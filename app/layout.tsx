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
  title: 'Xinverse - Stream & Download Anime, Movies & Series',
  description: 'Xinverse - Your ultimate destination for streaming and downloading anime, movies, and TV series. Watch trailers, browse by genre, and download with subtitles.',
  generator: 'v0.app',
  keywords: ['xinverse', 'anime', 'movies', 'series', 'streaming', 'download', 'subtitles', 'free movies'],
  openGraph: {
    title: 'Xinverse - Stream & Download Anime, Movies & Series',
    description: 'Your ultimate destination for streaming and downloading anime, movies, and TV series with subtitles.',
    siteName: 'Xinverse',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
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
        <main className="pt-14">
          {children}
        </main>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
