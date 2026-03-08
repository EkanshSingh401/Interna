'use server'

import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, 
})

export async function findMatches() {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_text, is_pro, matcher_scans')
    .eq('id', userId)
    .single()

  const resumeText = profile?.resume_text || ""

  // 1. LIMIT CHECK (Server Side)
  const isPro = !!profile?.is_pro
  const scansUsed = profile?.matcher_scans || 0

  if (!isPro && scansUsed >= 1) {
    return [{ isLimitReached: true }]
  }

  if (!resumeText || resumeText.length < 50) {
    return []
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: `You are the Interna AI Matcher engine. 
          Analyze the resume to understand the user's skills and goals, but DO NOT return any companies or roles that are already listed on their resume. 
          
          Your task is to propose 3 NEW, prospective internship opportunities that they haven't had yet. These should also be up to date.
          
          RETURN JSON OBJECT: { "matches": [ ... ] }
          
          Job Object Fields:
          - id: string
          - company: string
          - role: string (Job Title)
          - fitScore: integer (70-99)
          - url: string (valid URL)
          - matchReason: string (short explanation)
          - posted: string (e.g. "2 days ago")`
        },
        {
          role: "user",
          content: `Resume: "${resumeText.substring(0, 4000)}"`
        }
      ],
      // @ts-ignore
      reasoning_effort: "minimal",
      response_format: { type: "json_object" }, 
    })

    const rawContent = completion.choices[0].message.content || "{}"
    const parsedData = JSON.parse(rawContent)
    
    // 2. SAFETY MAPPING: Ensure 'role' and 'fitScore' exist even if AI hallucinates keys
    const rawMatches = parsedData.matches || []
    
    const safeMatches = rawMatches.map((job: any, index: number) => ({
      id: job.id || `job-${index}`,
      company: job.company || "Unknown Company",
      // Map common AI slip-ups to the correct field
      role: job.role || job.title || job.position || "Software Intern",
      fitScore: job.fitScore || job.fit_score || job.score || 85,
      url: job.url || "#",
      matchReason: job.matchReason || job.reason || "High match based on skills.",
      posted: job.posted || "Recently",
      isLimitReached: false
    }))

    // 3. Update Usage
    if (!isPro) {
      await supabase.from('profiles').update({ matcher_scans: scansUsed + 1 }).eq('id', userId)
    }
    
    return safeMatches.slice(0, 3)

  } catch (error: any) {
    console.error("GPT Match Error:", error)
    return []
  }
}