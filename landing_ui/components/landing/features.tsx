"use client"

import { motion } from "framer-motion"
import { 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  TrendingUp, 
  PenTool,
  XCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

// --- Sub-Component: Internship Score Card (Top Right) ---
function ScoreCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      // Standardized width (w-64) for a clean look
      className="absolute top-8 -right-[20px] md:-right-[60px] w-64 bg-[#0F1219]/95 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-2xl z-20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-xs text-gray-400 uppercase tracking-wider font-bold">Internship Match</span>
          {/* GREEN for Success */}
          <span className="text-xl font-black text-emerald-500">
            Top 5%
          </span>
        </div>
        
        {/* Circular Score - GREEN ring */}
        <div className="relative h-14 w-14 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
            <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-emerald-500" strokeDasharray="150.8" strokeDashoffset="10" />
          </svg>
          <span className="absolute text-sm font-bold text-white">93</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Metric 1 - Green (Good) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-300 font-medium">
            <span>Role Fit (SWE Intern)</span>
            <span>98/100</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[98%]" />
          </div>
        </div>
        
        {/* Metric 2 - Yellow (Warning/Average) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-300 font-medium">
            <span>ATS Keywords</span>
            <span className="text-amber-400">OK</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 w-[70%]" />
          </div>
        </div>

        {/* Metric 3 - Green (High) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-300 font-medium">
            <span>Experience Impact</span>
            <span className="text-emerald-500">High</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-[85%]" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// --- Sub-Component: Analysis Card (Top Left) ---
function AnalysisCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6 }}
      className="absolute top-16 -left-[20px] md:-left-[60px] w-60 bg-[#0F1219]/95 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-2xl z-20"
    >
      <div className="space-y-4">
        <div>
          {/* Green for Strength */}
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-2">
            <CheckCircle2 className="h-3.5 w-3.5" /> Strong Keywords
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {/* Green Tags based on resume image */}
            {["Python", "Flask", "React", "PostgreSQL"].map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full h-[1px] bg-white/10" />
        <div>
          {/* Red for Missing/Error */}
          <h4 className="flex items-center gap-1.5 text-xs font-bold text-rose-500 mb-1">
            <XCircle className="h-3.5 w-3.5" /> Missing Skills
          </h4>
          <p className="text-[10px] text-gray-400 leading-snug">
            Job requires <span className="text-white font-medium">Kubernetes</span> and <span className="text-white font-medium">AWS</span>. Consider adding a cloud project.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// --- Sub-Component: Bullet Improver (Bottom Left) ---
function BulletImproverCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.7 }}
      className="absolute bottom-20 -left-[10px] md:-left-[40px] w-72 bg-[#0F1219]/95 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-2xl z-20"
    >
       {/* Green for Optimized - Improving the 'Gitlytics' bullet */}
       <h4 className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 mb-2">
          <Sparkles className="h-3.5 w-3.5" /> Optimized Bullet
       </h4>
       <p className="text-[10px] text-gray-300 italic mb-3 bg-white/5 p-2 rounded border-l-2 border-emerald-500 leading-relaxed">
         "Integrated GitHub OAuth 2.0 to securely authenticate 500+ users, enabling seamless repository data ingestion."
       </p>
       
       {/* Amber/Yellow for 'Improvement Suggestion' */}
       <h4 className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
          <TrendingUp className="h-3.5 w-3.5" /> Improvement
       </h4>
       <div className="text-[10px] text-gray-400 leading-snug">
         Added specific technology (<span className="text-emerald-400">OAuth 2.0</span>) and user scale to demonstrate impact.
       </div>
    </motion.div>
  )
}

// --- Sub-Component: AI Writer (Bottom Right) ---
// Cyan/Purple as requested
function AIWriterCard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.8 }}
      className="absolute bottom-8 -right-[10px] md:-right-[40px] w-60 bg-[#0F1219]/95 backdrop-blur-md border border-white/10 p-5 rounded-xl shadow-2xl z-20"
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="h-5 w-5 rounded bg-purple-500/20 flex items-center justify-center text-purple-400">
          <PenTool className="h-3.5 w-3.5" />
        </div>
        <span className="text-xs font-bold text-white">AI Content Writer</span>
      </div>
      <p className="text-[10px] text-gray-400 mb-3">
        Generate metrics-driven bullets for your internship applications.
      </p>
      {/* BRAND GRADIENT BUTTON (Kept) */}
      <Button size="sm" className="w-full h-8 text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 border-0 text-white shadow-lg shadow-purple-500/20">
        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Generate Bullet
      </Button>
    </motion.div>
  )
}

// --- Main Component ---
export function Features() {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-[#070B14]">
      
      {/* Background Glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-purple-900/10 blur-[130px] rounded-full opacity-40" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            See What <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-cyan-400 animate-pulse">Internship Recruiters See</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Our AI analyzes your resume against 100+ internship requirements to maximize your interview chances.
          </p>
        </div>

        {/* --- MAIN DEMO AREA --- */}
        <div className="relative max-w-5xl mx-auto min-h-[700px] flex justify-center items-center">
          
          {/* THE REAL RESUME PNG */}
          {/* Using a fixed width of 500px for desktop to hit the "smaller but bigger" target */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative w-[340px] md:w-[500px] h-auto bg-white rounded-sm shadow-2xl z-10 hidden md:block"
          >
             {/* IMPORTANT: Ensure 'resume.png' is in your /public folder.
                 If using Next.js Image, you need width/height or fill. 
                 Using standard img tag here for simplicity with variable height.
             */}
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
               src="/resume.png" 
               alt="Ekansh Singh Resume Analysis" 
               className="w-full h-auto object-cover rounded-sm"
             />

            {/* THE SCANNING EFFECT (Green) */}
            <motion.div 
               className="absolute left-0 right-0 h-[2px] bg-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.8)] z-20"
               animate={{ top: ["0%", "100%", "0%"] }}
               transition={{ duration: 7, ease: "linear", repeat: Infinity }}
            />
          </motion.div>

          {/* Floating Widgets */}
          <div className="hidden md:block">
            <ScoreCard />
            <AnalysisCard />
            <BulletImproverCard />
            <AIWriterCard />
          </div>

          {/* Mobile Fallback */}
          <div className="md:hidden flex flex-col gap-6 w-full px-4">
             <div className="relative w-full bg-white rounded-sm overflow-hidden mb-4 shadow-xl">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src="/resume.png" alt="Resume Mobile" className="w-full h-auto opacity-50" />
                 <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <p className="text-white font-bold px-4 text-center">Interactive Analysis available on Desktop</p>
                 </div>
             </div>
             
             {/* Mobile Analysis Cards */}
             <div className="space-y-4">
                 <div className="bg-[#0F1219] p-4 rounded-xl border border-white/10">
                    <h4 className="text-emerald-500 font-bold mb-1">Top 5% Match</h4>
                    <p className="text-sm text-gray-400">Your profile fits the SWE Intern role perfectly.</p>
                 </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  )
}