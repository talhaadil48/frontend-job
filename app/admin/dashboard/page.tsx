"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, Users, Briefcase, Calendar, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface User {
  id?: string
  user_id?: string
  name?: string
  email?: string
  role?: string
  is_blocked?: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
    is_blocked: boolean
  }
}

interface Job {
  id: string
  title: string
  type?: string
  tags: string[]
  salary?: string
  deadline: string
  employer_id: string
  company_name?: string
  employers?: {
    company_name: string
    logo_url?: string
  }
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all users with proper error handling and data transformation
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching users...")
      const response = await fetch("https://backend-job-eight.vercel.app//allusers")
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)

      const data = await response.json()
      console.log("Users API response:", data)

      // Handle the array format
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.warn("API response is not an array as expected:", data)

        // Fallback handling for other formats
        let usersArray: User[] = []
        if (data && typeof data === "object") {
          if (data.users && Array.isArray(data.users)) {
            usersArray = data.users
          } else if (Object.keys(data).some((key) => !isNaN(Number(key)))) {
            usersArray = Object.values(data)
          } else {
            usersArray = [data]
          }
        }

        setUsers(usersArray)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }, [])

  // Fetch all jobs with proper error handling and data transformation
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching jobs...")
      const response = await fetch("https://backend-job-eight.vercel.app//alljobs")
      if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`)

      const data = await response.json()
      console.log("Jobs API response:", data)

      // Ensure we have an array of jobs
      let jobsArray: Job[] = []
      if (Array.isArray(data)) {
        jobsArray = data
      } else if (data && typeof data === "object") {
        // If it's an object with numeric keys, convert to array
        if (Object.keys(data).some((key) => !isNaN(Number(key)))) {
          jobsArray = Object.values(data)
        } else if (data.jobs && Array.isArray(data.jobs)) {
          // If it has a jobs property that's an array
          jobsArray = data.jobs
        } else {
          // If it's a single job object, wrap in array
          jobsArray = [data]
        }
      }

      // Ensure each job has tags as an array
      jobsArray = jobsArray.map((job) => ({
        ...job,
        tags: Array.isArray(job.tags) ? job.tags : job.tags ? [job.tags] : [],
      }))

      setJobs(jobsArray)
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    }
  }, [])

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both users and jobs in parallel
      await Promise.all([fetchUsers(), fetchJobs()])
    } catch (err) {
      console.error("Error fetching dashboard data:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchUsers, fetchJobs])

  useEffect(() => {
    fetchAllData()
  }, [fetchAllData])

  // Helper function to get user role safely
  const getUserRole = (user: User): string => {
    if (user.role) return user.role
    if (user.user?.role) return user.user.role
    return "unknown"
  }

  // Calculate statistics
  const totalUsers = users.length
  const totalJobs = jobs.length
  const totalCandidates = users.filter((user) => getUserRole(user) === "candidate").length
  const totalEmployers = users.filter((user) => getUserRole(user) === "employer").length

  // Calculate job types distribution
  const jobTypes = jobs.reduce(
    (acc, job) => {
      if (job.type) {
        acc[job.type] = (acc[job.type] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Calculate popular job tags
  const jobTags = jobs.reduce(
    (acc, job) => {
      if (Array.isArray(job.tags)) {
        job.tags.forEach((tag) => {
          acc[tag] = (acc[tag] || 0) + 1
        })
      }
      return acc
    },
    {} as Record<string, number>,
  )

  // Sort tags by popularity
  const popularTags = Object.entries(jobTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    } catch (e) {
      return dateString
    }
  }

  // Get company name safely
  const getCompanyName = (job: Job): string => {
    return job.company_name || job.employers?.company_name || "Unknown Company"
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading dashboard data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error loading dashboard</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button onClick={() => fetchAllData()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/admin/manage-users">
            <Button>Manage Users</Button>
          </Link>
          <Link href="/admin/manage-jobs">
            <Button>Manage Jobs</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {totalCandidates} candidates, {totalEmployers} employers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
                <Briefcase className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalJobs}</div>
                <p className="text-xs text-muted-foreground">{Object.keys(jobTypes).length} different job types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {jobs.filter((job) => new Date(job.deadline) > new Date()).length}
                </div>
                <p className="text-xs text-muted-foreground">Active job postings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Popular Skills</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{popularTags.length}</div>
                <p className="text-xs text-muted-foreground">{popularTags.map(([tag]) => tag).join(", ")}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>Latest job postings on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{job.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCompanyName(job)} • {job.type || "N/A"}
                        </p>
                      </div>
                      <div className="ml-auto font-medium">{job.salary || "N/A"}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>Breakdown of user types</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <PieChart className="h-24 w-24 text-primary" />
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-primary mr-2" />
                      <span className="text-sm">Candidates: {totalCandidates}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-3 w-3 rounded-full bg-muted mr-2" />
                      <span className="text-sm">Employers: {totalEmployers}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Job Types</CardTitle>
                <CardDescription>Distribution of job types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(jobTypes).map(([type, count]) => (
                    <div key={type} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{type}</p>
                      </div>
                      <div className="ml-auto font-medium">{count} jobs</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Popular Tags</CardTitle>
                <CardDescription>Most requested skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularTags.map(([tag, count]) => (
                    <div key={tag} className="flex items-center">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{tag}</p>
                      </div>
                      <div className="ml-auto font-medium">{count} jobs</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
