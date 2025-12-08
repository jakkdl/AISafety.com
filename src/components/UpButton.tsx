'use client'

export default function UpButton() {
  return (
    <button
      className="up-button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      ⌃
    </button>
  )
}
