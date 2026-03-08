"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea" 
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs" 
import { Link2, Loader2, CheckCircle2, Zap, Building2, Crown, Infinity as InfinityIcon } from "lucide-react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { scrapeJobListing } from "@/app/actions/scrape"
import { useAuth } from "@clerk/nextjs"
import { useSubscription } from "@/hooks/use-subscription"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"

// --- INTERNAL LOGIC ---
function FastAddForm({ onComplete, isModal = false }: { onComplete?: () => void, isModal?: boolean }) {
  const { userId } = useAuth()
  
  const { canCreateApp, canScrape, appCount, scrapeCount, isLoading, isPro, refreshSubscription } = useSubscription()
  const [showUpgrade, setShowUpgrade] = useState(false)

  const [activeTab, setActiveTab] = useState<"url" | "text">("url")
  const [inputValue, setInputValue] = useState("") 
  const [isScanning, setIsScanning] = useState(false)
  const [scanComplete, setScanComplete] = useState(false)
  const [scanResult, setScanResult] = useState<{company:string, position:string, location:string} | null>(null)

  // Helper to determine if the CURRENT tab's limit is reached
  const isLimitReached = !isPro && (activeTab === "url" ? !canScrape : !canCreateApp);

  const handleScan = async () => {
    if (!inputValue.trim() || !userId) return
    
    // Check limit before starting
    if (isLimitReached) {
      setShowUpgrade(true)
      return
    }

    setIsScanning(true)
    setScanComplete(false)
    setScanResult(null)

    try {
      const result = await scrapeJobListing(inputValue.trim(), activeTab, userId)
      
      // Handle Server-Side Scrape Limit Error
      if (result && 'error' in result && result.error === 'limit_reached') {
        setShowUpgrade(true) 
        setIsScanning(false)
        return
      }

      // Handle Success
      if (result && 'company' in result) {
        setScanResult({
          company: result.company,
          position: result.role,
          location: result.location
        })
        setScanComplete(true)
        
        refreshSubscription()

        setTimeout(() => {
          setScanComplete(false)
          setScanResult(null)
          setInputValue("")
          if (onComplete) onComplete()
        }, 2000)
      }
    } catch (error) {
      console.error("Error processing:", error)
    } finally {
      setIsScanning(false)
    }
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="url" value={activeTab} onValueChange={(v) => setActiveTab(v as "url" | "text")} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="url">Link</TabsTrigger>
          <TabsTrigger value="text">Paste Text</TabsTrigger>
        </TabsList>

        <TabsContent value="url" className="space-y-4">
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="url"
              placeholder="Paste internship listing URL..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="pl-10 font-mono text-sm h-11"
              disabled={isScanning || isLoading}
              autoFocus={isModal}
            />
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <div className="relative">
            <Textarea 
              placeholder="Paste the full job description here..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="min-h-[150px] max-h-[300px] overflow-y-auto font-mono text-sm resize-none"
              disabled={isScanning || isLoading}
              autoFocus={isModal}
            />
          </div>
        </TabsContent>
        
        {/* STATUS BAR */}
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          
          <div className="text-xs text-muted-foreground order-2 sm:order-1 flex items-center gap-2">
            {isLoading ? (
               <span className="opacity-50">Checking plan...</span>
            ) : isPro ? (
               <span className="text-emerald-600 font-medium flex items-center gap-1">
                 <InfinityIcon className="h-3 w-3" /> 
                 Pro Plan: Unlimited
               </span>
            ) : (
               <span className={isLimitReached ? "text-amber-600 font-bold" : ""}>
                 {activeTab === 'url' 
                   ? `${scrapeCount} / 5 free scans used` 
                   : `${appCount} / 5 free slots used`
                 }
               </span>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto justify-end order-1 sm:order-2">
            {isModal && (
              <Button variant="outline" onClick={onComplete} disabled={isScanning}>
                Cancel
              </Button>
            )}
            
            <Button 
              onClick={handleScan}
              disabled={!inputValue.trim() || isScanning || isLoading}
              className="bg-primary hover:bg-primary/90 w-full sm:w-auto min-w-[120px]"
            >
              {isScanning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {activeTab === 'url' ? 'Scanning...' : 'Extracting...'}
                </>
              ) : scanComplete ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  {isLimitReached && <Crown className="h-3 w-3 mr-2 text-amber-300" />}
                  {activeTab === 'url' ? 'Scan URL' : 'Process Text'}
                </>
              )}
            </Button>
          </div>
        </div>
      </Tabs>
      
      {scanResult && (
        <div className="p-4 rounded-lg bg-secondary/50 border border-primary/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-foreground truncate">{scanResult.position}</h4>
              <p className="text-sm text-muted-foreground">{scanResult.company}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-[#10B981] flex-shrink-0" />
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)}
        // [UPDATED] Title and Description logic as requested
        title={activeTab === 'url' ? "Scrape Limit Reached" : "Application Limit Reached"}
        description={
          activeTab === 'url' 
          ? "You've used your 5 Free Internship Fast Adds. Upgrade to Pro for unlimited AI web scraping."
          : "You've reached your free limit of 5 tracked applications. Upgrade to add more."
        }
      />
    </div>
  )
}

export function FastAdd() {
  return (
    <Card className="bg-card border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Fast Add
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FastAddForm />
      </CardContent>
    </Card>
  )
}

export function FastAddDialog({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add New Application</DialogTitle>
          </div>
          <DialogDescription>Paste a URL or job description.</DialogDescription>
        </DialogHeader>
        <div className="pt-4">
          <FastAddForm onComplete={() => setOpen(false)} isModal={true} />
        </div>
      </DialogContent>
    </Dialog>
  )
}