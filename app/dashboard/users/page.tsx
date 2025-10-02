"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { UserForm } from "@/components/user-form"
import { UsersList } from "@/components/users-list"
import type { User } from "@/lib/types"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function UsersPage() {
  const { isAdmin } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
      return
    }
    loadUsers()
  }, [isAdmin, router])

  const loadUsers = () => {
    const stored = localStorage.getItem("users")
    if (stored) {
      setUsers(JSON.parse(stored))
    }
  }

  const handleSave = (user: User) => {
    let updatedUsers: User[]
    if (editingUser) {
      updatedUsers = users.map((u) => (u.id === user.id ? user : u))
    } else {
      updatedUsers = [...users, user]
    }
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
    setShowForm(false)
    setEditingUser(null)
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedUsers = users.filter((u) => u.id !== id)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
    setUsers(updatedUsers)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingUser(null)
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New User
          </Button>
        )}
      </div>

      <Alert>
        <AlertDescription>
          Only administrators can access this page. Users with the "user" role can view and manage farm data but cannot
          create or modify user accounts.
        </AlertDescription>
      </Alert>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingUser ? "Edit User" : "New User"}</CardTitle>
            <CardDescription>
              {editingUser ? "Update user account details" : "Create a new user account"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserForm user={editingUser} existingUsers={users} onSave={handleSave} onCancel={handleCancel} />
          </CardContent>
        </Card>
      ) : (
        <UsersList users={users} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
