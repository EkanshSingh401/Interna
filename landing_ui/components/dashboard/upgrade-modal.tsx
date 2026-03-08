"use client"

import { useState } from "react"
import { Check, Crown, Loader2, Sparkles } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  title = "Unlock Interna Pro", 
  description = "You've reached your free limit. Upgrade to unlock unlimited AI features." 
}: UpgradeModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "annual" | null>(null);

  const handleUpgrade = async (plan: "monthly" | "annual") => {
    try {
      setLoadingPlan(plan);
      
      const response = await fetch("/api/stripe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }), 
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Checkout failed");
      }

      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Upgrade Error:", error);
    } finally {
      setLoadingPlan(null);
    }
  };

  // [UPDATED] New Feature List per your request
  const proFeatures = [
    "Unlimited Fast Adds",
    "Unlimited Resume Uploads",
    "Unlimited Applications",
    "AI Powered Internship Matching",
    "AI Resume Optimization",
    "Priority Support",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-background shadow-2xl">
        
        {/* Header Section */}
        <div className="bg-gradient-to-b from-amber-500/10 to-transparent p-6 pb-2 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-3 shadow-sm">
            <Crown className="h-6 w-6 text-amber-600 dark:text-amber-500" />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1 px-4">
            {description}
          </DialogDescription>
        </div>

        {/* Features List */}
        <div className="px-6 py-2 space-y-2">
          {proFeatures.map((feature) => (
            <div key={feature} className="flex items-center gap-3 text-sm">
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
              <span className="text-foreground/90 font-medium">{feature}</span>
            </div>
          ))}
        </div>

        {/* Plan Selection Buttons */}
        <div className="p-6 space-y-3 bg-muted/20">
          
          {/* ANNUAL OPTION (Best Value - Amber/Gold) */}
          <div className="relative group">
            <Badge className="absolute -top-2.5 right-3 z-10 bg-emerald-600 hover:bg-emerald-700 text-white border-0 px-2 py-0.5 text-[10px] uppercase tracking-wide shadow-sm pointer-events-none">
              <Sparkles className="h-3 w-3 mr-1 fill-current" />
              Save 37%
            </Badge>

            <Button 
              onClick={() => handleUpgrade("annual")}
              disabled={loadingPlan !== null}
              variant="outline"
              className="w-full h-auto py-3 px-4 flex items-center justify-between border-amber-200 bg-amber-50/50 hover:bg-amber-100/80 hover:border-amber-300 dark:border-amber-800 dark:bg-amber-950/20 dark:hover:bg-amber-950/40 relative overflow-hidden transition-all shadow-sm"
            >
              <div className="flex flex-col items-start text-left">
                <span className="font-bold text-base text-amber-900 dark:text-amber-100">Annual Plan</span>
                <span className="text-xs text-muted-foreground">$67.99 billed yearly</span>
              </div>
              
              <div className="flex flex-col items-end">
                {loadingPlan === "annual" ? (
                   <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
                ) : (
                  <>
                    <span className="text-xl font-bold text-amber-700 dark:text-amber-400">$5.67<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                  </>
                )}
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-amber-500/5 pointer-events-none" />
            </Button>
          </div>

          {/* MONTHLY OPTION (Standard - Cool Indigo/Blue) */}
          <Button 
            onClick={() => handleUpgrade("monthly")}
            disabled={loadingPlan !== null}
            variant="outline"
            className="w-full h-auto py-3 px-4 flex items-center justify-between border-indigo-200/60 bg-indigo-50/40 hover:bg-indigo-100/50 hover:border-indigo-300 dark:border-indigo-900/40 dark:bg-indigo-950/10 dark:hover:bg-indigo-950/30 transition-all"
          >
             <div className="flex flex-col items-start text-left">
                <span className="font-semibold text-foreground">Monthly Plan</span>
                <span className="text-xs text-muted-foreground">Cancel anytime</span>
              </div>

              <div className="flex flex-col items-end">
                {loadingPlan === "monthly" ? (
                   <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                ) : (
                   <span className="text-lg font-bold text-foreground/90">$8.99<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                )}
              </div>
          </Button>

          <div className="text-center pt-1">
            <button onClick={onClose} className="text-xs text-muted-foreground hover:underline hover:text-foreground transition-colors" disabled={loadingPlan !== null}>
              No thanks, I'll stick to the free plan
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}