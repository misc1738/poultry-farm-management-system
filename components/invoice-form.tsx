"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import type { Invoice, InvoiceItem, Customer } from "@/lib/types"

interface InvoiceFormProps {
  invoice: Invoice | null
  onSave: (invoice: Invoice) => void
  onCancel: () => void
}

export function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const { user, logAction } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    customerId: "",
    date: new Date().toISOString().split("T")[0],
    dueDate: "",
    taxRate: "10",
    status: "draft" as Invoice["status"],
    notes: "",
  })
  const [items, setItems] = useState<InvoiceItem[]>([{ id: "1", description: "", quantity: 1, unitPrice: 0, total: 0 }])

  useEffect(() => {
    const stored = localStorage.getItem("customers")
    if (stored) {
      setCustomers(JSON.parse(stored))
    }

    if (invoice) {
      setFormData({
        invoiceNumber: invoice.invoiceNumber,
        customerId: invoice.customerId,
        date: invoice.date,
        dueDate: invoice.dueDate,
        taxRate: invoice.taxRate.toString(),
        status: invoice.status,
        notes: invoice.notes || "",
      })
      setItems(invoice.items)
    } else {
      // Generate invoice number
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]")
      const nextNumber = invoices.length + 1
      setFormData((prev) => ({ ...prev, invoiceNumber: `INV-${String(nextNumber).padStart(4, "0")}` }))
    }
  }, [invoice])

  const handleItemChange = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value }
          if (field === "quantity" || field === "unitPrice") {
            updated.total = Number(updated.quantity) * Number(updated.unitPrice)
          }
          return updated
        }
        return item
      }),
    )
  }

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, total: 0 }])
  }

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const tax = subtotal * (Number(formData.taxRate) / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.customerId) return

    const customer = customers.find((c) => c.id === formData.customerId)
    if (!customer) return

    const { subtotal, tax, total } = calculateTotals()

    const invoiceData: Invoice = {
      id: invoice?.id || Date.now().toString(),
      invoiceNumber: formData.invoiceNumber,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      date: formData.date,
      dueDate: formData.dueDate,
      items,
      subtotal,
      tax,
      taxRate: Number(formData.taxRate),
      total,
      status: formData.status,
      notes: formData.notes,
      createdBy: invoice?.createdBy || user.id,
      createdAt: invoice?.createdAt || new Date().toISOString(),
    }

    logAction(
      invoice ? "UPDATE_INVOICE" : "CREATE_INVOICE",
      `${invoice ? "Updated" : "Created"} invoice: ${invoiceData.invoiceNumber}`,
    )

    onSave(invoiceData)
  }

  const { subtotal, tax, total } = calculateTotals()

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number *</Label>
          <Input id="invoiceNumber" value={formData.invoiceNumber} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerId">Customer *</Label>
          <Select
            value={formData.customerId}
            onValueChange={(value) => setFormData({ ...formData, customerId: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Invoice Date *</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            min="0"
            step="0.01"
            value={formData.taxRate}
            onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Invoice Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem} className="gap-2 bg-transparent">
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>

        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item.id} className="grid gap-2 md:grid-cols-12 items-end">
              <div className="md:col-span-5 space-y-2">
                <Label htmlFor={`desc-${item.id}`}>Description</Label>
                <Input
                  id={`desc-${item.id}`}
                  value={item.description}
                  onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                  placeholder="Item description"
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor={`qty-${item.id}`}>Quantity</Label>
                <Input
                  id={`qty-${item.id}`}
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor={`price-${item.id}`}>Unit Price</Label>
                <Input
                  id={`price-${item.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => handleItemChange(item.id, "unitPrice", Number(e.target.value))}
                  required
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Total</Label>
                <Input value={`$${item.total.toFixed(2)}`} disabled />
              </div>
              <div className="md:col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  disabled={items.length === 1}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({formData.taxRate}%):</span>
            <span className="font-medium">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes or payment terms..."
          rows={3}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">Save Invoice</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
