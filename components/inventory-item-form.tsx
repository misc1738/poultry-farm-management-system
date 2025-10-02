"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem } from "@/lib/types"

interface InventoryItemFormProps {
  item: InventoryItem | null
  onSave: (item: InventoryItem) => void
  onCancel: () => void
}

export function InventoryItemForm({ item, onSave, onCancel }: InventoryItemFormProps) {
  const { user, logAction } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    category: "feed" as "feed" | "medication" | "equipment" | "other",
    quantity: "",
    unit: "",
    reorderLevel: "",
    unitPrice: "",
    supplier: "",
    lastRestocked: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: "",
  })

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity.toString(),
        unit: item.unit,
        reorderLevel: item.reorderLevel.toString(),
        unitPrice: item.unitPrice.toString(),
        supplier: item.supplier,
        lastRestocked: item.lastRestocked,
        expiryDate: item.expiryDate || "",
        notes: item.notes || "",
      })
    }
  }, [item])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const itemData: InventoryItem = {
      id: item?.id || Date.now().toString(),
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      reorderLevel: Number(formData.reorderLevel),
      unitPrice: Number(formData.unitPrice),
      supplier: formData.supplier,
      lastRestocked: formData.lastRestocked,
      expiryDate: formData.expiryDate || undefined,
      notes: formData.notes,
      createdBy: item?.createdBy || user.id,
      createdAt: item?.createdAt || new Date().toISOString(),
    }

    logAction(
      item ? "UPDATE_INVENTORY_ITEM" : "CREATE_INVENTORY_ITEM",
      `${item ? "Updated" : "Created"} inventory item: ${itemData.name}`,
    )

    onSave(itemData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Layer Feed"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select
            value={formData.category}
            onValueChange={(value: any) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="feed">Feed</SelectItem>
              <SelectItem value="medication">Medication</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Current Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit *</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="e.g., kg, bags, bottles"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reorderLevel">Reorder Level *</Label>
          <Input
            id="reorderLevel"
            type="number"
            min="0"
            step="0.01"
            value={formData.reorderLevel}
            onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unitPrice">Unit Price *</Label>
          <Input
            id="unitPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.unitPrice}
            onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier *</Label>
          <Input
            id="supplier"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
            placeholder="Supplier name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastRestocked">Last Restocked *</Label>
          <Input
            id="lastRestocked"
            type="date"
            value={formData.lastRestocked}
            onChange={(e) => setFormData({ ...formData, lastRestocked: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional information..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save Item</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
