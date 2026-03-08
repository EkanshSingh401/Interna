"use client"

import { useEffect, useRef } from "react"
import { useUser } from "@clerk/nextjs"
import { syncUserAction } from "@/app/actions/profile" // Import the Server Action

export function UserSync() {
  const { user, isLoaded } = useUser()
  const hasSynced = useRef(false) // Ref to prevent double-firing in React Strict Mode

  useEffect(() => {
    async function sync() {
      // 1. Guard clauses
      if (!user || !isLoaded) return
      if (hasSynced.current) return

      hasSynced.current = true
      
      const email = user.primaryEmailAddress?.emailAddress

      // 2. Call the Server Action
      try {
        const result = await syncUserAction({
          id: user.id,
          email: email
        })

        if (result.success) {
          console.log("✅ Profile Synced (Server Action)")
        } else {
          console.error("❌ Profile Sync Failed:", result.error)
        }
      } catch (err) {
        console.error("❌ Sync Error:", err)
      }
    }

    sync()
  }, [user, isLoaded])

  return null
}