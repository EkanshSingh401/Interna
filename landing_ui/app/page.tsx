import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { ResumeUploadCTA } from "@/components/landing/resume-upload-cta" // 1. Import the new component
import { Pricing } from "@/components/landing/pricing"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect("/dashboard");
  }

  const isPro = false;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'Interna',
    'operatingSystem': 'Web',
    'applicationCategory': 'BusinessApplication',
    'description': 'AI-powered internship matching and application tracking platform.',
    'offers': {
      '@type': 'Offer',
      'price': '0.00',
      'priceCurrency': 'USD',
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <main>
        <Hero />
        
        {/* The Resume Analysis Section */}
        <Features />
        
        {/* 2. Add the Upload Section Here */}
        <ResumeUploadCTA />
        
        <Pricing isPro={isPro} />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}