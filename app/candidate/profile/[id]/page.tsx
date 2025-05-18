"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import CandidateLayout from "@/components/layouts/candidate-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@supabase/supabase-js"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Resume form schema
const resumeFormSchema = z.object({
  bio: z
    .string()
    .max(500, {
      message: "Bio must not exceed 500 characters.",
    })
    .optional(),
  skills: z.string().optional(),
  experienceYears: z.string().optional(),
  education: z.string().optional(),
  linkedinUrl: z
    .string()
    .url({
      message: "Please enter a valid LinkedIn URL.",
    })
    .optional()
    .or(z.literal("")),
  portfolioUrl: z
    .string()
    .url({
      message: "Please enter a valid portfolio URL.",
    })
    .optional()
    .or(z.literal("")),
})

interface UserData {
  user: {
    id: string
    name: string
    email: string
    role: string
    profile_picture_url?: string
  }
  candidate?: {
    user_id: string
    resume_url?: string
    bio?: string
    skills?: string[]
    experience_years?: number
    education?: string
    linkedin_url?: string
    portfolio_url?: string
  }
}

export default function CandidateProfilePage() {
  const router = useRouter()
  const params = useParams()
  const storedUser = localStorage.getItem("user")
  const user = storedUser ? JSON.parse(storedUser) : null
  const { toast } = useToast()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [resumeFileName, setResumeFileName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Initialize profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  // Initialize resume form
  const resumeForm = useForm<z.infer<typeof resumeFormSchema>>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: {
      bio: "",
      skills: "",
      experienceYears: "",
      education: "",
      linkedinUrl: "",
      portfolioUrl: "",
    },
  })

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

    // Check if the profile ID matches the logged-in user's ID
    if (params.id !== user.id) {
      router.push(`/candidate/profile/${user.id}`)
      return
    }

    // Fetch user data from API
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`http://localhost:8000/user/${user.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUserData(data)

        // Set profile form values
        profileForm.reset({
          name: data.user.name,
          email: data.user.email,
        })

        // Set resume form values
        resumeForm.reset({
          bio: data.candidate?.bio || "",
          skills: data.candidate?.skills ? data.candidate.skills.join(", ") : "",
          experienceYears: data.candidate?.experience_years?.toString() || "",
          education: data.candidate?.education || "",
          linkedinUrl: data.candidate?.linkedin_url || "",
          portfolioUrl: data.candidate?.portfolio_url || "",
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load profile data. Please try again.")
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [router, params.id, profileForm, resumeForm])

  // Handle profile image change
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setProfileImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle resume file change
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setResumeFile(file)
      setResumeFileName(file.name)
    }
  }

  // Replace the uploadFile function with this implementation
  async function uploadFile(file: File): Promise<string> {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "Supabase environment variables are not set. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
      )
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const isImage = file.type.startsWith("image/")
    const bucket = isImage ? "avatars" : "resumes"
    const filePath = `${userData?.user.id}_${Date.now()}_${file.name.replace(/\s+/g, "_")}`

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)

    if (error) throw new Error(`Upload failed: ${error.message}`)

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

    return publicUrlData.publicUrl
  }

  // Update the onProfileSubmit function to handle file uploads properly
  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!userData) return

    setIsSubmitting(true)
    setError(null)

    try {
      // In a real app, you would upload the file to storage here
      // and get back a URL to store in the database
      let profilePictureUrl = userData.user.profile_picture_url || null

      // For this demo, we'll simulate storing the file
      if (profileImage) {
        try {
          // Upload profile image and get URL
          profilePictureUrl = await uploadFile(profileImage)
        } catch (uploadError) {
          console.error("Error uploading profile image:", uploadError)
          toast({
            title: "Upload Error",
            description: "Failed to upload profile image. Profile will be updated without the new image.",
            variant: "destructive",
          })
        }
      }

      // Update user profile via API
      const response = await fetch("http://localhost:8000/updateuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          name: values.name,
          email: values.email,
          profile_picture_url: profilePictureUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update local state
      setUserData({
        ...userData,
        user: {
          ...userData.user,
          name: values.name,
          email: values.email,
          profile_picture_url: profilePictureUrl || undefined,
        },
      })

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update the onResumeSubmit function to handle file uploads properly
  async function onResumeSubmit(values: z.infer<typeof resumeFormSchema>) {
    if (!userData) return

    setIsSubmitting(true)
    setError(null)

    try {
      // In a real app, you would upload the resume file to storage here
      // and get back a URL to store in the database
      let resumeUrl = userData.candidate?.resume_url || null

      // For this demo, we'll simulate storing the file
      if (resumeFile) {
        try {
          // Upload resume file and get URL
          resumeUrl = await uploadFile(resumeFile)
        } catch (uploadError) {
          console.error("Error uploading resume:", uploadError)
          toast({
            title: "Upload Error",
            description: "Failed to upload resume. Profile will be updated without the new resume.",
            variant: "destructive",
          })
        }
      }

      // Convert skills string to array
      const skillsArray = values.skills ? values.skills.split(",").map((skill) => skill.trim()) : []

      // Update candidate profile via API
      const response = await fetch("http://localhost:8000/updateuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.user.id,
          role: "candidate",
          resume_url: resumeUrl,
          bio: values.bio || null,
          skills: skillsArray,
          experience_years: values.experienceYears ? Number.parseInt(values.experienceYears) : null,
          education: values.education || null,
          linkedin_url: values.linkedinUrl || null,
          portfolio_url: values.portfolioUrl || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update resume")
      }

      // Update local state
      setUserData({
        ...userData,
        candidate: {
          ...userData.candidate!,
          resume_url: resumeUrl || undefined,
          bio: values.bio || undefined,
          skills: skillsArray,
          experience_years: values.experienceYears ? Number.parseInt(values.experienceYears) : undefined,
          education: values.education || undefined,
          linkedin_url: values.linkedinUrl || undefined,
          portfolio_url: values.portfolioUrl || undefined,
        },
      })

      toast({
        title: "Resume updated!",
        description: "Your resume and profile details have been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating resume:", error)
      setError("Failed to update resume. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
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

  // Update the error state handling for when data fails to load
  if (error && !userData) {
    return (
      <CandidateLayout>
        <div className="flex-1 p-4 md:p-8 pt-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </CandidateLayout>
    )
  }

  if (!userData) {
    return (
      <CandidateLayout>
        <div className="flex-1 p-4 md:p-8 pt-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">Profile not found</h2>
            <p className="text-muted-foreground mt-2">Unable to load your profile data.</p>
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
      <div className="flex-1 space-y-4 p-4 md:px-8 lg:px-12 pt-6 mx-auto container">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="resume">Resume & Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={userData.user.profile_picture_url || ""} alt={userData.user.name} />
                      <AvatarFallback className="text-2xl">{getInitials(userData.user.name || "")}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-2">
                          <FormLabel>Profile Picture</FormLabel>
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageChange}
                              className="cursor-pointer"
                            />
                            {profileImagePreview && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                                <img
                                  src={profileImagePreview || "/placeholder.svg"}
                                  alt="Profile preview"
                                  className="h-20 w-20 object-cover rounded-full"
                                />
                              </div>
                            )}
                            {!profileImagePreview && userData.user.profile_picture_url && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Current image:</p>
                                <img
                                  src={userData.user.profile_picture_url || "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="}
                                  alt="Current profile"
                                  className="h-20 w-20 object-cover rounded-full"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resume" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Resume & Professional Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...resumeForm}>
                  <form onSubmit={resumeForm.handleSubmit(onResumeSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <FormLabel>Resume (PDF)</FormLabel>
                      <div className="flex flex-col gap-2">
                        <Input type="file" accept=".pdf" onChange={handleResumeChange} className="cursor-pointer" />
                        {resumeFileName && (
                          <p className="text-sm text-muted-foreground">Selected file: {resumeFileName}</p>
                        )}
                        {!resumeFile && userData.candidate?.resume_url && (
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">Current resume:</p>
                            <a
                              href={userData.candidate.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline"
                            >
                              View Resume
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <FormField
                      control={resumeForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Tell employers about yourself" className="resize-none" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resumeForm.control}
                      name="skills"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skills (Comma separated)</FormLabel>
                          <FormControl>
                            <Input placeholder="JavaScript, React, Node.js" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={resumeForm.control}
                        name="experienceYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="3" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={resumeForm.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education</FormLabel>
                            <FormControl>
                              <Input placeholder="Bachelor's in Computer Science" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={resumeForm.control}
                      name="linkedinUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/in/username" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={resumeForm.control}
                      name="portfolioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Portfolio URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://yourportfolio.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CandidateLayout>
  )
}
