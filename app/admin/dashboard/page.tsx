"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, Activity, Users, Briefcase, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface Job {
  id: string
  title: string
  type: string
  tags: string[]
  salary: string
  deadline: string
  employer_id: string
  employers: {
    company_name: string
    logo_url: string
  }
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch all users
        const usersResponse = await fetch("http://localhost:8000/allusers")
        if (!usersResponse.ok) throw new Error("Failed to fetch users")
        const usersData = await usersResponse.json()

        // Log the response for debugging
        console.log("Users API response:", usersData)

        // Ensure we have an array of users
        let usersArray: User[] = []
        if (Array.isArray(usersData)) {
          usersArray = usersData
        } else if (usersData && typeof usersData === "object") {
          // If it's an object with numeric keys, convert to array
          if (Object.keys(usersData).some((key) => !isNaN(Number(key)))) {
            usersArray = Object.values(usersData)
          } else {
            // If it's a single user object, wrap in array
            usersArray = [usersData]
          }
        }

        setUsers(usersArray)

        // Fetch all jobs
        const jobsResponse = await fetch("http://localhost:8000/alljobs")
        if (!jobsResponse.ok) throw new Error("Failed to fetch jobs")
        const jobsData = await jobsResponse.json()

        // Log the response for debugging
        console.log("Jobs API response:", jobsData)

        // Ensure we have an array of jobs
        let jobsArray: Job[] = []
        if (Array.isArray(jobsData)) {
          jobsArray = jobsData
        } else if (jobsData && typeof jobsData === "object") {
          // If it's an object with numeric keys, convert to array
          if (Object.keys(jobsData).some((key) => !isNaN(Number(key)))) {
            jobsArray = Object.values(jobsData)
          } else {
            // If it's a single job object, wrap in array
            jobsArray = [jobsData]
          }
        }

        setJobs(jobsArray)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate statistics
  const totalUsers = users.length
  const totalJobs = jobs.length
  const totalCandidates = users.filter((user) => user.role === "candidate").length
  const totalEmployers = users.filter((user) => user.role === "employer").length

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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading dashboard data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive">Error loading dashboard</h2>
          <p className="mt-2">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
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
          <Link href="manage-users">
            <Button>Manage Users</Button>
          </Link>
          <Link href="manage-jobs">
            <Button>Manage Jobs</Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          
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
                          {job.employers?.company_name || "Unknown"} • {job.type || "N/A"}
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
