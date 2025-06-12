"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import EmployerLayout from "@/components/layouts/employer-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@supabase/supabase-js"
// Profile form schema
const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

// Company form schema
const companyFormSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  companyWebsite: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional()
    .or(z.literal("")),
  companyDescription: z
    .string()
    .max(500, {
      message: "Description must not exceed 500 characters.",
    })
    .optional(),
})

export default function EmployerProfilePage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [companyLogo, setCompanyLogo] = useState<File | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)

  // Initialize profile form
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  // Initialize company form
  const companyForm = useForm<z.infer<typeof companyFormSchema>>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyName: "",
      companyWebsite: "",
      companyDescription: "",
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

    // Check if user is an employer
    if (userData.role !== "employer") {
      router.push("/")
      return
    }

    // Check if the profile ID matches the logged-in user's ID
    if (params.id !== userData.id) {
      router.push(`/employer/profile/${userData.id}`)
      return
    }

    // Fetch user data
    const fetchUser = async () => {
      try {
        const response = await fetch(`https://backend-job-eight.vercel.app//user/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch user data")
        }

        const data = await response.json()
        setUser(data)

        // Set form values
        profileForm.reset({
          name: data.user.name,
          email: data.user.email,
        })

        companyForm.reset({
          companyName: data.employer.company_name || "",
          companyWebsite: data.employer.company_website || "",
          companyDescription: data.employer.company_description || "",
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching user:", error)
        setIsLoading(false)
      }
    }

    fetchUser()
  }, [params.id, router, profileForm, companyForm])

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

  // Handle company logo change
  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCompanyLogo(file)

      // Create preview
      const reader = new FileReader()
      reader.onload = (event) => {
        setCompanyLogoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle profile form submission
  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    setIsSubmitting(true)

    try {
      // In a real app, you would upload the file to storage here
      // and get back a URL to store in the database
      let profilePictureUrl = user?.user?.profile_picture_url || null

      // For this demo, we'll simulate storing the file
      if (profileImage) {
        // Upload profile image and get URL
        // This is a placeholder - you would implement actual file upload
        profilePictureUrl = await uploadFile(profileImage)
      }

      // Update user profile
      const response = await fetch("https://backend-job-eight.vercel.app//updateuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user.id,
          name: values.name,
          email: values.email,
          profile_picture_url: profilePictureUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      // Update local user data
      const updatedUser = {
        ...user,
        user: {
          ...user.user,
          name: values.name,
          email: values.email,
          profile_picture_url: profilePictureUrl,
        },
      }
      setUser(updatedUser)

      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}")
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...storedUser,
          name: values.name,
          email: values.email,
          profile_picture_url: profilePictureUrl,
        }),
      )

      toast({
        title: "Profile updated!",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle company form submission
  async function onCompanySubmit(values: z.infer<typeof companyFormSchema>) {
    setIsSubmitting(true)

    try {
      // In a real app, you would upload the file to storage here
      // and get back a URL to store in the database
      let companyLogoUrl = user?.employer?.company_logo_url || null

      // For this demo, we'll simulate storing the file
      if (companyLogo) {
        // Upload company logo and get URL
        // This is a placeholder - you would implement actual file upload
        companyLogoUrl = await uploadFile(companyLogo)
      }

      // Update company profile
      const response = await fetch("https://backend-job-eight.vercel.app//updateuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user.id,
          role : "employer",
          company_name: values.companyName,
          company_website: values.companyWebsite || null,
          company_description: values.companyDescription || null,
          company_logo_url: companyLogoUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update company profile")
      }

      // Update local user data
      const updatedUser = {
        ...user,
        employer: {
          ...user.employer,
          company_name: values.companyName,
          company_website: values.companyWebsite || null,
          company_description: values.companyDescription || null,
          company_logo_url: companyLogoUrl,
        },
      }
      setUser(updatedUser)

      toast({
        title: "Company profile updated!",
        description: "Your company profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating company profile:", error)
      toast({
        title: "Error",
        description: "Failed to update company profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Placeholder function for file upload
  async function uploadFile(file: File): Promise<string> {
     const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase environment variables are not set. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.")
      }
    
      const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
      const isImage = file.type.startsWith('image/')
      const bucket = isImage ? 'avatars' : 'resumes'
      const filePath = `${Date.now()}_${file.name}`
    
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file)
    
      if (error) throw new Error(`Upload failed: ${error.message}`)
    
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    
      return publicUrlData.publicUrl
   
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
      <EmployerLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </EmployerLayout>
    )
  }

  return (
    <EmployerLayout>
      <div className="flex-1 space-y-4 p-4 md:px-8 lg:px-12 pt-6 mx-auto container">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        </div>

        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList>
            <TabsTrigger value="personal">Personal Information</TabsTrigger>
            <TabsTrigger value="company">Company Information</TabsTrigger>
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
                      <AvatarImage src={user?.user?.profile_picture_url || ""} alt={user?.user?.name} />
                      <AvatarFallback className="text-2xl">{getInitials(user?.user?.name || "")}</AvatarFallback>
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
                            {!profileImagePreview && user?.user?.profile_picture_url && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Current image:</p>
                                <img
                                  src={user.user.profile_picture_url || "/placeholder.svg"}
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

          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.employer?.company_logo_url || ""} alt={user?.employer?.company_name} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(user?.employer?.company_name || "")}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex-1">
                    <Form {...companyForm}>
                      <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="space-y-4">
                        <FormField
                          control={companyForm.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="companyWebsite"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Website</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={companyForm.control}
                          name="companyDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Description</FormLabel>
                              <FormControl>
                                <Textarea className="resize-none" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-2">
                          <FormLabel>Company Logo</FormLabel>
                          <div className="flex flex-col gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={handleCompanyLogoChange}
                              className="cursor-pointer"
                            />
                            {companyLogoPreview && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                                <img
                                  src={companyLogoPreview || "/placeholder.svg"}
                                  alt="Logo preview"
                                  className="h-20 w-20 object-cover rounded"
                                />
                              </div>
                            )}
                            {!companyLogoPreview && user?.employer?.company_logo_url && (
                              <div className="mt-2">
                                <p className="text-sm text-muted-foreground mb-1">Current logo:</p>
                                <img
                                  src={user.employer.company_logo_url || "/placeholder.svg"}
                                  alt="Current logo"
                                  className="h-20 w-20 object-cover rounded"
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
        </Tabs>
      </div>
    </EmployerLayout>
  )
}
