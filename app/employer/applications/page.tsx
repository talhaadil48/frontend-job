"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import EmployerLayout from "@/components/layouts/employer-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, FileText } from "lucide-react"
import Link from "next/link"

// Types
interface Application {
  id: string
  candidate_id: string
  job_id: string
  resume_url: string
  message?: string
  applied_at: string
  status: boolean
  job_title?: string
  candidate_name?: string
  candidate_email?: string
  candidate_picture?: string
}

export default function EmployerApplicationsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    const userData = JSON.parse(storedUser)
    setUser(userData)

    // Check if user is an employer
    if (userData.role !== "employer") {
      router.push("/")
      return
    }

    // Fetch user data with jobs and applications
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/user/${userData.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()

        // Process applications
        if (data.applications && Array.isArray(data.applications)) {
          // Filter to only include pending applications (where status is null)
          const pendingApplications = data.applications.filter((app: any) => app.status === "pending")

          // Enhance applications with job and candidate data
          const enhancedApplications = await Promise.all(
            pendingApplications.map(async (app: any) => {
              // Fetch job details
              const jobResponse = await fetch(`http://localhost:8000/job/${app.job_id}`)
              const jobData = await jobResponse.json()

              // Get candidate details from the application data
              const candidateData = app.candidates || {}

              // Fetch candidate user data
              const candidateUserResponse = await fetch(`http://localhost:8000/user/${app.candidate_id}`)
              const candidateUserData = await candidateUserResponse.json()

              return {
                ...app,
                job_title: jobData.job?.title || "Unknown Job",
                candidate_name: candidateUserData.user?.name || "Unknown Candidate",
                candidate_email: candidateUserData.user?.email || "",
                candidate_picture: candidateUserData.user?.profile_picture_url || "",
              }
            }),
          )

          setApplications(enhancedApplications)
          setFilteredApplications(enhancedApplications)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching data:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router])

  // Filter applications based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredApplications(applications)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = applications.filter(
      (app) =>
        app.job_title?.toLowerCase().includes(query) ||
        app.candidate_name?.toLowerCase().includes(query) ||
        app.message?.toLowerCase().includes(query),
    )

    setFilteredApplications(filtered)
  }, [applications, searchQuery])

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

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
          <h2 className="text-3xl font-bold tracking-tight">Applications</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search applications..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job</TableHead>
                    <TableHead>Applied On</TableHead>
                    <TableHead>Resume</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No applications found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={application.candidate_picture || ""} alt={application.candidate_name} />
                              <AvatarFallback>{getInitials(application.candidate_name || "")}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{application.candidate_name}</div>
                              <div className="text-sm text-muted-foreground">{application.candidate_email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{application.job_title}</div>
                          <Badge variant="outline" className="mt-1">
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(application.applied_at)}</TableCell>
                        <TableCell>
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-primary hover:underline"
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View Resume
                          </a>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild>
                            <Link href={`/employer/application/${application.id}`}>View Details</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  )
}
