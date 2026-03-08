"use client"

import { useState, useTransition } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Building2, MapPin, Calendar, ExternalLink, 
  Sparkles, MessageSquare, FileText, CheckCircle2,
  AlertCircle, ArrowRight, Crown, Lock, Loader2
} from "lucide-react"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { generateContent } from "@/app/actions/generate-content" 
import { toast } from "sonner"

// --- INTERNAL HELPER: Pro Gatekeeper ---
function ProGatekeeper({ 
  children, 
  isPro, 
  onUpgrade, 
  title 
}: { 
  children: React.ReactNode, 
  isPro: boolean, 
  onUpgrade: () => void, 
  title: string 
}) {
  if (isPro) return <>{children}</>;

  return (
    <div className="relative rounded-lg overflow-hidden min-h-[300px] border border-border/50 bg-muted/10">
      <div className="blur-md opacity-50 select-none pointer-events-none transition-all filter saturate-50 p-4">
        {children}
      </div>

      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] p-6 text-center">
        <div className="bg-background/95 p-5 rounded-2xl border border-amber-500/20 shadow-xl space-y-3 max-w-[260px] animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
            <Lock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-bold text-foreground">Unlock {title}</p>
            <p className="text-xs text-muted-foreground leading-tight px-2">
              Upgrade to Pro to see AI-powered insights for this role.
            </p>
          </div>
          <Button 
            size="sm" 
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm"
            onClick={onUpgrade}
          >
            <Crown className="h-3 w-3 mr-1.5 fill-current" />
            UPGRADE NOW
          </Button>
        </div>
      </div>
    </div>
  )
}

interface JobDetailSheetProps {
  isOpen: boolean
  onClose: () => void
  job: any
  isPro?: boolean 
}

export function JobDetailSheet({ isOpen, onClose, job, isPro = false }: JobDetailSheetProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [isPending, startTransition] = useTransition() 
  const [loadingType, setLoadingType] = useState<string | null>(null)

  if (!job) return null

  const analysis = job.fit_analysis || {};
  
  // Logic to determine if we have real generated data
  const hasQuestions = analysis.questions && analysis.questions.length > 0;
  const hasActionPlan = analysis.action_plan && analysis.action_plan.length > 0;

  const handleGenerate = (type: "interview" | "resume") => {
    setLoadingType(type);
    startTransition(async () => {
      const result = await generateContent(type, job.id, job.user_id); 
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(`${type === 'interview' ? 'Questions' : 'Suggestions'} generated!`);
      }
      setLoadingType(null);
    });
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="sm:max-w-2xl w-full overflow-hidden flex flex-col p-0 border-l border-border gap-0">
          
          {/* Header */}
          <div className="p-6 border-b border-border bg-muted/30 shrink-0">
            <SheetHeader className="p-0 gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl font-bold text-primary shadow-sm">
                    {job.company ? job.company.charAt(0).toUpperCase() : "?"}
                  </div>
                  <div>
                    <SheetTitle className="text-xl font-bold leading-tight">{job.role}</SheetTitle>
                    <SheetDescription className="flex items-center gap-2 mt-1.5 font-medium">
                      <Building2 className="h-3.5 w-3.5" /> {job.company}
                    </SheetDescription>
                  </div>
                </div>
                <Badge variant="outline" className="capitalize bg-background px-3 py-1 text-xs font-medium shadow-sm">
                  {job.status}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{job.location}</div>
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Added {new Date(job.created_at).toLocaleDateString()}</div>
                {job.source_url && (
                  <a href={job.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-primary hover:text-primary/80 hover:underline ml-auto font-medium transition-colors">
                    View Listing <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </SheetHeader>
          </div>

          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="px-6 pt-4 border-b border-border shrink-0">
              <TabsList className="grid w-full grid-cols-4 h-auto p-1 bg-muted/50 rounded-lg">
                <TabsTrigger value="overview" className="text-xs py-2 font-medium">Overview</TabsTrigger>
                <TabsTrigger value="match" className="text-xs py-2 gap-1.5 font-medium group">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400 group-data-[state=active]:text-indigo-600 dark:group-data-[state=active]:text-indigo-300" /> Match
                </TabsTrigger>
                <TabsTrigger value="interview" className="text-xs py-2 gap-1.5 font-medium group">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-400 group-data-[state=active]:text-emerald-600 dark:group-data-[state=active]:text-emerald-300" /> Prep
                </TabsTrigger>
                <TabsTrigger value="resume" className="text-xs py-2 gap-1.5 font-medium group">
                  <FileText className="h-3.5 w-3.5 text-amber-400 group-data-[state=active]:text-amber-600 dark:group-data-[state=active]:text-amber-300" /> Resume
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1 min-h-0">
              <div className="p-6 h-full">
                
                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="mt-0 space-y-6">
                  <div>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" /> Job Description</h3>
                    <div className="text-sm text-muted-foreground leading-relaxed bg-muted/30 p-5 rounded-xl border border-border whitespace-pre-wrap">
                      {job.summary || "No description available for this position."}
                    </div>
                  </div>
                </TabsContent>

                {/* MATCH ANALYSIS TAB */}
                <TabsContent value="match" className="mt-0 focus-visible:outline-none">
                  <ProGatekeeper isPro={isPro} onUpgrade={() => setShowUpgrade(true)} title="Match Analysis">
                      <div className="space-y-6">
                          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-5 rounded-xl border border-indigo-500/20">
                              <div>
                                  <h4 className="font-semibold text-indigo-500 flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Fit Score</h4>
                                  <p className="text-xs text-muted-foreground mt-1">Based on resume comparison</p>
                              </div>
                              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{job.fit_score || 0}%</div>
                          </div>
                          <div className="grid gap-4">
                              <div className="space-y-3 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-emerald-600 dark:text-emerald-500"><CheckCircle2 className="h-4 w-4" /> Key Strengths</h4>
                                <ul className="text-sm text-muted-foreground space-y-2.5">
                                  {(analysis.pros || ["No analysis available yet."]).map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                      <span className="text-emerald-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" />
                                      <span className="leading-snug">{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                               <div className="space-y-3 p-4 bg-amber-500/5 rounded-xl border border-amber-500/10">
                                <h4 className="text-sm font-semibold flex items-center gap-2 text-amber-600 dark:text-amber-500"><AlertCircle className="h-4 w-4" /> Potential Gaps</h4>
                                <ul className="text-sm text-muted-foreground space-y-2.5">
                                  {(analysis.cons || ["No gaps identified yet."]).map((s: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2.5">
                                      <span className="text-amber-500 mt-1.5 h-1.5 w-1.5 rounded-full bg-current shrink-0" /> 
                                      <span className="leading-snug">{s}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                          </div>
                      </div>
                  </ProGatekeeper>
                </TabsContent>

                {/* INTERVIEW PREP TAB */}
                <TabsContent value="interview" className="mt-0 focus-visible:outline-none">
                   <ProGatekeeper isPro={isPro} onUpgrade={() => setShowUpgrade(true)} title="Interview Prep">
                      <div className="space-y-5">
                          <div className="flex items-center justify-between mb-2">
                             <h4 className="text-sm font-medium text-foreground">AI Generated Questions</h4>
                             <Badge variant="secondary" className="text-xs font-normal">Based on JD</Badge>
                          </div>
                          
                          {!hasQuestions ? ( 
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-muted/20 text-center space-y-4">
                              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary"><MessageSquare className="h-6 w-6" /></div>
                              <div className="space-y-1">
                                <p className="text-sm font-semibold">Ready to prepare?</p>
                                <p className="text-xs text-muted-foreground">Generate role-specific technical and behavioral questions.</p>
                              </div>
                              <Button 
                                onClick={() => handleGenerate("interview")} 
                                disabled={loadingType === "interview"}
                                className="w-full shadow-sm bg-indigo-600 hover:bg-indigo-700"
                              >
                                {loadingType === "interview" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                {loadingType === "interview" ? "Generating Questions..." : "Generate with Interna AI"}
                              </Button>
                            </div>
                          ) : (
                             <ul className="space-y-4">
                               {(analysis.questions || []).map((q: string, i: number) => (
                                   <li key={i} className="bg-muted/30 p-4 rounded-xl border border-border text-sm relative group hover:border-primary/20 transition-colors">
                                       <div className="absolute top-4 left-4 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">Q{i + 1}</div>
                                       <div className="pl-10"><p className="text-muted-foreground leading-relaxed">{q}</p></div>
                                   </li>
                               ))}
                            </ul>
                          )}
                      </div>
                   </ProGatekeeper>
                </TabsContent>

                 {/* RESUME TAB */}
                <TabsContent value="resume" className="mt-0 focus-visible:outline-none">
                   <ProGatekeeper isPro={isPro} onUpgrade={() => setShowUpgrade(true)} title="Resume Suggestions">
                      <div className="space-y-5">
                          <p className="text-sm text-muted-foreground bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                             <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                             Tailoring your resume for this specific role can increase your fit score by up to 20%.
                          </p>

                          {!hasActionPlan ? ( 
                            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl bg-muted/20 text-center space-y-4">
                               <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600"><FileText className="h-6 w-6" /></div>
                               <div className="space-y-1">
                                 <p className="text-sm font-semibold">Optimize your resume</p>
                                 <p className="text-xs text-muted-foreground">Get specific bullet point edits tailored for this job.</p>
                               </div>
                               <Button 
                                 onClick={() => handleGenerate("resume")} 
                                 disabled={loadingType === "resume"}
                                 className="w-full shadow-sm bg-amber-500 hover:bg-amber-600"
                               >
                                 {loadingType === "resume" ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                                 {loadingType === "resume" ? "Analyzing Resume..." : "Generate with Interna AI"}
                               </Button>
                             </div>
                          ) : (
                             <div className="bg-card p-5 rounded-xl border border-border space-y-4">
                                <h4 className="font-medium text-foreground flex items-center gap-2 text-sm"><ArrowRight className="h-4 w-4 text-primary" /> Suggested Edits</h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    {(analysis.action_plan || []).map((item: string, i: number) => (
                                      <li key={i} className="flex gap-3">
                                        <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-mono shrink-0 mt-0.5">{(i + 1).toString().padStart(2, '0')}</div>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                </ul>
                            </div>
                          )}
                      </div>
                   </ProGatekeeper>
                </TabsContent>

              </div>
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} title="Unlock Full AI Insights" description="Get the complete breakdown, interview questions, and resume tailoring advice." />
    </>
  )
}