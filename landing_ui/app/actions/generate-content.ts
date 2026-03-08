"use server"

import OpenAI from "openai"
import { createClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null

export async function generateContent(
  type: "email" | "cover_letter" | "interview" | "resume", 
  jobId: string, 
  userId: string
) {
  if (!supabase) return { error: "Database error" }

  // 1. Fetch Job & Profile Context
  const { data: job } = await supabase
    .from('internships')
    .select('role, company, summary, fit_analysis, generated_email, generated_cover_letter')
    .eq('id', jobId)
    .single()
    
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

  if (!job || !profile) return { error: "Missing data" }

  // 2. Security: Ensure User is Pro
  if (!profile.is_pro) {
    return { error: "Subscription required. Please upgrade to continue." }
  }

  const analysis = job.fit_analysis || {}

  // 3. Check for existing content (Prevent duplicate charges)
  if (type === "email" && job.generated_email) return { error: "Email already generated" }
  if (type === "cover_letter" && job.generated_cover_letter) return { error: "Cover letter already generated" }
  if (type === "interview" && analysis.questions?.length > 0) return { error: "Questions already generated" }
  if (type === "resume" && analysis.action_plan?.length > 0) return { error: "Resume suggestions already generated" }

  // Extract strategy from previous analysis
  const strategy = analysis.action_plan?.join(". ") || ""

  // 4. Configure Prompt
  let systemInstruction = ""
  let userPrompt = ""
  
  // [UPDATED] STRICTLY FORCE GPT-5-NANO FOR ALL TASKS
  const model = "gpt-5-nano" 
  
  let isJsonMode = false

  switch (type) {
    case "email":
      systemInstruction = "You are an expert career networker. Write a concise, professional cold email using a 'Bridge' strategy."
      userPrompt = `
        Write a cold email to ${job.company} for the ${job.role} role.
        STRATEGY: "${strategy}". Bridge the gap between my background (${profile.major} at ${profile.school}) and their needs.
        FORMAT: Subject line included. Formal salutation. Under 150 words. Double-line breaks between paragraphs.
      `
      break;

    case "cover_letter":
      systemInstruction = "You are an expert technical writer. Write a compelling, formal cover letter."
      userPrompt = `
        Write a formal cover letter for ${job.role} at ${job.company}.
        STRATEGY: Incorporate "${strategy}". Specifically use the 'Bridge' project to address 'Missing Skills'.
        RESUME: ${profile.resume_text?.slice(0, 3000)}
        JOB DESC: ${job.summary}
        FORMAT: Full block letter. Professional header/sign-off. Double-line breaks.
      `
      break;

    case "interview":
      isJsonMode = true
      systemInstruction = "You are a strict technical interviewer. Output JSON only."
      userPrompt = `
        Generate 5 difficult, role-specific interview questions for a ${job.role} position at ${job.company}.
        Base them on this job summary: ${job.summary}.
        
        OUTPUT FORMAT: { "result": ["Question 1", "Question 2", "Question 3", "Question 4", "Question 5"] }
      `
      break;

    case "resume":
      isJsonMode = true
      systemInstruction = "You are a resume optimizer. Output JSON only."
      userPrompt = `
        Suggest 3 specific, actionable resume bullet point edits to better match ${job.role} at ${job.company}.
        Base them on the job summary: ${job.summary}.
        
        OUTPUT FORMAT: { "result": ["Actionable Edit 1", "Actionable Edit 2", "Actionable Edit 3"] }
      `
      break;
  }

  try {
    // 5. Call OpenAI with GPT-5-NANO
    const completion = await openai.chat.completions.create({
      model: model, 
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: userPrompt }
      ],
      response_format: isJsonMode ? { type: "json_object" } : undefined
    })

    const content = completion.choices[0].message.content

    // 6. Handle Updates
    if (type === "email") {
      await supabase.from('internships').update({ generated_email: content }).eq('id', jobId)
    } 
    else if (type === "cover_letter") {
      await supabase.from('internships').update({ generated_cover_letter: content }).eq('id', jobId)
    } 
    else {
      // Parse JSON for Interview/Resume lists
      let parsedItems = []
      try {
        const json = JSON.parse(content || "{}")
        parsedItems = json.result || []
      } catch (e) {
        console.error("JSON Parse Error", e)
        parsedItems = [] // Fallback
      }

      // Map to correct key in fit_analysis
      const fieldToUpdate = type === "interview" ? "questions" : "action_plan"
      
      const updatedAnalysis = { 
        ...analysis, 
        [fieldToUpdate]: parsedItems 
      }
      
      await supabase.from('internships').update({ fit_analysis: updatedAnalysis }).eq('id', jobId)
    }

    // 7. Refresh UI
    revalidatePath('/dashboard')

    return { success: true, content }

  } catch (error) {
    console.error("Generation Error:", error)
    return { error: "Failed to generate content" }
  }
}