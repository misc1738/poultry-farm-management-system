"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Batch } from "@/lib/types"

interface BatchFormProps {
  batch: Batch | null
  onSave: (batch: Batch) => void
  onCancel: () => void
}

export function BatchForm({ batch, onSave, onCancel }: BatchFormProps) {
  const { user, logAction } = useAuth()
  const [formData, setFormData] = useState({
    batchNumber: "",
    batchName: "",
    initialQuantity: "",
    currentQuantity: "",
    dateReceived: new Date().toISOString().split("T")[0],
    breed: "",
    ageInWeeks: "",
    status: "active" as "active" | "sold" | "completed",
    notes: "",
  })

  useEffect(() => {
    if (batch) {
      setFormData({
        batchNumber: batch.batchNumber,
        batchName: batch.batchName,
        initialQuantity: batch.initialQuantity.toString(),
        currentQuantity: batch.currentQuantity.toString(),
        dateReceived: batch.dateReceived,
        breed: batch.breed,
        ageInWeeks: batch.ageInWeeks.toString(),
        status: batch.status,
        notes: batch.notes || "",
      })
    }
  }, [batch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const batchData: Batch = {
      id: batch?.id || Date.now().toString(),
      batchNumber: formData.batchNumber,
      batchName: formData.batchName,
      initialQuantity: Number(formData.initialQuantity),
      currentQuantity: Number(formData.currentQuantity),
      dateReceived: formData.dateReceived,
      breed: formData.breed,
      ageInWeeks: Number(formData.ageInWeeks),
      status: formData.status,
      notes: formData.notes,
      createdBy: batch?.createdBy || user.id,
      createdAt: batch?.createdAt || new Date().toISOString(),
    }

    logAction(
      batch ? "UPDATE_BATCH" : "CREATE_BATCH",
      `${batch ? "Updated" : "Created"} batch: ${batchData.batchNumber} - ${batchData.batchName}`,
    )

    onSave(batchData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="batchNumber">Batch Number *</Label>
          <Input
            id="batchNumber"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
            placeholder="e.g., B-2024-001"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="batchName">Batch Name *</Label>
          <Input
            id="batchName"
            value={formData.batchName}
            onChange={(e) => setFormData({ ...formData, batchName: e.target.value })}
            placeholder="e.g., Spring Layers"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="initialQuantity">Initial Quantity *</Label>
          <Input
            id="initialQuantity"
            type="number"
            min="1"
            value={formData.initialQuantity}
            onChange={(e) => setFormData({ ...formData, initialQuantity: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentQuantity">Current Quantity *</Label>
          <Input
            id="currentQuantity"
            type="number"
            min="0"
            value={formData.currentQuantity}
            onChange={(e) => setFormData({ ...formData, currentQuantity: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateReceived">Date Received *</Label>
          <Input
            id="dateReceived"
            type="date"
            value={formData.dateReceived}
            onChange={(e) => setFormData({ ...formData, dateReceived: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="breed">Breed *</Label>
          <Input
            id="breed"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            placeholder="e.g., Rhode Island Red"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="ageInWeeks">Age (Weeks) *</Label>
          <Input
            id="ageInWeeks"
            type="number"
            min="0"
            value={formData.ageInWeeks}
            onChange={(e) => setFormData({ ...formData, ageInWeeks: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional information about this batch..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save Batch</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
