import { NextResponse } from 'next/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = 'appF8XfZUGXtfi40E'
const METADATA_TABLE_ID = 'tblsglkum9Op43mvq'
const METADATA_RECORD_ID = 'rec0oNUMVZuYVXU82'

export async function GET() {
  if (!AIRTABLE_TOKEN) {
    return NextResponse.json(
      { error: 'Airtable token not configured' },
      { status: 500 }
    )
  }

  try {
    // Fetch the specific metadata record that contains the last updated date
    const url = `https://api.airtable.com/v0/${BASE_ID}/${METADATA_TABLE_ID}/${METADATA_RECORD_ID}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `Airtable API error: ${response.status} ${response.statusText}`,
        errorText
      )
      return NextResponse.json(
        { error: `Airtable API error: ${response.status}`, details: errorText },
        { status: response.status }
      )
    }

    const record = await response.json()

    // Look for a date field in the record - this will need to be adjusted based on the actual field name
    const fields = record.fields || {}
    let lastUpdatedDate: Date | null = null

    // Common field names for last updated dates - you may need to adjust this
    const possibleDateFields = [
      'Last updated',
      'Last Updated',
      'Date',
      'Updated',
      'Last modified',
      'Modified',
    ]

    for (const fieldName of possibleDateFields) {
      if (fields[fieldName]) {
        lastUpdatedDate = new Date(fields[fieldName])
        if (!isNaN(lastUpdatedDate.getTime())) {
          break
        }
      }
    }

    // Fallback to record creation time if no date field found
    if (!lastUpdatedDate || isNaN(lastUpdatedDate.getTime())) {
      lastUpdatedDate = new Date(record.createdTime)
    }

    return NextResponse.json({
      lastUpdated: lastUpdatedDate.toISOString(),
      formattedDate: formatDate(lastUpdatedDate),
    })
  } catch (error) {
    console.error('Error fetching last updated date:', error)
    return NextResponse.json(
      { error: 'Failed to fetch last updated date' },
      { status: 500 }
    )
  }
}

function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }
  return new Intl.DateTimeFormat('en-GB', options).format(date)
}
