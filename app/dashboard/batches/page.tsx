"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Layers, TrendingUp, TrendingDown } from "lucide-react"
import { BatchForm } from "@/components/batch-form"
import { BatchesList } from "@/components/batches-list"
import type { Batch } from "@/lib/types"

export default function BatchesPage() {
  const { user } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("batches")
    if (stored) {
      setBatches(JSON.parse(stored))
    }
  }, [])

  const handleSave = (batch: Batch) => {
    let updated: Batch[]
    if (editingBatch) {
      updated = batches.map((b) => (b.id === batch.id ? batch : b))
    } else {
      updated = [...batches, batch]
    }
    setBatches(updated)
    localStorage.setItem("batches", JSON.stringify(updated))
    setShowForm(false)
    setEditingBatch(null)
  }

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updated = batches.filter((b) => b.id !== id)
    setBatches(updated)
    localStorage.setItem("batches", JSON.stringify(updated))
  }

  const activeBatches = batches.filter((b) => b.status === "active")
  const totalBirds = activeBatches.reduce((sum, b) => sum + b.currentQuantity, 0)
  const totalInitial = activeBatches.reduce((sum, b) => sum + b.initialQuantity, 0)
  const mortalityRate = totalInitial > 0 ? (((totalInitial - totalBirds) / totalInitial) * 100).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Batch Management</h1>
          <p className="text-muted-foreground">Track and manage different flocks of birds</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Batch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Batches</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBatches.length}</div>
            <p className="text-xs text-muted-foreground">Currently being managed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Birds</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBirds.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all active batches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mortality Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mortalityRate}%</div>
            <p className="text-xs text-muted-foreground">For active batches</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingBatch ? "Edit Batch" : "New Batch"}</CardTitle>
            <CardDescription>
              {editingBatch ? "Update batch information" : "Add a new batch/flock to track"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BatchForm
              batch={editingBatch}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingBatch(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <BatchesList batches={batches} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
