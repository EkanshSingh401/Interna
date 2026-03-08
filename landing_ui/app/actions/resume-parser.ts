"use server"

import OpenAI from "openai"
import pdf from "pdf-parse-fork" 

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function parseResumeAction(formData: FormData) {
  const file = formData.get("file") as File
  if (!file) return { error: "No file provided" }

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const data = await pdf(buffer)
    
    // 1. THE DEEP CLEAN: ASCII Only
    // This regex strips any character that isn't a standard letter, number, or punctuation.
    // It kills the "invisible gremlins" that break LaTeX.
    const cleanText = data.text
      .replace(/[^\x20-\x7E\n]/g, "") // Keep only printable ASCII characters and newlines
      .replace(/The following table:/gi, "")
      .replace(/Location/gi, "")
      .replace(/\s+/g, " ")
      .slice(0, 14000)

    // 2. AI Extraction (GPT-4o-mini)
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano", 
      messages: [
        {
          role: "system",
          content: `Extract resume data into JSON.
          
          RULES:
          1. Clean up the text. If a field is just "1" or "Location", make it empty.
          2. Convert description bullets into a single string joined by newlines (\\n).
          
          Structure:
          {
            "personal": { "fullName": "", "email": "", "phone": "", "linkedin": "", "website": "" },
            "experience": [{ "role": "", "company": "", "date": "", "description": "" }],
            "education": [{ "school": "", "degree": "", "date": "" }],
            "projects": [{ "name": "", "tech": "", "date": "", "description": "" }],
            "skills": ""
          }`
        },
        { role: "user", content: cleanText }
      ],
      response_format: { type: "json_object" }
    })

    const parsedData = JSON.parse(completion.choices[0].message.content || "{}")
    
    // 3. ID Generation & formatting
    const fix = (val: any) => typeof val === 'string' ? val.trim() : "";
    
    parsedData.experience = parsedData.experience?.map((e: any) => ({ 
      id: crypto.randomUUID(), 
      role: fix(e.role), company: fix(e.company), date: fix(e.date),
      description: Array.isArray(e.description) ? e.description.join('\n') : fix(e.description)
    })) || []

    parsedData.education = parsedData.education?.map((e: any) => ({ 
      id: crypto.randomUUID(), 
      school: fix(e.school), degree: fix(e.degree), date: fix(e.date) 
    })) || []

    parsedData.projects = parsedData.projects?.map((p: any) => ({ 
      id: crypto.randomUUID(), 
      name: fix(p.name), tech: fix(p.tech), date: fix(p.date),
      description: Array.isArray(p.description) ? p.description.join('\n') : fix(p.description)
    })) || []
    
    if (Array.isArray(parsedData.skills)) parsedData.skills = parsedData.skills.join(', ');

    return { success: true, data: parsedData }
  } catch (error) {
    return { error: "Failed to parse resume" }
  }
}