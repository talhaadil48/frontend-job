"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Edit, Trash, ArrowLeft, Eye, Calendar, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface Job {
  id: string
  employer_id: string
  title: string
  description?: string
  type?: string
  tags: string[]
  salary?: string
  deadline: string
  created_at?: string
  employers?: {
    company_name: string
    logo_url?: string
  }
  company_name?: string
}

interface Employer {
  user_id: string
  company_name: string
  company_website?: string
  company_description?: string
  company_logo_url?: string
}

// Cache for storing employer data
const employerCache = new Map<string, Employer>()

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [employers, setEmployers] = useState<Record<string, Employer>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<Job>>({
    title: "",
    description: "",
    type: "",
    tags: [],
    salary: "",
    deadline: "",
    employer_id: "",
  })

  // Fetch employer data in batches
  const fetchEmployerData = useCallback(async (employerIds: string[]) => {
    // Filter out employer IDs that are already in the cache
    const uncachedEmployerIds = employerIds.filter((id) => !employerCache.has(id))
    
    if (uncachedEmployerIds.length === 0) {
      return
    }

    try {
      // Fetch employer details for each ID
      const employerPromises = uncachedEmployerIds.map(async (employerId) => {
        const response = await fetch(`https://backend-job-eight.vercel.app/user/${employerId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch employer data: ${response.status}`)
        }

        const data = await response.json()
        if (data.employer) {
          // Store in cache
          employerCache.set(employerId, data.employer)
          return { employerId, employerInfo: data.employer }
        }
        return null
      })

      const results = await Promise.all(employerPromises)
      
      // Update employers state with new data
      const newEmployers = { ...employers }
      results.forEach((result) => {
        if (result && result.employerInfo) {
          newEmployers[result.employerId] = result.employerInfo
        }
      })
      
      setEmployers(newEmployers)
    } catch (err) {
      console.error("Error fetching employer data:", err)
    }
  }, [employers])

  // Enhance jobs with employer data
  const enhanceJobsWithEmployerData = useCallback((jobsData: any[]) => {
    return jobsData.map((job) => {
      const employer = employerCache.get(job.employer_id)
      
      return {
        ...job,
        company_name: employer?.company_name || job.employers?.company_name || "Unknown Company",
      }
    })
  }, [])

  // Fetch all jobs
  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching jobs...")
      const response = await fetch("https://backend-job-eight.vercel.app/alljobs")
      if (!response.ok) throw new Error("Failed to fetch jobs")
      
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
      
      // Get unique employer IDs
      const employerIds = Array.from(
        new Set(jobsArray.map((job) => job.employer_id))
      ).filter(Boolean) as string[]
      
      // Fetch employer data
      await fetchEmployerData(employerIds)
      
      // Enhance jobs with employer data
      const enhancedJobs = enhanceJobsWithEmployerData(jobsArray)
      setJobs(enhancedJobs)
      
    } catch (err) {
      console.error("Error fetching jobs:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchEmployerData, enhanceJobsWithEmployerData])

  // Fetch job details
  const fetchJobDetails = useCallback(async (jobId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`https://backend-job-eight.vercel.app/job/${jobId}`)
      if (!response.ok) throw new Error("Failed to fetch job details")
      
      const data = await response.json()
      console.log("Job details API response:", data)
      
      // Extract job data from the response
      const jobData = data.job || data
      
      // Ensure tags is an array
      const jobWithArrayTags = {
        ...jobData,
        tags: Array.isArray(jobData.tags) ? jobData.tags : jobData.tags ? [jobData.tags] : [],
      }
      
      // Fetch employer data if needed
      if (jobWithArrayTags.employer_id && !employerCache.has(jobWithArrayTags.employer_id)) {
        await fetchEmployerData([jobWithArrayTags.employer_id])
      }
      
      // Enhance job with employer data
      const enhancedJob = enhanceJobsWithEmployerData([jobWithArrayTags])[0]
      
      setSelectedJob(enhancedJob)
      
      // Populate form data for editing
      setFormData({
        title: enhancedJob.title || "",
        description: enhancedJob.description || "",
        type: enhancedJob.type || "",
        tags: enhancedJob.tags || [],
        salary: enhancedJob.salary || "",
        deadline: enhancedJob.deadline?.split("T")[0] || "",
        employer_id: enhancedJob.employer_id || "",
      })
      
    } catch (err) {
      console.error("Error fetching job details:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [fetchEmployerData, enhanceJobsWithEmployerData])

  // Create job
  const createJob = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("https://backend-job-eight.vercel.app/job", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employer_id: formData.employer_id,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          tags: formData.tags || [],
          salary: formData.salary,
          deadline: formData.deadline,
        }),
      })

      if (!response.ok) throw new Error("Failed to create job")

      setSuccess("Job created successfully")
      setIsCreateDialogOpen(false)
      fetchJobs()

      // Reset form data
      setFormData({
        title: "",
        description: "",
        type: "",
        tags: [],
        salary: "",
        deadline: "",
        employer_id: "",
      })
    } catch (err) {
      console.error("Error creating job:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Update job
  const updateJob = async () => {
    if (!selectedJob) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("https://backend-job-eight.vercel.app/updatejob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
          title: formData.title,
          description: formData.description,
          type: formData.type,
          tags: formData.tags || [],
          salary: formData.salary,
          deadline: formData.deadline,
        }),
      })

      if (!response.ok) throw new Error("Failed to update job")

      setSuccess("Job updated successfully")
      setIsEditDialogOpen(false)
      fetchJobs()
    } catch (err) {
      console.error("Error updating job:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Delete job
  const deleteJob = async () => {
    if (!selectedJob) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("https://backend-job-eight.vercel.app/deljob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          job_id: selectedJob.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to delete job")

      setSuccess("Job deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedJob(null)
      fetchJobs()
    } catch (err) {
      console.error("Error deleting job:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

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

  // Check if a date is in the past
  const isDatePassed = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const today = new Date()
      return date < today
    } catch (e) {
      return false
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  if (loading && jobs.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading jobs data...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/admin/dashboard">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Manage Jobs</h2>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>Add New Job</Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="default" className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
          <TabsTrigger value="active">Active Jobs</TabsTrigger>
          <TabsTrigger value="expired">Expired Jobs</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Jobs</CardTitle>
              <CardDescription>Manage all job postings on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && jobs.length > 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No jobs found. Create your first job posting.
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs.map((job, index) => (
                        <TableRow key={job.id || `job-${index}`}>
                          <TableCell className="font-medium">{job.title}</TableCell>
                          <TableCell>{job.company_name || job.employers?.company_name || "Unknown"}</TableCell>
                          <TableCell>{job.type || "N/A"}</TableCell>
                          <TableCell>
                            <span
                              className={`flex items-center ${
                                isDatePassed(job.deadline) ? "text-red-500" : "text-green-500"
                              }`}
                            >
                              <Calendar className="mr-1 h-3 w-3" />
                              {formatDate(job.deadline)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {job.tags.slice(0, 2).map((tag, tagIndex) => (
                                <Badge key={`${job.id || index}-tag-${tagIndex}`} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {job.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{job.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                fetchJobDetails(job.id)
                                setIsViewDialogOpen(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                fetchJobDetails(job.id)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                fetchJobDetails(job.id)
                                setIsDeleteDialogOpen(true)
                              }}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>Jobs with deadlines in the future</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && jobs.length > 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.filter((job) => !isDatePassed(job.deadline)).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No active jobs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs
                        .filter((job) => !isDatePassed(job.deadline))
                        .map((job, index) => (
                          <TableRow key={job.id || `active-job-${index}`}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.company_name || job.employers?.company_name || "Unknown"}</TableCell>
                            <TableCell>{job.type || "N/A"}</TableCell>
                            <TableCell>
                              <span className="flex items-center text-green-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDate(job.deadline)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {job.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <Badge
                                    key={`${job.id || index}-active-tag-${tagIndex}`}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {job.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchJobDetails(job.id)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchJobDetails(job.id)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchJobDetails(job.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expired Jobs</CardTitle>
              <CardDescription>Jobs with deadlines in the past</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && jobs.length > 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.filter((job) => isDatePassed(job.deadline)).length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No expired jobs found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      jobs
                        .filter((job) => isDatePassed(job.deadline))
                        .map((job, index) => (
                          <TableRow key={job.id || `expired-job-${index}`}>
                            <TableCell className="font-medium">{job.title}</TableCell>
                            <TableCell>{job.company_name || job.employers?.company_name || "Unknown"}</TableCell>
                            <TableCell>{job.type || "N/A"}</TableCell>
                            <TableCell>
                              <span className="flex items-center text-red-500">
                                <Calendar className="mr-1 h-3 w-3" />
                                {formatDate(job.deadline)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {job.tags.slice(0, 2).map((tag, tagIndex) => (
                                  <Badge
                                    key={`${job.id || index}-expired-tag-${tagIndex}`}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                                {job.tags.length > 2 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{job.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchJobDetails(job.id)
                                  setIsViewDialogOpen(true)
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchJobDetails(job.id)
                                  setIsEditDialogOpen(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  fetchJobDetails(job.id)
                                  setIsDeleteDialogOpen(true)
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Job Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>Add a new job posting to the platform</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employer">Employer</Label>
                <Select
                  value={formData.employer_id}
                  onValueChange={(value) => setFormData({ ...formData, employer_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employer" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(employers).map(([userId, employer]) => (
                      <SelectItem key={userId} value={userId}>
                        {employer.company_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Full-time, Part-time, Remote, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary">Salary</Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g. $70,000 - $90,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, JavaScript, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createJob} disabled={loading}>
              {loading ? "Creating..." : "Create Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Job</DialogTitle>
            <DialogDescription>Update job posting information</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-employer">Employer</Label>
                <Input 
                  id="edit-employer" 
                  value={
                    selectedJob?.company_name || 
                    employers[formData.employer_id || ""]?.company_name || 
                    ""
                  } 
                  disabled 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Job Description</Label>
              <Textarea
                id="edit-description"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-type">Job Type</Label>
                <Input
                  id="edit-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Full-time, Part-time, Remote, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salary</Label>
                <Input
                  id="edit-salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="e.g. $70,000 - $90,000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tags">Tags (comma separated)</Label>
                <Input
                  id="edit-tags"
                  value={formData.tags?.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean),
                    })
                  }
                  placeholder="React, JavaScript, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-deadline">Deadline</Label>
                <Input
                  id="edit-deadline"
                  type="date"
                  value={formData.deadline?.split("T")[0]}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={updateJob} disabled={loading}>
              {loading ? "Updating..." : "Update Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Job Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedJob?.title}</DialogTitle>
            <DialogDescription>
              Posted by {selectedJob?.company_name || employers[selectedJob?.employer_id || ""]?.company_name || "Unknown Company"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Job Type</h4>
                <p className="text-sm">{selectedJob?.type || "Not specified"}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Salary</h4>
                <p className="text-sm">{selectedJob?.salary || "Not specified"}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium">Deadline</h4>
              <p
                className={`text-sm flex items-center ${
                  selectedJob && isDatePassed(selectedJob.deadline) ? "text-red-500" : "text-green-500"
                }`}
              >
                <Calendar className="mr-1 h-3 w-3" />
                {selectedJob ? formatDate(selectedJob.deadline) : ""}
                {selectedJob && isDatePassed(selectedJob.deadline) ? " (Expired)" : " (Active)"}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium">Required Skills</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedJob?.tags &&
                  selectedJob.tags.map((tag, index) => (
                    <Badge key={`view-tag-${index}`} variant="outline">
                      {tag}
                    </Badge>
                  ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm whitespace-pre-line mt-1">
                {selectedJob?.description || "No description provided."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                setIsEditDialogOpen(true)
              }}
            >
              Edit Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Job Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Job</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this job posting? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteJob} disabled={loading}>
              {loading ? "Deleting..." : "Delete Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
