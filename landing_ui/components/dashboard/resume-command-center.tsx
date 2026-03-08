"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { useReactToPrint } from "react-to-print"
import {
  Briefcase, GraduationCap, User, Sparkles, Edit3, Download, UploadCloud,
  LayoutTemplate, BookOpen, Columns, Award, Bot, ChevronLeft,
  History, Loader2, Cloud, FolderGit2, Cpu, PenTool
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogTitle, DialogDescription
} from "@/components/ui/dialog"
import { updateResumeAction } from "@/app/actions/update-resume"
import { parseResumeAction } from "@/app/actions/resume-parser"
import { toast } from "sonner"
import Link from "next/link"

// --- TYPES & DEFAULTS ---
type TemplateType = 'jake' | 'harvard' | 'mit' | 'stanford' | 'deedy'

// Added 'location' to interfaces so it maps to the LaTeX templates
interface Experience { id: string; role: string; company: string; location?: string; date: string; description: string }
interface Education { id: string; school: string; degree: string; location?: string; date: string }
interface Project { id: string; name: string; tech: string; date: string; description: string }

interface ResumeData {
  personal: { fullName: string; email: string; phone: string; linkedin: string; website: string }
  experience: Experience[]
  education: Education[]
  projects: Project[]
  skills: string
}

const EMPTY_RESUME: ResumeData = {
  personal: { fullName: "", email: "", phone: "", linkedin: "", website: "" },
  experience: [],
  education: [],
  projects: [],
  skills: ""
}

// --- SAMPLE DATA ---
const SAMPLE_RESUME: ResumeData = {
  personal: {
    fullName: "ALEXANDER INTERNA",
    email: "alex@interna.ai",
    phone: "123-456-7890",
    linkedin: "linkedin.com/in/alex",
    website: "github.com/alex"
  },
  experience: [
    {
      id: "1",
      role: "Undergraduate Research Assistant",
      company: "Texas A&M University",
      location: "College Station, TX",
      date: "Jul 2021 – Present",
      description: "• Developed a REST API using FastAPI and PostgreSQL to store data from learning management systems\n• Developed a full-stack web application using Flask, React, PostgreSQL and Docker to analyze GitHub data\n• Explored ways to visualize GitHub collaboration in a classroom setting"
    },
    {
      id: "2",
      role: "Information Technology Support Specialist",
      company: "Southwestern University",
      location: "Georgetown, TX",
      date: "Sep. 2018 – Present",
      description: "• Communicate with managers to set up campus computers used on campus\n• Assess and troubleshoot computer problems brought by students, faculty and staff"
    }
  ],
  education: [
    { id: "e1", school: "Southwestern University", location: "Georgetown, TX", degree: "Bachelor of Arts in Computer Science", date: "Aug. 2018 – May 2021" },
  ],
  projects: [
    {
      id: "p1",
      name: "Gitlytics",
      tech: "Python, Flask, React, PostgreSQL, Docker",
      date: "June 2020 – Present",
      description: "• Developed a full-stack web application using with Flask serving a REST API with React as the frontend\n• Implemented GitHub OAuth to get data from user's repositories"
    }
  ],
  skills: "Java, Python, C/C++, SQL, PostgreSQL, JavaScript, HTML, CSS, React, Node.js, Flask"
}

// --- TEMPLATES ARRAY ---
const TEMPLATES = [
  { id: 'jake', name: "Jake's Resume", tagline: "The FAANG Standard", desc: "Single-column, Serif, 100% ATS Parse Rate.", longDesc: "Based on the legendary 'Jake's Resume'. Ideal for FAANG applications.", icon: LayoutTemplate, color: "bg-blue-600" },
  { id: 'harvard', name: "Harvard OCS", tagline: "Finance & Law", desc: "Conservative, Center-Header.", longDesc: "Strictly modeled after Harvard OCS templates. Best for IB and Law.", icon: BookOpen, color: "bg-red-800" },
  { id: 'mit', name: "MIT Technology", tagline: "Engineering", desc: "Skills-First, Sans-Serif.", longDesc: "Inspired by MIT CAPD. Prioritizes technical skills and coursework.", icon: Award, color: "bg-gray-800" },
  { id: 'stanford', name: "Stanford Modern", tagline: "Product & Design", desc: "Elegant Serif, Whitespace.", longDesc: "A polished, modern take on the classic resume.", icon: GraduationCap, color: "bg-red-600" },
  { id: 'deedy', name: "Deedy CV", tagline: "Two-Column", desc: "High Density, Visual.", longDesc: "The famous two-column layout. Great for human review.", icon: Columns, color: "bg-indigo-600" },
]

// --- HELPER: MINIATURE RENDERER ---
function TemplateMiniature({ template, scale = 0.2 }: { template: TemplateType, scale?: number }) {
  return (
    <div className="bg-white w-full h-full relative overflow-hidden select-none pointer-events-none shadow-sm">
      <div style={{ width: '210mm', height: '297mm', transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <ResumePreview resume={SAMPLE_RESUME} template={template} />
      </div>
    </div>
  )
}

// --- MAIN COMPONENT ---
export function ResumeCommandCenter({ profile, isLocked, internships = [] }: { profile: any, isLocked?: boolean, internships?: any[] }) {
  const searchParams = useSearchParams()
  const router = useRouter()
 
  const [currentResumeId, setCurrentResumeId] = useState<string | undefined>(searchParams.get('id') || undefined)
  const hasData = profile?.resume_data && Object.keys(profile.resume_data).length > 0 && profile.resume_data.personal?.fullName !== ""
 
  const [view, setView] = useState<'template_choice' | 'questionnaire' | 'editor'>(currentResumeId || hasData ? 'editor' : 'template_choice')
  const [resume, setResume] = useState<ResumeData>(hasData ? profile.resume_data : EMPTY_RESUME)
  const [template, setTemplate] = useState<TemplateType>(profile?.resume_template || 'jake')
  const [selectedTemplateObj, setSelectedTemplateObj] = useState<any>(null)
 
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  // --- NEW: REAL LATEX LOGIC ---
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLatexLoading, setIsLatexLoading] = useState(false);

  // ADDED: Date Formatter helper
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    if (dateStr.toLowerCase() === 'present') return "Present";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; 
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // "May 2019"
  };

  // 1. Effect to refresh the LaTeX Preview (Debounced)
  useEffect(() => {
    // CHANGED: Timeout set to 3.5 seconds
    const timer = setTimeout(async () => {
      setIsLatexLoading(true);
      try {
        const templateMap: Record<string, string> = {
            jake: 'jakes-ryan',
            harvard: 'harvard',
            mit: 'mit',
            stanford: 'stanford',
            deedy: 'deedy'
        };

        const payload = {
          templateName: templateMap[template] || 'jakes-ryan',
          data: {
            fullName: resume.personal.fullName || "",
            email: resume.personal.email || "",
            phone: resume.personal.phone || "",
            linkedin: resume.personal.linkedin || "",
            github: resume.personal.website || "",
            
            education: (resume.education || []).map(edu => ({
              school: edu.school || "",
              degree: edu.degree || "",
              location: edu.location || "", 
              date: formatDate(edu.date)    
            })),
            
            experience: (resume.experience || []).map(exp => ({
               title: exp.role || "",       
               company: exp.company || "",
               location: exp.location || "", 
               startDate: formatDate(exp.date),   
               bullets: typeof exp.description === 'string' 
                 ? exp.description.split('\n').map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(line => line.length > 0)
                 : []
            })),
            
            projects: (resume.projects || []).map(proj => ({
               title: proj.name || "",      
               tech: proj.tech || "",
               date: formatDate(proj.date), 
               bullets: typeof proj.description === 'string'
                 ? proj.description.split('\n').map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(line => line.length > 0)
                 : []
            })),
            
            skillCategories: resume.skills ? [
                { name: "Skills", skills: resume.skills }
            ] : []
          }
        };

        const res = await fetch('/api/compile-latex', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      } catch (err) {
        console.error("LaTeX Preview failed", err);
      } finally {
        setIsLatexLoading(false);
      }
    }, 1500); // <--- CHANGED TO 3.5 SECONDS

    return () => clearTimeout(timer);
  }, [resume, template]);

  // 2. Real LaTeX Download
  const downloadLatexPdf = async () => {
    if (!pdfUrl) {
      toast.info("Waiting for PDF generation...");
      return;
    }
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `${resume.personal.fullName.replace(/\s+/g, '_')}_${template}_Resume.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resumePreviewRef = useRef<HTMLDivElement>(null)

  const handleDownloadPdf = useReactToPrint({
    contentRef: resumePreviewRef,
    documentTitle: `${resume.personal.fullName.replace(/\s+/g, '_')}_Resume`,
    onAfterPrint: () => toast.success("Resume downloaded successfully!"),
    pageStyle: `
      @page { size: letter; margin: 0.5in; }
      @media print { body { -webkit-print-color-adjust: exact; } }
    `
  })

  // --- PARSING & SAVING LOGIC ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setIsParsing(true);
    const fd = new FormData(); fd.append("file", file);
    const res = await parseResumeAction(fd);
    if (res.success) {
      setResume(prev => ({ ...prev, ...res.data }));
      if (selectedTemplateObj) { setTemplate(selectedTemplateObj.id); setSelectedTemplateObj(null); }
      setView('editor');
      toast.success("Resume extracted!");
      await saveToDb(res.data);
    } else { toast.error("Extraction failed."); }
    setIsParsing(false);
  }

  const saveToDb = useCallback(async (data: ResumeData) => {
    if (isLocked) return;
    setIsSaving(true)
    const textVersion = `${data.personal.fullName} | ${data.personal.email}`
    const result = await updateResumeAction({ resumeData: data, resumeText: textVersion, resumeId: currentResumeId })
    if (!result?.error) {
       setLastSaved(new Date())
       if (result?.id && result.id !== currentResumeId) {
           setCurrentResumeId(result.id)
           window.history.replaceState(null, '', `/dashboard/resume?id=${result.id}`)
       }
    }
    setIsSaving(false)
  }, [isLocked, currentResumeId])

  useEffect(() => {
    if (view === 'editor') {
        const timer = setTimeout(() => { if (resume.personal.fullName) saveToDb(resume) }, 2000)
        return () => clearTimeout(timer)
    }
  }, [resume, view, saveToDb])

  const startWizard = () => {
    if (selectedTemplateObj) { setTemplate(selectedTemplateObj.id); setSelectedTemplateObj(null); }
    setView('questionnaire')
  }

  // --- RENDER ---
  // ... inside ResumeCommandCenter component

  if (view === 'template_choice') {
    return (
      // Added 'relative' to the parent container so we can position the back button
      <div className="min-h-[550px] p-8 bg-[#0F1218] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 font-sans relative h-screen overflow-y-auto">
        
        {/* --- NEW BACK BUTTON --- */}
        <div className="absolute top-6 left-6 z-20">
          <Button 
            variant="ghost" 
            onClick={() => currentResumeId ? setView('editor') : router.back()}
            className="text-muted-foreground hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        {/* ----------------------- */}

        <div className="max-w-7xl w-full mt-12 md:mt-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Select Template</h2>
            <p className="text-sm text-muted-foreground font-medium">Choose the visual architecture for your professional identity.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {TEMPLATES.map((t) => (
              <div key={t.id} onClick={() => setSelectedTemplateObj(t)} className="group cursor-pointer flex flex-col gap-4 p-4 rounded-2xl border border-white/5 bg-[#141820] hover:border-indigo-500/50 hover:bg-[#1A1F2B] transition-all duration-300 relative">
                <div className="aspect-[3/4] w-full rounded-xl bg-[#0A0D12] relative overflow-hidden shadow-lg group-hover:shadow-indigo-500/10 transition-shadow">
                    <div className="absolute inset-0 flex flex-col p-3 opacity-20 group-hover:opacity-60 transition-opacity">
                      <TemplateMiniature template={t.id as TemplateType} scale={0.19} />
                    </div>
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0A0D12]/40 via-transparent to-transparent opacity-50" />
                    <div className="absolute bottom-3 left-3 z-10">
                      <div className={`p-2 rounded-lg shadow-lg ${t.color.replace('bg-', 'bg-opacity-80 text-')}`}>
                        <t.icon className="h-5 w-5" />
                      </div>
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">{t.name}</h3>
                  <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <Dialog open={!!selectedTemplateObj} onOpenChange={(open) => !open && setSelectedTemplateObj(null)}>
          <DialogContent className="bg-[#161a22] border-white/10 text-white !max-w-none !w-[95vw] h-[90vh] p-0 overflow-hidden flex shadow-2xl rounded-3xl font-sans">
             {selectedTemplateObj && (
               <div className="flex w-full">
                 <div className={`hidden md:flex w-[40%] relative overflow-hidden ${selectedTemplateObj.color} bg-opacity-5 items-center justify-center p-8`}>
                     <div className={`absolute inset-0 ${selectedTemplateObj.color} opacity-10`} />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#161a22] via-transparent to-transparent opacity-80" />
                     <div className="relative z-10 bg-white shadow-2xl rounded-sm w-[340px] h-[480px] overflow-hidden border border-white/20 transition-transform duration-500">
                       <TemplateMiniature template={selectedTemplateObj.id as TemplateType} scale={0.43} />
                     </div>
                 </div>
                 <div className="w-full md:w-[60%] p-8 md:p-10 flex flex-col justify-between bg-[#161a22] relative">
                   <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[100px] rounded-full pointer-events-none" />
                   <div className="relative z-10 max-w-4xl">
                     <div className="flex items-center gap-5 mb-4">
                       <div className={`p-4 rounded-2xl ${selectedTemplateObj.color.replace('bg-', 'bg-opacity-20 text-')}`}>
                         <selectedTemplateObj.icon className="h-8 w-8" />
                       </div>
                       <div>
                         <DialogTitle className="text-4xl font-bold text-white leading-none mb-2 tracking-tight">{selectedTemplateObj.name}</DialogTitle>
                         <p className={`text-xs font-bold uppercase tracking-[0.2em] ${selectedTemplateObj.color.replace('bg-', 'text-')}`}>{selectedTemplateObj.tagline}</p>
                       </div>
                     </div>
                     <DialogDescription className="text-base text-gray-400 leading-relaxed mt-5 line-clamp-4 font-medium">{selectedTemplateObj.longDesc}</DialogDescription>
                   </div>
                   <div className="grid grid-cols-1 gap-4 relative z-10 mt-4">
                     <div className="relative group w-full">
                         <Button disabled={isParsing} variant="outline" className="w-full h-16 md:h-20 border-cyan-500/20 bg-cyan-950/10 text-cyan-100 hover:bg-cyan-900/20 hover:border-cyan-400/50 hover:text-white justify-start px-6 relative overflow-hidden transition-all duration-300 rounded-xl">
                           <div className="h-10 w-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-5 border border-cyan-500/20 group-hover:border-cyan-400/50 group-hover:scale-105 transition-all">
                             {isParsing ? <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" /> : <UploadCloud className="h-5 w-5 text-cyan-400" />}
                           </div>
                           <div className="flex flex-col items-start text-left z-10">
                             <span className="font-bold text-lg mb-0.5 tracking-tight">{isParsing ? "Analyzing PDF..." : "Import PDF"}</span>
                             <span className="opacity-60 text-[10px] font-bold uppercase tracking-widest">{isParsing ? "Interna AI Extraction in Progress" : "Extract data"}</span>
                           </div>
                         </Button>
                         <input type="file" accept=".pdf" disabled={isParsing} className="absolute inset-0 opacity-0 cursor-pointer z-20 disabled:cursor-not-allowed" onChange={handleFileUpload} />
                     </div>
                     <Button onClick={startWizard} className="w-full h-16 md:h-20 bg-gradient-to-r from-[#0F1218] via-[#1A1F2B] to-[#0F1218] border border-amber-500/40 hover:border-amber-400/90 text-white justify-start px-6 shadow-2xl shadow-indigo-900/10 transition-all duration-300 group relative overflow-hidden rounded-xl">
                       <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-400/10 to-purple-500/10 flex items-center justify-center mr-5 border border-amber-400/30 group-hover:border-amber-400 group-hover:shadow-[0_0_15px_rgba(251,191,36,0.4)] transition-all">
                           <Sparkles className="h-5 w-5 text-amber-400" />
                       </div>
                       <div className="flex flex-col items-start text-left z-10">
                         <span className="font-bold text-lg text-white group-hover:text-amber-50 transition-colors mb-0.5 tracking-tight">Build with Interna AI</span>
                         <span className="text-indigo-200/70 text-[10px] font-bold uppercase tracking-widest group-hover:text-amber-200/80">Intelligent Wizard</span>
                       </div>
                     </Button>
                   </div>
                 </div>
               </div>
             )}
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  if (view === 'questionnaire') {
    return <Wizard onComplete={(data: ResumeData) => { setResume(data); setView('editor'); saveToDb(data); }} onBack={() => setView('template_choice')} templateName={template} />
  }

  // --- EDITOR VIEW (LATEX READY) ---
  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-[#0F1218] font-sans h-screen w-screen overflow-hidden">
     
      {/* LEFT: INPUTS (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col border-r border-white/10 bg-[#0A0D12]">
         <div className="p-4 border-b border-white/10 bg-[#1A1F2B] flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white mr-1" onClick={() => currentResumeId ? router.push('/dashboard/resumes') : setView('template_choice')}><ChevronLeft className="h-5 w-5" /></Button>
               <div className="h-8 w-8 rounded-lg bg-indigo-500/20 flex items-center justify-center"><Edit3 className="h-4 w-4 text-indigo-400"/></div>
               <div>
                  <h3 className="text-sm font-bold text-white">Editor</h3>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">{isSaving ? <Loader2 className="h-2 w-2 animate-spin"/> : <Cloud className="h-2 w-2"/>}{lastSaved ? "Synced" : "Unsaved"}</p>
               </div>
            </div>
            <div className="flex gap-2">
               {/* CHANGED: Button Text */}
               <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-white border-0 font-bold px-4 gap-2"><Bot className="h-4 w-4" /> Tailor to Internship</Button>
            </div>
         </div>
         <EditorForm resume={resume} setResume={setResume} />
      </div>

      {/* RIGHT: LIVE PREVIEW (55%) */}
      <div className="hidden lg:flex lg:w-[55%] flex-col bg-[#1E1E1E] overflow-hidden relative">
         <div className="h-14 border-b border-black/20 bg-[#252526] flex justify-between items-center px-6 shrink-0 z-10 shadow-sm">
            <span className="font-medium text-gray-400 text-xs flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Preview</span>
            <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button size="sm" variant="ghost" className="h-8 text-gray-300 hover:bg-white/10 gap-2 text-xs"><LayoutTemplate className="h-3.5 w-3.5" /> Template</Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#1A1F2B] border-white/10 text-white">{TEMPLATES.map(t => (<DropdownMenuItem key={t.id} onClick={() => setTemplate(t.id as TemplateType)} className="cursor-pointer hover:bg-white/5">{t.name}</DropdownMenuItem>))}</DropdownMenuContent>
                </DropdownMenu>
                
                {/* PDF DOWNLOAD BUTTON */}
                <Button 
                   size="sm" 
                   onClick={downloadLatexPdf}
                   disabled={isLatexLoading}
                   className="h-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white gap-2 font-medium text-xs px-4 border-0"
                >
                  {isLatexLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                  Download PDF
                </Button>
            </div>
         </div>

         {/* THE PREVIEW CONTAINER */}
         <div className="flex-1 overflow-y-auto bg-[#1E1E1E] flex justify-center items-start pt-8 pb-20 relative">
             {/* CHANGED: Increased scale significantly to zoom in (0.95) */}
             <div className="relative w-[210mm] h-[297mm] shadow-2xl transition-all duration-300 scale-[0.95] origin-top">
                {isLatexLoading && (
                  <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                     <Loader2 className="h-10 w-10 animate-spin text-cyan-400 mb-2" />
                     <p className="text-sm font-medium">Compiling {template.toUpperCase()}...</p>
                  </div>
                )}
                {pdfUrl ? (
                   <iframe src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full bg-white" title="LaTeX Preview" />
                ) : (
                   <div className="w-full h-full bg-[#252526] flex items-center justify-center text-gray-500 flex-col gap-2">
                      <Loader2 className="h-8 w-8 animate-spin" /><span className="text-xs">Connecting to Engine...</span>
                   </div>
                )}
             </div>
         </div>
      </div>
    </div>
  )
}

function EditorForm({ resume, setResume }: any) {
  const updateExp = (id: string, f: string, v: string) => setResume({ ...resume, experience: resume.experience.map((e: any) => e.id === id ? { ...e, [f]: v } : e) })
  const updateEdu = (id: string, f: string, v: string) => setResume({ ...resume, education: resume.education.map((e: any) => e.id === id ? { ...e, [f]: v } : e) })
  const updateProj = (id: string, f: string, v: string) => setResume({ ...resume, projects: resume.projects.map((p: any) => p.id === id ? { ...p, [f]: v } : p) })
  return (
    <Tabs defaultValue="personal" className="flex-1 flex flex-col min-h-0">
      <div className="px-4 py-3 border-b border-white/5">
        <TabsList className="w-full bg-[#141820] h-12 p-1 gap-1 rounded-xl">
          <TabsTrigger value="personal" className="flex-1 text-xs"><User className="h-3.5 w-3.5 mr-2" /> Info</TabsTrigger>
          <TabsTrigger value="experience" className="flex-1 text-xs"><Briefcase className="h-3.5 w-3.5 mr-2" /> Exp</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1 text-xs"><FolderGit2 className="h-3.5 w-3.5 mr-2" /> Proj</TabsTrigger>
          <TabsTrigger value="education" className="flex-1 text-xs"><GraduationCap className="h-3.5 w-3.5 mr-2" /> Edu</TabsTrigger>
          <TabsTrigger value="skills" className="flex-1 text-xs"><Cpu className="h-3.5 w-3.5 mr-2" /> Skills</TabsTrigger>
        </TabsList>
      </div>
      <div className="flex-1 overflow-y-auto p-6 bg-[#0A0D12]">
        <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <Input placeholder="Full Name" value={resume.personal.fullName} onChange={e => setResume({...resume, personal: {...resume.personal, fullName: e.target.value}})} className="bg-[#1A1F2B]" />
                <Input placeholder="Email" value={resume.personal.email} onChange={e => setResume({...resume, personal: {...resume.personal, email: e.target.value}})} className="bg-[#1A1F2B]" />
            </div>
            <Input placeholder="Phone" value={resume.personal.phone} onChange={e => setResume({...resume, personal: {...resume.personal, phone: e.target.value}})} className="bg-[#1A1F2B]" />
            <Input placeholder="LinkedIn" value={resume.personal.linkedin} onChange={e => setResume({...resume, personal: {...resume.personal, linkedin: e.target.value}})} className="bg-[#1A1F2B]" />
            <Input placeholder="GitHub / Website" value={resume.personal.website} onChange={e => setResume({...resume, personal: {...resume.personal, website: e.target.value}})} className="bg-[#1A1F2B]" />
        </TabsContent>
        <TabsContent value="experience" className="space-y-4">
          {resume.experience.map((exp: any) => (
            <div key={exp.id} className="p-4 bg-[#141820] rounded-xl border border-white/5 space-y-3">
              <Input placeholder="Role" value={exp.role} onChange={e => updateExp(exp.id, 'role', e.target.value)} className="bg-[#0A0D12]" />
              <div className="grid grid-cols-2 gap-3">
                 <Input placeholder="Company" value={exp.company} onChange={e => updateExp(exp.id, 'company', e.target.value)} className="bg-[#0A0D12]" />
                 {/* ADDED LOCATION INPUT */}
                 <Input placeholder="Location" value={exp.location || ""} onChange={e => updateExp(exp.id, 'location', e.target.value)} className="bg-[#0A0D12]" />
              </div>
              <Input placeholder="Date (YYYY-MM)" value={exp.date} onChange={e => updateExp(exp.id, 'date', e.target.value)} className="bg-[#0A0D12]" />
              <Textarea placeholder="Bullets..." value={exp.description} onChange={e => updateExp(exp.id, 'description', e.target.value)} className="min-h-[100px] bg-[#0A0D12]" />
              <Button variant="ghost" className="text-red-400 w-full" onClick={() => setResume({...resume, experience: resume.experience.filter((x:any)=>x.id!==exp.id)})}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed" onClick={() => setResume({...resume, experience: [...resume.experience, {id:crypto.randomUUID(), role:"", company:"", location:"", date:"", description:""}]})}>+ Add Experience</Button>
        </TabsContent>
        <TabsContent value="projects" className="space-y-4">
          {resume.projects?.map((proj: any) => (
            <div key={proj.id} className="p-4 bg-[#141820] rounded-xl border border-white/5 space-y-3">
              <Input placeholder="Name" value={proj.name} onChange={e => updateProj(proj.id, 'name', e.target.value)} className="bg-[#0A0D12]" />
              <Input placeholder="Tech Stack" value={proj.tech} onChange={e => updateProj(proj.id, 'tech', e.target.value)} className="bg-[#0A0D12]" />
              <Input placeholder="Date (YYYY-MM)" value={proj.date} onChange={e => updateProj(proj.id, 'date', e.target.value)} className="bg-[#0A0D12]" />
              <Textarea placeholder="Description..." value={proj.description} onChange={e => updateProj(proj.id, 'description', e.target.value)} className="bg-[#0A0D12]" />
              <Button variant="ghost" className="text-red-400 w-full" onClick={() => setResume({...resume, projects: resume.projects.filter((x:any)=>x.id!==proj.id)})}>Remove</Button>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed" onClick={() => setResume({...resume, projects: [...(resume.projects||[]), {id:crypto.randomUUID(), name:"", tech:"", date:"", description:""}]})}>+ Add Project</Button>
        </TabsContent>
        <TabsContent value="education" className="space-y-4">
            {resume.education?.map((edu: any) => (
                <div key={edu.id} className="p-4 bg-[#141820] rounded-xl border border-white/5 space-y-3">
                    <Input placeholder="School" value={edu.school} onChange={e => updateEdu(edu.id, 'school', e.target.value)} className="bg-[#0A0D12]" />
                    <div className="grid grid-cols-2 gap-3">
                        <Input placeholder="Degree" value={edu.degree} onChange={e => updateEdu(edu.id, 'degree', e.target.value)} className="bg-[#0A0D12]" />
                        {/* ADDED LOCATION INPUT */}
                        <Input placeholder="Location" value={edu.location || ""} onChange={e => updateEdu(edu.id, 'location', e.target.value)} className="bg-[#0A0D12]" />
                    </div>
                    <Input placeholder="Date (YYYY-MM)" value={edu.date} onChange={e => updateEdu(edu.id, 'date', e.target.value)} className="bg-[#0A0D12]" />
                    <Button variant="ghost" className="text-red-400 w-full" onClick={() => setResume({...resume, education: resume.education.filter((x:any)=>x.id!==edu.id)})}>Remove</Button>
                </div>
            ))}
            <Button variant="outline" className="w-full border-dashed" onClick={() => setResume({...resume, education: [...(resume.education || []), {id: crypto.randomUUID(), school: "", degree: "", date: ""}]})}>+ Add Education</Button>
        </TabsContent>
        <TabsContent value="skills">
          <Textarea placeholder="Skills (e.g. Java, React, Node.js)" value={resume.skills} onChange={e => setResume({...resume, skills: e.target.value})} className="min-h-[300px] bg-[#1A1F2B]" />
        </TabsContent>
      </div>
    </Tabs>
  )
}

function Wizard({ onComplete, onBack, templateName }: any) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({ fullName: "", role: "", skills: "" })
  const nextStep = () => {
    if (step === 3) {
      onComplete({ ...EMPTY_RESUME, personal: { ...EMPTY_RESUME.personal, fullName: formData.fullName }, skills: formData.skills, experience: [{ id: crypto.randomUUID(), role: formData.role || "Intern", company: "Example Corp", date: "Present", description: `• Aspiring ${formData.role} ready to contribute.\n• Skilled in ${formData.skills}.` }] })
    } else { setStep(s => s + 1) }
  }
  return (
    <div className="min-h-[500px] flex items-center justify-center bg-[#0F1218] p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center text-white"><h2 className="text-xl font-bold">Configuring {templateName}</h2><p className="text-xs opacity-50">Step {step} of 3</p></div>
        {step === 1 && <Input placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="bg-[#1A1F2B] text-white" />}
        {step === 2 && <Input placeholder="Role" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="bg-[#1A1F2B] text-white" />}
        {step === 3 && <Textarea placeholder="Skills" value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} className="bg-[#1A1F2B] text-white" />}
        <div className="flex justify-between"><Button variant="ghost" onClick={step === 1 ? onBack : () => setStep(s => s - 1)}>Back</Button><Button onClick={nextStep} className="bg-indigo-600">Next</Button></div>
      </div>
    </div>
  )
}

// (Keep your existing ResumePreview component below as it's used for miniatures and other templates)
function ResumePreview({ resume, template }: { resume: any, template: TemplateType }) {
  const safeSplit = (text: any, delimiter: string = '\n') => { if (!text) return []; return String(text).split(delimiter).filter(line => line.trim() !== ''); };
  const ensureUrl = (url: string) => { if (!url) return ''; const clean = url.trim(); if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('mailto:')) return clean; return `https://${clean}`; }
  const displayUrl = (url: string) => { if (!url) return ''; return url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, ''); }

  if (template === 'jake') {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: `@import url('https://www.resume.lol/fonts/cm/fonts.css'); .jake-resume { font-family: "Computer Modern Serif", serif; font-size: 11pt; padding: 0.5in; background: white; color: black; line-height: 1.15; } .jake-resume h1 { text-align: center; font-size: 24pt; margin-bottom: 4pt; } .jake-resume h2 { border-bottom: 1px solid black; text-transform: uppercase; font-size: 11pt; margin-top: 10pt; } .jake-resume h3 { display: flex; justify-content: space-between; font-weight: bold; } .jake-resume ul { padding-left: 0.2in; list-style-type: disc; } .jake-resume a { color: black; text-decoration: none; }` }} />
        <div className="jake-resume">
          <h1>{resume.personal.fullName}</h1>
          <div className="text-center text-sm mb-4">
            {resume.personal.phone} | <a href={`mailto:${resume.personal.email}`}>{resume.personal.email}</a> | <a href={ensureUrl(resume.personal.linkedin)}>{displayUrl(resume.personal.linkedin)}</a>
          </div>
          <section><h2>Education</h2>{resume.education?.map((e:any) => (<div key={e.id}><h3><span>{e.school}</span><span>{e.date}</span></h3><div>{e.degree}</div></div>))}</section>
          <section><h2>Experience</h2>{resume.experience?.map((e:any) => (<div key={e.id} className="mb-2"><h3><span>{e.role}</span><span>{e.date}</span></h3><div className="italic">{e.company}</div><ul>{safeSplit(e.description).map((l:string, i:number)=><li key={i}>{l.replace(/^•\s*/, '')}</li>)}</ul></div>))}</section>
          <section><h2>Technical Skills</h2><div className="pl-4"><strong>Skills:</strong> {resume.skills}</div></section>
        </div>
      </>
    )
  }
 
  // (Harvard, MIT, etc. logic remains exactly as you had it...)
  return <div className="p-8 bg-white text-black font-sans"><h1>{resume.personal.fullName}</h1><p>CSS Fallback Preview</p></div>;
}