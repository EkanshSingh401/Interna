"use server"

import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import { recalculateFitScores } from "./recalculate-scores"

export async function updateResumeAction(data: {
  resumeData: any,      // JSON structure
  resumeText: string,   // Flat text for AI
  resumeId?: string,    // The specific ID from the 'resumes' table
  targetRole?: string   // Optional: "Product Manager", "Software Engineer"
}) {
  const { userId } = await auth()
  if (!userId) return { success: false, error: "Unauthorized" }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // 1. Prepare the payload for the 'resumes' table
    // If resumeId is provided, we update. If not, Supabase creates a new UUID.
    const payload: any = {
        user_id: userId,
        resume_data: data.resumeData,
        resume_text: data.resumeText,
        target_role: data.targetRole || data.resumeData.experience?.[0]?.role || "General",
        updated_at: new Date().toISOString()
    }

    // Only add ID to payload if it exists (for updates)
    if (data.resumeId) {
        payload.id = data.resumeId
    }

    // 2. Perform the Upsert to 'resumes' table
    const { data: savedResume, error: resumeError } = await supabase
        .from('resumes')
        .upsert(payload)
        .select()
        .single()

    if (resumeError) throw new Error(`Resume Save Error: ${resumeError.message}`)

    // 3. Sync to 'profiles' (The "Master" Copy)
    // We keep this to ensure your Internship Matcher and Readiness Score 
    // always have *some* data to work with, even if the user has multiple resumes.
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        resume_data: data.resumeData,
        resume_text: data.resumeText,
        updated_at: new Date().toISOString() 
      })
      .eq('id', userId)

    if (profileError) console.warn("Profile sync warning:", profileError.message)

    // 4. Trigger AI Matcher Recalculation
    // This runs against the text we just saved to ensure fit scores are live
    if (data.resumeText) {
      try {
        // We don't await this to keep the UI snappy (fire and forget)
        recalculateFitScores(data.resumeText).catch(e => console.error("Background score recalc failed:", e))
      } catch (scoreError) {
        console.error("Score logic error:", scoreError)
      }
    }

    // 5. Revalidate Paths
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/resumes')
    
    // Return the ID so the frontend can lock onto this version
    return { success: true, id: savedResume.id }

  } catch (error: any) {
    console.error("Master Sync Error:", error.message)
    return { success: false, error: error.message }
  }
}