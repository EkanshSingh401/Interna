import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { ResumeCommandCenter } from "@/components/dashboard/resume-command-center"
import { getUserInternships } from "@/app/actions/fetch-internships"
import { Header } from "@/components/dashboard/header"
import { redirect } from "next/navigation"

// Force dynamic rendering so searchParams work correctly
export const dynamic = 'force-dynamic'

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function ResumePage(props: {
  searchParams: SearchParams
}) {
  const searchParams = await props.searchParams
  const resumeId = typeof searchParams.id === 'string' ? searchParams.id : undefined
  
  const { userId } = await auth()
  
  if (!userId) {
    redirect("/")
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Parallel Fetch: Get Internships (for Tailor feature) & The Resume Data
  const internshipPromise = getUserInternships(userId)
  
  let dataPromise;

  if (resumeId) {
    // CASE A: Editing a specific saved resume (from Hangar)
    // We fetch from the 'resumes' table
    dataPromise = supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', userId) // Security: Ensure user owns this resume
      .single()
  } else {
    // CASE B: Editing the "Master" profile resume (Default/New)
    // We fetch from the 'profiles' table
    dataPromise = supabase
      .from('profiles')
      .select('resume_data, resume_template, is_pro')
      .eq('id', userId)
      .single()
  }

  const [internships, dataResult] = await Promise.all([
    internshipPromise,
    dataPromise
  ])

  // 2. Normalize the data structure
  // The Component expects a 'profile' object with 'resume_data' and 'resume_template'
  let normalizedProfile = null

  if (dataResult.data) {
    if (resumeId) {
      // If we fetched from 'resumes', we map 'template_id' to 'resume_template'
      // to match what the component expects.
      normalizedProfile = {
        resume_data: dataResult.data.resume_data,
        resume_template: dataResult.data.template_id || 'jake', // Default to jake if missing
        is_pro: true // Assuming saved resumes are accessible
      }
    } else {
      // If we fetched from 'profiles', it's already in the right format
      normalizedProfile = dataResult.data
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1218] text-foreground">
      <Header isPro={true} />
      
      <main className="container mx-auto px-4 py-6 max-w-[1600px]">
        {/* We removed the redundant header/back button here because 
            the ResumeCommandCenter now handles navigation internally */}
            
        <ResumeCommandCenter 
          profile={normalizedProfile} 
          internships={internships}
          isLocked={false} 
        />
      </main>
    </div>
  )
}