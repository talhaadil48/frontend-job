"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type User = any // Replace with your actual User type

interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onSave: (userId: string, userData: any) => Promise<void>
}

export default function EditUserModal({ isOpen, onClose, user, onSave }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    // Basic user info
    name: "",
    email: "",
    role: "",
    is_blocked: false,

    // Candidate specific fields
    resume_url: "",
    skills: [] as string[],
    experience_years: 0,
    education: "",
    linkedin_url: "",

    // Employer specific fields
    company_name: "",
    company_website: "",
    company_description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [skillInput, setSkillInput] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  useEffect(() => {
    if (user) {
      // Initialize form with user data
      const userData: any = {
        name: user.name || "",
        email: user.email || "",
        role: user.role || "",
        is_blocked: user.is_blocked || false,
      }

      // Add candidate data if available
      if (user.candidate) {
        userData.resume_url = user.candidate.resume_url || ""
        userData.skills = user.candidate.skills || []
        userData.experience_years = user.candidate.experience_years || 0
        userData.education = user.candidate.education || ""
        userData.linkedin_url = user.candidate.linkedin_url || ""
      }

      // Add employer data if available
      if (user.employer) {
        userData.company_name = user.employer.company_name || ""
        userData.company_website = user.employer.company_website || ""
        userData.company_description = user.employer.company_description || ""
      }

      setFormData(userData)

      // Set active tab based on role
      if (user.role === "candidate") {
        setActiveTab("candidate")
      } else if (user.role === "employer") {
        setActiveTab("employer")
      } else {
        setActiveTab("basic")
      }
    }
  }, [user])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }))
      setSkillInput("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)
    try {
      // Prepare data based on user role
      const userData: any = {
        name: formData.name,
        email: formData.email,
        is_blocked: formData.is_blocked,
      }

      if (user.role === "candidate") {
        userData.resume_url = formData.resume_url
        userData.skills = formData.skills
        userData.experience_years = Number(formData.experience_years)
        userData.education = formData.education
        userData.linkedin_url = formData.linkedin_url
      } else if (user.role === "employer") {
        userData.company_name = formData.company_name
        userData.company_website = formData.company_website
        userData.company_description = formData.company_description
      }

      await onSave(user.id, userData)
      onClose()
    } catch (error) {
      console.error("Error saving user data:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information. Click save when you're done.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              {user?.role === "candidate" && <TabsTrigger value="candidate">Candidate Info</TabsTrigger>}
              {user?.role === "employer" && <TabsTrigger value="employer">Employer Info</TabsTrigger>}
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Status</Label>
                  <Select
                    value={formData.is_blocked ? "blocked" : "active"}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, is_blocked: value === "blocked" }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {user?.role === "candidate" && (
              <TabsContent value="candidate" className="space-y-4 mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="resume_url" className="text-right">
                      Resume URL
                    </Label>
                    <Input
                      id="resume_url"
                      name="resume_url"
                      value={formData.resume_url}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="experience_years" className="text-right">
                      Experience (years)
                    </Label>
                    <Input
                      id="experience_years"
                      name="experience_years"
                      type="number"
                      value={formData.experience_years}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="education" className="text-right">
                      Education
                    </Label>
                    <Input
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="linkedin_url" className="text-right">
                      LinkedIn URL
                    </Label>
                    <Input
                      id="linkedin_url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">Skills</Label>
                    <div className="col-span-3 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          placeholder="Add a skill"
                          className="flex-1"
                        />
                        <Button type="button" onClick={handleAddSkill} size="sm">
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {formData.skills.map((skill: string) => (
                          <div
                            key={skill}
                            className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-1"
                          >
                            {skill}
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-secondary-foreground/70 hover:text-secondary-foreground"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}

            {user?.role === "employer" && (
              <TabsContent value="employer" className="space-y-4 mt-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company_name" className="text-right">
                      Company Name
                    </Label>
                    <Input
                      id="company_name"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="company_website" className="text-right">
                      Company Website
                    </Label>
                    <Input
                      id="company_website"
                      name="company_website"
                      value={formData.company_website}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="company_description" className="text-right pt-2">
                      Company Description
                    </Label>
                    <Textarea
                      id="company_description"
                      name="company_description"
                      value={formData.company_description}
                      onChange={handleInputChange}
                      className="col-span-3 min-h-[100px]"
                    />
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
