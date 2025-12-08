'use client'

import { useEffect, useState } from 'react'

interface LastUpdatedProps {
  apiEndpoint: string
  className?: string
}

export default function LastUpdated({
  apiEndpoint,
  className = '',
}: LastUpdatedProps) {
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLastUpdated() {
      try {
        const response = await fetch(apiEndpoint)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.formattedDate) {
          setLastUpdated(`Last updated: ${data.formattedDate}`)
        } else if (data.error) {
          setError(data.error)
        } else {
          setLastUpdated('Last updated: Date unavailable')
        }
      } catch (err) {
        console.error('Error fetching last updated date:', err)
        setError('Failed to load update date')
      } finally {
        setLoading(false)
      }
    }

    fetchLastUpdated()
  }, [apiEndpoint])

  if (loading) {
    return <div className={`${className}`}>Loading last updated...</div>
  }

  if (error) {
    return <div className={`${className}`}>Last updated: Date unavailable</div>
  }

  return <div className={`${className}`}>{lastUpdated}</div>
}
