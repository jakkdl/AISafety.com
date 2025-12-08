import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="utility-page-wrap">
      <div className="utility-page-content">
        <Image
          src="/images/HAL9000.svg.png"
          alt="HAL 9000 computer interface"
          width={201}
          height={201}
          sizes="201px"
          className="self-center"
        />
        <h2 className="heading-3">404</h2>
        <div className="text-white">
          I&apos;m sorry, Dave, I can&apos;t find this page.
        </div>
      </div>
    </div>
  )
}
