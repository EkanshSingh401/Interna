"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { User, FileText, Crown, LogOut, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge" // Added for the Pro Badge
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { UpgradeModal } from "@/components/dashboard/upgrade-modal"
import { useClerk } from "@clerk/nextjs"

interface HeaderProps {
  isPro?: boolean
}

export function Header({ isPro = false }: HeaderProps) {
  const [showUpgrade, setShowUpgrade] = useState(false)
  const { signOut } = useClerk()

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left Side: Logo & Brand */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <div className="relative h-8 w-8">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* BRAND NAME: Interna written next to logo */}
            <span className="font-bold text-lg tracking-tight hidden sm:block">
              Interna
            </span>
          </Link>

          {/* PRO BADGE: Only shows if user is Pro */}
          {isPro && (
            <Badge 
              variant="secondary" 
              className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-2 py-0.5 flex items-center gap-1 animate-in fade-in zoom-in duration-300"
            >
              <Crown className="h-3 w-3 fill-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Pro</span>
            </Badge>
          )}
        </div>
        
        {/* Right Side: Actions */}
        <div className="flex items-center gap-3">
          
          {/* Unlock Pro Button (Only for non-pro) */}
          {!isPro && (
            <Button 
              onClick={() => setShowUpgrade(true)}
              variant="outline" 
              size="sm"
              className="hidden sm:flex items-center gap-2 border-amber-500/50 bg-amber-500/5 text-amber-600 hover:bg-amber-500 hover:text-white dark:text-amber-500 dark:hover:text-white transition-all font-bold h-9 px-3 text-[11px] uppercase tracking-wider"
            >
              <Crown className="h-3.5 w-3.5 fill-current" />
              Unlock Pro
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard/resume" className="flex items-center gap-2 cursor-pointer">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Resume Command</span>
                </Link>
              </DropdownMenuItem>

              {/* Billing & Subscription Link (Only useful for Pro) */}
              {isPro && (
                <DropdownMenuItem asChild>
                  <Link href="/api/stripe/portal" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>Billing & Subscription</span>
                  </Link>
                </DropdownMenuItem>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => signOut({ redirectUrl: '/' })}
                className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <UpgradeModal 
        isOpen={showUpgrade} 
        onClose={() => setShowUpgrade(false)} 
        title="Upgrade to Interna Pro"
        description="Get unlimited AI scraping, custom resumes, and deep match analysis."
      />
    </header>
  )
}