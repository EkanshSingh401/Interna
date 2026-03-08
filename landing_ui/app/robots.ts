import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard',          // Protects the main mission control
        '/api/',               // Protects internal API routes
        '/dashboard/resume',   // Protects personal data
        '/dashboard/analysis'  // Protects user-specific match reports
      ],
    },
    sitemap: 'https://internahq.com/sitemap.xml',
  }
}