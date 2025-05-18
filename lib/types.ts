// User type
export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  role: "admin" | "employer" | "candidate"
  is_blocked: boolean
  profile_picture_url: string | null
  created_at: string
  employer?: {
    company_name: string
    company_website: string | null
    company_description: string | null
    company_logo_url: string | null
  }
  candidate?: {
    resume_url: string | null
    bio: string | null
    skills: string[]
    experience_years: number | null
    education: string | null
    linkedin_url: string | null
   
  }
}

// Job type
export interface Job {
  id: string
  employer_id: string
  title: string
  description: string | null
  type: string | null
  tags: string[]
  salary: string | null
  deadline: string
  created_at: string
  company_name: string
}

// Application type
export interface Application {
  id: string
  candidate_id: string
  job_id: string
  resume_url: string
  message: string | null
  applied_at: string
  job_title?: string
  job_company?: string
  job_type?: string
  job_salary?: string
  job_deadline?: string
  job_description?: string
  candidate_name?: string
  candidate_email?: string
  candidate_picture?: string
  status?: string
}
