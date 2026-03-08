"use server"

import pdf from "pdf-parse-fork"

// 1. PDF Parsing Polyfill (Required for serverless)
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    constructor() {}
    static fromMatrix() { return new DOMMatrix(); }
  };
}

// NOTE: OpenAI import removed to save credits.

export async function landingPageScanAction(formData: FormData) {
  const role = formData.get("role") as string
  const file = formData.get("file") as File | null
  const manualText = formData.get("text") as string | null

  let resumeText = ""

  try {
    // 2. Extract Text (Keep this so it actually processes the file)
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const pdfData = await pdf(buffer)
      resumeText = pdfData.text
    } else if (manualText) {
      resumeText = manualText
    }

    // 3. Basic Validation
    if (!resumeText || resumeText.length < 50) {
      return { error: "Resume content is too short or empty." }
    }

    // 4. "The Free Scanner" (Heuristic Logic)
    // We calculate a score locally based on keywords instead of paying OpenAI.
    
    const lowerText = resumeText.toLowerCase()
    const lowerRole = role.toLowerCase()
    let score = 40; // Base score
    const issues = [];

    // Rule A: Does the resume mention the target role? (+20 pts)
    if (lowerText.includes(lowerRole)) {
        score += 20;
    } else {
        issues.push(`Target role "${role}" is missing from your summary.`);
    }

    // Rule B: Does it have standard sections? (+20 pts)
    if (lowerText.includes('experience') || lowerText.includes('employment')) score += 10;
    else issues.push("Could not clearly identify an 'Experience' section.");

    if (lowerText.includes('education') || lowerText.includes('university')) score += 10;

    // Rule C: Length check (+10 pts)
    if (resumeText.length > 600) score += 10;
    else issues.push("Resume is a bit short. Add more detail to your bullets.");

    // Rule D: Formatting/Noise check
    if (resumeText.includes('Unknown') || resumeText.includes('[]')) {
        score -= 5;
        issues.push("Detected formatting errors or special characters.");
    }

    // Cap score at 95 (To leave room for improvement)
    if (score > 95) score = 95;

    // Fallback issues if the resume is actually perfect
    if (issues.length === 0) {
        issues.push("Add more quantifiable metrics (numbers/%) to your bullets.");
        issues.push("Ensure skills list matches the job description keywords.");
    }

    // Return the exact same shape as before, but instant and free.
    return { 
      success: true, 
      score: score,
      issues: issues.slice(0, 3) // Return top 3 issues
    }

  } catch (error: any) {
    console.error("Landing Scan Error:", error.message)
    return { error: "Failed to process document." }
  }
}