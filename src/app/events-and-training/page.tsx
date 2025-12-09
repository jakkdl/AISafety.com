import Link from 'next/link'
import LastUpdated from '@/components/LastUpdated'

export const metadata = {
  title: 'Events & Training – AISafety.com',
  description:
    'AI safety events and training programs, both online and in-person.',
}

export default function EventsAndTrainingPage() {
  return (
    <div>
      {/* Main Content */}
      <div className="content-container">
        <h1 className="page-title">Events &amp; training</h1>

        <LastUpdated
          apiEndpoint="/api/last-updated/events"
          className="last-updated-text"
        />

        <p className="intro-paragraph">
          There&apos;s a wide range of events and training programs in AI
          safety, both online and in-person. These can help you{' '}
          <span className="highlight-text">
            build skills, make connections, and discover opportunities.
          </span>
        </p>

        {/* Action Links */}
        <div className="action-links-grid">
          <Link
            href="https://aisafetyeventsandtraining.substack.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="action-link"
          >
            <h3 className="action-title">Subscribe to newsletter →</h3>
            <p className="action-description">
              Receive a weekly email summarizing all new events and training
              programs
            </p>
          </Link>

          <Link
            href="https://airtable.com/appF8XfZUGXtfi40E/pagyqtPZ2BFcKU6ys/form"
            target="_blank"
            rel="noopener noreferrer"
            className="action-link hide-mobile"
          >
            <h3 className="action-title">Suggest entry →</h3>
            <p className="action-description">
              Suggest an event or training program to be listed here and in the
              newsletter
            </p>
          </Link>

          <Link
            href="https://airtable.com/appF8XfZUGXtfi40E/pagndDvdya1DSqoxN/form"
            target="_blank"
            rel="noopener noreferrer"
            className="action-link hide-mobile"
          >
            <h3 className="action-title">Suggest correction →</h3>
            <p className="action-description">
              Let us know of any updates that should be made to the database
            </p>
          </Link>
        </div>

        <h2 className="section-heading">
          All upcoming events and training programs
        </h2>
      </div>

      {/* Airtable Embeds */}
      <div className="airtable-section">
        <iframe
          src="https://airtable.com/embed/appF8XfZUGXtfi40E/shrLgl03tMK4q6cyc?viewControls=on"
          frameBorder={0}
          width="100%"
          height="2300"
          style={{ background: 'transparent', border: '1px solid #ccc' }}
          className="airtable-embed mobile-embed"
        />

        <iframe
          src="https://airtable.com/embed/appF8XfZUGXtfi40E/shrZ4Uh9OsbUryfjp"
          frameBorder={0}
          width="100%"
          height="2880"
          style={{ background: 'transparent', border: '1px solid #ccc' }}
          className="airtable-embed desktop-embed hide-mobile"
        />
      </div>

      {/* Second section */}
      <div className="content-container">
        <h2 className="section-heading registration-heading hide-mobile">
          Open for application/registration
        </h2>
      </div>

      <div className="airtable-section">
        <iframe
          src="https://airtable.com/embed/appF8XfZUGXtfi40E/shrbap2hy8Yd3xojA"
          frameBorder={0}
          width="100%"
          height="1000"
          style={{ background: 'transparent', border: '1px solid #ccc' }}
          className="airtable-embed registration-embed hide-mobile"
        />
      </div>

      {/* Link to self-study */}
      <div className="content-container">
        <Link href="/self-study" className="self-study-link hover-opacity">
          <h3 className="self-study-heading">
            Self-study courses <span className="color-teal-400">→</span>
          </h3>
          <p className="self-study-description">
            Courses with freely available materials for independent learning
          </p>
        </Link>
      </div>
    </div>
  )
}
