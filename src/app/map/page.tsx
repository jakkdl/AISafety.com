'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import styles from './page.module.css'

// Dynamic import D3Map to avoid SSR issues with D3
const D3Map = dynamic(() => import('./D3Map'), {
  ssr: false,
  loading: () => (
    <div
      className={styles.mapContainer}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p className="paragraph-small color-teal-300">Loading map...</p>
    </div>
  ),
})

const categories = [
  'Advocacy',
  'Blog',
  'Capabilities research',
  'Career support',
  'Conceptual research',
  'Empirical research',
  'Forecasting',
  'Funding',
  'Governance',
  'Newsletter',
  'Podcast',
  'Research support',
  'Resource',
  'Strategy',
  'Training and education',
  'Video',
]

interface MapOrg {
  id: string
  title: string
  shortName: string | null
  description: string
  category: string
  status: string
  logo: string | null
  mapLogo: string | null
  link: string
  x: number | null
  y: number | null
  scale: string | null
  isMagic: boolean
}

export default function MapPage() {
  const [orgs, setOrgs] = useState<MapOrg[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set()
  )
  const [showActive, setShowActive] = useState(true)
  const [showInactive, setShowInactive] = useState(false)
  const [suggestEntryLink, setSuggestEntryLink] = useState('/map/suggest')
  const [suggestCorrectionLink, setSuggestCorrectionLink] = useState('#')
  const mapWrapperRef = useRef<HTMLDivElement>(null)

  const scrollToCards = () => {
    if (!mapWrapperRef.current) return
    const mapRect = mapWrapperRef.current.getBoundingClientRect()
    const scrollAmount = window.scrollY + mapRect.bottom
    window.scrollTo({ top: scrollAmount, behavior: 'smooth' })
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/map')
        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await res.json()
        setOrgs(data.records)
        if (data.lastUpdated) {
          setLastUpdated(data.lastUpdated)
        }
        // Extract links from magic rows for sidebar
        for (const record of data.records) {
          if (record.title === 'Suggest entry' && record.link) {
            setSuggestEntryLink(record.link)
          } else if (record.title === 'Suggest correction' && record.link) {
            setSuggestCorrectionLink(record.link)
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filter orgs based on search, category, and status (exclude magic rows from cards)
  const filteredOrgs = orgs.filter(org => {
    // Exclude magic rows from cards
    if (org.isMagic) return false

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !org.title.toLowerCase().includes(query) &&
        !org.description.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    // Category filter
    if (selectedCategories.size > 0) {
      const orgCategories = org.category
        .toLowerCase()
        .split(',')
        .map(c => c.trim())
      const hasMatchingCategory = Array.from(selectedCategories).some(cat =>
        orgCategories.some(orgCat => orgCat.includes(cat.toLowerCase()))
      )
      if (!hasMatchingCategory) {
        return false
      }
    }

    // Status filter
    const isActive = org.status === 'Active'
    if (isActive && !showActive) return false
    if (!isActive && !showInactive) return false

    return true
  })

  const toggleCategory = (category: string) => {
    const newSelected = new Set(selectedCategories)
    if (newSelected.has(category)) {
      newSelected.delete(category)
    } else {
      newSelected.add(category)
    }
    setSelectedCategories(newSelected)
  }

  // Filter orgs that have map coordinates for the D3 map
  const mapOrgs = orgs.filter(org => org.x !== null && org.y !== null)

  // Calculate category counts (excluding magic rows)
  const categoryCounts = orgs.reduce(
    (counts, org) => {
      if (org.isMagic) return counts
      const orgCategories = org.category
        .toLowerCase()
        .split(',')
        .map(c => c.trim())
      for (const category of categories) {
        const catLower = category.toLowerCase()
        if (orgCategories.some(orgCat => orgCat.includes(catLower))) {
          counts[category] = (counts[category] || 0) + 1
        }
      }
      return counts
    },
    {} as Record<string, number>
  )

  // Calculate status counts (excluding magic rows)
  const activeCount = orgs.filter(
    org => !org.isMagic && org.status === 'Active'
  ).length
  const inactiveCount = orgs.filter(
    org => !org.isMagic && org.status !== 'Active'
  ).length

  return (
    <>
      {/* D3 Interactive Map - full width, outside content-container */}
      <div className="padding-24px">
        <div ref={mapWrapperRef} className={styles.mapWrapper}>
          {!loading && <D3Map orgs={mapOrgs} />}
          <button onClick={scrollToCards} className={styles.scrollButton}>
            View cards
            <Image src="/images/arrow-down.svg" alt="" width={16} height={16} />
          </button>
        </div>
      </div>

      <div id="cards" className="content-container">
        <p className="padding-24px paragraph-small color-teal-300">
          {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
        </p>
        <h2 className="width-7-col padding-56px">
          An overview of the key{' '}
          <span className="color-light-teal">
            organizations, programs, and projects
          </span>{' '}
          operating in the AI safety space.
        </h2>

        {/* Cards section */}
        <div className="database-outer-grid">
          {/* Left column: search + cards */}
          <div>
            <div className="padding-40px">
              <input
                type="text"
                className="text-field"
                placeholder="Search listings by name or description"
                maxLength={256}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="padding-40px">
                <p className="paragraph-small color-teal-300">Loading...</p>
              </div>
            ) : error ? (
              <div className="padding-40px">
                <p className="paragraph-small color-teal-300">Error: {error}</p>
              </div>
            ) : (
              <div className="collection-list padding-40px">
                {filteredOrgs.map(org => (
                  <a
                    key={org.id}
                    href={org.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card"
                  >
                    <div className="featured-img-title-flex padding-24px">
                      <div className="featured-img">
                        {org.logo && (
                          <Image
                            src={org.logo}
                            alt=""
                            className="card-image"
                            width={64}
                            height={64}
                            unoptimized
                          />
                        )}
                      </div>
                      <h3>{org.title}</h3>
                    </div>
                    <p className="paragraph-small padding-24px">
                      {org.description}
                    </p>
                    <p className="paragraph-xs-bold color-teal-300 padding-4px">
                      Category
                    </p>
                    <p className="paragraph-small">{org.category}</p>
                  </a>
                ))}
                {filteredOrgs.length === 0 && (
                  <p className="paragraph-small color-teal-300">
                    No items found.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Right column: filters (desktop only) */}
          <div className="hide-mobile">
            {/* Category filter */}
            <div className="padding-40px">
              <label className="paragraph-small padding-16px">Category</label>
              {categories.map(category => (
                <label key={category} className="checkbox-field padding-16px">
                  <input
                    type="checkbox"
                    className="checkbox"
                    checked={selectedCategories.has(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span className="paragraph-small color-teal-300 w-form-label">
                    {category}
                    <span className="filter-count">
                      {' '}
                      ({categoryCounts[category] || 0})
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {/* Status filter */}
            <div className="padding-56px">
              <label className="paragraph-small padding-16px">Status</label>
              <label className="checkbox-field padding-16px">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={showActive}
                  onChange={e => setShowActive(e.target.checked)}
                />
                <span className="paragraph-small color-teal-300 w-form-label">
                  Active
                  <span className="filter-count"> ({activeCount})</span>
                </span>
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={showInactive}
                  onChange={e => setShowInactive(e.target.checked)}
                />
                <span className="paragraph-small color-teal-300 w-form-label">
                  No longer active
                  <span className="filter-count"> ({inactiveCount})</span>
                </span>
              </label>
            </div>

            {/* Contribute buttons */}
            <div className="contribute-buttons">
              <a
                href={suggestEntryLink}
                target={suggestEntryLink.startsWith('/') ? undefined : '_blank'}
                rel={
                  suggestEntryLink.startsWith('/')
                    ? undefined
                    : 'noopener noreferrer'
                }
              >
                <p className="paragraph-default-bold padding-8px">
                  Suggest entry <span className="color-teal-300">→</span>
                </p>
                <p className="side-button">
                  Suggest something to be listed on the map
                </p>
              </a>
              <a
                href={suggestCorrectionLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="paragraph-default-bold padding-8px">
                  Suggest correction <span className="color-teal-300">→</span>
                </p>
                <p className="side-button">
                  Let us know of changes to something listed here
                </p>
              </a>
              <a
                href="https://airtable.com/appF8XfZUGXtfi40E/shrLojIEOsNCKg1BL"
                target="_blank"
                rel="noopener noreferrer"
              >
                <p className="paragraph-default-bold padding-8px">
                  View raw data <span className="color-teal-300">→</span>
                </p>
                <p className="side-button">See the database in Airtable</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
