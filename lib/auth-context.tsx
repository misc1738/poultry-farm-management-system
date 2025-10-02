"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAdmin: boolean
  logAction: (action: string, details: string) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

    // Initialize default admin user if no users exist
    const users = localStorage.getItem("users")
    if (!users) {
      const defaultAdmin: User = {
        id: "1",
        username: "admin",
        password: "admin123",
        role: "admin",
        createdAt: new Date().toISOString(),
      }
      localStorage.setItem("users", JSON.stringify([defaultAdmin]))
    }
  }, [])

  const login = (username: string, password: string): boolean => {
    const users = JSON.parse(localStorage.getItem("users") || "[]") as User[]
    const foundUser = users.find((u) => u.username === username && u.password === password)

    if (foundUser) {
      setUser(foundUser)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("currentUser")
  }

  const logAction = (action: string, details: string) => {
    if (!user) return

    const logs = JSON.parse(localStorage.getItem("auditLogs") || "[]")
    const newLog = {
      id: Date.now().toString(),
      userId: user.id,
      username: user.username,
      action,
      details,
      timestamp: new Date().toISOString(),
    }
    logs.unshift(newLog)
    // Keep only last 1000 logs
    if (logs.length > 1000) logs.pop()
    localStorage.setItem("auditLogs", JSON.stringify(logs))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAdmin: user?.role === "admin",
        logAction,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
