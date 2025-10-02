"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { EggSaleForm } from "@/components/egg-sale-form"
import { EggSalesList } from "@/components/egg-sales-list"
import type { EggSale } from "@/lib/types"

export default function EggSalesPage() {
  const [sales, setSales] = useState<EggSale[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingSale, setEditingSale] = useState<EggSale | null>(null)

  useEffect(() => {
    loadSales()
  }, [])

  const loadSales = () => {
    const stored = localStorage.getItem("eggSales")
    if (stored) {
      setSales(JSON.parse(stored))
    }
  }

  const handleSave = (sale: EggSale) => {
    let updatedSales: EggSale[]
    if (editingSale) {
      updatedSales = sales.map((s) => (s.id === sale.id ? sale : s))
    } else {
      updatedSales = [...sales, sale]
    }
    localStorage.setItem("eggSales", JSON.stringify(updatedSales))
    setSales(updatedSales)
    setShowForm(false)
    setEditingSale(null)
  }

  const handleEdit = (sale: EggSale) => {
    setEditingSale(sale)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedSales = sales.filter((s) => s.id !== id)
    localStorage.setItem("eggSales", JSON.stringify(updatedSales))
    setSales(updatedSales)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingSale(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Egg Sales</h1>
          <p className="text-muted-foreground">Track and manage egg sales transactions</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Sale
          </Button>
        )}
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingSale ? "Edit Egg Sale" : "New Egg Sale"}</CardTitle>
            <CardDescription>
              {editingSale ? "Update the egg sale details" : "Record a new egg sale transaction"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EggSaleForm sale={editingSale} onSave={handleSave} onCancel={handleCancel} />
          </CardContent>
        </Card>
      ) : (
        <EggSalesList sales={sales} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
