"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, TrendingUp, TrendingDown, Minus, Crown, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"

interface ReadinessGaugeProps {
  score: number
  previousScore: number
  isPro?: boolean
}

export function ReadinessGauge({ score, previousScore, isPro = false }: ReadinessGaugeProps) {
  const [reading, setReading] = useState(0)
  const [showUpgrade, setShowUpgrade] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setReading(score)
    }, 100)
    return () => clearTimeout(timer)
  }, [score])

  const hasData = score > 0
  
  // --- MATH (Scaled up from 80 to 90 radius) ---
  const radius = 90
  const fullCircumference = 2 * Math.PI * radius
  const arcLength = fullCircumference / 2
  
  const progress = hasData ? reading : 0 
  const dashArray = `${arcLength} ${fullCircumference}`
  const dashOffset = arcLength * (1 - progress / 100)
  
  // --- COLOR LOGIC ---
  let colorClass = "text-muted-foreground" 
  let strokeClass = "stroke-muted-foreground/20"
  let statusText = "No Data"
  
  if (hasData) {
    if (score >= 80) {
      colorClass = "text-emerald-500"
      strokeClass = "stroke-emerald-500"
      statusText = "Ready"
    } else if (score >= 40) { 
      colorClass = "text-yellow-500"
      strokeClass = "stroke-yellow-500"
      statusText = "Progressing"
    } else {
      colorClass = "text-red-500"
      strokeClass = "stroke-red-500"
      statusText = "Attention"
    }
  }

  const diff = score - previousScore
  const isTrendingUp = diff > 0
  const isTrendingDown = diff < 0

  return (
    <>
      <Card className="h-full border-border bg-card relative overflow-hidden flex flex-col group min-h-[280px]">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Readiness Score
            </div>
            {!isPro && <Lock className="h-3 w-3 text-muted-foreground/50" />}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col items-center justify-center pt-6 pb-6 relative z-10">
          
          {/* WRAPPER FOR BLUR EFFECT */}
          <div className={`w-full flex flex-col items-center transition-all duration-700 ${!isPro ? "blur-xl select-none opacity-30 scale-90 pointer-events-none" : ""}`}>
            
            {/* GAUGE (Bigger Dimensions) */}
            <div className="relative h-36 w-64 flex items-end justify-center overflow-hidden">
              <svg className="w-full h-full transform translate-y-4" viewBox="0 0 220 120">
                {/* Background Path */}
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14" 
                  strokeLinecap="round"
                  className="text-secondary"
                />
                {/* Progress Path */}
                <path
                  d="M 20 110 A 90 90 0 0 1 200 110"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeLinecap="round"
                  className={`transition-all duration-1000 ease-out ${strokeClass}`}
                  strokeDasharray={dashArray}
                  strokeDashoffset={dashOffset}
                  style={{ filter: hasData ? "drop-shadow(0 0 6px currentColor)" : "none" }}
                />
              </svg>
              
              {/* NUMBER (Scaled up to 5xl) */}
              <div className="absolute bottom-2 text-center">
                <span 
                  className={`text-5xl font-extrabold font-mono tracking-tighter transition-colors duration-500 ${colorClass}`}
                  style={{ filter: hasData ? "drop-shadow(0 0 12px currentColor)" : "none" }}
                >
                  {hasData ? score : "--"}
                </span>
              </div>
            </div>

            {/* FOOTER */}
            <div className="text-center w-full mt-4">
              {hasData ? (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground border border-border bg-secondary/40 px-3 py-1 rounded-full">
                    {statusText}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm font-mono font-bold">
                    {isTrendingUp ? (
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    ) : isTrendingDown ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <Minus className="h-4 w-4" />
                    )}
                    <span className={isTrendingUp ? "text-emerald-500" : isTrendingDown ? "text-red-500" : "text-muted-foreground"}>
                      {Math.abs(diff)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Add internships to calculate your score</p>
              )}
            </div>
            
            {/* PULSING GLOW */}
            {hasData && (
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 bg-current opacity-[0.1] blur-[60px] rounded-full pointer-events-none animate-pulse ${colorClass}`} />
            )}
          </div>

          {/* LOCKED OVERLAY */}
          {!isPro && (
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-background/90 backdrop-blur-md p-6 rounded-2xl border border-border shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-500">
                <div className="mx-auto h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Crown className="h-5 w-5 text-amber-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-base font-bold text-foreground">Unlock Mission Readiness</p>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-[180px] mx-auto">
                    Get deep AI insights into your application strength.
                  </p>
                </div>
                <Button 
                  size="default" 
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold h-10 px-8"
                  onClick={() => setShowUpgrade(true)}
                >
                  UPGRADE TO VIEW
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        title="Unlock Readiness Score"
        description="See exactly how your resume stacks up against your target internships with AI-powered analysis."
      />
    </>
  )
}