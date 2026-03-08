"use server"

import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import OpenAI from "openai"
import { revalidatePath } from "next/cache" // Added this

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function addInternshipWithAI(jobData: { company: string, role: string, description: string, location: string }) {
  const { userId } = await auth()
  if (!userId) throw new Error("Unauthorized")

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Get user profile (Resume + Pro status)
  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_text, is_pro, school, major') // Added school/major for prompt consistency
    .eq('id', userId)
    .single()

  // 2. Save the internship to get an ID
  const { data: job, error: insertError } = await supabase
    .from('internships')
    .insert([{
      user_id: userId,
      company: jobData.company,
      role: jobData.role,
      summary: jobData.description,
      location: jobData.location,
      status: 'wishlist'
    }])
    .select()
    .single()

  if (insertError) throw insertError

  // 3. Trigger AI only if conditions are met
  if (profile?.is_pro && profile?.resume_text && jobData.description) {
    try {
      // Use the same "Hiring Manager" prompt structure as match.ts
      const prompt = `
        ACT AS: A strict technical recruiter & career coach.
        
        CANDIDATE:
        Major: ${profile.major || 'N/A'}
        School: ${profile.school || 'N/A'}
        Resume Snippet: ${profile.resume_text.slice(0, 4000)}

        JOB:
        Role: ${jobData.role} at ${jobData.company}
        Desc: ${jobData.description}

        TASK:
        1. Rate the fit (0-100). Be strict.
        2. Identify specific Pros & Cons.
        3. Create a 3-bullet "Action Plan" to improve the candidate's odds for THIS specific job.

        OUTPUT JSON ONLY:
        {
          "score": number,
          "verdict": "string",
          "pros": ["string"],
          "cons": ["string"],
          "action_plan": ["string"]
        }
      `

      const completion = await openai.chat.completions.create({
        model: "gpt-5-nano", 
        messages: [
          { role: "system", content: "You are a JSON factory. Output valid JSON only." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      })

      const analysis = JSON.parse(completion.choices[0].message.content || "{}")

      // 4. Update the internship with synced keys (score vs fit_score)
      await supabase
        .from('internships')
        .update({
          fit_score: analysis.score, // Correctly mapping 'score' from AI to 'fit_score' in DB
          fit_analysis: analysis     // This now includes 'pros', 'cons', and 'action_plan'
        })
        .eq('id', job.id)

      // 5. Force the Dashboard to update
      revalidatePath('/dashboard')

    } catch (error) {
      console.error("AI Analysis Error:", error)
    }
  }

  return { success: true }
}