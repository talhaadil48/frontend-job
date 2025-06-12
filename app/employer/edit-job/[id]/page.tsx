"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import EmployerLayout from "@/components/layouts/employer-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Job form schema
const formSchema = z.object({
  title: z.string().min(2, {
    message: "Job title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Job description must be at least 10 characters.",
  }),
  type: z.string({
    required_error: "Please select a job type.",
  }),
  salary: z.string().min(1, {
    message: "Salary is required.",
  }),
  deadline: z.string().min(1, {
    message: "Application deadline is required.",
  }),
})

export default function EditJobPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [job, setJob] = useState<any>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "",
      salary: "",
      deadline: "",
    },
  })

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

    // Fetch job data
    const fetchJob = async () => {
      try {
        const response = await fetch(`https://backend-job-eight.vercel.app/job/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch job data")
        }

        const data = await response.json()

        // Check if this employer owns the job
        if (data.job.employer_id !== userData.id) {
          router.push(`/employer/dashboard/${userData.id}`)
          return
        }

        setJob(data.job)
        setTags(data.job.tags || [])

        // Format deadline date for input
        const deadlineDate = new Date(data.job.deadline)
        const formattedDeadline = deadlineDate.toISOString().split("T")[0]

        // Set form values
        form.reset({
          title: data.job.title,
          description: data.job.description || "",
          type: data.job.type || "",
          salary: data.job.salary || "",
          deadline: formattedDeadline,
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching job:", error)
        setIsLoading(false)
        router.push(`/employer/dashboard/${userData.id}`)
      }
    }

    fetchJob()
  }, [params.id, router, form])

  // Add tag
  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  // Remove tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!job) return

    setIsSubmitting(true)

    try {
      // Update job object
      const updatedJob = {
        job_id: job.id,
        title: values.title,
        description: values.description,
        type: values.type,
        tags: tags,
        salary: values.salary,
        deadline: values.deadline,
      }

      // Call API to update job
      const response = await fetch("https://backend-job-eight.vercel.app/updatejob", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedJob),
      })

      if (!response.ok) {
        throw new Error("Failed to update job")
      }

      toast({
        title: "Job updated!",
        description: "Your job has been updated successfully.",
      })

      // Redirect to employer dashboard
      router.push(`/employer/dashboard/${user?.id}`)
    } catch (error) {
      console.error("Error updating job:", error)
      toast({
        title: "Error",
        description: "Failed to update job. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
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

  if (!job) {
    return (
      <EmployerLayout>
        <div className="flex-1 p-4 md:p-8 pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Job not found</h2>
            <p className="text-muted-foreground mt-2">
              The job you are looking for does not exist or you do not have permission to edit it.
            </p>
            <Button className="mt-4" onClick={() => router.push(`/employer/dashboard/${user?.id}`)}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Edit Job</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Senior Frontend Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the job responsibilities, requirements, and benefits..."
                          className="min-h-[200px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select job type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Freelance">Freelance</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Salary Range</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. $80,000 - $100,000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      placeholder="e.g. React, JavaScript, Remote"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                    />
                    <Button type="button" onClick={addTag} variant="outline">
                      Add
                    </Button>
                  </div>
                  <FormDescription>Press Enter or click Add to add a tag.</FormDescription>
                </FormItem>

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Deadline</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Updating..." : "Update Job"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  )
}
