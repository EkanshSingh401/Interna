import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Building2, MapPin, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnalysisTools } from "@/components/dashboard/analysis-tools"

// Init Supabase for Server Component
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AnalysisPage({ params }: PageProps) {
  const { userId } = await auth()
  if (!userId || !supabase) redirect("/")

  const { id } = await params

  // 1. Fetch the internship data, ensuring we get the generated content columns
  const { data: job } = await supabase
    .from('internships')
    .select('*')
    .eq('id', id)
    .single()

  if (!job) redirect("/dashboard")

  const analysis = job.fit_analysis || {}
  const score = job.fit_score || 0
  const pros = analysis.pros || []
  const cons = analysis.cons || []
  const actionPlan = analysis.action_plan || []
  const verdict = analysis.verdict || "No verdict available"

  // Color Logic
  let colorClass = "text-muted-foreground"
  if (score >= 80) colorClass = "text-emerald-500"
  else if (score >= 50) colorClass = "text-yellow-500"
  else colorClass = "text-red-500"

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild className="-ml-2">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="font-semibold text-sm">Fit Analysis</span>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
        
        {/* Job Info Bar */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-secondary/20 p-4 rounded-xl border border-border">
          <div className="space-y-1">
            <h1 className="text-xl font-bold flex items-center gap-2">
              {job.role}
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" /> {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.location || "Remote"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-background p-3 rounded-lg border shadow-sm">
             <div className="text-right">
               <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Fit Score</div>
               <div className="text-xs font-medium text-foreground">{verdict}</div>
             </div>
             <div className={`text-4xl font-bold font-mono tracking-tighter ${colorClass}`}>
                {score}
             </div>
          </div>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
               <CheckCircle2 className="h-4 w-4 text-emerald-500" />
               <h3 className="font-semibold text-sm uppercase tracking-wide text-emerald-600">Why You Match</h3>
            </div>
            <div className="space-y-2">
              {pros.map((item: string, i: number) => (
                <div key={i} className="bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-md flex gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-amber-500/20">
               <AlertTriangle className="h-4 w-4 text-amber-500" />
               <h3 className="font-semibold text-sm uppercase tracking-wide text-amber-600">Missing Skills</h3>
            </div>
            <div className="space-y-2">
              {cons.map((item: string, i: number) => (
                <div key={i} className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-md flex gap-3">
                  <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/90">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Coach */}
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-100 dark:from-indigo-950/20 dark:to-purple-950/20 dark:border-indigo-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
               <Sparkles className="h-5 w-5" />
               AI Coach: How to Increase Your Odds
            </CardTitle>
          </CardHeader>
          <CardContent>
            {actionPlan.length > 0 ? (
              <ul className="space-y-3">
                {actionPlan.map((tip: string, i: number) => (
                  <li key={i} className="flex gap-3 text-sm text-foreground/80 bg-background/50 p-3 rounded-lg border border-indigo-100/50">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300">
                      {i + 1}
                    </span>
                    <span className="pt-0.5">{tip}</span>
                  </li>
                ))}
              </ul>
            ) : (
               <p className="text-sm text-muted-foreground italic">Re-run analysis to see your action plan.</p>
            )}
          </CardContent>
        </Card>

        {/* 2. PASS THE SAVED DATA TO MAGIC ACTIONS */}
        <AnalysisTools 
          jobId={job.id} 
          userId={userId} 
          initialEmail={job.generated_email} 
          initialCoverLetter={job.generated_cover_letter} 
        />

        {/* Original Listing */}
        <div className="pt-4 border-t">
          <h3 className="font-semibold text-sm mb-2 text-muted-foreground">Original Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
            {job.summary}
          </p>
          <div className="mt-4">
             <Button variant="outline" size="sm" asChild>
                <a href={job.source_url} target="_blank" rel="noopener noreferrer">
                  View Full Listing on {job.company} Career Page
                </a>
             </Button>
          </div>
        </div>
      </main>
    </div>
  )
}