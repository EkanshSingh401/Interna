import OpenAI from "openai"
import dotenv from "dotenv"
import { resolve } from "path"

// Load environment variables from .env.local (if it exists)
dotenv.config({ path: resolve(process.cwd(), ".env.local") })

// Also check system environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  console.error("❌ Error: OPENAI_API_KEY environment variable is not set.")
  console.error("\nPlease do one of the following:")
  console.error("1. Create a .env.local file in the landing_ui directory with:")
  console.error("   OPENAI_API_KEY=your_api_key_here")
  console.error("\n2. Or set it as a system environment variable:")
  console.error("   $env:OPENAI_API_KEY='your_api_key_here' (PowerShell)")
  console.error("   export OPENAI_API_KEY='your_api_key_here' (Bash)")
  process.exit(1)
}

console.log("✅ Found OPENAI_API_KEY (length:", apiKey.length, "characters)\n")

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function testAI() {
  console.log("Testing OpenAI integration with GPT-5-nano...\n")

  const fakeJobDescription = `
    Software Engineering Intern - Summer 2025
    
    Company: TechCorp Solutions
    Location: San Francisco, CA (Remote option available)
    
    We are seeking a motivated Software Engineering Intern to join our dynamic team. 
    The ideal candidate will work on cutting-edge projects involving full-stack development, 
    cloud infrastructure, and machine learning applications.
    
    Requirements:
    - Currently pursuing a Bachelor's or Master's degree in Computer Science or related field
    - Strong programming skills in Python, JavaScript, and TypeScript
    - Experience with React, Node.js, and cloud platforms (AWS preferred)
    - Familiarity with Git and agile development practices
    - Excellent problem-solving and communication skills
    - Previous internship or project experience is a plus
    
    Responsibilities:
    - Develop and maintain web applications using modern frameworks
    - Collaborate with cross-functional teams on product features
    - Write clean, maintainable, and well-documented code
    - Participate in code reviews and team meetings
    - Contribute to technical design discussions
    
    Duration: 12 weeks (June - August 2025)
    Compensation: $45/hour + housing stipend
  `

  try {
    console.log("Sending request to OpenAI...\n")

    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that summarizes job descriptions. Provide a concise summary of the key requirements and responsibilities.",
        },
        {
          role: "user",
          content: `Please summarize this job description:\n\n${fakeJobDescription}`,
        },
      ],
      temperature: 0.3,
    })

    const response = completion.choices[0].message.content

    console.log("✅ OpenAI API Response:")
    console.log("=" .repeat(50))
    console.log(response)
    console.log("=" .repeat(50))
    console.log("\n✅ Test successful! OpenAI integration is working.")
  } catch (error: any) {
    console.error("❌ Error testing OpenAI:")
    console.error(error.message)
    if (error.status) {
      console.error(`Status: ${error.status}`)
    }
    process.exit(1)
  }
}

// Run the test
testAI()
