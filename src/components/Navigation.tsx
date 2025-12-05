import Image from 'next/image'
import Link from 'next/link'

const navItems = [
  {
    href: '/events-and-training',
    label: 'Events & training',
    icon: 'calendar.svg',
    count: 48,
  },
  { href: '/map', label: 'Field map', icon: 'map.svg', count: 323 },
  { href: '/communities', label: 'Communities', icon: 'globe.svg', count: 196 },
  { href: '/self-study', label: 'Self-study', icon: 'book.svg', count: 25 },
  { href: '/jobs', label: 'Jobs', icon: 'briefcase.svg', count: 327 },
  { href: '/funding', label: 'Funding', icon: 'coins.svg', count: 49 },
]

export default function Navigation() {
  return (
    <div className="nav w-nav px-6 py-4">
      <div className="nav-container">
        <Link href="/" className="brand padding-right-24px w-nav-brand">
          <Image
            src="/images/logo.svg"
            alt="AI Safety logo"
            width={150}
            height={50}
            className="display-block"
          />
        </Link>

        <nav className="nav-menu w-nav-menu">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="nav-item w-inline-block"
            >
              <div className="nav-item-icon drop-shadow-dark">
                <Image
                  width={16}
                  height={16}
                  alt={`${item.label} icon`}
                  src={`/images/${item.icon}`}
                />
              </div>
              <p className="paragraph-small-bold">{item.label}</p>
              <p className="paragraph-xs color-teal-300">{item.count}</p>
            </Link>
          ))}

          <div className="nav-item-last">
            <p className="paragraph-small-bold">+4</p>
          </div>
        </nav>
      </div>
    </div>
  )
}
