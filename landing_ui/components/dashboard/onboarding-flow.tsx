"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, GraduationCap, BookOpen, CheckCircle2 } from "lucide-react"
import { saveUserProfile, checkProfileExists } from "@/app/actions/profile"

export function OnboardingFlow() {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1) // 1: Edu, 2: Major
  const [isSaving, setIsSaving] = useState(false)
  
  // Form Data
  const [eduLevel, setEduLevel] = useState("")
  const [major, setMajor] = useState("")

  useEffect(() => {
    // Check if user already has a profile
    checkProfileExists().then((exists) => {
      if (!exists) setIsOpen(true)
    })
  }, [])

  const handleNext = () => setStep(s => s + 1)
  
  const handleFinish = async () => {
    setIsSaving(true)
    await saveUserProfile({
      educationLevel: eduLevel,
      major: major,
      resumeText: "" // Sending empty string or null since step is removed
    })
    setIsSaving(false)
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      {/* prevent closing by clicking outside */}
      <DialogContent className="sm:max-w-[500px] [&>button]:hidden max-h-[90vh] overflow-y-auto"> 
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {step === 1 && <GraduationCap className="h-5 w-5 text-primary" />}
            {step === 2 && <BookOpen className="h-5 w-5 text-primary" />}
            
            {step === 1 && "What is your education level?"}
            {step === 2 && "What are you studying?"}
          </DialogTitle>
          <DialogDescription>
            Step {step} of 2 • We use this to calculate your Fit Score.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {step === 1 && (
            <div className="space-y-4">
              <Label>Current Status</Label>
              <Select onValueChange={setEduLevel} value={eduLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High School">High School</SelectItem>
                  <SelectItem value="Undergraduate (Freshman/Sophomore)">Undergraduate (Freshman/Sophomore)</SelectItem>
                  <SelectItem value="Undergraduate (Junior/Senior)">Undergraduate (Junior/Senior)</SelectItem>
                  <SelectItem value="Post-Graduate / Masters">Post-Graduate / Masters</SelectItem>
                  <SelectItem value="Bootcamp / Self-Taught">Bootcamp / Self-Taught</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Major or Career Interest</Label>
              <Input 
                placeholder="e.g. Computer Science, Marketing, UI/UX..." 
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && major) {
                    handleFinish();
                  }
                }}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          {step < 2 ? (
            <Button 
              onClick={handleNext} 
              disabled={step === 1 && !eduLevel}
            >
              Next Step
            </Button>
          ) : (
            <Button 
              onClick={handleFinish} 
              disabled={!major || isSaving}
              className="bg-primary"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving Profile...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete Setup
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}