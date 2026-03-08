"use client"

import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createCheckoutSession } from "@/app/actions/stripe"
import { toast } from "sonner" 

// Expanded feature lists to include all features "we had before"
const FEATURE_LISTS = {
  free: [
    { name: "Manual resume builder", included: true },
    { name: "1 basic ATS-optimized template", included: true },
    { name: "3 resumes with PDF download", included: true },
    { name: "AI bullet point generator", included: false },
    { name: "ATS keyword optimization", included: false },
    { name: "Tailor to internship feature", included: false },
    { name: "Unlimited resumes & exports", included: false },
  ],
  pro: [
    { name: "Everything in Free", included: true },
    { name: "AI bullet point generator", included: true },
    { name: "AI summary & headline writer", included: true },
    { name: "ATS keyword optimization & scoring", included: true },
    { name: "Tailor to internship feature", included: true },
    { name: "Unlimited resumes & exports", included: true },
    { name: "Full template library access", included: true },
    { name: "Priority email support", included: true },
  ],
  intern: [
    { name: "Everything in Pro included", included: true },
    { name: "AI bullet point generator", included: true },
    { name: "ATS keyword optimization", included: true },
    { name: "Tailor to internship feature", included: true },
    { name: "Unlimited resumes & exports", included: true },
    { name: "Full template library access", included: true },
    { name: "Priority email support", included: true },
    { name: "LinkedIn profile optimization", included: true },
  ]
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Build a great resume manually",
    highlighted: false,
    savings: null,
    features: FEATURE_LISTS.free,
    cta: "Create Free Resume",
    priceId: "" 
  },
  {
    id: "pro",
    name: "Pro",
    price: "$8.99",
    period: "per month",
    description: "Supercharge your resume with AI",
    highlighted: false,
    savings: null,
    features: FEATURE_LISTS.pro,
    cta: "Upgrade to Pro",
    priceId: "price_PRO_ID_HERE" 
  },
  {
    id: "intern",
    name: "Intern Plan", // Renamed from Recruiting Plan
    price: "$67.99",
    period: "per year",
    description: "Perfect for your entire Internship search journey",
    highlighted: true,
    savings: "SAVE 40%",
    features: FEATURE_LISTS.intern,
    cta: "Get Intern Plan",
    priceId: "price_INTERN_ID_HERE"
  }
]

export function Pricing({ isPro = false }: { isPro?: boolean }) {
  const [isLoading, setIsLoading] = useState<string | null>(null)

  const handleUpgrade = async (planId: string, priceId?: string) => {
    if (planId === "free" || isPro) {
      window.location.href = "/dashboard"
      return
    }

    if (!priceId) {
      toast.error("Configuration Error: Missing Stripe Price ID.")
      return
    }

    setIsLoading(planId)

    try {
      const { url } = await createCheckoutSession(priceId)
      if (url) window.location.href = url
      else throw new Error("Failed to create checkout session")
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
      setIsLoading(null)
    }
  }

  return (
    <section id="pricing" className="py-16 relative overflow-hidden bg-[#070B14]">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-purple-900/10 blur-[100px] rounded-full opacity-40" />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        
        {/* Header - Compact & Bold */}
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Choose Your Plan
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto text-base font-medium">
            Start free and upgrade when you're ready to accelerate your job search
          </p>
        </div>

        {/* PRICING CARDS - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
          {PLANS.map((plan) => {
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-xl p-6 transition-all duration-300 h-full ${
                  isHighlighted
                    ? "bg-[#0A0D12] border-2 border-purple-500/50 shadow-[0_0_30px_-10px_rgba(168,85,247,0.2)] z-10 scale-105"
                    : "bg-[#0A0D12] border border-white/10 hover:border-white/20"
                }`}
              >
                
                {/* Badge: Most Popular (Purple/Aqua Gradient) */}
                {isHighlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Badge: Savings (GOLD GRADIENT) */}
                {plan.savings && (
                  <div className="absolute -top-2.5 right-4">
                     <span className="px-2 py-0.5 rounded-full bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-black text-[10px] font-black shadow-lg shadow-amber-500/20 border border-yellow-200/20">
                        {plan.savings}
                     </span>
                  </div>
                )}

                {/* Header Section */}
                <div className="text-center mb-6 pt-2">
                  <h3 className="text-lg font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  
                  <div className="flex items-end justify-center gap-0.5 mb-3">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-bold text-gray-500 mb-1.5 uppercase">
                      /{plan.period.replace('per ', '')}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 font-medium leading-relaxed px-2">
                    {plan.description}
                  </p>
                </div>

                {/* Features List - More bullets, compact text */}
                <div className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs font-bold">
                      {/* Icon */}
                      <div className="shrink-0 mt-0.5">
                        {feature.included ? (
                          <Check className="h-3.5 w-3.5 text-cyan-400 stroke-[3]" />
                        ) : (
                          <X className="h-3.5 w-3.5 text-red-500/50 stroke-[3]" />
                        )}
                      </div>

                      {/* Text */}
                      <span className={`${feature.included ? "text-gray-300" : "text-gray-600 line-through decoration-gray-700"}`}>
                         {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ACTION BUTTON */}
                <Button
                  onClick={() => handleUpgrade(plan.id, plan.priceId)}
                  disabled={isLoading !== null}
                  className={`w-full h-10 rounded-lg text-xs font-bold uppercase tracking-wide transition-all hover:scale-[1.02] ${
                    isHighlighted 
                      ? "bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-lg shadow-purple-500/20 border-none"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {isLoading === plan.id ? (
                    <>
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Redirecting...
                    </>
                  ) : isPro && plan.id !== "free" ? (
                    "Go to Dashboard"
                  ) : (
                    plan.cta
                  )}
                </Button>

              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}