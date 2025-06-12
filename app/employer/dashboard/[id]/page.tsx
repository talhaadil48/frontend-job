"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Briefcase, FileText, Users, TrendingUp, Plus } from "lucide-react"
import Link from "next/link"
import EmployerLayout from "@/components/layouts/employer-layout"
import DashboardChart from "@/components/dashboard-chart"

// Types
interface Job {
  id: string
  title: string
  type: string
  created_at: string
  employer_id: string
  description?: string
  tags?: string[]
  salary?: string
  deadline: string
}

interface EmployerStats {
  activeJobs: number
  totalApplications: number
  candidatesViewed: number
  conversionRate: number
  activeJobsChange: number
  applicationsChange: number
  viewsChange: number
  conversionChange: number
  applicationsPerJobData: { name: string; data: number[] }[]
}

export default function EmployerDashboard() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<EmployerStats>({
    activeJobs: 0,
    totalApplications: 0,
    candidatesViewed: 0,
    conversionRate: 0,
    activeJobsChange: 0,
    applicationsChange: 0,
    viewsChange: 0,
    conversionChange: 0,
    applicationsPerJobData: [],
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    console.log("Stored user data:", storedUser)
    if (!storedUser) {
      router.push("/login")
      return
    }
    console.log(storedUser)

    const userData = JSON.parse(storedUser)
    console.log("User ID from localStorage:", userData.id)
    console.log("Expected ID from params:", params.id)

    setUser(userData)

    // Check if user is an employer
    if (userData.role !== "employer") {
      router.push("/")
      return
    }

    // Fetch user data with jobs and applications
    const fetchData = async () => {
      try {
        const response = await fetch(`https://backend-job-eight.vercel.app//user/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()

        // Set jobs from the response
        if (data.jobs && Array.isArray(data.jobs)) {
          setJobs(data.jobs)
        }

        // Calculate stats
        const activeJobs = data.jobs?.length || 0
        const totalApplications = data.applications?.length || 0

        // Generate mock stats for now
        // In a real app, you would calculate these from the actual data
        setStats({
          activeJobs,
          totalApplications,
          candidatesViewed: Math.floor(totalApplications * 0.8),
          conversionRate: totalApplications > 0 ? Math.floor((totalApplications / (activeJobs || 1)) * 10) : 0,
          activeJobsChange: 2,
          applicationsChange: 5,
          viewsChange: 3,
          conversionChange: 1,
          applicationsPerJobData: [
            {
              name: "Applications",
              data: data.jobs?.map(() => Math.floor(Math.random() * 20)) || [],
            },
          ],
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  if (isLoading) {
    return (
      <EmployerLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <Link href="/employer/create-job">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Job
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeJobsChange > 0 ? "+" : ""}
                {stats.activeJobsChange} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApplications}</div>
              <p className="text-xs text-muted-foreground">
                {stats.applicationsChange > 0 ? "+" : ""}
                {stats.applicationsChange} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Candidates Viewed</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.candidatesViewed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.viewsChange > 0 ? "+" : ""}
                {stats.viewsChange} from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.conversionChange > 0 ? "+" : ""}
                {stats.conversionChange}% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Applications per Job</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <DashboardChart data={stats.applicationsPerJobData} categories={["Applications"]} />
            </CardContent>
          </Card>

          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Your Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <p className="text-center text-muted-foreground">You haven&apos;t posted any jobs yet.</p>
                ) : (
                  jobs.slice(0, 5).map((job) => (
                    <div key={job.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{job.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.type} • Posted on {new Date(job.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{Math.floor(Math.random() * 20)} applications</div>
                        <Link href={`/employer/edit-job/${job.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
                {jobs.length > 5 && (
                  <div className="text-center">
                    <Button variant="link" asChild>
                      <Link href="/employer/applications">View all jobs</Link>
                    </Button>
                  </div>
                )}
                {jobs.length === 0 && (
                  <div className="text-center mt-4">
                    <Button asChild>
                      <Link href="/employer/create-job">Create Your First Job</Link>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployerLayout>
  )
}
