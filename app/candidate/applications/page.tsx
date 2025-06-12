"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import CandidateLayout from "@/components/layouts/candidate-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Job {
  id: string
  title: string
  type: string
  salary: string
  deadline: string
  company_name?: string
}

interface Application {
  id: string
  candidate_id: string
  job_id: string
  resume_url: string
  message?: string
  applied_at: string
  status: string | null
  job?: Job
}

export default function CandidateApplicationsPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const stored =  localStorage.getItem("user")
  const user = stored ? JSON.parse(stored) : null

  useEffect(() => {
    // Check if user is logged in and is a candidate
  

    // Fetch applications data from API
    const fetchApplications = async () => {
      try {
        setIsLoading(true)

        // Fetch user data which includes applications
        const response = await fetch(`https://backend-job-eight.vercel.app//user/${user.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch applications")
        }

        const userData = await response.json()

        if (userData.applications && Array.isArray(userData.applications)) {
          // Process applications to include job details
          const enhancedApplications = await Promise.all(
            userData.applications.map(async (app: any) => {
              // Fetch job details for each application
              const jobResponse = await fetch(`https://backend-job-eight.vercel.app//job/${app.job_id}`)
              const jobData = await jobResponse.json()

              // Get employer details for company name
              const employerResponse = await fetch(`https://backend-job-eight.vercel.app//user/${jobData.job.employer_id}`)
              const employerData = await employerResponse.json()

              // Map status to string values for UI
              let statusString = "pending"
              if (app.status === "accepted") statusString = "accepted"
              else if (app.status === "rejected") statusString = "rejected"
              else statusString = "pending"

              return {
                ...app,
                status: statusString,
                job: {
                  ...jobData.job,
                  company_name: employerData.employer?.company_name || "Unknown Company",
                },
              }
            }),
          )

          setApplications(enhancedApplications)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching applications:", error)
        setIsLoading(false)
      }
    }

    fetchApplications()
  }, [router])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <CandidateLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">My Applications</h2>
          <Button asChild>
            <Link href={`/candidate/dashboard/${user?.id}`}>Browse Jobs</Link>
          </Button>
        </div>

        {applications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-6">
              <div className="text-center space-y-2">
                <h3 className="text-xl font-medium">No applications yet</h3>
                <p className="text-muted-foreground">You haven&apos;t applied to any jobs yet.</p>
                <Button className="mt-2" asChild>
                  <Link href={`/candidate/dashboard/${user?.id}`}>Browse Jobs</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{application.job?.company_name?.charAt(0) || "C"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-bold text-lg">{application.job?.title || "Unknown Job"}</h3>
                          <p className="text-muted-foreground">{application.job?.company_name || "Unknown Company"}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <Badge variant="outline">{application.job?.type || "Unknown"}</Badge>
                        {getStatusBadge(application.status || "pending")}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4" />
                          Applied on: {formatDate(application.applied_at)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4" />
                          Deadline: {formatDate(application.job?.deadline || "")}
                        </div>
                        <div className="flex items-center">
                          <FileText className="mr-1 h-4 w-4" />
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            View Resume
                          </a>
                        </div>
                      </div>

                      {application.message && (
                        <div className="mt-2">
                          <h4 className="text-sm font-medium">Your Message:</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">{application.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-end justify-end mt-4 md:mt-0">
                      <Button variant="outline" asChild>
                        <Link href={`/candidate/job/${application.job_id}`}>View Job</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </CandidateLayout>
  )
}
