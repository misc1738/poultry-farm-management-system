"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Mortality } from "@/lib/types"

interface MortalityFormProps {
  record: Mortality | null
  onSave: (record: Mortality) => void
  onCancel: () => void
}

export function MortalityForm({ record, onSave, onCancel }: MortalityFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: record?.date || new Date().toISOString().split("T")[0],
    quantity: record?.quantity.toString() || "",
    cause: record?.cause || "",
    notes: record?.notes || "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const mortality: Mortality = {
      id: record?.id || Date.now().toString(),
      date: formData.date,
      quantity: Number(formData.quantity),
      cause: formData.cause,
      notes: formData.notes,
      createdBy: user?.username || "",
      createdAt: record?.createdAt || new Date().toISOString(),
    }

    onSave(mortality)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity (Birds)</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            placeholder="Enter quantity"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cause">Cause of Death</Label>
        <Input
          id="cause"
          type="text"
          placeholder="e.g., Disease, Natural, Predator, etc."
          value={formData.cause}
          onChange={(e) => setFormData({ ...formData, cause: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional details"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Record</Button>
      </div>
    </form>
  )
}
