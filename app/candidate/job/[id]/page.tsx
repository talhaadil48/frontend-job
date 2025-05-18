"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { useToast } from "@/hooks/use-toast"
import CandidateLayout from "@/components/layouts/candidate-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Briefcase, DollarSign, Calendar, Globe } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Job {
  id: string
  title: string
  description?: string
  type: string
  tags: string[]
  salary?: string
  deadline: string
  created_at: string
  employer_id: string
  company_name?: string
  company_logo_url?: string
}

interface Employer {
  user_id: string
  company_name: string
  company_website?: string
  company_description?: string
  company_logo_url?: string
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const { toast } = useToast()
  const [job, setJob] = useState<Job | null>(null)
  const [employer, setEmployer] = useState<any>(null)
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    // Check if user is logged in and is a candidate
    if (!user) {
      router.push("/login")
      return
    }

    if (user.role !== "candidate") {
      router.push("/")
      return
    }

    const fetchJobDetails = async () => {
      try {
        setIsLoading(true)
        const jobId = params.id as string

        // Fetch job details
        const jobResponse = await fetch(`http://localhost:8000/job/${jobId}`)
        if (!jobResponse.ok) {
          throw new Error("Failed to fetch job details")
        }

        const jobData = await jobResponse.json()

        // Fetch employer details
        const employerResponse = await fetch(`http://localhost:8000/user/${jobData.job.employer_id}`)
        if (!employerResponse.ok) {
          throw new Error("Failed to fetch employer details")
        }

        const employerData = await employerResponse.json()

        // Fetch all jobs to get related jobs from same employer
        const allJobsResponse = await fetch("http://localhost:8000/alljobs")
        if (!allJobsResponse.ok) {
          throw new Error("Failed to fetch all jobs")
        }

        const allJobsData = await allJobsResponse.json()

        // Filter related jobs (same employer, different job)
        const related = allJobsData
          .filter((j: any) => j.employer_id === jobData.job.employer_id && j.id !== jobId)
          .slice(0, 3)
          .map((j: any) => ({
            ...j,
            company_name: employerData.employer?.company_name,
          }))

        // Check if user has already applied
        const userResponse = await fetch(`http://localhost:8000/user/${user.id}`)
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user applications")
        }

        const userData = await userResponse.json()
        const existingApplication = userData.applications?.find((app: any) => app.job_id === jobId)

        // Set state with fetched data
        setJob({
          ...jobData.job,
          company_name: employerData.employer?.company_name,
        })
        setEmployer(employerData)
        setRelatedJobs(related)
        setHasApplied(!!existingApplication)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching job details:", error)
        setIsLoading(false)
      }
    }

    fetchJobDetails()
  }, [user, router, params.id])

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Handle job application
  const handleApply = async () => {
    if (!user || !job) return

    setIsSubmitting(true)

    try {
      // Create application object
      const applicationData = {
        candidate_id: user.id,
        job_id: job.id,
        resume_url: user.candidate?.resume_url || "https://example.com/resume.pdf",
        message: applicationMessage,
        status: "pending",
      }

      // Submit application to API
      const response = await fetch("http://localhost:8000/application", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      setIsApplyDialogOpen(false)
      setHasApplied(true)

      toast({
        title: "Application submitted!",
        description: "Your application has been submitted successfully.",
      })
    } catch (error) {
      console.error("Error submitting application:", error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
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

  if (!job) {
    return (
      <CandidateLayout>
        <div className="flex-1 p-4 md:p-8 pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Job not found</h2>
            <p className="text-muted-foreground mt-2">The job you are looking for does not exist.</p>
            <Button className="mt-4" onClick={() => router.push(`/candidate/dashboard/${user?.id}`)}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </CandidateLayout>
    )
  }

  return (
    <CandidateLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/candidate/dashboard/${user?.id}`)}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Job Details</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employer?.employer?.company_logo_url || ""} alt={job.company_name} />
                  <AvatarFallback>{job.company_name?.charAt(0) || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{job.title}</CardTitle>
                  <p className="text-muted-foreground">{job.company_name}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center text-sm">
                  <Briefcase className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{job.type}</span>
                </div>
                <div className="flex items-center text-sm">
                  <DollarSign className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>{job.salary}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>Deadline: {formatDate(job.deadline)}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>Posted: {formatDate(job.created_at)}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {job.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Job Description</h3>
                <div className="prose max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line">{job.description}</p>
                </div>
              </div>

              <div className="pt-4">
                {hasApplied ? (
                  <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-4 rounded-lg flex items-center justify-between">
                    <p>You have already applied to this job.</p>
                    <Link href="/candidate/applications">
                      <Button variant="outline" size="sm">
                        View Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <Button size="lg" onClick={() => setIsApplyDialogOpen(true)}>
                    Apply Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={employer?.employer?.company_logo_url || ""} alt={job.company_name} />
                  <AvatarFallback className="text-xl">{job.company_name?.charAt(0) || "C"}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-lg">{job.company_name}</h3>
                </div>
              </div>

              {employer?.employer?.company_description && (
                <div>
                  <h4 className="font-semibold text-sm mb-1">About</h4>
                  <p className="text-sm text-muted-foreground">{employer.employer.company_description}</p>
                </div>
              )}

              {employer?.employer?.company_website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={employer.employer.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {employer.employer.company_website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}

              <div className="pt-4">
                <h4 className="font-semibold text-sm mb-2">More Jobs from this Company</h4>
                <div className="space-y-2">
                  {relatedJobs.length > 0 ? (
                    relatedJobs.map((relatedJob) => (
                      <Link
                        key={relatedJob.id}
                        href={`/candidate/job/${relatedJob.id}`}
                        className="block p-2 hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="font-medium">{relatedJob.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {relatedJob.type} • {relatedJob.salary}
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No other jobs from this company.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Apply Dialog */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>Your application will include your resume and the message below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Your Resume</h4>
              <div className="flex items-center p-2 border rounded-md">
                <div className="text-sm">
                  {user?.candidate?.resume_url ? (
                    <a
                      href={user.candidate.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      View Resume
                    </a>
                  ) : (
                    <span className="text-yellow-600 dark:text-yellow-400">
                      No resume uploaded. Please add a resume in your profile.
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Application Message</h4>
              <Textarea
                placeholder="Introduce yourself and explain why you're a good fit for this position..."
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={isSubmitting || !user?.candidate?.resume_url}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CandidateLayout>
  )
}
