import type { Metadata } from 'next'
import { Inter, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'OmniEdge Studio // v0.1-beta',
  description: 'The Unified IDE for Edge-AI Robotics',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#050505]"suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --font-sans: ${inter.style.fontFamily};
            --font-mono: ${geistMono.style.fontFamily};
          }
        `}</style>
      </head>
      <body className="font-sans antialiased bg-[#050505] text-white overflow-hidden">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
