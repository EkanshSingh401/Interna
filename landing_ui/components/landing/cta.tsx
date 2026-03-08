"use client"

import Link from "next/link"
import { ArrowRight, CheckCircle2, Sparkles, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

export function CTA() {
  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#05070A]">
      
      {/* 1. VIBRANT BACKGROUND ELEMENTS */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-aqua-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <div className="relative rounded-[2.5rem] border border-white/10 bg-[#0A0D12]/80 backdrop-blur-xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          
          {/* 2. INTENSE INTERNAL GLOWS (Aqua, Purple, Gold) */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-600/15 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="relative p-10 md:p-20 flex flex-col items-center text-center">
            
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 animate-pulse">
              <Zap className="h-3.5 w-3.5 fill-current" />
              Instant Mission Readiness
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter text-balance max-w-4xl mb-6 leading-[1.1]">
              The only <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-amber-400">Free AI Resume</span> you'll ever need.
            </h2>
            
            <p className="text-lg md:text-xl text-gray-400 text-pretty max-w-2xl mb-12 leading-relaxed">
              Stop fighting with formatting. Let Interna craft <span className="text-white font-medium">ATS-crushing bullet points</span> and track your applications in one high-octane dashboard.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 w-full justify-center items-center">
              
              <SignedOut>
                <SignInButton mode="modal">
                  <Button 
                    size="lg" 
                    className="relative group overflow-hidden w-full sm:w-auto h-16 px-12 rounded-2xl text-xl font-bold text-white bg-gradient-to-r from-cyan-600 via-purple-600 to-purple-700 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_60px_rgba(147,51,234,0.4)] transition-all duration-500 hover:scale-[1.03] active:scale-95"
                  >
                    <span className="relative z-10 flex items-center gap-3">
                      Start Building Free
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                    {/* High-Intensity Shimmer */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                  </Button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Button 
                  size="lg" 
                  className="relative group overflow-hidden w-full sm:w-auto h-16 px-12 rounded-2xl text-xl font-bold text-white bg-gradient-to-r from-cyan-600 to-purple-600 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(147,51,234,0.4)] transition-all duration-500 hover:scale-[1.03]"
                  asChild
                >
                  <Link href="/dashboard">
                    <span className="relative z-10 flex items-center gap-3">
                      Go to Mission Control
                      <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                    </span>
                  </Link>
                </Button>
              </SignedIn>

              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto h-16 px-10 rounded-2xl text-lg font-bold border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white hover:border-amber-500/50 transition-all backdrop-blur-md group"
                asChild
              >
                <Link href="#pricing" className="flex items-center gap-2">
                  Check Plans
                  <Sparkles className="h-4 w-4 text-amber-500 group-hover:animate-spin" />
                </Link>
              </Button>
            </div>

            {/* TRUST SIGNALS (Gold themed) */}
            <div className="mt-12 flex flex-wrap justify-center gap-x-10 gap-y-5 text-sm font-semibold tracking-wide text-gray-500">
              <span className="flex items-center gap-2.5 group cursor-default">
                <div className="h-6 w-6 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-amber-500" />
                </div>
                No Credit Card Required
              </span>
              <span className="flex items-center gap-2.5 group cursor-default">
                <div className="h-6 w-6 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" />
                </div>
                ATS-Optimized Templates
              </span>
              <span className="flex items-center gap-2.5 group cursor-default">
                <div className="h-6 w-6 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                </div>
                Unlimited Tracking
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}