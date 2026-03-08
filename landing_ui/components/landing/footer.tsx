import Link from "next/link"
import Image from "next/image" // 1. Import Image
import { Github, Twitter, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#05070A] pt-20 pb-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2">
              {/* 2. Replaced Icon with Image */}
              <div className="relative h-6 w-6">
                <Image 
                  src="/logo.png" 
                  alt="Interna Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <span className="text-lg font-bold text-white">Interna</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              The AI-powered mission control for ambitious students. Stop guessing, start landing.
            </p>
            <div className="flex items-center gap-4 pt-2">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <Link 
                  key={i} 
                  href="#" 
                  className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-black transition-all"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Features', 'Pricing', 'Roadmap', 'Changelog'].map(item => (
                <li key={item}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                <li key={item}>
                  <Link href="#" className="hover:text-primary transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Interna Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            All Systems Operational
          </div>
        </div>
      </div>
    </footer>
  )
}