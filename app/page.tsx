"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, Users, Award, Clock } from "lucide-react"

export default function LandingPage() {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState("")
  const [userId, setUserId] = useState("")

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser)
      setUser(parsedUser)
      setUserRole(parsedUser.role || "")
      setUserId(parsedUser.id || "")
    }
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-8 lg:px-12 mx-auto">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center justify-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Find Your Dream Job or Perfect Candidate
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                JobConnect bridges the gap between talented professionals and forward-thinking companies. Start your
                journey today.
              </p>

              {!user ? (
                <>
                  <div className="flex flex-col gap-2 min-[400px]:flex-row">
                    <Link href="/signup?role=candidate">
                      <Button size="lg" className="w-full min-[400px]:w-auto">
                        Join as Candidate
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/signup?role=employer">
                      <Button size="lg" variant="outline" className="w-full min-[400px]:w-auto">
                        Join as Employer
                      </Button>
                    </Link>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Already have an account?{" "}
                      <Link href="/login" className="text-primary underline underline-offset-2">
                        Log in
                      </Link>
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href={
                      userRole === "admin"
                        ? "/admin/dashboard"
                        : userRole === "candidate"
                          ? `/candidate/dashboard/${userId}`
                          : userRole === "employer"
                            ? `/employer/dashboard/${userId}`
                            : "/dashboard"
                    }
                  >
                    <Button size="lg" className="w-full min-[400px]:w-auto">
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
            <div className="mx-auto lg:mx-0 relative">
              <img
                src="/pic.jpeg"
                alt="Job Connect Platform"
                width={550}
                height={550}
                className="rounded-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-8 lg:px-12 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform makes it easy to connect talent with opportunity
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Create Your Profile</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Sign up and build your professional profile or company page
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Connect</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Browse jobs or candidates that match your requirements
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <div className="rounded-full bg-primary/10 p-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Succeed</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Apply to positions or review applications with our smart tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 md:px-8 lg:px-12 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Powerful tools to streamline your job search or hiring process
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-12 mt-8">
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Smart Matching</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Our AI-powered system matches candidates with the most suitable jobs based on skills and experience
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Application Tracking</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Keep track of all your applications or manage candidate applications in one place
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Professional Profiles</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Create detailed profiles that showcase your skills or company culture
              </p>
            </div>
            <div className="flex flex-col space-y-2 rounded-lg border p-6 shadow-sm">
              <h3 className="text-xl font-bold">Real-time Notifications</h3>
              <p className="text-gray-500 dark:text-gray-400">
                Stay updated with instant notifications about new opportunities or applications
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-8 lg:px-12 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Benefits</h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Why choose JobConnect for your career or hiring needs
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3 lg:gap-12 mt-8">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Clock className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">Time Saving</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Streamlined processes save you hours in your job search or recruitment efforts
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Users className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">Quality Connections</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Connect with high-quality candidates or employers that match your specific needs
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Award className="h-8 w-8 text-primary" />
              <h3 className="text-xl font-bold">Career Growth</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">
                Find opportunities that align with your career goals and help you grow professionally
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-8 lg:px-12 mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Ready to Get Started?</h2>
              <p className="max-w-[600px] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of professionals and companies already using JobConnect
              </p>
            </div>

            {!user ? (
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="w-full min-[400px]:w-auto bg-white text-primary hover:bg-gray-100">
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-[400px]:w-auto border-white text-white hover:bg-primary-foreground/10"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link
                  href={
                    userRole === "admin"
                      ? "/admin/dashboard"
                      : userRole === "candidate"
                        ? `/candidate/dashboard/${userId}`
                        : userRole === "employer"
                          ? `/employer/dashboard/${userId}`
                          : "/dashboard"
                  }
                >
                  <Button size="lg" className="w-full min-[400px]:w-auto bg-white text-primary hover:bg-gray-100">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
