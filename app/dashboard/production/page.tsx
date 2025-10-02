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
import { Plus, Pencil, Trash2, Egg, TrendingUp, AlertTriangle, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProductionRecord {
  id: string
  flock_id: string
  record_date: string
  eggs_collected: number
  mortality_count: number
  feed_consumed_kg: number
  notes: string | null
  created_at: string
}

interface Flock {
  id: string
  name: string
}

interface ChartData {
  date: string
  eggs: number
  mortality: number
  feed: number
}

export default function ProductionPage() {
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([])
  const [flocks, setFlocks] = useState<Flock[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ProductionRecord | null>(null)
  const [formData, setFormData] = useState({
    flock_id: "",
    record_date: "",
    eggs_collected: "",
    mortality_count: "",
    feed_consumed_kg: "",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    const supabase = createClient()

    const [productionResult, flocksResult] = await Promise.all([
      supabase.from("production_records").select("*").order("record_date", { ascending: false }),
      supabase.from("flocks").select("id, name"),
    ])

    if (productionResult.error) {
      console.error("[v0] Error fetching production records:", productionResult.error)
    } else {
      setProductionRecords(productionResult.data || [])
    }

    if (flocksResult.error) {
      console.error("[v0] Error fetching flocks:", flocksResult.error)
    } else {
      setFlocks(flocksResult.data || [])
    }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const supabase = createClient()

    const recordData = {
      flock_id: formData.flock_id,
      record_date: formData.record_date,
      eggs_collected: Number.parseInt(formData.eggs_collected),
      mortality_count: Number.parseInt(formData.mortality_count),
      feed_consumed_kg: Number.parseFloat(formData.feed_consumed_kg),
      notes: formData.notes || null,
    }

    if (editingRecord) {
      const { error } = await supabase.from("production_records").update(recordData).eq("id", editingRecord.id)

      if (error) {
        console.error("[v0] Error updating production record:", error)
        return
      }
    } else {
      const { error } = await supabase.from("production_records").insert([recordData])

      if (error) {
        console.error("[v0] Error creating production record:", error)
        return
      }
    }

    setDialogOpen(false)
    resetForm()
    fetchData()
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this production record?")) return

    const supabase = createClient()
    const { error } = await supabase.from("production_records").delete().eq("id", id)

    if (error) {
      console.error("[v0] Error deleting production record:", error)
    } else {
      fetchData()
    }
  }

  function handleEdit(record: ProductionRecord) {
    setEditingRecord(record)
    setFormData({
      flock_id: record.flock_id,
      record_date: record.record_date,
      eggs_collected: record.eggs_collected.toString(),
      mortality_count: record.mortality_count.toString(),
      feed_consumed_kg: record.feed_consumed_kg.toString(),
      notes: record.notes || "",
    })
    setDialogOpen(true)
  }

  function resetForm() {
    setFormData({
      flock_id: "",
      record_date: "",
      eggs_collected: "",
      mortality_count: "",
      feed_consumed_kg: "",
      notes: "",
    })
    setEditingRecord(null)
  }

  function getFlockName(flockId: string) {
    const flock = flocks.find((f) => f.id === flockId)
    return flock?.name || "Unknown Flock"
  }

  // Calculate statistics
  const totalEggs = productionRecords.reduce((sum, r) => sum + r.eggs_collected, 0)
  const totalMortality = productionRecords.reduce((sum, r) => sum + r.mortality_count, 0)
  const totalFeed = productionRecords.reduce((sum, r) => sum + r.feed_consumed_kg, 0)
  const avgEggsPerDay = productionRecords.length > 0 ? totalEggs / productionRecords.length : 0

  // Prepare chart data (last 14 days)
  const chartData: ChartData[] = productionRecords
    .slice(0, 14)
    .reverse()
    .map((record) => ({
      date: new Date(record.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      eggs: record.eggs_collected,
      mortality: record.mortality_count,
      feed: record.feed_consumed_kg,
    }))

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
          <h1 className="text-3xl font-bold tracking-tight text-balance">Production Tracking</h1>
          <p className="text-muted-foreground">Monitor daily egg production, mortality, and feed consumption</p>
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
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Edit Production Record" : "Add New Production Record"}</DialogTitle>
              <DialogDescription>
                {editingRecord ? "Update production record information" : "Enter daily production data"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="flock_id">Flock</Label>
                <Select
                  value={formData.flock_id}
                  onValueChange={(value) => setFormData({ ...formData, flock_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select flock" />
                  </SelectTrigger>
                  <SelectContent>
                    {flocks.map((flock) => (
                      <SelectItem key={flock.id} value={flock.id}>
                        {flock.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="record_date">Date</Label>
                <Input
                  id="record_date"
                  type="date"
                  value={formData.record_date}
                  onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eggs_collected">Eggs Collected</Label>
                <Input
                  id="eggs_collected"
                  type="number"
                  value={formData.eggs_collected}
                  onChange={(e) => setFormData({ ...formData, eggs_collected: e.target.value })}
                  placeholder="120"
                  required
                  min="0"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mortality_count">Mortality Count</Label>
                  <Input
                    id="mortality_count"
                    type="number"
                    value={formData.mortality_count}
                    onChange={(e) => setFormData({ ...formData, mortality_count: e.target.value })}
                    placeholder="0"
                    required
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feed_consumed_kg">Feed (kg)</Label>
                  <Input
                    id="feed_consumed_kg"
                    type="number"
                    step="0.01"
                    value={formData.feed_consumed_kg}
                    onChange={(e) => setFormData({ ...formData, feed_consumed_kg: e.target.value })}
                    placeholder="25.5"
                    required
                    min="0"
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
                <Button type="submit">{editingRecord ? "Update" : "Add"} Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Eggs</CardTitle>
            <Egg className="w-4 h-4 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEggs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Daily Eggs</CardTitle>
            <TrendingUp className="w-4 h-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEggsPerDay.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Per day</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mortality</CardTitle>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMortality}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Feed Used</CardTitle>
            <Calendar className="w-4 h-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFeed.toFixed(0)} kg</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Egg Production Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  eggs: {
                    label: "Eggs Collected",
                    color: "hsl(var(--chart-4))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="eggs" stroke="hsl(var(--chart-4))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Feed Consumption</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  feed: {
                    label: "Feed (kg)",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-[250px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="feed" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Production Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Flock</TableHead>
                <TableHead>Eggs Collected</TableHead>
                <TableHead>Mortality</TableHead>
                <TableHead>Feed (kg)</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productionRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    No production records found. Add your first production record to get started.
                  </TableCell>
                </TableRow>
              ) : (
                productionRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{new Date(record.record_date).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">{getFlockName(record.flock_id)}</TableCell>
                    <TableCell>{record.eggs_collected.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className={record.mortality_count > 0 ? "text-destructive font-medium" : ""}>
                        {record.mortality_count}
                      </span>
                    </TableCell>
                    <TableCell>{record.feed_consumed_kg.toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{record.notes || "—"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
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
