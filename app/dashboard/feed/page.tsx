"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Pencil, Trash2, Package, AlertTriangle, TrendingDown, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FeedItem {
  id: string
  feed_type: string
  quantity_kg: number
  unit_price: number
  supplier: string
  purchase_date: string
  expiry_date: string | null
  notes: string | null
  created_at: string
}

export default function FeedInventoryPage() {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FeedItem | null>(null)
  const [formData, setFormData] = useState({
    feed_type: "",
    quantity_kg: "",
    unit_price: "",
    supplier: "",
    purchase_date: "",
    expiry_date: "",
    notes: "",
  })

  useEffect(() => {
    fetchFeedInventory()
  }, [])

  async function fetchFeedInventory() {
    const supabase = createClient()
    const { data, error } = await supabase.from("feed_inventory").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching feed inventory:", error)
    } else {
      setFeedItems(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const feedData = {
      feed_type: formData.feed_type,
      quantity_kg: Number.parseFloat(formData.quantity_kg),
      unit_price: Number.parseFloat(formData.unit_price),
      supplier: formData.supplier,
      purchase_date: formData.purchase_date,
      expiry_date: formData.expiry_date || null,
      notes: formData.notes || null,
    }

    if (editingItem) {
      const { error } = await supabase.from("feed_inventory").update(feedData).eq("id", editingItem.id)

      if (error) {
        console.error("[v0] Error updating feed item:", error)
        return
      }
    } else {
      const { error } = await supabase.from("feed_inventory").insert([feedData])

      if (error) {
        console.error("[v0] Error creating feed item:", error)
        return
      }
    }

    setDialogOpen(false)
    resetForm()
    fetchFeedInventory()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this feed item?")) return

    const supabase = createClient()
    const { error } = await supabase.from("feed_inventory").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting feed item:", error)
    } else {
      fetchFeedInventory()
    }
  }

  function handleEdit(item: FeedItem) {
    setEditingItem(item)
    setFormData({
      feed_type: item.feed_type,
      quantity_kg: item.quantity_kg.toString(),
      unit_price: item.unit_price.toString(),
      supplier: item.supplier,
      purchase_date: item.purchase_date,
      expiry_date: item.expiry_date || "",
      notes: item.notes || "",
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      feed_type: "",
      quantity_kg: "",
      unit_price: "",
      supplier: "",
      purchase_date: "",
      expiry_date: "",
      notes: "",
    })
    setEditingItem(null)
  }

  function isExpiringSoon(expiryDate: string | null) {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0
  }

  function isExpired(expiryDate: string | null) {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  function isLowStock(quantity: number) {
    return quantity < 100
  }

  const totalQuantity = feedItems.reduce((sum, item) => sum + item.quantity_kg, 0)
  const totalValue = feedItems.reduce((sum, item) => sum + item.quantity_kg * item.unit_price, 0)
  const lowStockItems = feedItems.filter((item) => isLowStock(item.quantity_kg)).length
  const expiringItems = feedItems.filter((item) => isExpiringSoon(item.expiry_date)).length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Feed Inventory</h1>
          <p className="text-muted-foreground">Manage your feed stock and track inventory levels</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Feed
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Feed Item" : "Add New Feed"}</DialogTitle>
              <DialogDescription>
                {editingItem ? "Update feed inventory information" : "Enter details for the new feed item"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feed_type">Feed Type</Label>
                <Select
                  value={formData.feed_type}
                  onValueChange={(value) => setFormData({ ...formData, feed_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select feed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Starter Feed">Starter Feed</SelectItem>
                    <SelectItem value="Grower Feed">Grower Feed</SelectItem>
                    <SelectItem value="Layer Feed">Layer Feed</SelectItem>
                    <SelectItem value="Broiler Feed">Broiler Feed</SelectItem>
                    <SelectItem value="Finisher Feed">Finisher Feed</SelectItem>
                    <SelectItem value="Organic Feed">Organic Feed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity_kg">Quantity (kg)</Label>
                  <Input
                    id="quantity_kg"
                    type="number"
                    step="0.01"
                    value={formData.quantity_kg}
                    onChange={(e) => setFormData({ ...formData, quantity_kg: e.target.value })}
                    placeholder="500"
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit_price">Unit Price ($)</Label>
                  <Input
                    id="unit_price"
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="25.00"
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  placeholder="ABC Feed Supplies"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry_date">Expiry Date</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">{editingItem ? "Update" : "Add"} Feed</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuantity.toFixed(0)} kg</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            <TrendingUp className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Low Stock</CardTitle>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Items below 100kg</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Soon</CardTitle>
            <AlertTriangle className="w-4 h-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringItems}</div>
            <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feed Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feed Type</TableHead>
                <TableHead>Quantity (kg)</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feedItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    No feed items found. Add your first feed item to get started.
                  </TableCell>
                </TableRow>
              ) : (
                feedItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.feed_type}</TableCell>
                    <TableCell>{item.quantity_kg.toFixed(2)}</TableCell>
                    <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell>${(item.quantity_kg * item.unit_price).toFixed(2)}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{new Date(item.purchase_date).toLocaleDateString()}</TableCell>
                    <TableCell>{item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {isExpired(item.expiry_date) && <Badge variant="destructive">Expired</Badge>}
                        {isExpiringSoon(item.expiry_date) && !isExpired(item.expiry_date) && (
                          <Badge variant="outline" className="border-chart-3 text-chart-3">
                            Expiring Soon
                          </Badge>
                        )}
                        {isLowStock(item.quantity_kg) && (
                          <Badge variant="outline" className="border-destructive text-destructive">
                            Low Stock
                          </Badge>
                        )}
                        {!isExpired(item.expiry_date) &&
                          !isExpiringSoon(item.expiry_date) &&
                          !isLowStock(item.quantity_kg) && <Badge variant="secondary">Good</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
