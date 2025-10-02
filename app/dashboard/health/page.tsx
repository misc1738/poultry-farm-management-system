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
import { Plus, Pencil, Trash2, Activity, AlertCircle, CheckCircle, Syringe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface HealthRecord {
  id: string
  flock_id: string
  record_date: string
  record_type: string
  description: string
  treatment: string | null
  cost: number | null
  notes: string | null
  created_at: string
}

interface Flock {
  id: string
  name: string
}

export default function HealthRecordsPage() {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])
  const [flocks, setFlocks] = useState<Flock[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null)
  const [formData, setFormData] = useState({
    flock_id: "",
    record_date: "",
    record_type: "",
    description: "",
    treatment: "",
    cost: "",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    const [healthResult, flocksResult] = await Promise.all([
      supabase.from("health_records").select("*").order("record_date", { ascending: false }),
      supabase.from("flocks").select("id, name"),
    ])

    if (healthResult.error) {
      console.error("[v0] Error fetching health records:", healthResult.error)
    } else {
      setHealthRecords(healthResult.data || [])
    }

    if (flocksResult.error) {
      console.error("[v0] Error fetching flocks:", flocksResult.error)
    } else {
      setFlocks(flocksResult.data || [])
    }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const recordData = {
      flock_id: formData.flock_id,
      record_date: formData.record_date,
      record_type: formData.record_type,
      description: formData.description,
      treatment: formData.treatment || null,
      cost: formData.cost ? Number.parseFloat(formData.cost) : null,
      notes: formData.notes || null,
    }

    if (editingRecord) {
      const { error } = await supabase.from("health_records").update(recordData).eq("id", editingRecord.id)

      if (error) {
        console.error("[v0] Error updating health record:", error)
        return
      }
    } else {
      const { error } = await supabase.from("health_records").insert([recordData])

      if (error) {
        console.error("[v0] Error creating health record:", error)
        return
      }
    }

    setDialogOpen(false)
    resetForm()
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this health record?")) return

    const supabase = createClient()
    const { error } = await supabase.from("health_records").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting health record:", error)
    } else {
      fetchData()
    }
  }

  function handleEdit(record: HealthRecord) {
    setEditingRecord(record)
    setFormData({
      flock_id: record.flock_id,
      record_date: record.record_date,
      record_type: record.record_type,
      description: record.description,
      treatment: record.treatment || "",
      cost: record.cost?.toString() || "",
      notes: record.notes || "",
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      flock_id: "",
      record_date: "",
      record_type: "",
      description: "",
      treatment: "",
      cost: "",
      notes: "",
    })
    setEditingRecord(null)
  }

  function getFlockName(flockId: string) {
    const flock = flocks.find((f) => f.id === flockId)
    return flock?.name || "Unknown Flock"
  }

  function getRecordTypeColor(type: string) {
    switch (type) {
      case "vaccination":
        return "default"
      case "disease":
        return "destructive"
      case "treatment":
        return "secondary"
      case "checkup":
        return "outline"
      default:
        return "secondary"
    }
  }

  const totalRecords = healthRecords.length
  const vaccinationRecords = healthRecords.filter((r) => r.record_type === "vaccination").length
  const diseaseRecords = healthRecords.filter((r) => r.record_type === "disease").length
  const totalCost = healthRecords.reduce((sum, r) => sum + (r.cost || 0), 0)

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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Health Records</h1>
          <p className="text-muted-foreground">Track vaccinations, diseases, and treatments for your flocks</p>
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
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Health Record" : "Add New Health Record"}</DialogTitle>
              <DialogDescription>
                {editingRecord ? "Update health record information" : "Enter details for the new health record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flock_id">Flock</Label>
                <Select
                  value={formData.flock_id}
                  onValueChange={(value) => setFormData({ ...formData, flock_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flock" />
                  </SelectTrigger>
                  <SelectContent>
                    {flocks.map((flock) => (
                      <SelectItem key={flock.id} value={flock.id}>
                        {flock.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="record_date">Date</Label>
                  <Input
                    id="record_date"
                    type="date"
                    value={formData.record_date}
                    onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="record_type">Type</Label>
                  <Select
                    value={formData.record_type}
                    onValueChange={(value) => setFormData({ ...formData, record_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="disease">Disease</SelectItem>
                      <SelectItem value="treatment">Treatment</SelectItem>
                      <SelectItem value="checkup">Checkup</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g., Newcastle Disease Vaccination"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Treatment</Label>
                <Input
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  placeholder="e.g., Antibiotics administered"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="50.00"
                  min="0"
                />
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
                <Button type="submit">{editingRecord ? "Update" : "Add"} Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vaccinations</CardTitle>
            <Syringe className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vaccinationRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disease Cases</CardTitle>
            <AlertCircle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diseaseRecords}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Cost</CardTitle>
            <CheckCircle className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Health Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Flock</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {healthRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No health records found. Add your first health record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                healthRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.record_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{getFlockName(record.flock_id)}</TableCell>
                    <TableCell>
                      <Badge variant={getRecordTypeColor(record.record_type)}>{record.record_type}</Badge>
                    </TableCell>
                    <TableCell>{record.description}</TableCell>
                    <TableCell>{record.treatment || "N/A"}</TableCell>
                    <TableCell>{record.cost ? `$${record.cost.toFixed(2)}` : "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
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
