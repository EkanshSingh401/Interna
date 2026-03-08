"use client"

import { useState, useTransition } from "react"
import { Sparkles, Search, GraduationCap, Briefcase, Loader2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { findInternshipsAction } from "@/app/actions/match-internships"
import { toast } from "sonner"

export function AIMatcher({ profile }: { profile: any }) {
  const [query, setQuery] = useState("")
  const [grade, setGrade] = useState(profile?.grade_level || "Junior")
  const [major, setMajor] = useState(profile?.major || "Computer Science")
  const [isPending, startTransition] = useTransition()
  const [results, setResults] = useState<any[]>([])

  const handleSearch = () => {
    if (!query) return toast.error("Please enter what you're looking for")
    
    startTransition(async () => {
      const data = await findInternshipsAction({ query, grade, major })
      if (data?.error) toast.error(data.error)
      else setResults(data.matches || [])
    })
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-card p-1 shadow-2xl">
      {/* Decorative Gradient Background */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      <div className="relative p-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">AI Internship Matcher</h2>
            <p className="text-xs text-muted-foreground">Using your resume to find the perfect fits</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Search Keywords</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="e.g. Software Engineer in New York..." 
                className="pl-10 h-12 bg-muted/50 border-none ring-1 ring-border focus-visible:ring-indigo-500 transition-all"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full md:w-40 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Major</label>
            <Select value={major} onValueChange={setMajor}>
              <SelectTrigger className="h-12 bg-muted/50 border-none ring-1 ring-border">
                <SelectValue placeholder="Major" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-40 space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">Grade</label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger className="h-12 bg-muted/50 border-none ring-1 ring-border">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Freshman">Freshman</SelectItem>
                <SelectItem value="Sophomore">Sophomore</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
                <SelectItem value="Senior">Senior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleSearch}
            disabled={isPending}
            className="h-12 px-8 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 font-bold transition-all active:scale-95"
          >
            {isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Match Me"}
          </Button>
        </div>

        {/* Results Preview (appears after search) */}
        {results.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            {results.map((res, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border bg-muted/30 hover:bg-muted/50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-background flex items-center justify-center border text-xs font-bold">
                    {res.company.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">{res.role}</h4>
                    <p className="text-[10px] text-muted-foreground">{res.company} • {res.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-full">{res.match}% Match</div>
                   <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus className="h-4 w-4" />
                   </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}