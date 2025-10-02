"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, FileText, DollarSign, Clock, CheckCircle } from "lucide-react"
import { InvoiceForm } from "@/components/invoice-form"
import { InvoicesList } from "@/components/invoices-list"
import type { Invoice } from "@/lib/types"

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("invoices")
    if (stored) {
      setInvoices(JSON.parse(stored))
    }
  }, [])

  const handleSave = (invoice: Invoice) => {
    let updated: Invoice[]
    if (editingInvoice) {
      updated = invoices.map((i) => (i.id === invoice.id ? invoice : i))
    } else {
      updated = [...invoices, invoice]
    }
    setInvoices(updated)
    localStorage.setItem("invoices", JSON.stringify(updated))
    setShowForm(false)
    setEditingInvoice(null)
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updated = invoices.filter((i) => i.id !== id)
    setInvoices(updated)
    localStorage.setItem("invoices", JSON.stringify(updated))
  }

  const handleStatusChange = (id: string, status: Invoice["status"]) => {
    const updated = invoices.map((i) => (i.id === id ? { ...i, status } : i))
    setInvoices(updated)
    localStorage.setItem("invoices", JSON.stringify(updated))
  }

  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter((i) => i.status === "paid").length
  const pendingInvoices = invoices.filter((i) => i.status === "sent").length
  const totalRevenue = invoices.filter((i) => i.status === "paid").reduce((sum, i) => sum + i.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage customer invoices</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">Completed invoices</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From paid invoices</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingInvoice ? "Edit Invoice" : "New Invoice"}</CardTitle>
            <CardDescription>
              {editingInvoice ? "Update invoice information" : "Create a new invoice for a customer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InvoiceForm
              invoice={editingInvoice}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingInvoice(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <InvoicesList
        invoices={invoices}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}
