"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, User, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface CandidateLayoutProps {
  children: React.ReactNode
}

export default function CandidateLayout({ children }: CandidateLayoutProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
   

    setIsMounted(true)
  }, [user, router])

  const navItems = [
    {
      title: "Job Feed",
      href: `/candidate/dashboard/${user?.id}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "My Applications",
      href: "/candidate/applications",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Profile",
      href: `/candidate/profile/${user?.id}`,
      icon: <User className="h-5 w-5" />,
    },
  ]

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Mobile Navigation */}
      <div className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:hidden">
        <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-4 py-4">
              <div className="flex items-center gap-2 px-2">
                <Link href="/" className="flex items-center gap-2">
                  <span className="text-lg font-bold">JobConnect</span>
                </Link>
              </div>
              <div className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium",
                      pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
                <Button
                  variant="ghost"
                  className="flex items-center justify-start gap-2 px-2 py-2 text-sm font-medium"
                  onClick={() => logout()}
                >
                  <LogOut className="h-5 w-5" />
                  Log out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold">Candidate Dashboard</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <aside className="hidden w-64 flex-col border-r bg-background md:flex">
          <div className="flex h-16 items-center gap-2 border-b px-6">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-lg font-bold">JobConnect</span>
            </Link>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex items-center justify-start gap-2 px-3 py-2 text-sm font-medium"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5" />
              Log out
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4">{children}</main>
      </div>
    </div>
  )
}
