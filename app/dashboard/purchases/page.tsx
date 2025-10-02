"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { PurchaseForm } from "@/components/purchase-form"
import { PurchasesList } from "@/components/purchases-list"
import type { Purchase } from "@/lib/types"

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)

  useEffect(() => {
    loadPurchases()
  }, [])

  const loadPurchases = () => {
    const stored = localStorage.getItem("purchases")
    if (stored) {
      setPurchases(JSON.parse(stored))
    }
  }

  const handleSave = (purchase: Purchase) => {
    let updatedPurchases: Purchase[]
    if (editingPurchase) {
      updatedPurchases = purchases.map((p) => (p.id === purchase.id ? purchase : p))
    } else {
      updatedPurchases = [...purchases, purchase]
    }
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
    setPurchases(updatedPurchases)
    setShowForm(false)
    setEditingPurchase(null)
  }

  const handleEdit = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updatedPurchases = purchases.filter((p) => p.id !== id)
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases))
    setPurchases(updatedPurchases)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPurchase(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchases</h1>
          <p className="text-muted-foreground">Track farm supplies and equipment purchases</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Purchase
          </Button>
        )}
      </div>

      {showForm ? (
        <Card>
          <CardHeader>
            <CardTitle>{editingPurchase ? "Edit Purchase" : "New Purchase"}</CardTitle>
            <CardDescription>
              {editingPurchase ? "Update the purchase details" : "Record a new purchase transaction"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseForm purchase={editingPurchase} onSave={handleSave} onCancel={handleCancel} />
          </CardContent>
        </Card>
      ) : (
        <PurchasesList purchases={purchases} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}
