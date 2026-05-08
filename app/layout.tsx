import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from '@/components/header'

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: 'CineMind - Stream & Download Anime, Movies & Series',
  description: 'Browse anime, movies and series. View trailers, synopses, filter by genre/year, and find where to watch on streaming services like Crunchyroll, Netflix, and HiDive.',
  generator: 'v0.app',
  keywords: ['anime', 'movies', 'series', 'streaming', 'download', 'crunchyroll', 'netflix', 'hidive'],
}

export const viewport: Viewport = {
  themeColor: '#1a1625',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Header />
        <main className="pt-16">
          {children}
        </main>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
