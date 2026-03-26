import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'
import sharp from 'sharp'

// Load .env.local for local development
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^=]+)=(.*)$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]
    }
  }
}

interface AirtableAttachment {
  id: string
  url: string
  filename: string
  type?: string
}

interface AirtableRawRecord {
  id: string
  fields: Record<string, unknown>
}

const CACHE_DIR = path.join(process.cwd(), 'public', 'images', 'airtable-cache')
const CONCURRENCY = 20
const CONVERTIBLE_EXTENSIONS = ['.png', '.jpg', '.jpeg']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']

function isAttachmentArray(value: unknown): value is AirtableAttachment[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === 'object' &&
    value[0] !== null &&
    'url' in value[0] &&
    'filename' in value[0]
  )
}

function getExtension(url: string, filename: string): string {
  const filenameExt = path.extname(filename).toLowerCase()
  if (filenameExt && ALLOWED_EXTENSIONS.includes(filenameExt)) {
    return filenameExt
  }

  const urlPath = new URL(url).pathname
  const urlExt = path.extname(urlPath).toLowerCase()
  if (urlExt && ALLOWED_EXTENSIONS.includes(urlExt)) {
    return urlExt
  }

  throw new Error(
    `Unknown image extension for attachment: filename="${filename}", url="${url}". ` +
      `Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`
  )
}

function downloadFile(url: string, dest: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    file.on('error', err => {
      reject(err)
    })
    const protocol = url.startsWith('https') ? https : http

    protocol
      .get(url, response => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          const redirectUrl = response.headers.location
          if (redirectUrl) {
            file.close()
            fs.unlinkSync(dest)
            downloadFile(redirectUrl, dest).then(resolve).catch(reject)
            return
          }
        }

        if (response.statusCode !== 200) {
          file.close()
          fs.unlinkSync(dest)
          reject(new Error(`HTTP ${response.statusCode}`))
          return
        }

        response.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
      })
      .on('error', err => {
        file.close()
        fs.unlink(dest, () => {})
        reject(err)
      })
  })
}

async function convertToWebP(inputPath: string): Promise<void> {
  const webpPath = inputPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')
  await sharp(inputPath).webp({ quality: 85 }).toFile(webpPath)
  fs.unlinkSync(inputPath)
}

interface DownloadTask {
  attachmentId: string
  url: string
  localPath: string
  ext: string
}

async function fetchAllAirtableRecords(): Promise<AirtableRawRecord[]> {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!token || !baseId) {
    throw new Error('AIRTABLE_TOKEN and AIRTABLE_BASE_ID must be set')
  }

  // All tables that may have image attachments
  const tables = [
    { tableId: 'tblvzbGL9q9dOO9Nc', viewId: 'viwJgtDFDmaP8PyoI' }, // Map
    { tableId: 'tbl59Ye8oxvPjoVJv', viewId: 'viwzMBhPBk1GpQXnn' }, // Founders
    { tableId: 'tblzMTLDZWZKqTxrq' }, // Funding
    { tableId: 'tblx0L8qJEaLBxJFS', viewId: 'viwHl72bJxCb2SfrL' }, // Events
    { tableId: 'tbluI5Dll697WiSm8' }, // Communities
    { tableId: 'tblRNYJ0m1cmJXKKk', viewId: 'viwblgaia3x1gsqBo' }, // Self-study
    { tableId: 'tblCTOMzyH3vILL5I' }, // Media channels
    { tableId: 'tblf3KKYnmgcjVGhD' }, // Advisors
    { tableId: 'tblHT29QNgMYKB8iW' }, // Projects
  ]

  const allRecords: AirtableRawRecord[] = []

  for (const { tableId, viewId } of tables) {
    let offset: string | null = null

    do {
      const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`)
      if (viewId) {
        url.searchParams.set('view', viewId)
      }
      if (offset) {
        url.searchParams.set('offset', offset)
      }

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`Airtable API error: ${response.status}`)
      }

      const data = await response.json()
      allRecords.push(...(data.records as AirtableRawRecord[]))
      offset = data.offset || null
    } while (offset)
  }

  return allRecords
}

async function main() {
  console.log('Fetching Airtable records...')
  const records = await fetchAllAirtableRecords()
  console.log(`Found ${records.length} records`)

  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true })
  }

  // Collect unique attachments to download
  const tasks = new Map<string, DownloadTask>()

  for (const record of records) {
    for (const value of Object.values(record.fields)) {
      if (!isAttachmentArray(value)) continue

      const attachment = value[0]
      const ext = getExtension(attachment.url, attachment.filename)
      const localFilename = `${attachment.id}${ext}`
      const localPath = path.join(CACHE_DIR, localFilename)

      // Check if already cached (as original or WebP)
      const isConvertible = CONVERTIBLE_EXTENSIONS.includes(ext.toLowerCase())
      const webpPath = isConvertible
        ? localPath.replace(/\.(png|jpg|jpeg)$/i, '.webp')
        : localPath

      if (fs.existsSync(webpPath) || fs.existsSync(localPath)) {
        continue
      }

      // Deduplicate by attachment ID
      if (!tasks.has(attachment.id)) {
        tasks.set(attachment.id, {
          attachmentId: attachment.id,
          url: attachment.url,
          localPath,
          ext,
        })
      }
    }
  }

  if (tasks.size === 0) {
    console.log('All attachments already cached')
    return
  }

  console.log(`Downloading ${tasks.size} attachments...`)

  const taskList = Array.from(tasks.values())
  const failures: string[] = []
  let completed = 0

  // Download and convert in parallel batches
  for (let i = 0; i < taskList.length; i += CONCURRENCY) {
    const batch = taskList.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(async task => {
        await downloadFile(task.url, task.localPath)

        // Convert PNG/JPG to WebP
        if (CONVERTIBLE_EXTENSIONS.includes(task.ext.toLowerCase())) {
          await convertToWebP(task.localPath)
        }
      })
    )

    for (let j = 0; j < results.length; j++) {
      const result = results[j]
      const task = batch[j]
      if (result.status === 'rejected') {
        failures.push(`${task.attachmentId}: ${result.reason}`)
      } else {
        completed++
      }
    }

    console.log(`Progress: ${completed}/${taskList.length}`)
  }

  if (failures.length > 0) {
    console.error(`Failed to download ${failures.length} attachments:`)
    failures.forEach(f => console.error(`  ${f}`))
    process.exit(1)
  }

  console.log('All attachments downloaded and converted')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
