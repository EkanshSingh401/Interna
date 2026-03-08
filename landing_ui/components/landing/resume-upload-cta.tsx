"use client"

import { useRef, useEffect, useState } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { CloudUpload, AlertTriangle, XCircle, CheckCircle2, TrendingUp, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SignInButton } from "@clerk/nextjs"

// --- Helper: Animated Number ---
function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(value, { mass: 0.8, stiffness: 50, damping: 15 });
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span>{display}</motion.span>;
}

// --- Helper: Score Row Component ---
function ScoreRow({ label, score, max, state }: { label: string, score: number, max: number, state: "low" | "high" }) {
  const percent = (score / max) * 100
  
  let colorClass = "bg-rose-500"
  let textClass = "text-rose-500"
  let bgClass = "bg-rose-500/10"
  let Icon = XCircle

  if (state === "high") {
    colorClass = "bg-emerald-500"
    textClass = "text-emerald-500"
    bgClass = "bg-emerald-500/10"
    Icon = CheckCircle2
  } else {
    const ratio = score / max
    if (ratio > 0.6) {
        colorClass = "bg-amber-400"
        textClass = "text-amber-400"
        bgClass = "bg-amber-400/10"
        Icon = AlertTriangle
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs md:text-sm transition-colors duration-700">
        <div className="flex items-center gap-2">
            <Icon className={`h-4 w-4 transition-all duration-700 ${textClass}`} />
            <span className="font-medium text-gray-300">{label}</span>
        </div>
        <span className={`font-bold transition-colors duration-700 ${textClass} flex`}>
          <AnimatedNumber value={score} />/{max}
        </span>
      </div>
      
      <div className={`h-2 w-full rounded-full overflow-hidden transition-colors duration-700 ${bgClass}`}>
        <motion.div 
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className={`h-full rounded-full transition-colors duration-700 ${colorClass}`} 
        />
      </div>
    </div>
  )
}

// --- REAL LOGO IMAGES ---
const LOGOS = [
  { name: "Google", src: "/logos/google.png" },
  { name: "Georgia Tech", src: "/logos/georgia-tech.png" },
  { name: "Emory", src: "/logos/emory.png" },
  { name: "Nvidia", src: "/logos/nvidia.png" },
  { name: "Netflix", src: "/logos/netflix.png" },
  { name: "Amazon", src: "/logos/amazon.png" },
  { name: "Microsoft", src: "/logos/microsoft.png" },
  { name: "NASA", src: "/logos/nasa.png" }
]

export function ResumeUploadCTA() {
  const ref = useRef(null)
  
  // Cycle State: "low" -> "high" -> "low"
  const [cycleState, setCycleState] = useState<"low" | "high">("low")

  useEffect(() => {
    const interval = setInterval(() => {
      setCycleState(prev => prev === "low" ? "high" : "low")
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  // DATA CONFIGURATION
  const DATA = {
    low: {
      total: 23,
      content: 26,
      ats: 4,
      internship: 3, 
      writing: 6,
      ready: 2,
      colorFrom: "from-rose-500",
      colorTo: "to-rose-600",
      textColor: "text-rose-500"
    },
    high: {
      total: 94,
      content: 34,
      ats: 24,
      internship: 23,
      writing: 10,
      ready: 5,
      colorFrom: "from-emerald-400",
      colorTo: "to-emerald-600",
      textColor: "text-emerald-500"
    }
  }

  const current = DATA[cycleState]

  return (
    // UPDATED ID HERE: matches Navbar href "#ai-resume-builder"
    <section id="ai-resume-builder" className="py-24 relative overflow-hidden bg-[#05080F]">
       
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-cyan-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-purple-600/5 blur-[100px] rounded-full" />
      </div>

      <style jsx global>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 40s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Upload Your Resume to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Start for Free</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Get your Interna Score instantly and discover how to maximize your resume's impact.
            Our AI analyzes every aspect to ensure it passes ATS systems.
          </p>
        </div>

        {/* --- MAIN CARD --- */}
        <div className="max-w-3xl mx-auto" ref={ref}>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-[#0A0D14] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden transition-colors duration-500"
          >
             {/* Card Top Border Glow */}
             <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${current.colorFrom} via-amber-500 ${current.colorTo} opacity-50 transition-all duration-700`} />

             {/* Top Score Section */}
             <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 pb-8 border-b border-white/5 gap-4">
                <div className="space-y-3 w-full md:w-auto">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Your Interna Score
                        {cycleState === "high" && <TrendingUp className="h-5 w-5 text-emerald-500 animate-bounce" />}
                    </h3>
                    
                    {/* Main Bar Animation */}
                    <div className="h-4 w-full md:w-80 bg-gray-800 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-white/5 animate-pulse z-0" />
                        <motion.div 
                           animate={{ width: `${current.total}%` }}
                           transition={{ duration: 1, ease: "easeInOut" }}
                           className={`h-full bg-gradient-to-r ${current.colorFrom} ${current.colorTo} relative z-10 shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-colors duration-700`} 
                        />
                    </div>
                </div>
                <div className="text-right flex items-baseline gap-1">
                    <span className={`text-5xl md:text-6xl font-black transition-colors duration-700 ${current.textColor}`}>
                        <AnimatedNumber value={current.total} />
                    </span>
                    <span className="text-xl text-gray-500 font-bold">/100</span>
                </div>
             </div>

             {/* Metrics Grid */}
             <div className="space-y-6 mb-10">
                <ScoreRow label="Content Quality" score={current.content} max={35} state={cycleState} />
                <ScoreRow label="ATS & Structure" score={current.ats} max={25} state={cycleState} />
                <ScoreRow label="Internship Optimization" score={current.internship} max={25} state={cycleState} />
                <ScoreRow label="Writing Quality" score={current.writing} max={10} state={cycleState} />
                <ScoreRow label="Application Ready" score={current.ready} max={5} state={cycleState} />
             </div>

             {/* Upload Area */}
             <div className="bg-white/5 rounded-xl p-6 md:p-8 text-center border border-white/5 border-dashed hover:border-cyan-500/30 hover:bg-white/[0.07] transition-all group">
                <p className="text-sm text-gray-400 mb-6 group-hover:text-gray-200 transition-colors">
                  Import your resume to get a detailed analysis and personalized recommendations
                </p>
                
                <SignInButton mode="modal">
                  <Button 
                     size="lg" 
                     className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-base h-12 px-8 shadow-lg shadow-purple-500/20 transition-all hover:scale-105"
                  >
                     <CloudUpload className="mr-2 h-5 w-5 animate-bounce" />
                     Import Resume
                  </Button>
                </SignInButton>
                
                <p className="text-[10px] text-gray-500 mt-4 group-hover:text-cyan-400/70 transition-colors">
                   Supported formats: PDF, DOCX (Max 5MB)
                </p>
             </div>
          </motion.div>
        </div>

        {/* --- INFINITE SCROLL LOGOS (IMAGES) --- */}
        <div className="mt-20 text-center overflow-hidden">
           <h3 className="text-lg font-bold text-white mb-10">
             Build Resumes That Land <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">Internships</span> At
           </h3>
           
           <div className="relative w-full max-w-5xl mx-auto overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
             <div className="flex gap-16 items-center w-max animate-scroll">
               {/* 1. Original Set */}
               {LOGOS.map((logo, i) => (
                 <div key={i} className="h-16 md:h-20 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt={logo.name} className="h-full w-auto object-contain max-h-12 md:max-h-14" />
                 </div>
               ))}
               {/* 2. Duplicate Set */}
               {LOGOS.map((logo, i) => (
                 <div key={`dup-${i}`} className="h-16 md:h-20 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt={logo.name} className="h-full w-auto object-contain max-h-12 md:max-h-14" />
                 </div>
               ))}
               {/* 3. Triplicate Set */}
               {LOGOS.map((logo, i) => (
                 <div key={`trip-${i}`} className="h-16 md:h-20 w-auto opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo.src} alt={logo.name} className="h-full w-auto object-contain max-h-12 md:max-h-14" />
                 </div>
               ))}
             </div>
           </div>
           
           <div className="flex justify-center gap-6 mt-12 text-[10px] md:text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                 <Check className="h-4 w-4 text-emerald-500" /> ATS-Optimized Formats
              </span>
              <span className="flex items-center gap-1.5">
                 <Check className="h-4 w-4 text-emerald-500" /> Industry-Specific Templates
              </span>
              <span className="flex items-center gap-1.5">
                 <Check className="h-4 w-4 text-emerald-500" /> AI-Powered Optimization
              </span>
           </div>
        </div>

      </div>
    </section>
  )
}