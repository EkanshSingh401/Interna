"use server"

import OpenAI from "openai"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function findInternshipsAction({ query, grade, major }: { query: string, grade: string, major: string }) {
  const { userId } = await auth()
  if (!userId) return { error: "Unauthorized" }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  
  // 1. Fetch location along with the resume
  const { data: profile } = await supabase
    .from('profiles')
    .select('resume_text, location') 
    .eq('id', userId)
    .single()

  const userLocation = profile?.location || "United States"

  try {
    // 2. Switching to a valid model (gpt-4o) to ensure JSON reliability 
    // and better reasoning for location proximity.
    const completion = await openai.chat.completions.create({
      model: "gpt-4o", 
      messages: [
        {
          role: "system",
          content: `Act as an AI Internship Matcher. 
          
          CANDIDATE CONTEXT:
          - Major: ${major}
          - Grade: ${grade}
          - Preferred Location: ${userLocation}
          
          TASK:
          Find 4 realistic internship matches for: "${query}".
          
          LOCATION MATCHING RULE: 
          Prioritize internships in ${userLocation} or "Remote". If a role is in a different city, decrease the match score unless it is a high-prestige "Reach" role.
          
          ANTI-HALLUCINATION RULE (LINKS): 
          Do NOT invent specific application URLs. 
          - If you know the exact company career page, provide it (e.g., https://careers.google.com).
          - Otherwise, provide a Google Jobs search URL for that specific role: 
            "https://www.google.com/search?q=[Company]+[Role]+internship+apply"
          
          CRITICAL: Ignore companies listed in the resume's experience section.`
        },
        {
          role: "user",
          content: `RESUME: ${profile?.resume_text?.slice(0, 3000) || "No resume provided"}
          
          RETURN JSON ONLY:
          {
            "matches": [
              { 
                "company": "Company Name", 
                "role": "Role Title", 
                "location": "City, ST", 
                "match": number,
                "link": "URL",
                "why": "1-sentence reason based on resume" 
              }
            ]
          }`
        }
      ],
      response_format: { type: "json_object" }
    })

    return JSON.parse(completion.choices[0].message.content || "{}")
  } catch (e) {
    console.error(e)
    return { error: "AI failed to find matches" }
  }
}