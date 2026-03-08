"use server"

import { createClient } from "@supabase/supabase-js"
import { auth } from "@clerk/nextjs/server"
import OpenAI from "openai"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function recalculateFitScores(resumeText: string) {
  const { userId } = await auth()
  if (!userId) return

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // FIX 1: Fetch 'summary' (where your job data actually lives), not 'description'
  const { data: internships } = await supabase
    .from('internships')
    .select('id, role, company, summary')
    .eq('user_id', userId)
    .not('status', 'in', '("rejected", "archived")')

  if (!internships || internships.length === 0) return

  // 2. Batch process every internship with the "Hiring Manager" logic
  const updates = internships.map(async (job) => {
    // FIX 2: Use the exact same prompt structure as match.ts
    // This ensures the "Action Plan" and "Pros/Cons" are generated for old jobs too.
    const prompt = `
      ACT AS: A strict technical recruiter & career coach.
      
      CANDIDATE RESUME:
      ${resumeText.substring(0, 4000)}

      JOB:
      Role: ${job.role} at ${job.company}
      Desc: ${job.summary}

      TASK:
      1. Rate the fit (0-100).
      2. Identify specific Pros & Cons.
      3. Create a 3-bullet "Action Plan".

      OUTPUT JSON ONLY:
      {
        "score": number,
        "verdict": "string",
        "pros": ["string"],
        "cons": ["string"],
        "action_plan": ["string"]
      }
    `

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-nano",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })

      const analysis = JSON.parse(response.choices[0].message.content || "{}")

      // FIX 3: Save to 'fit_analysis' column
      // This is the column your Dashboard UI reads to show the expanded details.
      return supabase
        .from('internships')
        .update({
          fit_score: analysis.score, 
          fit_analysis: analysis,    // Now includes verdict, pros, cons, action_plan
          last_analyzed_at: new Date().toISOString()
        })
        .eq('id', job.id)
    } catch (e) {
      console.error(`Recalculation failed for ${job.company}:`, e)
    }
  })

  // Wait for all updates to finish before the function returns
  await Promise.all(updates)
}