import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'EdgeTwin OS',
  description: 'AI-to-Hardware Simulation Portal',
  generator: 'v0.app',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-[#0A0A0A]">
      <head>
        <style>{`
          :root {
            --font-sans: ${geist.style.fontFamily};
            --font-mono: ${geistMono.style.fontFamily};
          }
        `}</style>
      </head>
      <body className="font-sans antialiased bg-[#0A0A0A] text-white">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
