"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Purchase } from "@/lib/types"

interface PurchaseFormProps {
  purchase: Purchase | null
  onSave: (purchase: Purchase) => void
  onCancel: () => void
}

export function PurchaseForm({ purchase, onSave, onCancel }: PurchaseFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    date: purchase?.date || new Date().toISOString().split("T")[0],
    item: purchase?.item || "",
    quantity: purchase?.quantity.toString() || "",
    unitPrice: purchase?.unitPrice.toString() || "",
    supplier: purchase?.supplier || "",
    notes: purchase?.notes || "",
  })

  const totalAmount = Number(formData.quantity) * Number(formData.unitPrice)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newPurchase: Purchase = {
      id: purchase?.id || Date.now().toString(),
      date: formData.date,
      item: formData.item,
      quantity: Number(formData.quantity),
      unitPrice: Number(formData.unitPrice),
      totalAmount,
      supplier: formData.supplier,
      notes: formData.notes,
      createdBy: user?.username || "",
      createdAt: purchase?.createdAt || new Date().toISOString(),
    }

    onSave(newPurchase)
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
          <Label htmlFor="supplier">Supplier Name</Label>
          <Input
            id="supplier"
            type="text"
            placeholder="Enter supplier name"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="item">Item Description</Label>
        <Input
          id="item"
          type="text"
          placeholder="e.g., Feed, Medicine, Equipment"
          value={formData.item}
          onChange={(e) => setFormData({ ...formData, item: e.target.value })}
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
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
          <Label htmlFor="unitPrice">Unit Price ($)</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            placeholder="Enter unit price"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
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
        <Button type="submit">Save Purchase</Button>
      </div>
    </form>
  )
}
