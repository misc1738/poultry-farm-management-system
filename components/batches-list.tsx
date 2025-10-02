"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Batch } from "@/lib/types"

interface BatchesListProps {
  batches: Batch[]
  onEdit: (batch: Batch) => void
  onDelete: (id: string) => void
}

export function BatchesList({ batches, onEdit, onDelete }: BatchesListProps) {
  const { logAction } = useAuth()
  const [search, setSearch] = useState("")

  const filteredBatches = batches.filter(
    (batch) =>
      batch.batchNumber.toLowerCase().includes(search.toLowerCase()) ||
      batch.batchName.toLowerCase().includes(search.toLowerCase()) ||
      batch.breed.toLowerCase().includes(search.toLowerCase()),
  )

  const handleDelete = (batch: Batch) => {
    if (confirm(`Are you sure you want to delete batch ${batch.batchNumber}?`)) {
      logAction("DELETE_BATCH", `Deleted batch: ${batch.batchNumber} - ${batch.batchName}`)
      onDelete(batch.id)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "sold":
        return "bg-blue-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const mortalityRate = (batch: Batch) => {
    if (batch.initialQuantity === 0) return "0%"
    const rate = ((batch.initialQuantity - batch.currentQuantity) / batch.initialQuantity) * 100
    return `${rate.toFixed(1)}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Batches</CardTitle>
        <CardDescription>Manage your bird batches and flocks</CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by batch number, name, or breed..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Age (Weeks)</TableHead>
                <TableHead>Initial</TableHead>
                <TableHead>Current</TableHead>
                <TableHead>Mortality</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Received</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground">
                    No batches found
                  </TableCell>
                </TableRow>
              ) : (
                filteredBatches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                    <TableCell>{batch.batchName}</TableCell>
                    <TableCell>{batch.breed}</TableCell>
                    <TableCell>{batch.ageInWeeks}</TableCell>
                    <TableCell>{batch.initialQuantity.toLocaleString()}</TableCell>
                    <TableCell>{batch.currentQuantity.toLocaleString()}</TableCell>
                    <TableCell>{mortalityRate(batch)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(batch.status)}>{batch.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(batch.dateReceived).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(batch)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(batch)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
