import { NextResponse } from 'next/server'

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN
const BASE_ID = process.env.AIRTABLE_BASE_ID
const TABLE_ID = 'tblvzbGL9q9dOO9Nc'
const LAST_UPDATED_RECORD_ID = 'recvDWyM9MW9q1GUj'

export async function GET() {
  if (!AIRTABLE_TOKEN || !BASE_ID) {
    return NextResponse.json(
      { error: 'Airtable credentials not configured' },
      { status: 500 }
    )
  }

  try {
    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${LAST_UPDATED_RECORD_ID}`

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(
        `Airtable API error: ${response.status} ${response.statusText}`,
        errorText
      )
      return NextResponse.json(
        { error: `Airtable API error: ${response.status}` },
        { status: response.status }
      )
    }

    const record = await response.json()
    const lastUpdated = record.fields?.Description || null

    return NextResponse.json({ lastUpdated })
  } catch (error) {
    console.error('Error fetching map last updated date:', error)
    return NextResponse.json(
      { error: 'Failed to fetch last updated date' },
      { status: 500 }
    )
  }
}
