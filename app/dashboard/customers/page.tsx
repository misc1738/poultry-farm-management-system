"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Users, Building, UserCircle, TrendingUp } from "lucide-react"
import { CustomerForm } from "@/components/customer-form"
import { CustomersList } from "@/components/customers-list"
import type { Customer, BirdSale, EggSale } from "@/lib/types"

export default function CustomersPage() {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("customers")
    if (stored) {
      setCustomers(JSON.parse(stored))
    }
  }, [])

  const handleSave = (customer: Customer) => {
    let updated: Customer[]
    if (editingCustomer) {
      updated = customers.map((c) => (c.id === customer.id ? customer : c))
    } else {
      updated = [...customers, customer]
    }
    setCustomers(updated)
    localStorage.setItem("customers", JSON.stringify(updated))
    setShowForm(false)
    setEditingCustomer(null)
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    const updated = customers.filter((c) => c.id !== id)
    setCustomers(updated)
    localStorage.setItem("customers", JSON.stringify(updated))
  }

  const individualCustomers = customers.filter((c) => c.customerType === "individual").length
  const businessCustomers = customers.filter((c) => c.customerType === "business").length

  // Calculate total revenue from this customer
  const calculateCustomerRevenue = () => {
    const birdSales = JSON.parse(localStorage.getItem("birdSales") || "[]") as BirdSale[]
    const eggSales = JSON.parse(localStorage.getItem("eggSales") || "[]") as EggSale[]

    const customerNames = customers.map((c) => c.name.toLowerCase())
    const birdRevenue = birdSales
      .filter((s) => customerNames.includes(s.buyer.toLowerCase()))
      .reduce((sum, s) => sum + s.totalAmount, 0)
    const eggRevenue = eggSales
      .filter((s) => customerNames.includes(s.buyer.toLowerCase()))
      .reduce((sum, s) => sum + s.totalAmount, 0)

    return birdRevenue + eggRevenue
  }

  const totalRevenue = calculateCustomerRevenue()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer database and relationships</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Customer
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
            <p className="text-xs text-muted-foreground">In database</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Individual</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{individualCustomers}</div>
            <p className="text-xs text-muted-foreground">Personal customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessCustomers}</div>
            <p className="text-xs text-muted-foreground">Business customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From all customers</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCustomer ? "Edit Customer" : "New Customer"}</CardTitle>
            <CardDescription>
              {editingCustomer ? "Update customer information" : "Add a new customer to your database"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerForm
              customer={editingCustomer}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditingCustomer(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <CustomersList customers={customers} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  )
}
