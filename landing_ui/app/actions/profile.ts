"use server"

import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
// Ensure this environment variable is set in .env.local
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } }) 
  : null

/**
 * [NEW] Securely syncs the user profile using Admin privileges (bypassing RLS).
 * Called by the <UserSync /> component on the client.
 */
export async function syncUserAction(userData: { id: string; email: string | undefined }) {
  // 1. Verify the user is actually authenticated
  const { userId } = await auth()
  
  // Security check: Ensure the caller matches the ID they are trying to sync
  if (!userId || userId !== userData.id) {
    return { success: false, error: "Unauthorized: ID mismatch" }
  }
  
  if (!supabase) {
    return { success: false, error: "Database configuration error" }
  }

  // 2. Perform Upsert with Admin Key
  // 'ignoreDuplicates' helps handle race conditions if the profile is created simultaneously
  const { error } = await supabase
    .from("profiles")
    .upsert(
      { 
        id: userData.id, 
        email: userData.email,
        updated_at: new Date().toISOString()
      }, 
      { 
        onConflict: 'id', 
        ignoreDuplicates: true 
      }
    )

  if (error) {
    console.error("❌ Sync Action Error:", error.message)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function saveUserProfile(data: {
  educationLevel: string,
  major: string,
  resumeText: string
}) {
  const { userId } = await auth()
  if (!userId || !supabase) return { error: "Unauthorized" }

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .single()

  const payload = {
    id: userId,
    school: data.educationLevel,
    major: data.major,
    resume_text: data.resumeText,
    updated_at: new Date().toISOString()
  }

  let error
  if (existing) {
    const res = await supabase.from("profiles").update(payload).eq("id", userId)
    error = res.error
  } else {
    const res = await supabase.from("profiles").insert(payload)
    error = res.error
  }

  if (error) {
    console.error("Profile Save Error:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function checkProfileExists() {
  const { userId } = await auth()
  if (!userId || !supabase) return false
  
  const { data } = await supabase
    .from("profiles")
    .select("resume_text")
    .eq("id", userId)
    .single()
    
  return !!data?.resume_text
}