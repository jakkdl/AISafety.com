import fs from 'fs'
import path from 'path'

export interface AirtableRawRecord {
  id: string
  fields: Record<string, unknown>
}

interface AirtableAttachment {
  id: string
  url: string
  filename: string
  type?: string
}

interface FetchOptions {
  tableId: string
  viewId?: string
  filterByFormula?: string
  sort?: Array<{ field: string; direction: 'asc' | 'desc' }>
  fields?: string[]
}

const CACHE_DIR = path.join(process.cwd(), 'public', 'images', 'airtable-cache')

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

// Extensions that get converted to WebP by the prebuild script
const CONVERTIBLE_EXTENSIONS = ['.png', '.jpg', '.jpeg']
const ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif']

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

/**
 * Replace Airtable attachment URLs with local cached paths.
 * Images are downloaded and converted to WebP by the prebuild script.
 */
function resolveAttachmentUrls(records: AirtableRawRecord[]): void {
  for (const record of records) {
    for (const [, value] of Object.entries(record.fields)) {
      if (!isAttachmentArray(value)) continue

      const attachment = value[0]
      const ext = getExtension(attachment.url, attachment.filename)

      // Check for WebP version first (converted by prebuild), then original
      const isConvertible = CONVERTIBLE_EXTENSIONS.includes(ext.toLowerCase())
      const webpFilename = `${attachment.id}.webp`
      const originalFilename = `${attachment.id}${ext}`

      if (isConvertible && fs.existsSync(path.join(CACHE_DIR, webpFilename))) {
        value[0] = { ...attachment, url: `/images/airtable-cache/${webpFilename}` }
      } else if (fs.existsSync(path.join(CACHE_DIR, originalFilename))) {
        value[0] = { ...attachment, url: `/images/airtable-cache/${originalFilename}` }
      }
      // If not cached, keep original Airtable URL (will work but not optimized)
    }
  }
}

export async function fetchAirtableRecords(
  options: FetchOptions
): Promise<AirtableRawRecord[]> {
  const token = process.env.AIRTABLE_TOKEN
  const baseId = process.env.AIRTABLE_BASE_ID

  if (!token || !baseId) {
    console.error('Airtable credentials not configured')
    return []
  }

  const allRecords: AirtableRawRecord[] = []
  let offset: string | null = null

  do {
    const url = new URL(
      `https://api.airtable.com/v0/${baseId}/${options.tableId}`
    )
    if (options.viewId) {
      url.searchParams.set('view', options.viewId)
    }
    if (options.filterByFormula) {
      url.searchParams.set('filterByFormula', options.filterByFormula)
    }
    if (options.sort) {
      options.sort.forEach((s, i) => {
        url.searchParams.set(`sort[${i}][field]`, s.field)
        url.searchParams.set(`sort[${i}][direction]`, s.direction)
      })
    }
    if (options.fields) {
      options.fields.forEach(f => url.searchParams.append('fields[]', f))
    }
    if (offset) {
      url.searchParams.set('offset', offset)
    }

    let response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 3600 }, // Hourly revalidation fetches fresh API responses with valid attachment URLs
    })

    if (!response.ok) {
      console.warn(`Airtable API error (${response.status}), retrying...`)
      await new Promise(r => setTimeout(r, 1000))
      response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 }, // Retry also uses hourly revalidation
      })
    }

    if (!response.ok) {
      throw new Error(`Airtable API error after retry: ${response.status}`)
    }

    const data = await response.json()
    allRecords.push(...(data.records as AirtableRawRecord[]))
    offset = data.offset || null
  } while (offset)

  // Replace Airtable URLs with local cached paths
  resolveAttachmentUrls(allRecords)

  return allRecords
}
