"use server"

import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Initialize Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null

export async function calculateJobFit(jobId: string, userId: string) {
  if (!supabase) return { error: "Database connection failed" }

  console.log(`🧠 STARTING AI ANALYSIS for Job: ${jobId}`)

  // 1. Fetch the Job and the User's Resume
  const { data: job } = await supabase.from('internships').select('role, company, summary').eq('id', jobId).single()
  const { data: profile } = await supabase.from('profiles').select('resume_text, school, major').eq('id', userId).single()

  if (!job || !profile || !profile.resume_text) {
    console.log("❌ Missing job or resume data")
    return { error: "Missing data" }
  }

  // 2. The "Hiring Manager" Prompt (UPDATED)
  const prompt = `
    ACT AS: A strict technical recruiter & career coach.
    
    CANDIDATE:
    Major: ${profile.major}
    School: ${profile.school}
    Resume Snippet: ${profile.resume_text.slice(0, 4000)}

    JOB:
    Role: ${job.role} at ${job.company}
    Desc: ${job.summary}

    TASK:
    1. Rate the fit (0-100). Be strict.
    2. Identify specific Pros & Cons.
    3. Create a 3-bullet "Action Plan" to improve the candidate's odds for THIS specific job (e.g., "Build a React project," "Mention interest in FinTech in cover letter").

    OUTPUT JSON ONLY:
    {
      "score": number,
      "verdict": "string (e.g. Good Match, Reach, mismatch)",
      "pros": ["string", "string"],
      "cons": ["string", "string"],
      "action_plan": ["string", "string", "string"]
    }
  `

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano", // Keeping your specific model
      messages: [
        { role: "system", content: "You are a JSON factory. Output valid JSON only." }, 
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })

    const responseText = completion.choices[0].message.content || "{}"
    const analysis = JSON.parse(responseText)

    console.log("🤖 AI Result:", analysis.score)

    // 3. Save to Database (WITH ERROR LOGGING)
    const { error: updateError } = await supabase
      .from('internships')
      .update({ 
        fit_score: analysis.score,
        fit_analysis: analysis // This now includes the 'action_plan' automatically
      })
      .eq('id', jobId)

    if (updateError) {
      console.error("❌ SUPABASE WRITE ERROR:", updateError)
      return { error: "Database update failed" }
    }

    revalidatePath('/dashboard')
    console.log("✅ SAVED TO DB SUCCESSFULLY")
    return { success: true, analysis }
    
  } catch (err) {
    console.error("AI Match Error:", err)
    return { error: "Failed to calculate fit" }
  }
}