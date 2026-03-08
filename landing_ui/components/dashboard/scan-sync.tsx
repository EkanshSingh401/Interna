"use client"

import { useEffect, useRef } from "react"
import { toast } from "sonner"
import { saveLandingScanAction } from "@/app/actions/save-landing-scan"
import { useRouter } from "next/navigation"

export function ScanSync() {
  const router = useRouter()
  const hasSynced = useRef(false)

  useEffect(() => {
    const checkAndSync = async () => {
      // Prevent double-firing in strict mode
      if (hasSynced.current) return
      
      const pendingScan = localStorage.getItem("interna_pending_scan")
      if (!pendingScan) return

      hasSynced.current = true

      try {
        const data = JSON.parse(pendingScan)
        toast.info("Finalizing your resume analysis...")

        const result = await saveLandingScanAction(data)

        if (result.success && result.id) {
          toast.success("Scan saved successfully!")
          
          // 1. Clear storage immediately so it never runs again
          localStorage.removeItem("interna_pending_scan")
          
          // 2. Redirect user to the specific analysis page to "See their score"
          router.push(`/dashboard/analysis/${result.id}`)
          router.refresh()
          
        } else {
          console.error("Sync failed:", result.error)
          toast.error("Failed to save your scan. Please try again.")
        }
      } catch (e) {
        console.error("Error parsing scan data", e)
      }
    }

    checkAndSync()
  }, [router])

  return null
}