"use client"

import Link from "next/link"
import { useEffect, useRef } from "react"
import { 
  motion, 
  useMotionValue, 
  useTransform, 
  animate,
  useInView
} from "framer-motion"
import { 
  ArrowRight,
  Check,
  Zap,
  ShieldCheck,
  TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"

// --- Helper Component: Number Counter ---
function Counter({ from = 0, to, duration = 2, delay = 0 }: { from?: number, to: number, duration?: number, delay?: number }) {
  const count = useMotionValue(from)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, delay, ease: "easeOut" })
      return controls.stop
    }
  }, [count, to, duration, delay, inView])

  return <motion.span ref={ref}>{rounded}</motion.span>
}

export function Hero() {
  return (
    <section 
      className="relative pt-32 pb-40 overflow-hidden"
      style={{
        background: `
          linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(0,0,0,0.05)),
          radial-gradient(500px 250px at 70% 40%, rgba(139,92,246,0.08), transparent 65%),
          #070B14
        `
      }}
    >
      
      {/* GLOBAL CSS ANIMATIONS */}
      <style jsx global>{`
        @keyframes flow-gradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-flow {
          background-size: 200% auto;
          animation: flow-gradient 3s linear infinite;
        }
        @keyframes pulse-shadow-cyan {
          0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.4); } 
          50% { box-shadow: 0 0 40px rgba(168, 85, 247, 0.6); }     
        }
        .animate-pulse-shadow-cyan {
          animation: pulse-shadow-cyan 3s ease-in-out infinite;
        }
      `}</style>

      {/* 1. ATMOSPHERE */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[-10%] w-[600px] h-[600px] bg-purple-700/10 blur-[180px] rounded-full opacity-40" />
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-purple-500/5 blur-[100px] rounded-full opacity-30" />
      </div>

      <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
        
        {/* 2. HEADLINE & CTA */}
        <div className="space-y-12 mb-24">
          
          {/* ANIMATED HEADLINE */}
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-normal text-white leading-[1.25]">
            {/* Part 1: "The Last" - Immediate */}
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block"
            >
              The Last 
            </motion.span>
            
            <br className="hidden md:block"/>

            {/* Part 2: Gradient Text & Underline - Delayed */}
            <span className="relative inline-block mx-2 pb-2 mt-2">
              <motion.span 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }} // Delay gradient text
                className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 animate-flow [word-spacing:0.15em]"
              >
                Internship Resume Builder
              </motion.span>
              
              {/* LIVE DRAWING UNDERLINE */}
              <motion.span 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1, delay: 1, ease: "circOut" }} // Draws after text appears
                className="absolute left-0 right-0 bottom-3 h-[6px] rounded-full bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 animate-flow origin-left"
              ></motion.span>
            </span> 
            
            <br className="hidden md:block"/>
            
            {/* Part 3: "You'll Ever Need" - Slight delay after gradient */}
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="inline-block"
            >
              You'll Ever Need
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-medium mb-16"
          >
            Build ATS-optimized resumes that pass screening systems and let Interna AI tailor each resume for every internship.
          </motion.p>

          {/* --- ACTION AREA --- */}
          <motion.div 
             initial={{ opacity: 0, y: 30 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.4, duration: 0.8 }}
             className="space-y-10"
          >
            
            {/* A. BUTTON */}
            <div className="flex justify-center">
              <SignedOut>
                  <SignInButton mode="modal">
                    <Button size="lg" className="relative group overflow-hidden rounded-lg w-64 h-14 text-lg font-bold text-white animate-pulse-shadow-cyan transition-all hover:scale-105 shadow-xl">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 transition-transform duration-300 group-hover:scale-110" />
                        <div className="relative flex items-center justify-center gap-2">
                          Get Started Free
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Button>
                  </SignInButton>
              </SignedOut>
              <SignedIn>
                  <Button size="lg" asChild className="relative group overflow-hidden rounded-lg w-64 h-14 text-lg font-bold text-white animate-pulse-shadow-cyan transition-all hover:scale-105 shadow-xl">
                    <Link href="/dashboard">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-600 transition-transform duration-300 group-hover:scale-110" />
                        <div className="relative flex items-center justify-center gap-2">
                          Go to Dashboard
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </Link>
                  </Button>
              </SignedIn>
            </div>

            {/* B. CHECKMARKS */}
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-medium text-gray-400">
               <span className="flex items-center gap-2">
                 <Check className="h-5 w-5 text-green-500" /> No credit card required
               </span>
               <span className="w-1 h-1 rounded-full bg-gray-700" />
               <span className="flex items-center gap-2">
                 <Check className="h-5 w-5 text-green-500" /> Free forever
               </span>
               <span className="w-1 h-1 rounded-full bg-gray-700" />
               <span className="flex items-center gap-2">
                 <Check className="h-5 w-5 text-green-500" /> Setup in 2 minutes
               </span>
            </div>

            {/* C. THREE CARDS - With Counters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-16">
              
              {/* Card 1: AI Powered */}
              <div className="group relative rounded-2xl bg-white/5 p-[4px] overflow-hidden transition-all duration-300 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-flow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative h-full bg-black/60 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                       <Zap className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-center">
                       <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2">
                         AI <span className="text-purple-400">Powered</span>
                       </h3>
                       <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-2">Smart Optimization</p>
                    </div>
                 </div>
              </div>

              {/* Card 2: 100% Pass Through */}
              <div className="group relative rounded-2xl bg-white/5 p-[4px] overflow-hidden transition-all duration-300 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-flow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative h-full bg-black/60 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                       <ShieldCheck className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-center">
                       <h3 className="text-2xl font-black text-white">
                         {/* NUMBER COUNTER ADDED HERE */}
                         <Counter to={100} duration={2.5} delay={1.5} />
                         <span className="text-purple-400 text-xl">%</span>
                       </h3>
                       <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-2">ATS Pass-Through</p>
                    </div>
                 </div>
              </div>

              {/* Card 3: 50% Boost */}
              <div className="group relative rounded-2xl bg-white/5 p-[4px] overflow-hidden transition-all duration-300 hover:-translate-y-1">
                 <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 animate-flow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                 
                 <div className="relative h-full bg-black/60 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center gap-4">
                    <div className="h-12 w-12 bg-cyan-500/10 rounded-xl flex items-center justify-center border border-cyan-500/20">
                       <TrendingUp className="h-6 w-6 text-cyan-400" />
                    </div>
                    <div className="text-center">
                       <h3 className="text-2xl font-black text-white">
                         {/* NUMBER COUNTER ADDED HERE */}
                         <Counter to={50} duration={2} delay={1.5} />
                         <span className="text-purple-400 text-xl">%+</span>
                       </h3>
                       <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mt-2">Interview Boost</p>
                    </div>
                 </div>
              </div>

            </div>

          </motion.div>
        </div>
      </div>
    </section>
  )
}