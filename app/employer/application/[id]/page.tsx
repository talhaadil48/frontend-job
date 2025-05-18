"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import EmployerLayout from "@/components/layouts/employer-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle, XCircle, ArrowLeft } from "lucide-react"

export default function ApplicationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [application, setApplication] = useState<any>(null)
  const [matchScore, setMatchScore] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [aiExplanation, setAiExplanation] = useState("")

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

    // Fetch application data
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/application/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch application data")
        }

        const data = await response.json()
        setApplication(data)

        // Generate a random match score for demo purposes
        // In a real app, this would come from your backend
        // setMatchScore(Math.floor(Math.random() * 100));

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching application:", error)
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

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

  const getApplicationStatus = (status: boolean | null) => {
    if (status === true) return "Accepted"
    if (status === false) return "Rejected"
    return "Pending"
  }

  const getStatusColor = (status: boolean | null) => {
    if (status === true) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
    if (status === false) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
  }
  const checkResume = async () => {
    try {
      setIsLoading(true)
      const resumeUrl = application.application.resume_url
      const jobDetails =
        (application.job.tags || []).join(" ") +
        " " +
        (application.job.description || "") +
        " " +
        (application.job.title || "")

      console.log("resume url", resumeUrl)
      console.log("job details", jobDetails)

      // Step 1: Extract resume text
      const resExtract = await fetch("http://localhost:8000/extract_pdf_text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: resumeUrl }),
      })

      const extractData = await resExtract.json()
      if (extractData.error) {
        console.error("Error extracting resume:", extractData.error)
        setIsLoading(false)
        return
      }
      const resumeText = extractData.text
      console.log("Extracted text:", resumeText)

      // Step 2: Send extracted resume and job details to match-resume API
      const resMatch = await fetch("/api/match-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeText, jobDetails }),
      })

      const matchData = await resMatch.json()
      console.log("Match result:", matchData)

      // Update the UI with the match score and explanation
      setMatchScore(matchData.score)
      setAiExplanation(matchData.explanation)
      setIsLoading(false)
    } catch (error) {
      console.error("Error checking resume:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to check resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle application approval
  const handleApprove = async () => {
    try {
      // Update application status
      const response = await fetch("http://localhost:8000/updateapplication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: application.application.id,
          status: "accepted",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update application status")
      }

      // Update local state
      setApplication({
        ...application,
        application: {
          ...application.application,
          status: true,
        },
      })
      router.push("/employer/applications")

      toast({
        title: "Application approved",
        description: `You have approved ${application.candidate_user.name}'s application.`,
      })
    } catch (error) {
      console.error("Error approving application:", error)
      toast({
        title: "Error",
        description: "Failed to approve application. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle application rejection
  const handleReject = async () => {
    try {
      // Update application status
      const response = await fetch("http://localhost:8000/updateapplication", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application_id: application.application.id,
          status: "rejected",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update application status")
      }

      // Update local state
      setApplication({
        ...application,
        application: {
          ...application.application,
          status: false,
        },
      })
      router.push("/employer/applications")

      toast({
        title: "Application rejected",
        description: `You have rejected ${application.candidate_user.name}'s application.`,
      })
    } catch (error) {
      console.error("Error rejecting application:", error)
      toast({
        title: "Error",
        description: "Failed to reject application. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get match score color
  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400"
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400"
    return "text-red-600 dark:text-red-400"
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

  if (!application) {
    return (
      <EmployerLayout>
        <div className="flex-1 p-4 md:p-8 pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Application not found</h2>
            <p className="text-muted-foreground mt-2">
              The application you are looking for does not exist or you do not have permission to view it.
            </p>
            <Button className="mt-4" onClick={() => router.push("/employer/applications")}>
              Back to Applications
            </Button>
          </div>
        </div>
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/employer/applications")}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Candidate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage
                      src={application.candidate_user.profile_picture_url || ""}
                      alt={application.candidate_user.name}
                    />
                    <AvatarFallback className="text-2xl">
                      {getInitials(application.candidate_user.name || "")}
                    </AvatarFallback>
                  </Avatar>
                  <a
                    href={application.application.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-primary hover:underline mt-2"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    View Resume
                  </a>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold">{application.candidate_user.name}</h3>
                    <p className="text-muted-foreground">{application.candidate_user.email}</p>
                    <Badge className={`mt-2 ${getStatusColor(application.application.status)}`}>
                      {getApplicationStatus(application.application.status)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Application Message</h4>
                    <div className="bg-muted p-4 rounded-lg">
                      {application.application.cover_letter || "No message provided."}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Applied On</h4>
                    <p>{formatDate(application.application.applied_at)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Match Score</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getMatchScoreColor(matchScore)}`}>{matchScore}%</div>
                <p className="text-muted-foreground mt-1">Match Score</p>
              </div>
              <Progress value={matchScore} className="h-2" />

              {aiExplanation && (
                <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                  <p className="font-medium mb-1">AI Analysis:</p>
                  <p>{aiExplanation}</p>
                </div>
              )}

              <Button onClick={checkResume} className="w-full mt-4" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></span>
                    Analyzing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Check Resume
                  </span>
                )}
              </Button>

              {!aiExplanation && (
                <div className="text-sm mt-4">
                  <p className="mb-2">
                    Click "Check Resume" to analyze how well the candidate&apos;s profile matches the job requirements
                    based on:
                  </p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Skills alignment</li>
                    <li>Experience level</li>
                    <li>Education background</li>
                    <li>Resume keywords</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-bold">{application.job.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{application.job.type}</Badge>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Job Description</h4>
                <p className="whitespace-pre-line">{application.job.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleReject}
            className="gap-2"
            disabled={application.application.status !== "pending"}
          >
            <XCircle className="h-5 w-5" />
            Reject Application
          </Button>
          <Button
            size="lg"
            onClick={handleApprove}
            className="gap-2"
            disabled={application.application.status !== "pending"}
          >
            <CheckCircle className="h-5 w-5" />
            Approve Application
          </Button>
        </div>
      </div>
      <div></div>
    </EmployerLayout>
  )
}
