"use client"

import { AvatarFallback } from "@/components/ui/avatar"
import { Avatar } from "@/components/ui/avatar"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import CandidateLayout from "@/components/layouts/candidate-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Search, Briefcase, DollarSign, Calendar } from "lucide-react"
import Link from "next/link"

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

export default function CandidateDashboard() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [salaryRange, setSalaryRange] = useState([0, 200000])
  const [jobType, setJobType] = useState<string | null>(null)
  const [allTags, setAllTags] = useState<string[]>([])
  const [allJobTypes, setAllJobTypes] = useState<string[]>([])

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

    // Check if the dashboard ID matches the logged-in user's ID
    if (params.id !== user.id) {
      router.push(`/candidate/dashboard/${user.id}`)
      return
    }

    // Fetch jobs from API
    const fetchJobs = async () => {
      try {
        setIsLoading(true)

        // Fetch all jobs
        const response = await fetch("http://localhost:8000/alljobs")
        if (!response.ok) {
          throw new Error("Failed to fetch jobs")
        }

        const jobsData = await response.json()

        // Check if jobsData is an array before processing
        if (!Array.isArray(jobsData)) {
          console.error("Expected array of jobs but received:", jobsData)
          setJobs([])
          setFilteredJobs([])
          setAllTags([])
          setAllJobTypes([])
          setIsLoading(false)
          return
        }

        // Process jobs to include company name
        const enhancedJobs = await Promise.all(
          jobsData.map(async (job: any) => {
            try {
              // Get employer details for company name
              const employerResponse = await fetch(`http://localhost:8000/user/${job.employer_id}`)
              const employerData = await employerResponse.json()

              return {
                ...job,
                company_name: employerData.employer?.company_name || "Unknown Company",
                company_logo_url: employerData.employer?.company_logo_url || null,
              }
            } catch (error) {
              console.error(`Error fetching employer data for job ${job.id}:`, error)
              return {
                ...job,
                company_name: "Unknown Company",
                company_logo_url: null,
              }
            }
          }),
        )

        setJobs(enhancedJobs)
        setFilteredJobs(enhancedJobs)

        // Extract all unique tags and job types
        const tags = Array.from(new Set(enhancedJobs.flatMap((job: Job) => job.tags))).sort()
        const types = Array.from(new Set(enhancedJobs.map((job: Job) => job.type))).sort()

        setAllTags(tags)
        setAllJobTypes(types)

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching jobs:", error)
        setIsLoading(false)
      }
    }

    fetchJobs()
  }, [user, router, params.id])

  // Filter jobs based on search query, tags, salary range, and job type
  useEffect(() => {
    let result = [...jobs]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company_name?.toLowerCase().includes(query) ||
          job.description?.toLowerCase().includes(query) ||
          job.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter((job) => selectedTags.some((tag) => job.tags.includes(tag)))
    }

    // Filter by job type
    if (jobType) {
      result = result.filter((job) => job.type === jobType)
    }

    // Filter by salary range (this is a simplified implementation)
    result = result.filter((job) => {
      // Extract numeric values from salary string
      const salaryString = job.salary || ""
      const salaryNumbers = salaryString.match(/\d+/g)
      if (!salaryNumbers) return true // Include if no salary info

      // Get the average of the salary range
      const salaryValues = salaryNumbers.map(Number)
      const avgSalary = salaryValues.length > 1 ? (salaryValues[0] + salaryValues[1]) / 2 : salaryValues[0]

      return avgSalary >= salaryRange[0] && avgSalary <= salaryRange[1]
    })

    setFilteredJobs(result)
  }, [jobs, searchQuery, selectedTags, salaryRange, jobType])

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("")
    setSelectedTags([])
    setSalaryRange([0, 200000])
    setJobType(null)
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
          <h2 className="text-3xl font-bold tracking-tight">Job Feed</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {/* Filters */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Job Type</h3>
                <div className="flex flex-wrap gap-2">
                  {allJobTypes.map((type) => (
                    <Badge
                      key={type}
                      variant={jobType === type ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setJobType(jobType === type ? null : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Salary Range</h3>
                  <span className="text-sm text-muted-foreground">
                    ${salaryRange[0].toLocaleString()} - ${salaryRange[1].toLocaleString()}
                  </span>
                </div>
                <Slider
                  defaultValue={[0, 200000]}
                  max={200000}
                  step={10000}
                  value={salaryRange}
                  onValueChange={setSalaryRange}
                  className="py-4"
                />
              </div>

              <Button variant="outline" className="w-full" onClick={resetFilters}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>

          {/* Job Listings */}
          <div className="md:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search jobs..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {filteredJobs.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-medium">No jobs found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                    <Button variant="outline" className="mt-2" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredJobs.map((job) => (
                <Card key={job.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{job.company_name?.charAt(0) || "C"}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold text-lg">{job.title}</h3>
                            <p className="text-muted-foreground">{job.company_name}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Briefcase className="mr-1 h-4 w-4" />
                            {job.type}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <DollarSign className="mr-1 h-4 w-4" />
                            {job.salary}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-4 w-4" />
                            Deadline: {formatDate(job.deadline)}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 pt-2">
                          {job.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-sm line-clamp-2">{job.description}</p>
                      </div>

                      <div className="flex items-end justify-end mt-4 md:mt-0">
                        <Button asChild>
                          <Link href={`/candidate/job/${job.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </CandidateLayout>
  )
}
