"use server"

import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null

export async function updateStatus(id: string, newStatus: string) {
  const { userId } = await auth()
  if (!userId || !supabase) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("internships")
    .update({ status: newStatus })
    .eq("id", id)
    .eq("user_id", userId) // Security: Ensure user owns this row

  if (error) {
    console.error("Update Error:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard") // Refresh the UI
  return { success: true }
}

export async function deleteInternship(id: string) {
  const { userId } = await auth()
  if (!userId || !supabase) return { error: "Unauthorized" }

  const { error } = await supabase
    .from("internships")
    .delete()
    .eq("id", id)
    .eq("user_id", userId)

  if (error) {
    console.error("Delete Error:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}