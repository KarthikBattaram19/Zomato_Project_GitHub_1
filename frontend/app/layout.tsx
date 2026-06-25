// 5B.1 — Root layout: fonts, metadata, Material Symbols

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Zomato AI Restaurant Recommender',
  description:
    'AI-powered restaurant recommendations for Bangalore — powered by Llama 3 × Groq',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Material Symbols icon font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans min-h-screen bg-[#FAFAFA] text-on-surface antialiased">
        {children}
      </body>
    </html>
  )
}
