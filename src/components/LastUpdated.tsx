'use client'

import { useEffect, useState } from 'react'

interface LastUpdatedProps {
  apiEndpoint: string
  className?: string
  format?: 'full' | 'relative'
}

export default function LastUpdated({
  apiEndpoint,
  className = '',
  format = 'full',
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

        if (data.lastUpdated) {
          const lastUpdatedDate = new Date(data.lastUpdated)
          const now = new Date()

          // Compare just the date parts, not time
          const lastUpdatedDateOnly = new Date(
            lastUpdatedDate.getFullYear(),
            lastUpdatedDate.getMonth(),
            lastUpdatedDate.getDate()
          )
          const nowDateOnly = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          )

          const diffTime = nowDateOnly.getTime() - lastUpdatedDateOnly.getTime()
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

          if (format === 'relative') {
            if (diffDays === 0) {
              setLastUpdated('Updated today')
            } else if (diffDays === 1) {
              setLastUpdated('Updated yesterday')
            } else if (diffDays < 7) {
              setLastUpdated(`Updated ${diffDays} days ago`)
            } else if (diffDays < 14) {
              setLastUpdated('Updated 1 week ago')
            } else if (diffDays < 30) {
              const weeks = Math.floor(diffDays / 7)
              setLastUpdated(`Updated ${weeks} weeks ago`)
            } else if (diffDays < 60) {
              setLastUpdated('Updated 1 month ago')
            } else {
              const months = Math.floor(diffDays / 30)
              setLastUpdated(`Updated ${months} months ago`)
            }
          } else {
            setLastUpdated(`Last updated: ${data.formattedDate}`)
          }
        } else if (data.error) {
          setError(data.error)
        } else {
          setLastUpdated(
            format === 'relative'
              ? 'Updated recently'
              : 'Last updated: Date unavailable'
          )
        }
      } catch (err) {
        console.error('Error fetching last updated date:', err)
        setError('Failed to load update date')
      } finally {
        setLoading(false)
      }
    }

    fetchLastUpdated()
  }, [apiEndpoint, format])

  if (loading) {
    return <div className={`${className}`}>Loading last updated...</div>
  }

  if (error) {
    return (
      <div className={`${className}`}>
        {format === 'relative'
          ? 'Updated recently'
          : 'Last updated: Date unavailable'}
      </div>
    )
  }

  return <div className={`${className}`}>{lastUpdated}</div>
}
