'use client'

import { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import styles from './page.module.css'

interface MapOrg {
  id: string
  title: string
  shortName: string | null
  description: string
  category: string
  link: string
  mapLogo: string | null
  x: number | null
  y: number | null
  scale: string | null
}

interface D3MapProps {
  orgs: MapOrg[]
}

// Map constants from WebFlow
const MAP_WIDTH = 2485
const MAP_HEIGHT = 1355
const PADDING_FACTOR = 1.1
const PADDED_WIDTH = MAP_WIDTH * PADDING_FACTOR
const PADDED_HEIGHT = MAP_HEIGHT * PADDING_FACTOR
const GRID_SIZE = MAP_WIDTH / 60
const BACKGROUND_IMAGE_URL =
  'https://cdn.prod.website-files.com/65380b51b01b69a63d681e04/67e5dce03ad758280cd8367c_Map%201.5.1.svg'

// Logo size scales (handle both cases)
const SIZE_TO_SCALE: Record<string, number> = {
  small: 0.4,
  Small: 0.4,
  medium: 0.6,
  Medium: 0.6,
  large: 0.8,
  Large: 0.8,
}
const BASE_LOGO_SIZE = 64
const LOGO_GLOBAL_SCALE = 1.0

// Area labels from WebFlow
const AREA_LABELS = [
  { label: 'Conceptual Cliffs', x: 46, y: 5.5 },
  { label: 'Resource Rock', x: 3.5, y: 8 },
  { label: 'Support Shoreline', x: 13, y: 6.7 },
  { label: 'Newsletter Nook', x: 15.8, y: 14.5 },
  { label: 'Video Vista', x: 23, y: 5.6 },
  { label: 'Funding Forest', x: 29.2, y: 7 },
  { label: 'Governance Grove', x: 37.7, y: 5.5 },
  { label: 'Strategy Summit', x: 34.8, y: 19 },
  { label: 'Research Range', x: 45.3, y: 15.9 },
  { label: 'Training Town', x: 22.2, y: 17.2 },
  { label: 'Empirical Escarpment', x: 53.5, y: 16 },
  { label: 'Podcast Port', x: 9.5, y: 20.5 },
  { label: 'Blog Beach', x: 15, y: 25.8 },
  { label: 'Forecasting Falls', x: 39.2, y: 23.8 },
  { label: 'Career Castle', x: 30.5, y: 29.4 },
  { label: 'Advocacy Anchorage', x: 8, y: 31 },
  { label: 'Capabilities Cove', x: 45, y: 27.1 },
  { label: 'Gone Graveyard', x: 56, y: 30 },
]

export default function D3Map({ orgs }: D3MapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const [tooltip, setTooltip] = useState<{
    visible: boolean
    x: number
    y: number
    title: string
    description: string
  }>({ visible: false, x: 0, y: 0, title: '', description: '' })

  useEffect(() => {
    if (!containerRef.current || orgs.length === 0) return

    // Clear any existing SVG
    d3.select(containerRef.current).select('svg').remove()

    // Create SVG
    const svg = d3
      .select(containerRef.current)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${PADDED_WIDTH} ${PADDED_HEIGHT}`)
      .attr('preserveAspectRatio', 'xMidYMin meet')

    svgRef.current = svg.node()

    // Create main group with offset
    const offsetX = (PADDED_WIDTH - MAP_WIDTH) / 2
    const offsetY = (PADDED_HEIGHT - MAP_HEIGHT) / 20
    const svgGroup = svg
      .append('g')
      .attr('transform', `translate(${offsetX}, ${offsetY})`)

    // Check if on mobile
    const isMobile = window.innerWidth < 768
    const maxZoom = isMobile ? 25 : 8

    // Set up zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, maxZoom])
      .on('zoom', event => {
        const newX = event.transform.x + offsetX
        const newY = event.transform.y + offsetY
        svgGroup.attr(
          'transform',
          `translate(${newX}, ${newY}) scale(${event.transform.k})`
        )
        // Hide tooltip on zoom/pan
        setTooltip(t => ({ ...t, visible: false }))
      })

    svg.call(zoom)

    // Add background image
    svgGroup
      .append('image')
      .attr('xlink:href', BACKGROUND_IMAGE_URL)
      .attr('width', MAP_WIDTH)
      .attr('height', MAP_HEIGHT)
      .attr('x', 0)
      .attr('y', 0)

    // Add main title
    const titleX = 30 * GRID_SIZE
    const titleY = 2.5 * GRID_SIZE
    svgGroup
      .append('text')
      .attr('x', titleX)
      .attr('y', titleY)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Inter, sans-serif')
      .attr('font-weight', 400)
      .attr('font-size', 72)
      .style('letter-spacing', '-2.16px')
      .attr('fill', '#fff')
      .text('Map of AI Existential Safety')

    // Add area labels
    const labelScale = 1.75
    const baseFontSize = 14
    const basePadX = 14
    const basePadY = 7
    const finalFontSize = baseFontSize * labelScale
    const finalPadX = basePadX * labelScale
    const finalPadY = basePadY * labelScale

    AREA_LABELS.forEach(({ label, x, y }) => {
      const xPos = x * GRID_SIZE
      const yPos = y * GRID_SIZE

      const labelGroup = svgGroup
        .append('g')
        .attr('transform', `translate(${xPos}, ${yPos})`)
        .style('user-select', 'none')
        .style('pointer-events', 'none')

      const textEl = labelGroup
        .append('text')
        .attr('x', 0)
        .attr('y', 0)
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', 600)
        .attr('font-size', finalFontSize)
        .style('letter-spacing', '-0.01em')
        .attr('fill', '#fff')
        .text(label)

      const bbox = textEl.node()?.getBBox()
      if (bbox) {
        labelGroup
          .insert('rect', 'text')
          .attr('x', bbox.x - finalPadX)
          .attr('y', bbox.y - finalPadY)
          .attr('width', bbox.width + finalPadX * 2)
          .attr('height', bbox.height + finalPadY * 2)
          .attr('rx', (bbox.height + finalPadY * 2) / 2)
          .attr('ry', (bbox.height + finalPadY * 2) / 2)
          .attr('fill', 'rgba(27, 43, 62, 0.6)')
      }
    })

    // Render organization logos
    orgs.forEach(org => {
      if (org.x === null || org.y === null) return

      const xPos = org.x * GRID_SIZE
      const yPos = org.y * GRID_SIZE

      // Calculate logo size based on scale (matching WebFlow)
      const rawScale = SIZE_TO_SCALE[org.scale || 'Medium'] || 0.6
      const iconSize = BASE_LOGO_SIZE * rawScale * LOGO_GLOBAL_SCALE
      const padding = 2
      const contentSize = iconSize - 2 * padding

      // Create link group
      const linkEl = svgGroup
        .append('a')
        .attr('xlink:href', org.link)
        .attr('target', '_blank')
        .append('g')
        .attr('transform', `translate(${xPos}, ${yPos})`)
        .style('cursor', 'pointer')

      // White circle background
      linkEl
        .append('circle')
        .attr('r', iconSize / 2)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', '#fff')

      // Logo image - copied directly from WebFlow implementation
      if (org.mapLogo) {
        const uniqueId = `logo-pattern-${Math.random().toString(36).substring(2, 11)}`
        const patternId = `pattern-${uniqueId}`
        const img = new Image()
        img.src = org.mapLogo

        img.onload = function () {
          const { width, height } = img
          const scaleFactor = contentSize / Math.max(width, height)
          const finalWidth = width * scaleFactor
          const finalHeight = height * scaleFactor
          const offsetX = (contentSize - finalWidth) / 2
          const offsetY = (contentSize - finalHeight) / 2

          // Create defs inside linkEl (as per WebFlow)
          const localDefs = linkEl.append('defs')
          const pattern = localDefs
            .append('pattern')
            .attr('id', patternId)
            .attr('patternUnits', 'objectBoundingBox')
            .attr('width', 1)
            .attr('height', 1)

          pattern
            .append('image')
            .attr('xlink:href', org.mapLogo)
            .attr('width', finalWidth)
            .attr('height', finalHeight)
            .attr('x', offsetX)
            .attr('y', offsetY)

          linkEl
            .append('circle')
            .attr('r', contentSize / 2)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', `url(#${patternId})`)
        }

        img.onerror = function () {
          linkEl
            .append('circle')
            .attr('r', contentSize / 2)
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('fill', '#f70')
        }
      } else {
        linkEl
          .append('circle')
          .attr('r', contentSize / 2)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', 'red')
      }

      // Add label below logo
      const labelName = org.shortName || org.title
      const labelOffset = 11 * rawScale * 1.5
      const labelY = iconSize / 2 + labelOffset
      const fontSize = 6 * rawScale * 1.5

      const labelG = linkEl
        .append('g')
        .attr('transform', `translate(0, ${labelY})`)

      const textEl = labelG
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-family', 'Inter, sans-serif')
        .attr('font-weight', 600)
        .attr('font-size', fontSize)
        .style('letter-spacing', '-0.02em')
        .attr('fill', '#000')
        .text(labelName)

      // Get text bounding box and add background pill
      const bbox = textEl.node()?.getBBox()
      if (bbox) {
        const padX = 6 * rawScale * 1.5
        const padY = 3 * rawScale * 1.5
        const rectW = bbox.width + padX * 2
        const rectH = bbox.height + padY * 2

        labelG
          .insert('rect', 'text')
          .attr('x', -rectW / 2)
          .attr('y', -rectH / 2)
          .attr('width', rectW)
          .attr('height', rectH)
          .attr('rx', rectH / 2)
          .attr('ry', rectH / 2)
          .attr('fill', '#fff')

        textEl.attr('y', bbox.height * 0.35)
      }

      // Tooltip events
      linkEl
        .on('mouseenter', event => {
          const [mouseX, mouseY] = d3.pointer(event, document.body)
          setTooltip({
            visible: true,
            x: mouseX + 10,
            y: mouseY + 10,
            title: org.title,
            description: org.description,
          })
        })
        .on('mousemove', event => {
          const [mouseX, mouseY] = d3.pointer(event, document.body)
          setTooltip(t => ({
            ...t,
            x: mouseX + 10,
            y: mouseY + 10,
          }))
        })
        .on('mouseleave', () => {
          setTooltip(t => ({ ...t, visible: false }))
        })
    })

    // Setup zoom controls
    const zoomIn = document.getElementById('zoom-in')
    const zoomOut = document.getElementById('zoom-out')
    const recenter = document.getElementById('recenter')

    if (zoomIn) {
      zoomIn.onclick = () => {
        svg.transition().duration(300).call(zoom.scaleBy, 1.5)
      }
    }
    if (zoomOut) {
      zoomOut.onclick = () => {
        svg.transition().duration(300).call(zoom.scaleBy, 0.75)
      }
    }
    if (recenter) {
      recenter.onclick = () => {
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity)
      }
    }

    const container = containerRef.current
    return () => {
      if (container) {
        d3.select(container).select('svg').remove()
      }
    }
  }, [orgs])

  return (
    <>
      <div ref={containerRef} className={styles.mapContainer} />

      {/* Zoom controls - positioned relative to mapWrapper, not the SVG */}
      <div className={styles.mapControls}>
        <div className={styles.mapControlGroup}>
          <button
            id="zoom-in"
            className={styles.mapControlButton}
            title="Zoom in"
          >
            <span>+</span>
          </button>
          <button
            id="zoom-out"
            className={styles.mapControlButton}
            title="Zoom out"
          >
            <span>−</span>
          </button>
          <button
            id="recenter"
            className={styles.mapControlButton}
            title="Reset view"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="currentColor"
            >
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className={styles.mapTooltip}
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          <strong>{tooltip.title}</strong>
          <span>{tooltip.description}</span>
        </div>
      )}
    </>
  )
}
