import { Header } from "@/components/dashboard/header"
import { ReadinessGauge } from "@/components/dashboard/readiness-gauge"
import { FastAdd } from "@/components/dashboard/fast-add"
import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { OnboardingFlow } from "@/components/dashboard/onboarding-flow"
import { InternshipMatcher } from "@/components/dashboard/internship-matcher"
import { auth } from "@clerk/nextjs/server"
import { getUserInternships } from "@/app/actions/fetch-internships"
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Crown,
  Zap,
  History 
} from "lucide-react" 
import Link from "next/link" 
import { createClient } from "@supabase/supabase-js" 
import { Button } from "@/components/ui/button"

// FORCE DYNAMIC
export const dynamic = 'force-dynamic'

/**
 * Calculates "Realized Readiness"
 */
function calculateReadinessScore(internships: any[]) {
  if (!internships || internships.length === 0) return 0
  
  const stageRealization: Record<string, number> = {
    'offer': 1.0, 
    'interview': 1.0, 
    'applied': 0.8, 
    'wishlist': 0.6, 
    'ghosted': 0.1
  }

  let totalRealizedScore = 0
  let validJobCount = 0

  internships.forEach((item) => {
    const aiFitScore = item.fit_score || 0
    const realizationFactor = stageRealization[(item.status || 'wishlist').toLowerCase()] || 0.6
    
    if (aiFitScore > 0) {
      totalRealizedScore += (aiFitScore * realizationFactor)
      validJobCount++
    }
  })

  return validJobCount === 0 ? 0 : Math.round(totalRealizedScore / validJobCount)
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Dashboard(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const paymentStatus = searchParams.payment
  const { userId } = await auth()
  
  // 1. Initialize Supabase
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // 2. Parallel Fetch
  const [profileResult, internships] = await Promise.all([
    userId 
      ? supabase
          .from('profiles')
          .select('resume_text, is_pro, matcher_scans') 
          .eq('id', userId)
          .single()
      : Promise.resolve({ data: null }),
    userId 
      ? getUserInternships(userId) 
      : Promise.resolve([])
  ])

  const profile = profileResult.data
  const isPro = !!profile?.is_pro
  const hasResume = !!profile?.resume_text
  const scansUsed = profile?.matcher_scans || 0
  
  // Logic: Free users get 1 free resume.
  // If they are NOT pro, and they DO have a resume, they are "Used"
  const isFreeAndUsed = !isPro && hasResume

  // 3. Calculate scores
  const currentScore = calculateReadinessScore(internships)
  const previousScore = Math.max(0, currentScore - (internships.length > 0 ? 5 : 0))

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <OnboardingFlow />
      <Header isPro={isPro} />
      
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-10">
        
        {/* Payment Alerts */}
        {paymentStatus === "success" && (
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-emerald-600">Upgrade Successful!</p>
              <p className="text-xs text-emerald-600/80">Your Pro features are now unlocked.</p>
            </div>
          </div>
        )}

        {paymentStatus === "canceled" && (
          <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-amber-500" />
            <p className="text-sm text-amber-600">Payment was canceled.</p>
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Mission Control</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Welcome back, Pilot. Your command center is ready.
          </p>
        </div>
        
        {/* --- MAIN FEATURE: RESUME COMMAND CENTER --- */}
        <section className="relative group perspective-1000">
          {/* Animated Glow Behind */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[24px] blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          
          <div className="relative overflow-hidden rounded-[20px] bg-[#0F1218] border border-white/10 p-8 md:p-10 transition-transform duration-500 hover:-translate-y-1 shadow-2xl">
              
              {/* Background Decoration */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                
                {/* Left Side: Text & Status */}
                <div className="space-y-6 max-w-2xl">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      <Sparkles className="h-3 w-3" />
                      Main Engine
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Title Link - Conditional based on usage */}
                      <Link 
                        href={isFreeAndUsed ? "/upgrade" : "/dashboard/resume"} 
                        className="hover:opacity-80 transition-opacity"
                      >
                        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                          Resume Command Center
                        </h2>
                      </Link>

                      {/* --- BUTTON: VIEW RESUMES --- */}
                      {/* Only show if they actually have a resume to view */}
                      {hasResume && (
                        <Link href="/dashboard/resumes">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="bg-white/10 hover:bg-white/20 text-indigo-100 border border-white/10 h-9 gap-2"
                          >
                            <History className="h-4 w-4" />
                            View History
                          </Button>
                        </Link>
                      )}
                    </div>

                    <p className="text-muted-foreground text-lg leading-relaxed">
                      Build, tailor, and optimize your resume with AI. 
                      {isFreeAndUsed 
                        ? " You have used your free slot. Upgrade to create more." 
                        : " Create your master resume to start generating tailored applications."}
                    </p>
                  </div>

                  {/* Status Indicators */}
                  <div className="flex flex-wrap items-center gap-4">
                      {/* Plan Status */}
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium ${
                        isPro 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-white/5 border-white/10 text-muted-foreground"
                      }`}>
                        {isPro ? <Crown className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                        {isPro ? "Pro Active" : "Free Plan"}
                      </div>

                      {/* Usage Limit Badge (The 0/1 Thing) */}
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                        isPro
                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          : isFreeAndUsed
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400" // Used (Red/Amber)
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" // Available (Green)
                      }`}>
                        <FileText className="h-4 w-4" />
                        {isPro ? (
                          "Unlimited Versions"
                        ) : (
                          <span className="flex items-center gap-2">
                             {/* Logic: If no resume, 0/1. If resume, 1/1 */}
                             {hasResume ? "1 / 1 Used" : "0 / 1 Used"}
                             
                             {/* Little pulsing dot if they still have a credit */}
                             {!hasResume && (
                               <span className="relative flex h-2 w-2">
                                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                 <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                               </span>
                             )}
                          </span>
                        )}
                      </div>
                  </div>
                </div>

                {/* Right Side: Big CTA Button visual */}
                {/* Redirects to Upgrade if limit reached, otherwise to Builder */}
                <Link 
                  href={isFreeAndUsed ? "/upgrade" : "/dashboard/resume"} 
                  className="flex-shrink-0 group/icon"
                >
                  <div className={`h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer shadow-2xl ${
                    isFreeAndUsed 
                      ? "bg-zinc-800 border border-white/10 opacity-80" // Locked Style
                      : "bg-indigo-600 shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] group-hover/icon:scale-110" // Active Style
                  }`}>
                    {isFreeAndUsed ? (
                      <Lock className="h-8 w-8 text-zinc-500" />
                    ) : (
                      <ArrowRight className="h-8 w-8 text-white" />
                    )}
                  </div>
                </Link>

              </div>
            </div>
        </section>

        {/* --- SECONDARY TOOLS --- */}
        <InternshipMatcher isPro={isPro} scansUsed={scansUsed} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <FastAdd />
          </div>
          <div>
             <ReadinessGauge score={currentScore} previousScore={previousScore} isPro={isPro} />
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Active Pipeline</h2>
          </div>
          <KanbanBoard initialData={internships} isPro={isPro} />
        </div>

        <div className="mt-12 flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-6">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              All systems operational
            </span>
            <span className="font-mono">Sync: {new Date().toLocaleTimeString()}</span>
          </div>
          <span className="font-mono">Interna v2.0</span>
        </div>
      </main>
    </div>
  )
}