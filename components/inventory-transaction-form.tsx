"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { InventoryItem, InventoryTransaction } from "@/lib/types"

interface InventoryTransactionFormProps {
  item: InventoryItem
  onComplete: () => void
  onCancel: () => void
}

export function InventoryTransactionForm({ item, onComplete, onCancel }: InventoryTransactionFormProps) {
  const { user, logAction } = useAuth()
  const [formData, setFormData] = useState({
    type: "in" as "in" | "out",
    quantity: "",
    reason: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const quantity = Number(formData.quantity)
    const newQuantity = formData.type === "in" ? item.quantity + quantity : item.quantity - quantity

    if (newQuantity < 0) {
      alert("Cannot remove more than available quantity")
      return
    }

    // Update item quantity
    const items = JSON.parse(localStorage.getItem("inventoryItems") || "[]")
    const updatedItems = items.map((i: InventoryItem) =>
      i.id === item.id
        ? { ...i, quantity: newQuantity, lastRestocked: formData.type === "in" ? formData.date : i.lastRestocked }
        : i,
    )
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))

    // Record transaction
    const transaction: InventoryTransaction = {
      id: Date.now().toString(),
      itemId: item.id,
      itemName: item.name,
      type: formData.type,
      quantity,
      reason: formData.reason,
      date: formData.date,
      notes: formData.notes,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    }

    const transactions = JSON.parse(localStorage.getItem("inventoryTransactions") || "[]")
    transactions.unshift(transaction)
    localStorage.setItem("inventoryTransactions", JSON.stringify(transactions))

    logAction(
      "INVENTORY_TRANSACTION",
      `${formData.type === "in" ? "Added" : "Removed"} ${quantity} ${item.unit} of ${item.name}`,
    )

    onComplete()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Transaction Type *</Label>
          <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in">Stock In (Add)</SelectItem>
              <SelectItem value="out">Stock Out (Remove)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="0.01"
            step="0.01"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder={`Current: ${item.quantity} ${item.unit}`}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason">Reason *</Label>
          <Input
            id="reason"
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            placeholder="e.g., Daily feeding, New purchase"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
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
        <Button type="submit">Record Transaction</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
