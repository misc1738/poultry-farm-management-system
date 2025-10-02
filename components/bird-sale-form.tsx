"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { BirdSale } from "@/lib/types"

interface BirdSaleFormProps {
  sale: BirdSale | null
  onSave: (sale: BirdSale) => void
  onCancel: () => void
}

export function BirdSaleForm({ sale, onSave, onCancel }: BirdSaleFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: sale?.date || new Date().toISOString().split("T")[0],
    quantity: sale?.quantity.toString() || "",
    pricePerBird: sale?.pricePerBird.toString() || "",
    buyer: sale?.buyer || "",
    notes: sale?.notes || "",
  })

  const totalAmount = Number(formData.quantity) * Number(formData.pricePerBird)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const birdSale: BirdSale = {
      id: sale?.id || Date.now().toString(),
      date: formData.date,
      quantity: Number(formData.quantity),
      pricePerBird: Number(formData.pricePerBird),
      totalAmount,
      buyer: formData.buyer,
      notes: formData.notes,
      createdBy: user?.username || "",
      createdAt: sale?.createdAt || new Date().toISOString(),
    }

    onSave(birdSale)
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
          <Label htmlFor="buyer">Buyer Name</Label>
          <Input
            id="buyer"
            type="text"
            placeholder="Enter buyer name"
            value={formData.buyer}
            onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
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
        <div className="space-y-2">
          <Label htmlFor="pricePerBird">Price per Bird ($)</Label>
          <Input
            id="pricePerBird"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter price"
            value={formData.pricePerBird}
            onChange={(e) => setFormData({ ...formData, pricePerBird: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Total Amount</Label>
        <div className="text-2xl font-bold text-primary">${totalAmount.toFixed(2)}</div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Add any additional notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Sale</Button>
      </div>
    </form>
  )
}
