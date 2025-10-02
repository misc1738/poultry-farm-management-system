"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Bird } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Flock {
  id: string
  name: string
  breed: string
  quantity: number
  hatch_date: string
  status: string
  notes: string | null
  created_at: string
}

export default function FlocksPage() {
  const [flocks, setFlocks] = useState<Flock[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFlock, setEditingFlock] = useState<Flock | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    breed: "",
    quantity: "",
    hatch_date: "",
    status: "active",
    notes: "",
  })

  useEffect(() => {
    fetchFlocks()
  }, [])

  async function fetchFlocks() {
    const supabase = createClient()
    const { data, error } = await supabase.from("flocks").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching flocks:", error)
    } else {
      setFlocks(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const flockData = {
      name: formData.name,
      breed: formData.breed,
      quantity: Number.parseInt(formData.quantity),
      hatch_date: formData.hatch_date,
      status: formData.status,
      notes: formData.notes || null,
    }

    if (editingFlock) {
      const { error } = await supabase.from("flocks").update(flockData).eq("id", editingFlock.id)

      if (error) {
        console.error("[v0] Error updating flock:", error)
        return
      }
    } else {
      const { error } = await supabase.from("flocks").insert([flockData])

      if (error) {
        console.error("[v0] Error creating flock:", error)
        return
      }
    }

    setDialogOpen(false)
    resetForm()
    fetchFlocks()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this flock?")) return

    const supabase = createClient()
    const { error } = await supabase.from("flocks").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting flock:", error)
    } else {
      fetchFlocks()
    }
  }

  function handleEdit(flock: Flock) {
    setEditingFlock(flock)
    setFormData({
      name: flock.name,
      breed: flock.breed,
      quantity: flock.quantity.toString(),
      hatch_date: flock.hatch_date,
      status: flock.status,
      notes: flock.notes || "",
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      name: "",
      breed: "",
      quantity: "",
      hatch_date: "",
      status: "active",
      notes: "",
    })
    setEditingFlock(null)
  }

  function calculateAge(hatchDate: string) {
    const hatch = new Date(hatchDate)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - hatch.getTime())
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return diffWeeks
  }

  const totalBirds = flocks.reduce((sum, flock) => sum + flock.quantity, 0)
  const activeFlocks = flocks.filter((f) => f.status === "active").length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Flock Management</h1>
          <p className="text-muted-foreground">Manage your poultry flocks and track their status</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Flock
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingFlock ? "Edit Flock" : "Add New Flock"}</DialogTitle>
              <DialogDescription>
                {editingFlock ? "Update flock information" : "Enter details for the new flock"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Flock Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Flock A - Layers"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Breed</Label>
                <Input
                  id="breed"
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g., Rhode Island Red"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="150"
                    required
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hatch_date">Hatch Date</Label>
                  <Input
                    id="hatch_date"
                    type="date"
                    value={formData.hatch_date}
                    onChange={(e) => setFormData({ ...formData, hatch_date: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingFlock ? "Update" : "Create"} Flock</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Flocks</CardTitle>
            <Bird className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flocks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Flocks</CardTitle>
            <Bird className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeFlocks}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Birds</CardTitle>
            <Bird className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBirds.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Flocks</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Age (weeks)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Hatch Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No flocks found. Add your first flock to get started.
                  </TableCell>
                </TableRow>
              ) : (
                flocks.map((flock) => (
                  <TableRow key={flock.id}>
                    <TableCell className="font-medium">{flock.name}</TableCell>
                    <TableCell>{flock.breed}</TableCell>
                    <TableCell>{flock.quantity.toLocaleString()}</TableCell>
                    <TableCell>{calculateAge(flock.hatch_date)} weeks</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          flock.status === "active" ? "default" : flock.status === "sold" ? "secondary" : "outline"
                        }
                      >
                        {flock.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(flock.hatch_date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(flock)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(flock.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
