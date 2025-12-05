import Image from 'next/image'

export default function NotFound() {
  return (
    <div>
      {/* Background */}
      <div className="hero-bg">
        <Image
          loading="lazy"
          src="/images/bg.svg"
          alt="Background pattern"
          width={1600}
          height={600}
        />
      </div>

      {/* 404 Content */}
      <div className="utility-page-wrap">
        <div className="utility-page-content">
          <Image
            src="/images/HAL9000.svg.png"
            alt="HAL 9000 computer interface"
            width={201}
            height={201}
            sizes="201px"
            className="image-8"
          />
          <h2 className="heading-3">404</h2>
          <div className="text-white">
            I&apos;m sorry, Dave, I can&apos;t find this page.
          </div>
        </div>
      </div>
    </div>
  )
}
