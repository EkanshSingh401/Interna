import { auth } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"
import { Header } from "@/components/dashboard/header"
import { 
  FileText, 
  Plus, 
  Calendar, 
  ArrowRight, 
  ExternalLink,
  ChevronLeft,
  Search,
  MoreVertical
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils" // Assuming you have a date formatter

export const dynamic = 'force-dynamic'

export default async function ResumesPage() {
  const { userId } = await auth()
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch all resumes for this user
  // Note: This assumes you have a 'resumes' table. 
  // If you only have 'profiles', you'd fetch the single profile record.
  const { data: resumes } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0D12] text-foreground pb-20">
      <Header isPro={true} /> {/* Pass your isPro logic here */}

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-indigo-400 text-sm mb-2 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              Back to Mission Control
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-white">The Hangar</h1>
            <p className="text-muted-foreground mt-1">Manage and deploy your tailored resumes.</p>
          </div>

          <Link href="/dashboard/resume">
            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-500/20">
              <Plus className="h-4 w-4" />
              Create New Version
            </Button>
          </Link>
        </div>

        {/* Resume Grid */}
        {!resumes || resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]">
            <div className="h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-white">No resumes found</h3>
            <p className="text-muted-foreground mb-6">You haven't created any resume versions yet.</p>
            <Link href="/dashboard/resume">
              <Button variant="outline" className="border-white/10 hover:bg-white/5">Generate your first resume</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function ResumeCard({ resume }: { resume: any }) {
  // Extracting name from JSON data
  const displayName = resume.resume_data?.personal?.fullName || "Untitled Resume"
  const targetRole = resume.target_role || "General Application"

  return (
    <div className="group relative flex flex-col bg-[#141820] border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 hover:bg-[#1A1F2B] transition-all duration-300">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="h-12 w-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
            <FileText className="h-6 w-6 text-indigo-400" />
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-white h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">
          {displayName}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-1">{targetRole}</p>

        <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-mono uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3" />
            {new Date(resume.updated_at).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            ATS Optimized
          </div>
        </div>
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5 flex gap-2">
        <Link href={`/dashboard/resume?id=${resume.id}`} className="flex-1">
          <Button variant="secondary" className="w-full bg-white/5 hover:bg-white/10 text-white border-0 text-xs h-9">
            Edit Version
          </Button>
        </Link>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-white">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}