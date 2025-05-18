"use client"

import { use, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { createClient } from '@supabase/supabase-js'

// Candidate form schema
const candidateFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  resumeFile: z.instanceof(File).optional().or(z.literal(null)),
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
  profilePictureFile: z.instanceof(File).optional().or(z.literal(null)),
})

// Employer form schema
const employerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
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
  companyLogoFile: z.instanceof(File).optional().or(z.literal(null)),
  profilePictureFile: z.instanceof(File).optional().or(z.literal(null)),
})

// Helper function for file upload (placeholder)
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

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  // Get role from URL query parameter
  const roleParam = searchParams.get("role")
  const [activeTab, setActiveTab] = useState<string>(roleParam === "employer" ? "employer" : "candidate")

  // Candidate form
  const candidateForm = useForm<z.infer<typeof candidateFormSchema>>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      resumeFile: null,
      bio: "",
      skills: "",
      experienceYears: "",
      education: "",
      linkedinUrl: "",
      profilePictureFile: null,
    },
  })

  // Employer form
  const employerForm = useForm<z.infer<typeof employerFormSchema>>({
    resolver: zodResolver(employerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      companyName: "",
      companyWebsite: "",
      companyDescription: "",
      companyLogoFile: null,
      profilePictureFile: null,
    },
  })

  // Handle candidate form submission
  async function onCandidateSubmit(values: z.infer<typeof candidateFormSchema>) {
    setIsLoading(true)

    try {
      // Upload files if provided
      let profilePictureUrl = undefined
      let resumeUrl = undefined

      if (values.profilePictureFile) {
        profilePictureUrl = await uploadFile(values.profilePictureFile)
      }

      if (values.resumeFile) {
        resumeUrl = await uploadFile(values.resumeFile)
      }

      // Create user
      const userResponse = await fetch("http://localhost:8000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password_hash: values.password, // Note: In production, hash this on the server
          role: "candidate",
          is_blocked: false,
          profile_picture_url: profilePictureUrl || null,
        }),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        throw new Error(errorData.detail || "Failed to create user")
      }

      const userData = await userResponse.json()
    const user = userData.data[0];
      // Convert skills string to array
      const skillsArray = values.skills ? values.skills.split(",").map((skill) => skill.trim()) : []
     
      // Create candidate details
      const candidateResponse = await fetch("http://localhost:8000/candidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          resume_url: resumeUrl,
          bio: values.bio || undefined,
          skills: skillsArray,
          experience_years: values.experienceYears ? Number.parseInt(values.experienceYears) : undefined,
          education: values.education || undefined,
          linkedin_url: values.linkedinUrl || undefined,
        }),
      })

      if (!candidateResponse.ok) {
        const errorData = await candidateResponse.json()
        console.log(errorData)
        throw new Error(errorData.detail || "Failed to create candidate details")
      }

      toast({
        title: "Account created!",
        description: "You have successfully created a candidate account.",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle employer form submission
  async function onEmployerSubmit(values: z.infer<typeof employerFormSchema>) {
    setIsLoading(true)

    try {
      // Upload files if provided
      let profilePictureUrl = undefined
      let companyLogoUrl = undefined

      if (values.profilePictureFile) {
        profilePictureUrl = await uploadFile(values.profilePictureFile)
      }

      if (values.companyLogoFile) {
        companyLogoUrl = await uploadFile(values.companyLogoFile)
      }

      // Create user
      const userResponse = await fetch("http://localhost:8000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password_hash: values.password, // Note: In production, hash this on the server
          role: "employer",
          is_blocked: false,
          profile_picture_url: profilePictureUrl || null,
        }),
      })

      if (!userResponse.ok) {
        const errorData = await userResponse.json()
        console.log(errorData)
        throw new Error(errorData.detail || "Failed to create user")
      }

      const userData = await userResponse.json()
      const user = userData.data[0]

      // Create employer details
      const employerResponse = await fetch("http://localhost:8000/employer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          company_name: values.companyName,
          company_website: values.companyWebsite || undefined,
          company_description: values.companyDescription || undefined,
          company_logo_url: companyLogoUrl,
        }),
      })

      if (!employerResponse.ok) {
        const errorData = await employerResponse.json()
        throw new Error(errorData.detail || "Failed to create employer details")
      }

      toast({
        title: "Account created!",
        description: "You have successfully created an employer account.",
      })

      // Redirect to login page
      router.push("/login")
    } catch (error) {
      console.error("Signup error:", error)
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "An error occurred during signup.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create an Account</h1>
          <p className="text-gray-500 dark:text-gray-400">Choose your account type and fill in your details</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="candidate">Candidate</TabsTrigger>
            <TabsTrigger value="employer">Employer</TabsTrigger>
          </TabsList>

          {/* Candidate Form */}
          <TabsContent value="candidate">
            <div className="space-y-4 mt-4">
              <Form {...candidateForm}>
                <form onSubmit={candidateForm.handleSubmit(onCandidateSubmit)} className="space-y-4">
                  <FormField
                    control={candidateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={candidateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={candidateForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={candidateForm.control}
                    name="resumeFile"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Resume (PDF) (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              onChange(file)
                            }}
                            {...fieldProps}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={candidateForm.control}
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

                  <FormField
                    control={candidateForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio (Optional)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={candidateForm.control}
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
                      control={candidateForm.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Education</FormLabel>
                          <FormControl>
                            <Input placeholder="Bachelor's in CS" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={candidateForm.control}
                    name="linkedinUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn URL (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://linkedin.com/in/johndoe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={candidateForm.control}
                    name="profilePictureFile"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Profile Picture (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              onChange(file)
                            }}
                            {...fieldProps}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Candidate Account"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>

          {/* Employer Form */}
          <TabsContent value="employer">
            <div className="space-y-4 mt-4">
              <Form {...employerForm}>
                <form onSubmit={employerForm.handleSubmit(onEmployerSubmit)} className="space-y-4">
                  <FormField
                    control={employerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="john.doe@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="********" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Acme Inc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="companyWebsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Website (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://acme.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="companyDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Tell us about your company" className="resize-none" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="companyLogoFile"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Company Logo (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              onChange(file)
                            }}
                            {...fieldProps}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={employerForm.control}
                    name="profilePictureFile"
                    render={({ field: { value, onChange, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Profile Picture (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              onChange(file)
                            }}
                            {...fieldProps}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating Account..." : "Create Employer Account"}
                  </Button>
                </form>
              </Form>
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="text-primary underline underline-offset-4">
            Log in
          </Link>
        </div>
      </div>
    </div>
  )
}
