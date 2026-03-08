import { createClient } from "@supabase/supabase-js"

export async function getSubscriptionStatus(userId: string) {
  // Use Service Role Key to bypass RLS and get the real numbers
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  )

  // 1. Get Profile & Scrape Count
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_pro, scrape_count")
    .eq("id", userId)
    .single()

  // 2. Get Real Internship Count
  const { count } = await supabase
    .from("internships")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", userId)

  return {
    isPro: !!profile?.is_pro,
    scrapeCount: profile?.scrape_count || 0,
    appCount: count || 0
  }
}