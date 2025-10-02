"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Trash2, Search, FileText, Printer, Filter, X } from "lucide-react"
import type { EggSale } from "@/lib/types"

interface EggSalesListProps {
  sales: EggSale[]
  onEdit: (sale: EggSale) => void
  onDelete: (id: string) => void
}

export function EggSalesList({ sales, onEdit, onDelete }: EggSalesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "quantity">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch =
      sale.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.date.includes(searchTerm) ||
      sale.notes?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesDateFrom = !dateFrom || new Date(sale.date) >= new Date(dateFrom)
    const matchesDateTo = !dateTo || new Date(sale.date) <= new Date(dateTo)
    const matchesMinAmount = !minAmount || sale.totalAmount >= Number.parseFloat(minAmount)
    const matchesMaxAmount = !maxAmount || sale.totalAmount <= Number.parseFloat(maxAmount)

    return matchesSearch && matchesDateFrom && matchesDateTo && matchesMinAmount && matchesMaxAmount
  })

  const sortedSales = [...filteredSales].sort((a, b) => {
    let comparison = 0
    if (sortBy === "date") {
      comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
    } else if (sortBy === "amount") {
      comparison = a.totalAmount - b.totalAmount
    } else if (sortBy === "quantity") {
      comparison = a.quantity - b.quantity
    }
    return sortOrder === "asc" ? comparison : -comparison
  })

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalAmount, 0)
  const totalCrates = sales.reduce((sum, sale) => sum + sale.quantity, 0)

  const handlePrint = () => {
    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Egg Sales Report</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .summary { margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px; }
            .summary-item { display: inline-block; margin-right: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #333; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .text-right { text-align: right; }
            .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>Egg Sales Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <div class="summary">
            <div class="summary-item"><strong>Total Sales:</strong> ${sortedSales.length}</div>
            <div class="summary-item"><strong>Total Crates:</strong> ${sortedSales.reduce((sum, s) => sum + s.quantity, 0)}</div>
            <div class="summary-item"><strong>Total Revenue:</strong> $${sortedSales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Buyer</th>
                <th class="text-right">Quantity</th>
                <th class="text-right">Price/Crate</th>
                <th class="text-right">Total</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${sortedSales
                .map(
                  (sale) => `
                <tr>
                  <td>${new Date(sale.date).toLocaleDateString()}</td>
                  <td>${sale.buyer}</td>
                  <td class="text-right">${sale.quantity}</td>
                  <td class="text-right">$${sale.pricePerCrate.toFixed(2)}</td>
                  <td class="text-right">$${sale.totalAmount.toFixed(2)}</td>
                  <td>${sale.notes || "-"}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <p>Poultry Farm Management System - Egg Sales Report</p>
          </div>
        </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.print()
  }

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setMinAmount("")
    setMaxAmount("")
    setSearchTerm("")
  }

  const handleCreateInvoice = (sale: EggSale) => {
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    const customer = customers.find((c: any) => c.name.toLowerCase() === sale.buyer.toLowerCase())

    if (!customer) {
      alert("Customer not found. Please add this customer to the database first.")
      return
    }

    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]")
    const nextNumber = invoices.length + 1
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)

    const invoice = {
      id: Date.now().toString(),
      invoiceNumber: `INV-${String(nextNumber).padStart(4, "0")}`,
      customerId: customer.id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      date: sale.date,
      dueDate: dueDate.toISOString().split("T")[0],
      items: [
        {
          id: "1",
          description: `Egg Sale - ${sale.quantity} crates`,
          quantity: sale.quantity,
          unitPrice: sale.pricePerCrate,
          total: sale.totalAmount,
        },
      ],
      subtotal: sale.totalAmount,
      tax: sale.totalAmount * 0.1,
      taxRate: 10,
      total: sale.totalAmount * 1.1,
      status: "draft",
      notes: sale.notes || "",
      createdBy: sale.createdBy,
      createdAt: new Date().toISOString(),
    }

    invoices.push(invoice)
    localStorage.setItem("invoices", JSON.stringify(invoices))
    alert(`Invoice ${invoice.invoiceNumber} created successfully!`)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Crates Sold</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCrates}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by buyer, date, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 bg-transparent">
                <Printer className="w-4 h-4" />
                Print
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-4 p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Advanced Filters</h3>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
                  <X className="w-4 h-4" />
                  Clear
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="date-from">Date From</Label>
                  <Input id="date-from" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date-to">Date To</Label>
                  <Input id="date-to" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-amount">Min Amount ($)</Label>
                  <Input
                    id="min-amount"
                    type="number"
                    placeholder="0.00"
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-amount">Max Amount ($)</Label>
                  <Input
                    id="max-amount"
                    type="number"
                    placeholder="0.00"
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sort-by">Sort By</Label>
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger id="sort-by">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="amount">Amount</SelectItem>
                      <SelectItem value="quantity">Quantity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort-order">Sort Order</Label>
                  <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
                    <SelectTrigger id="sort-order">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {sortedSales.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || dateFrom || dateTo || minAmount || maxAmount
                ? "No sales found matching your filters"
                : "No egg sales recorded yet"}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Price/Crate</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{sale.buyer}</TableCell>
                      <TableCell className="text-right">{sale.quantity}</TableCell>
                      <TableCell className="text-right">${sale.pricePerCrate.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${sale.totalAmount.toFixed(2)}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{sale.notes || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCreateInvoice(sale)}
                            title="Create Invoice"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onEdit(sale)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteId(sale.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Egg Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this egg sale record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) onDelete(deleteId)
                setDeleteId(null)
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
