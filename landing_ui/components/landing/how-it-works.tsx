"use client"

//
import { 
  Link2, 
  Database, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2,
  FileText,
  MousePointer2,
  Target // Ensure Target is included here
} from "lucide-react"

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-[#05070A]">
      
      {/* Background Circuitry */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-24 space-y-4">
          <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter">
            How the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Engine</span> Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We don't just track applications. We reverse-engineer the hiring process.
          </p>
        </div>

        {/* THE VISUAL PIPELINE */}
        <div className="grid lg:grid-cols-3 gap-8 items-center relative">
          
          {/* CONNECTING BEAM (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent -translate-y-1/2 z-0 blur-sm" />

          {/* STEP 1: INGESTION */}
          <div className="relative z-10 group">
            <div className="bg-[#0A0D12] border border-white/10 p-8 rounded-3xl h-full shadow-2xl hover:border-primary/50 transition-all duration-300">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0A0D12] border border-white/10 px-4 py-1 rounded-full text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Input Source
              </div>
              
              <div className="h-20 w-20 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Link2 className="h-10 w-10 text-primary" />
              </div>
              
              <h3 className="text-xl font-bold text-center mb-4">Universal Capture</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5">
                  <MousePointer2 className="h-4 w-4 text-cyan-400" />
                  <span>Paste LinkedIn/Indeed URL</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground bg-white/5 p-3 rounded-lg border border-white/5">
                  <FileText className="h-4 w-4 text-cyan-400" />
                  <span>Upload PDF Resume</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: THE AI CORE (Animated) */}
          <div className="relative z-20 scale-110">
            {/* Pulsing Rings */}
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full animate-pulse-glow" />
            
            <div className="bg-gradient-to-b from-[#1a1f2e] to-[#0A0D12] border border-primary/50 p-1 rounded-3xl shadow-[0_0_50px_rgba(0,242,255,0.15)]">
              <div className="bg-[#0A0D12] rounded-[22px] p-8 text-center overflow-hidden relative">
                
                {/* Scanning Animation Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-20 animate-scan pointer-events-none" />

                <div className="h-24 w-24 mx-auto bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-primary/20 animate-float">
                  <BrainCircuit className="h-12 w-12 text-white" />
                </div>

                <h3 className="text-2xl font-black text-white mb-2">Neural Analysis</h3>
                <p className="text-xs font-mono text-primary mb-6">PROCESSING...</p>

                <div className="space-y-2 text-left">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Keyword Matching</span>
                    <span className="text-green-400">98%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 w-[98%]" />
                  </div>
                  
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Gap Detection</span>
                    <span className="text-amber-400">3 Found</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 w-[40%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: OUTPUT */}
          <div className="relative z-10 group">
             <div className="bg-[#0A0D12] border border-white/10 p-8 rounded-3xl h-full shadow-2xl hover:border-green-500/50 transition-all duration-300">
               <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#0A0D12] border border-white/10 px-4 py-1 rounded-full text-xs font-mono text-muted-foreground uppercase tracking-wider">
                Strategic Output
              </div>

              <div className="h-20 w-20 mx-auto bg-green-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Target className="h-10 w-10 text-green-500" />
              </div>
              
              <h3 className="text-xl font-bold text-center mb-4">Action Plan</h3>
              <ul className="space-y-3">
                {[
                  "Readiness Score (0-100)",
                  "Missing Keywords List",
                  "Automated Follow-up Dates",
                  "Kanban Status Update"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>

        {/* FLOATING TAGS (Visual Noise for Tech Feel) */}
        <div className="absolute top-20 left-10 hidden lg:block opacity-20 animate-float delay-100">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs font-mono text-primary">JSON_PARSER</div>
        </div>
        <div className="absolute bottom-20 right-10 hidden lg:block opacity-20 animate-float delay-300">
          <div className="bg-white/5 border border-white/10 px-3 py-1 rounded text-xs font-mono text-purple-400">LATENCY: 12ms</div>
        </div>

      </div>
    </section>
  )
}