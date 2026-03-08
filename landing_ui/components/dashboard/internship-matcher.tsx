"use client"

import { useState } from "react"
import { Sparkles, ExternalLink, Loader2, CheckCircle, Search, AlertCircle, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { findMatches } from "@/app/actions/find-matches" 
import Link from "next/link"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { useRouter } from "next/navigation"

interface InternshipMatcherProps {
  isPro?: boolean
  scansUsed?: number
}

export function InternshipMatcher({ isPro = false, scansUsed = 0 }: InternshipMatcherProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [hasRun, setHasRun] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const handleMatch = async () => {
    if (!isPro && scansUsed >= 1) {
      setShowUpgrade(true)
      return
    }

    setIsLoading(true)
    setResults([]) 
    try {
      const data = await findMatches()
      
      if (data && data.some((item: any) => item.isLimitReached)) {
        setShowUpgrade(true)
        setIsLoading(false)
        return
      }

      setResults(data || []) 
      setHasRun(true)
      router.refresh()
      
    } catch (error) {
      console.error("Matching failed", error)
      setHasRun(true) 
    } finally {
      setIsLoading(false)
    }
  }

  const isLimitReached = results.some(job => job.isLimitReached === true);

  return (
    <>
      <div className="w-full mb-8 rounded-xl border border-indigo-500/50 bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-indigo-900/40 overflow-hidden shadow-[0_0_15px_rgba(99,102,241,0.15)] transition-all relative">
        
        {/* Header Area */}
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <div className="z-10">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white tracking-tight">
              <Sparkles className="h-5 w-5 text-cyan-400 fill-cyan-400/20" />
              Interna AI Matcher
              <Sparkles className="h-4 w-4 text-purple-400 fill-purple-400/20" />
            </h2>
            <p className="text-sm text-indigo-200/80 mt-1.5 font-medium">
              Scan your resume against live job boards to find high-fit roles.
            </p>
          </div>

          <div className="z-10 flex flex-col items-end gap-2">
            {!hasRun && (
              <>
                <Button 
                  onClick={handleMatch} 
                  disabled={isLoading}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all border-0"
                >
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...</>
                  ) : (
                    <><Search className="mr-2 h-4 w-4 stroke-[3px]" /> Find Matches</>
                  )}
                </Button>

                {!isPro && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
                     scansUsed >= 1 
                      ? "text-amber-500 bg-amber-500/10 border-amber-500/20" 
                      : "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
                  }`}>
                    {scansUsed} / 1 Free Scan Used
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {!isLoading && hasRun && (
          <div className="relative border-t border-indigo-500/30 bg-black/20 backdrop-blur-md animate-in slide-in-from-top-2 duration-500">
            
            {/* Limit Overlay */}
            {isLimitReached && (
              <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[6px] p-6 text-center transition-all duration-500">
                <div className="mb-4 rounded-full bg-amber-500/20 p-3 ring-1 ring-amber-500/50">
                  <Crown className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Unlock Mission Readiness</h3>
                <p className="mb-6 mt-2 max-w-[280px] text-sm text-muted-foreground">
                  Get deep AI insights into your application strength and unlimited matching.
                </p>
                <Button 
                  onClick={() => setShowUpgrade(true)}
                  className="bg-amber-500 font-semibold text-black hover:bg-amber-600 px-8 py-6 h-auto"
                >
                  Upgrade to Pro
                </Button>
              </div>
            )}

            <div className={`${isLimitReached ? "opacity-40 pointer-events-none blur-[4px]" : ""}`}>
              {results.length > 0 ? (
                <div className="divide-y divide-indigo-500/20">
                  {results.map((job, index) => (
                    // KEY FIX: Unique key using index
                    <div key={`${job.id}-${index}`} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-white/5 group transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          {/* FALLBACKS for Missing Data */}
                          <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {job.role || "Internship Role"}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-400 font-bold">
                            {job.fitScore || 0}% Fit
                          </span>
                        </div>
                        <p className="text-sm text-indigo-200/60 mt-0.5">{job.company || "Company"} • {job.posted || "Recently"}</p>
                        <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1.5 font-medium bg-emerald-500/5 w-fit px-2 py-1 rounded">
                          <CheckCircle className="h-3 w-3" /> {job.matchReason || "Recommended for you"}
                        </p>
                      </div>
                      
                      {/* URL FIX: Prevent undefined href crash */}
                      <Link href={job.url || "#"} target="_blank">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 border-indigo-500/30 hover:text-cyan-400 hover:border-cyan-500/50 text-indigo-200"
                          disabled={!job.url || job.url === "#"}
                        >
                          Apply Now <ExternalLink className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <AlertCircle className="h-5 w-5 text-indigo-400 mb-3" />
                  <p className="text-sm text-indigo-200 font-medium">No matches found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REVERTED: Original Loading Text */}
        {isLoading && (
          <div className="p-10 text-center border-t border-indigo-500/30 bg-black/20 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="mx-auto w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border border-indigo-400/30 animate-ping" />
                <Loader2 className="h-7 w-7 text-cyan-400 animate-spin" />
             </div>
             <p className="text-sm font-semibold text-indigo-100">Analyzing your resume skills...</p>
             <p className="text-xs text-indigo-300/70 mt-1">Cross-referencing with live job sources</p>
          </div>
        )}
      </div>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        title="Matcher Limit Reached"
        description="You've used your 1 free AI scan. Upgrade to Pro for unlimited high-accuracy internship matching with Interna AI."
      />
    </>
  )
}