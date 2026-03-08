"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation" 
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Star, Send, MessageSquare, Gift, Ghost, 
  Building2, Calendar, MoreHorizontal, 
  Trash2, Plus, Sparkles, Activity, Lock, Crown
} from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { updateStatus, deleteInternship } from "@/app/actions/kanban-actions"
import { FastAddDialog } from "@/components/dashboard/fast-add"
import { JobDetailSheet } from "@/components/dashboard/job-detail-sheet" 
import { UpgradeModal } from "@/components/dashboard/upgrade-modal" 

interface Internship {
  id: string
  company: string
  role: string
  location: string
  status: string
  created_at: string
  fit_score: number | null
  summary?: string
  source_url?: string
  fit_analysis?: any 
}

const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
  Wishlist: { label: "Wishlist", icon: Star, color: "#6366F1", bgColor: "rgba(99, 102, 241, 0.15)" },
  Applied: { label: "Applied", icon: Send, color: "#00F2FF", bgColor: "rgba(0, 242, 255, 0.15)" },
  Interview: { label: "Interview", icon: MessageSquare, color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.15)" },
  Offer: { label: "Offer", icon: Gift, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.15)" },
  Ghosted: { label: "Ghosted", icon: Ghost, color: "#6B7280", bgColor: "rgba(107, 114, 128, 0.15)" },
}

function getScoreColor(score: number) {
  if (score >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
  if (score >= 50) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20"
  return "text-red-500 bg-red-500/10 border-red-500/20"
}

function InternshipCard({ internship, onClick, isPro = false }: { internship: Internship, onClick: () => void, isPro?: boolean }) {
  const router = useRouter()
  const config = statusConfig[internship.status] || statusConfig["Wishlist"]
  const [isPending, startTransition] = useTransition()
  const [showUpgrade, setShowUpgrade] = useState(false) 
  
  const handleStatusChange = (newStatus: string) => {
    startTransition(async () => {
      await updateStatus(internship.id, newStatus)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (confirm("Delete this application?")) {
      startTransition(async () => {
        await deleteInternship(internship.id)
        router.refresh()
      })
    }
  }

  const availableStatuses = Object.keys(statusConfig).filter(s => s !== internship.status)
  const hasValidScore = internship.fit_score !== null && internship.fit_score > 0

  return (
    <>
      <div 
        onClick={onClick}
        className={`p-3 rounded-lg bg-secondary/50 border border-border hover:border-primary/30 transition-all group relative cursor-pointer ${isPending ? "opacity-50" : ""}`}
      >
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="h-8 w-8 rounded flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono"
              style={{ backgroundColor: config.bgColor, color: config.color }}
            >
              {internship.company ? internship.company.charAt(0) : "?"}
            </div>
            <div className="min-w-0 overflow-hidden">
              <h4 className="font-medium text-sm truncate text-foreground leading-tight">{internship.role}</h4>
              <p className="text-[10px] text-muted-foreground truncate">{internship.company}</p>
            </div>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-6 w-6 p-0 hover:bg-secondary rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Move to...</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableStatuses.map((status) => {
                   const StatusIcon = statusConfig[status].icon
                   return (
                    <DropdownMenuItem 
                      key={status} 
                      onClick={() => handleStatusChange(status)}
                      className="cursor-pointer"
                    >
                      <StatusIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      <span>{status}</span>
                    </DropdownMenuItem>
                   )
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="text-red-500 focus:text-red-500 cursor-pointer">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* FIT SCORE with Gatekeeping */}
            <div 
              className="relative group/lock"
              onClick={(e) => {
                if (!isPro) {
                  e.stopPropagation();
                  setShowUpgrade(true);
                }
              }}
            >
              {hasValidScore ? (
                <div className={`text-[10px] font-medium px-1.5 py-0.5 rounded border flex items-center gap-1 transition-all ${isPro ? getScoreColor(internship.fit_score!) : "text-muted-foreground bg-secondary blur-[2px] opacity-60 select-none"}`}>
                  <Activity className="h-3 w-3" />
                  {isPro ? `${internship.fit_score}% Fit` : "95% Fit"}
                </div>
              ) : (
                <div className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
                   <Sparkles className="h-3 w-3" />
                   <span>--</span>
                </div>
              )}
              
              {!isPro && hasValidScore && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-3 w-3 text-foreground/80 drop-shadow-md" />
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {new Date(internship.created_at).toLocaleDateString("en-US", { month: "numeric", day: "numeric" })}
            </div>
          </div>

          {/* Attractive AI Report Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isPro) {
                onClick(); // Open sheet if Pro
              } else {
                setShowUpgrade(true); // Open upgrade if not
              }
            }}
            className="w-full group/btn relative py-1.5 px-3 rounded-md overflow-hidden transition-all active:scale-[0.98] mt-1"
          >
            {/* Shimmer Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-shimmer opacity-90 group-hover/btn:opacity-100 transition-opacity" />
            
            <div className="relative flex items-center justify-center gap-1.5 text-[10px] font-bold text-white tracking-wide uppercase">
              {isPro ? (
                <>
                  <Sparkles className="h-3 w-3 fill-white/20" />
                  View AI Report
                </>
              ) : (
                <>
                  <Crown className="h-3 w-3 text-amber-300 fill-amber-300" />
                  Unlock AI Report
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        title={isPro ? "Interna Pro" : "Unlock Deep Analysis"}
        description="See exactly why you're a match and get AI-generated interview prep questions."
      />
    </>
  )
}

function KanbanColumn({ status, internships, onCardClick, isPro }: { status: string; internships: Internship[], onCardClick: (job: Internship) => void, isPro?: boolean }) {
  const config = statusConfig[status]
  const Icon = config.icon
  
  return (
    <div className="flex flex-col min-w-[220px] xl:min-w-0 flex-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded flex items-center justify-center" style={{ backgroundColor: config.bgColor }}>
            <Icon className="h-3 w-3" style={{ color: config.color }} />
          </div>
          <span className="text-sm font-medium text-foreground truncate">{config.label}</span>
          <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: config.bgColor, color: config.color }}>
            {internships.length}
          </span>
        </div>
      </div>
      
      <div className="flex-1 space-y-2 p-2 rounded-lg bg-card/50 border border-border min-h-[400px]">
        {internships.map((item) => (
          <InternshipCard 
            key={item.id} 
            internship={item} 
            onClick={() => onCardClick(item)} 
            isPro={isPro} 
          />
        ))}
        {internships.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center min-h-[100px] text-muted-foreground/30">
            <FastAddDialog 
              trigger={
                <button className="group flex flex-col items-center gap-2 hover:text-primary transition-colors">
                  <div className="h-10 w-10 rounded-full border-2 border-dashed border-current flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-all">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Add to {status}</span>
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function KanbanBoard({ initialData = [], isPro = false }: { initialData?: any[], isPro?: boolean }) {
  const [internships, setInternships] = useState<Internship[]>(initialData)
  const [selectedJob, setSelectedJob] = useState<Internship | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  // Sync state when server data updates (triggered by router.refresh)
  useEffect(() => {
    setInternships(initialData)
    
    // If the user has a job open in the sheet, find its updated version in the new initialData
    if (selectedJob) {
      const updatedJob = initialData.find(j => j.id === selectedJob.id)
      if (updatedJob) {
        setSelectedJob(updatedJob)
      }
    }
  }, [initialData, selectedJob?.id]) // Stable dependency array
  
  const handleCardClick = (job: Internship) => {
    setSelectedJob(job)
    setIsSheetOpen(true)
  }

  const statuses = ["Wishlist", "Applied", "Interview", "Offer", "Ghosted"]
  
  return (
    <>
      <Card className="bg-card border-border h-full">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Pipeline
            </CardTitle>
            <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded">
              {internships.length} Active Applications
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4 xl:grid xl:grid-cols-5 xl:overflow-visible">
            {statuses.map((status) => (
              <KanbanColumn
                key={status}
                status={status}
                internships={internships.filter(i => i.status === status)}
                onCardClick={handleCardClick}
                isPro={isPro} 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <JobDetailSheet 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        job={selectedJob} 
        isPro={isPro} 
      />
    </>
  )
}