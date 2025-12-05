import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import './globals.css'
import Navigation from '@/components/Navigation'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'AI Safety',
  description: 'AI Safety community website',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
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
        <Navigation />
        {children}
      </body>
    </html>
  )
}
