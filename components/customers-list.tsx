"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Search, Mail, Phone } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import type { Customer, BirdSale, EggSale } from "@/lib/types"

interface CustomersListProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
}

export function CustomersList({ customers, onEdit, onDelete }: CustomersListProps) {
  const { logAction } = useAuth()
  const [search, setSearch] = useState("")

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search.toLowerCase()) ||
      customer.phone.includes(search),
  )

  const handleDelete = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      logAction("DELETE_CUSTOMER", `Deleted customer: ${customer.name}`)
      onDelete(customer.id)
    }
  }

  const getCustomerRevenue = (customerName: string) => {
    const birdSales = JSON.parse(localStorage.getItem("birdSales") || "[]") as BirdSale[]
    const eggSales = JSON.parse(localStorage.getItem("eggSales") || "[]") as EggSale[]

    const birdRevenue = birdSales
      .filter((s) => s.buyer.toLowerCase() === customerName.toLowerCase())
      .reduce((sum, s) => sum + s.totalAmount, 0)
    const eggRevenue = eggSales
      .filter((s) => s.buyer.toLowerCase() === customerName.toLowerCase())
      .reduce((sum, s) => sum + s.totalAmount, 0)

    return birdRevenue + eggRevenue
  }

  const getCustomerPurchases = (customerName: string) => {
    const birdSales = JSON.parse(localStorage.getItem("birdSales") || "[]") as BirdSale[]
    const eggSales = JSON.parse(localStorage.getItem("eggSales") || "[]") as EggSale[]

    const birdCount = birdSales.filter((s) => s.buyer.toLowerCase() === customerName.toLowerCase()).length
    const eggCount = eggSales.filter((s) => s.buyer.toLowerCase() === customerName.toLowerCase()).length

    return birdCount + eggCount
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Customers</CardTitle>
        <CardDescription>Manage your customer database and view purchase history</CardDescription>
        <div className="flex items-center gap-2 pt-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
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
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Purchases</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No customers found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>
                      <Badge variant={customer.customerType === "business" ? "default" : "secondary"}>
                        {customer.customerType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {customer.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {customer.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{customer.address}</TableCell>
                    <TableCell>{getCustomerPurchases(customer.name)}</TableCell>
                    <TableCell>${getCustomerRevenue(customer.name).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(customer)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(customer)}>
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
