"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { mockUsers } from "@/lib/mock-data"
import type { User } from "@/lib/types"
import { useRouter } from "next/navigation"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role: string) => Promise<boolean>
  logout: () => void
  signUp: (userData: any) => Promise<boolean>
  updateUser: (updatedUser: User) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  signUp: async () => false,
  updateUser: () => {},
})

export const useAuth = () => useContext(AuthContext)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load user from localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse stored user:", error)
        localStorage.removeItem("user")
      }
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (email: string, password: string, role: string): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user with matching email and role
    const foundUser = mockUsers.find((u) => u.email === email && u.role === role)

    if (foundUser) {
      // In a real app, we would verify the password hash here
      // For this mock, we'll just check if the password matches the one in the mock data
      // (removing the "hashed_" prefix we added in the mock data)
      const passwordMatches = foundUser.password_hash === `hashed_${password}`

      if (passwordMatches && !foundUser.is_blocked) {
        setUser(foundUser)
        localStorage.setItem("user", JSON.stringify(foundUser))
        return true
      }
    }

    return false
  }

  // Logout function
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
    router.push("/login")
    
  }

  // Sign up function
  const signUp = async (userData: any): Promise<boolean> => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // In a real app, we would send the user data to the server
    // For this mock, we'll just return true
    return true
  }

  // Update user function
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem("user", JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, signUp, updateUser }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
