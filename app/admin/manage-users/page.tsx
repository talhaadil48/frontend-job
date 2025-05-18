"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Trash, Building, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

interface UserInterface {
  id: string
  name: string
  email: string
  role: string
  is_blocked?: boolean
  profile_picture_url?: string
  password_hash?: string
  candidate?: {
    user_id: string
    resume_url?: string
    bio?: string
    skills: string[]
    experience_years?: number
    education?: string
    linkedin_url?: string
  }
  employer?: {
    user_id: string
    company_name: string
    company_website?: string
    company_description?: string
    company_logo_url?: string
  }
}

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserInterface[]>([])
  const [selectedUser, setSelectedUser] = useState<UserInterface | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [formData, setFormData] = useState<Partial<UserInterface>>({
    name: "",
    email: "",
    password_hash: "",
    role: "candidate",
    is_blocked: false,
    profile_picture_url: "",
    candidate: {
      skills: [],
      experience_years: 0,
      education: "",
      linkedin_url: "",
    },
    employer: {
      company_name: "",
      company_website: "",
      company_description: "",
      company_logo_url: "",
    },
  })

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("Fetching users...")
      const response = await fetch("http://localhost:8000/allusers")
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)

      const data = await response.json()
      console.log("Users API response:", data)

      // Handle the array format
      if (Array.isArray(data)) {
        setUsers(data)
      } else {
        console.warn("API response is not an array as expected:", data)

        // Fallback handling for other formats
        let usersArray: UserInterface[] = []
        if (data && typeof data === "object") {
          if (data.users && Array.isArray(data.users)) {
            usersArray = data.users
          } else if (Object.keys(data).some((key) => !isNaN(Number(key)))) {
            usersArray = Object.values(data)
          } else {
            usersArray = [data]
          }
        }

        setUsers(usersArray)
      }
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch user details
  const fetchUserDetails = useCallback(async (userId: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`http://localhost:8000/user/${userId}`)
      if (!response.ok) throw new Error(`Failed to fetch user details: ${response.status} ${response.statusText}`)

      const data = await response.json()
      console.log("User details API response:", data)

      // Extract user data from the response
      const userData = data.user || data

      // Ensure candidate skills is an array
      if (userData.candidate && userData.candidate.skills) {
        userData.candidate.skills = Array.isArray(userData.candidate.skills)
          ? userData.candidate.skills
          : [userData.candidate.skills]
      }

      setSelectedUser(userData)

      // Populate form data for editing
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        password_hash: userData.password_hash || "",
        role: userData.role || "candidate",
        is_blocked: userData.is_blocked || false,
        profile_picture_url: userData.profile_picture_url || "",
        candidate: {
          skills: userData.candidate?.skills || [],
          experience_years: userData.candidate?.experience_years || 0,
          education: userData.candidate?.education || "",
          linkedin_url: userData.candidate?.linkedin_url || "",
          resume_url: userData.candidate?.resume_url || "",
          bio: userData.candidate?.bio || "",
        },
        employer: {
          company_name: userData.employer?.company_name || "",
          company_website: userData.employer?.company_website || "",
          company_description: userData.employer?.company_description || "",
          company_logo_url: userData.employer?.company_logo_url || "",
        },
      })
    } catch (err) {
      console.error("Error fetching user details:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [])

  // Create user
  const createUser = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create user
      const userResponse = await fetch("http://localhost:8000/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password_hash: formData.password_hash,
          role: formData.role,
          is_blocked: formData.is_blocked,
          profile_picture_url: formData.profile_picture_url,
        }),
      })

      if (!userResponse.ok) throw new Error(`Failed to create user: ${userResponse.status} ${userResponse.statusText}`)
      const userData = await userResponse.json()
      const userId = userData.id || userData.user_id

      // If candidate, create candidate details
      if (formData.role === "candidate") {
        const candidateResponse = await fetch("http://localhost:8000/candidate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            resume_url: formData.candidate?.resume_url,
            bio: formData.candidate?.bio,
            skills: formData.candidate?.skills || [],
            experience_years: formData.candidate?.experience_years || 0,
            education: formData.candidate?.education,
            linkedin_url: formData.candidate?.linkedin_url,
          }),
        })

        if (!candidateResponse.ok) throw new Error(`Failed to create candidate details: ${candidateResponse.status}`)
      }

      // If employer, create employer details
      if (formData.role === "employer") {
        const employerResponse = await fetch("http://localhost:8000/employer", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            company_name: formData.employer?.company_name,
            company_website: formData.employer?.company_website,
            company_description: formData.employer?.company_description,
            company_logo_url: formData.employer?.company_logo_url,
          }),
        })

        if (!employerResponse.ok) throw new Error(`Failed to create employer details: ${employerResponse.status}`)
      }

      setSuccess("User created successfully")
      setIsCreateDialogOpen(false)
      fetchUsers()

      // Reset form data
      setFormData({
        name: "",
        email: "",
        password_hash: "",
        role: "candidate",
        is_blocked: false,
        profile_picture_url: "",
        candidate: {
          skills: [],
          experience_years: 0,
          education: "",
          linkedin_url: "",
          resume_url: "",
          bio: "",
        },
        employer: {
          company_name: "",
          company_website: "",
          company_description: "",
          company_logo_url: "",
        },
      })
    } catch (err) {
      console.error("Error creating user:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("http://localhost:8000/updateuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          name: formData.name,
          email: formData.email,
          password_hash: formData.password_hash,
          role: formData.role,
          is_blocked: formData.is_blocked,
          profile_picture_url: formData.profile_picture_url,

          // Candidate fields
          resume_url: formData.candidate?.resume_url,
          bio: formData.candidate?.bio,
          skills: formData.candidate?.skills,
          experience_years: formData.candidate?.experience_years,
          education: formData.candidate?.education,
          linkedin_url: formData.candidate?.linkedin_url,

          // Employer fields
          company_name: formData.employer?.company_name,
          company_website: formData.employer?.company_website,
          company_description: formData.employer?.company_description,
          company_logo_url: formData.employer?.company_logo_url,
        }),
      })

      if (!response.ok) throw new Error(`Failed to update user: ${response.status} ${response.statusText}`)

      setSuccess("User updated successfully")
      setIsEditDialogOpen(false)
      fetchUsers()
    } catch (err) {
      console.error("Error updating user:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Delete user
  const deleteUser = async () => {
    if (!selectedUser) return

    try {
      setLoading(true)
      setError(null)
      console.log("Deleting user:", selectedUser.user.id)

      const response = await fetch("http://localhost:8000/deluser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: selectedUser.user.id,
        }),
      })

      if (!response.ok) throw new Error(`Failed to delete user: ${response.status} ${response.statusText}`)

      setSuccess("User deleted successfully")
      setIsDeleteDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (err) {
      console.error("Error deleting user:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  if (loading && users.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Loading users data...</h2>
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
          <h2 className="text-3xl font-bold tracking-tight">Manage Users</h2>
        </div>
      </div>

      

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="employers">Employers</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Users</CardTitle>
              <CardDescription>Manage all users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && users.length > 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          No users found. Create your first user.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user, index) => (
                        <TableRow key={user.id || `user-${index}`}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {user.role === "candidate" ? (
                                <Loader2 className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Building className="h-4 w-4 text-muted-foreground" />
                              )}
                              {user.user.name}
                            </div>
                          </TableCell>
                          <TableCell>{user.user.email}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.role === "candidate" ? "bg-blue-50 text-blue-800" : "bg-amber-50 text-amber-800"
                              }`}
                            >
                              {user.role === "candidate" ? (
                                <Loader2 className="mr-1 h-3 w-3" />
                              ) : (
                                <Building className="mr-1 h-3 w-3" />
                              )}
                              {user.user.role}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                user.user.is_blocked ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
                              }`}
                            >
                              {user.user.is_blocked ? "Blocked" : "Active"}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user)
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

        <TabsContent value="candidates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Candidates</CardTitle>
              <CardDescription>Manage candidate users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && users.length > 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter((user) => user.user.role === "candidate").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No candidates found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users
                        .filter((user) => user.user.role === "candidate")
                        .map((user, index) => (
                          <TableRow key={user.user.id || `candidate-${index}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">{user.user.name}</div>
                            </TableCell>
                            <TableCell>{user.user.email}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.user.is_blocked ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
                                }`}
                              >
                                {user.user.is_blocked ? "Blocked" : "Active"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user)
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

        <TabsContent value="employers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Employers</CardTitle>
              <CardDescription>Manage employer users</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && users.length > 0 ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.filter((user) => user.user.role === "employer").length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          No employers found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users
                        .filter((user) => user.user.role === "employer")
                        .map((user, index) => (
                          <TableRow key={user.user.id || `employer-${index}`}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                {user.user.name}
                              </div>
                            </TableCell>
                            <TableCell>{user.user.email}</TableCell>
                            <TableCell>
                              <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                  user.user.is_blocked ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"
                                }`}
                              >
                                {user.user.is_blocked ? "Blocked" : "Active"}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setSelectedUser(user)
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
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteUser} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
