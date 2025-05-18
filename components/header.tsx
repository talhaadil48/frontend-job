"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/context/auth-context"
import { Menu, LogOut, User, Briefcase, FileText } from "lucide-react"

export default function Header() {
  const pathname = usePathname()
  const  storedUser = localStorage.getItem("user")
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const {logout} = useAuth()
  const user = storedUser ? JSON.parse(storedUser) : null

  // Handle scroll event to add shadow to header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    setIsMounted(true)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Get dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/login"

    switch (user.role) {
      case "admin":
        return "/admin/dashboard"
      case "employer":
        return `/employer/dashboard/${user.id}`
      case "candidate":
        return `/candidate/dashboard/${user.id}`
      default:
        return "/"
    }
  }

  // Get profile link based on user role
  const getProfileLink = () => {
    if (!user) return "/login"

    switch (user.role) {
      case "employer":
        return `/employer/profile/${user.id}`
      case "candidate":
        return `/candidate/profile/${user.id}`
      default:
        return "/"
    }
  }

  // Check if the current path is a public page
  const isPublicPage = ["/", "/login", "/signup"].includes(pathname)

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container px-4 md:px-8 lg:px-12 mx-auto flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <span className="text-xl font-bold">JobConnect</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
          
          </Link>
          {user && (
            <Link
              href={getDashboardLink()}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.includes("dashboard") ? "text-primary" : "text-muted-foreground"
              }`}
            >
              
            </Link>
          )}
          {user?.role === "candidate" && (
            <Link
              href="/candidate/applications"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.includes("applications") ? "text-primary" : "text-muted-foreground"
              }`}
            >
             
            </Link>
          )}
          {user?.role === "employer" && (
            <Link
              href="/employer/applications"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname.includes("applications") ? "text-primary" : "text-muted-foreground"
              }`}
            >
            
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />

          {isMounted && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profile_picture_url || ""} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={getDashboardLink()} className="cursor-pointer">
                    <Briefcase className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={getProfileLink()} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === "candidate" && (
                  <DropdownMenuItem asChild>
                    <Link href="/candidate/applications" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Applications
                    </Link>
                  </DropdownMenuItem>
                )}
                {user.role === "employer" && (
                  <DropdownMenuItem asChild>
                    <Link href="/employer/applications" className="cursor-pointer">
                      <FileText className="mr-2 h-4 w-4" />
                      Applications
                    </Link>
                  </DropdownMenuItem>
                )}
                  <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
                
            
            </DropdownMenu>
          ) : (
            isPublicPage && (
              <div className="flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign up</Button>
                </Link>
              </div>
            )
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="grid gap-4 py-4">
                <Link href="/" className="flex items-center gap-2 text-sm font-medium">
                  Home
                </Link>
                {user && (
                  <>
                    <Link href={getDashboardLink()} className="flex items-center gap-2 text-sm font-medium">
                      <Briefcase className="h-4 w-4" />
                      Dashboard
                    </Link>
                    <Link href={getProfileLink()} className="flex items-center gap-2 text-sm font-medium">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    {user.role === "candidate" && (
                      <Link href="/candidate/applications" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        My Applications
                      </Link>
                    )}
                    {user.role === "employer" && (
                      <Link href="/employer/applications" className="flex items-center gap-2 text-sm font-medium">
                        <FileText className="h-4 w-4" />
                        Applications
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      className="flex items-center justify-start gap-2 text-sm font-medium"
                      onClick={() => logout()}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </Button>
                  </>
                )}
                {!user && isPublicPage && (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full justify-start">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full">Sign up</Button>
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
