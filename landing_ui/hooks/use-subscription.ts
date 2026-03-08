"use client"

import { useState, useEffect, useCallback } from "react"
import { useUser } from "@clerk/nextjs"
import { SUBSCRIPTION_PLANS, getPlan } from "@/config/subscriptions"
import { getUserSubscriptionData } from "@/app/actions/subscription" // Import the action

export function useSubscription() {
  const { user, isLoaded: clerkLoaded } = useUser()
  
  const [isPro, setIsPro] = useState(false)
  const [appCount, setAppCount] = useState(0)
  const [scrapeCount, setScrapeCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    if (!user) return

    // console.log("🔍 Checking Subscription (Server Action) for:", user.id)

    try {
      // CALL THE SERVER ACTION (Bypasses RLS)
      const data = await getUserSubscriptionData(user.id)

      if (data) {
        setIsPro(data.isPro)
        setAppCount(data.appCount)
        setScrapeCount(data.scrapeCount)
        // console.log("✅ Data received:", data)
      }
    } catch (error) {
      console.error("Critical Error fetching subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (clerkLoaded && user) {
      fetchData()
    } else if (clerkLoaded && !user) {
      setIsLoading(false)
    }
  }, [clerkLoaded, user, fetchData])

  const plan = getPlan(isPro)
  
  // Logic: Allow if Pro OR under limit
  const canCreateApp = isPro || appCount < SUBSCRIPTION_PLANS.FREE.maxApplications
  const canScrape = isPro || scrapeCount < 5 

  return {
    isPro,
    plan,
    appCount,
    scrapeCount,
    isLoading,
    canCreateApp,
    canScrape,
    refreshSubscription: fetchData
  }
}