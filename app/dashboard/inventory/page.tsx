"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Package, AlertTriangle, TrendingUp } from "lucide-react"
import { InventoryItemForm } from "@/components/inventory-item-form"
import { InventoryList } from "@/components/inventory-list"
import { InventoryTransactionForm } from "@/components/inventory-transaction-form"
import type { InventoryItem } from "@/lib/types"

export default function InventoryPage() {
  const { user } = useAuth()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [showItemForm, setShowItemForm] = useState(false)
  const [showTransactionForm, setShowTransactionForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("inventoryItems")
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }, [])

  const handleSaveItem = (item: InventoryItem) => {
    let updated: InventoryItem[]
    if (editingItem) {
      updated = items.map((i) => (i.id === item.id ? item : i))
    } else {
      updated = [...items, item]
    }
    setItems(updated)
    localStorage.setItem("inventoryItems", JSON.stringify(updated))
    setShowItemForm(false)
    setEditingItem(null)
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowItemForm(true)
  }

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((i) => i.id !== id)
    setItems(updated)
    localStorage.setItem("inventoryItems", JSON.stringify(updated))
  }

  const handleTransaction = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowTransactionForm(true)
  }

  const handleTransactionComplete = () => {
    setShowTransactionForm(false)
    setSelectedItem(null)
    // Reload items
    const stored = localStorage.getItem("inventoryItems")
    if (stored) {
      setItems(JSON.parse(stored))
    }
  }

  const totalItems = items.length
  const lowStockItems = items.filter((i) => i.quantity <= i.reorderLevel).length
  const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track feed, medication, and supplies</p>
        </div>
        <Button onClick={() => setShowItemForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Item
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground">Items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Current inventory value</p>
          </CardContent>
        </Card>
      </div>

      {showItemForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingItem ? "Edit Item" : "New Inventory Item"}</CardTitle>
            <CardDescription>{editingItem ? "Update item information" : "Add a new item to inventory"}</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryItemForm
              item={editingItem}
              onSave={handleSaveItem}
              onCancel={() => {
                setShowItemForm(false)
                setEditingItem(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      {showTransactionForm && selectedItem && (
        <Card>
          <CardHeader>
            <CardTitle>Record Transaction</CardTitle>
            <CardDescription>Add or remove stock for {selectedItem.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <InventoryTransactionForm
              item={selectedItem}
              onComplete={handleTransactionComplete}
              onCancel={() => {
                setShowTransactionForm(false)
                setSelectedItem(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <InventoryList
        items={items}
        onEdit={handleEditItem}
        onDelete={handleDeleteItem}
        onTransaction={handleTransaction}
      />
    </div>
  )
}
