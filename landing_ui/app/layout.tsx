import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { UserSync } from '@/components/auth/user-sync'
import './globals.css'

const _inter = Inter({ subsets: ["latin"] });
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] });

// AI & SEO Optimized Metadata
export const metadata: Metadata = {
  title: {
    default: 'Interna | AI Internship Matcher & Mission Control',
    template: '%s | Interna',
  },
  description: 'Automate your internship search with Interna. AI-powered resume matching, application tracking, and mission control for your career.', 
  keywords: ['internship matcher', 'AI job search', 'internship tracker', 'resume analyzer'],
  generator: 'v0.app',
  metadataBase: new URL('https://internahq.com'),
  alternates: {
    canonical: '/', 
  },
  // --- ADDED FOR GOOGLE INDEXING ---
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // You get this string from Google Search Console -> Settings -> Ownership Verification -> HTML Tag
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_VERIFICATION_STRING', 
  },
  // ---------------------------------
  openGraph: {
    title: 'Interna | The AI Command Center for Interns',
    description: 'Stop the manual grind. Use AI to find high-fit roles and track your mission.',
    url: 'https://internahq.com',
    siteName: 'Interna',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/logo.png', 
        width: 1200,
        height: 630,
        alt: 'Interna Dashboard Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Interna | AI Internship Accelerator',
    description: 'Navigate your career journey with AI-driven precision.',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#05070A',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // JSON-LD Schema for AI Engines (AEO/GEO)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Interna',
    'description': 'AI-powered internship matching and application tracking platform.',
    'applicationCategory': 'BusinessApplication',
    'operatingSystem': 'Web',
    'offers': {
      '@type': 'Offer',
      'price': '5.67', 
      'priceCurrency': 'USD',
    },
    'featureList': [
      'AI Resume Matching',
      'Application Kanban Board',
      'Readiness Score Analysis',
      'Live Job Feed Integration'
    ],
  };

  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <head>
          {/* Inject JSON-LD to help AI models categorize your site */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </head>
        <body className={`${_inter.className} font-sans antialiased`}>
          <UserSync /> 
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  )
}