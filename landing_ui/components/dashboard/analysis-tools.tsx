"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, FileText, Loader2, Copy, Check, Sparkles, ShieldCheck, AlertTriangle } from "lucide-react"
import { generateContent } from "@/app/actions/generate-content"

interface AnalysisToolsProps {
  jobId: string
  userId: string
  initialEmail?: string
  initialCoverLetter?: string
}

export function AnalysisTools({ jobId, userId, initialEmail, initialCoverLetter }: AnalysisToolsProps) {
  const [emailText, setEmailText] = useState(initialEmail || "")
  const [clText, setClText] = useState(initialCoverLetter || "")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"email" | "cover_letter">("email")
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (type: "email" | "cover_letter") => {
    if (type === "email" && emailText) return
    if (type === "cover_letter" && clText) return

    setIsLoading(true)
    setActiveTab(type)
    
    try {
      const result = await generateContent(type, jobId, userId)
      if (result.success && result.content) {
        if (type === "email") setEmailText(result.content)
        else setClText(result.content)
      }
    } catch (e) {
      console.error("Outreach Error:", e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    const text = activeTab === "email" ? emailText : clText
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentDisplay = activeTab === "email" ? emailText : clText
  const isGenerated = !!currentDisplay

  return (
    <Card className="border-primary/20 bg-background/50 backdrop-blur overflow-hidden shadow-lg">
      <CardHeader className="border-b border-border/50 pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Magic Outreach
          </CardTitle>
          <div className="flex gap-1 p-1 bg-secondary/50 rounded-md border border-border">
            <Button 
              variant={activeTab === "email" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3 transition-all"
              onClick={() => setActiveTab("email")}
            >
              Email
            </Button>
            <Button 
              variant={activeTab === "cover_letter" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 text-xs px-3 transition-all"
              onClick={() => setActiveTab("cover_letter")}
            >
              Cover Letter
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          {!isGenerated ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-xl border-border bg-secondary/5">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                {activeTab === "email" ? <Mail className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
              </div>
              <h4 className="text-sm font-medium mb-1 capitalize">Unlock {activeTab.replace('_', ' ')}</h4>
              <p className="text-xs text-muted-foreground mb-6 text-center max-w-[260px]">
                One-shot optimization: Once generated, Interna AI locks this draft to your application profile.
              </p>
              <Button onClick={() => handleGenerate(activeTab)} disabled={isLoading} className="gap-2 px-6">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                Generate with Interna AI
              </Button>
            </div>
          ) : (
            <div className="relative animate-in fade-in duration-500 slide-in-from-bottom-2">
              
              {/* FIXED: Action Bar Z-index and Background */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-md rounded-md shadow-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Interna Optimized</span>
                </div>
                
                <Button 
                   variant="secondary" 
                   size="sm" 
                   className="h-8 gap-1.5 border shadow-sm hover:bg-secondary bg-background/80 backdrop-blur-sm"
                   onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-green-500" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">Copy</span>
                    </>
                  )}
                </Button>
              </div>

              {/* FIXED: Added pt-24 to push text below the absolute buttons */}
              <div className="h-[550px] w-full overflow-y-auto rounded-md bg-secondary/20 border border-border/50 p-10 pt-24 font-serif text-[15px] leading-relaxed shadow-inner whitespace-pre-wrap selection:bg-primary/20 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                {currentDisplay}
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10 flex gap-3 items-start">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700/80 leading-snug italic">
                  Draft saved to Interna. Review carefully to ensure your robotic projects and Fall 2026 academic plans are highlighted correctly for recruiters.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}