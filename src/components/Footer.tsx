import Link from 'next/link'
import Image from 'next/image'
import UpButton from './UpButton'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-grid">
          <div className="footer-main">
            <Image
              src="/images/logo.svg"
              alt="AI Safety logo"
              width={150}
              height={50}
              className="footer-logo"
            />
            <p className="footer-description">
              We&apos;re a global team of volunteers and professionals from
              various disciplines who believe AI poses a grave risk of
              extinction to humanity.
            </p>
            <Link href="/about" className="footer-button">
              Learn more about us
            </Link>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Help us out</h4>
            <Link
              href="https://airtable.com/appF8XfZUGXtfi40E/pagndDvdya1DSqoxN/form"
              target="_blank"
              className="footer-link"
            >
              Suggest a correction
            </Link>
            <Link href="/feedback" className="footer-link">
              Give anonymous feedback
            </Link>
            <Link
              href="https://www.every.org/alignment-ecosystem-development"
              target="_blank"
              className="footer-link"
            >
              Donate
            </Link>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Newsletters</h4>
            <Link
              href="https://aisafetyeventsandtraining.substack.com/"
              target="_blank"
              className="footer-link"
            >
              AI Safety Events &amp; Training
            </Link>
            <Link
              href="https://aisafetyfunding.substack.com/"
              target="_blank"
              className="footer-link"
            >
              AI Safety Funding (coming soon)
            </Link>
            <Link
              href="https://aisafetycom.substack.com/"
              target="_blank"
              className="footer-link"
            >
              AISafety.com Updates
            </Link>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <div className="footer-attribution">
            <Image
              width={80}
              height={32}
              alt="Community thumbnails"
              src="/images/thumbnails.png"
            />
            <p className="footer-credit">
              Maintained by AI safety community-builders
            </p>
          </div>
          <p className="footer-copyright">
            (ɔ) 2025 · This site is released under a CC BY-SA license
          </p>
        </div>
      </div>

      <UpButton />
    </footer>
  )
}
