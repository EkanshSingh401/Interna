"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  // Detect scroll to add background opacity
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // New Navigation Items
  const navItems = [
    { name: "AI Resume Builder", href: "#features" },
    { name: "Intern Analysis", href: "#ai-resume-builder" },
    { name: "Tracking", href: "#tracking" },
    { name: "Pricing", href: "#pricing" },
  ]

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
        isScrolled ? "bg-[#05070A]/80 backdrop-blur-xl border-white/10 py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 max-w-7xl flex items-center justify-between relative">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative h-8 w-8">
             <Image 
               src="/logo.png" 
               alt="Interna Logo" 
               fill 
               className="object-contain"
             />
          </div>
          {/* Smooth, subtle gradient: Cyan-400 to Cyan-500 */}
          <span className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-500">
            Interna
          </span>
        </Link>

        {/* DESKTOP NAV - CENTERED ABSOLUTELY */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors relative group whitespace-nowrap"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        {/* AUTH BUTTONS */}
        <div className="hidden md:flex items-center gap-4">
          <SignedIn>
            <Button variant="ghost" className="text-muted-foreground hover:text-white" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-9 w-9 ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
                }
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-muted-foreground hover:text-white hover:bg-white/5">
                Sign In
              </Button>
            </SignInButton>
            
            <SignInButton mode="modal">
              {/* Button: Gradient Background (Cyan to Violet/Purple) */}
              <Button className="bg-gradient-to-r from-cyan-500 via-purple-500 to-violet-600 hover:from-cyan-400 hover:via-purple-400 hover:to-violet-500 text-white font-bold shadow-lg transition-all duration-300">
                Get Started Free
              </Button>
            </SignInButton>
          </SignedOut>
        </div>

        {/* MOBILE TOGGLE */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#05070A] border-b border-white/10 p-4 flex flex-col gap-4 md:hidden shadow-2xl animate-in slide-in-from-top-2">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className="text-base font-medium text-muted-foreground hover:text-primary block p-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="h-px bg-white/10 my-2" />
          <SignedOut>
             <SignInButton mode="modal">
               <Button className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-violet-600 text-white font-bold">Get Started Free</Button>
             </SignInButton>
          </SignedOut>
          <SignedIn>
             <Button asChild className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-violet-600 font-bold text-white">
               <Link href="/dashboard">Dashboard</Link>
             </Button>
          </SignedIn>
        </div>
      )}
    </header>
  )
}