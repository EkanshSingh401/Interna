"use server"

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseKey = supabaseServiceRoleKey || supabaseAnonKey

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null

export async function getUserInternships(userId: string) {
  if (!supabase) return []

  // Fetch data ordered by most recently added
  const { data, error } = await supabase
    .from("internships")
    .select("*")
    .eq("user_id", userId) // Security: Only get THIS user's data
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching internships:", error)
    return []
  }

  return data || []
}