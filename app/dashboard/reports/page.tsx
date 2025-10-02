"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Download, TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import type { BirdSale, EggSale, Mortality, Purchase } from "@/lib/types"

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  })

  const [data, setData] = useState({
    birdSales: [] as BirdSale[],
    eggSales: [] as EggSale[],
    mortality: [] as Mortality[],
    purchases: [] as Purchase[],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setData({
      birdSales: JSON.parse(localStorage.getItem("birdSales") || "[]"),
      eggSales: JSON.parse(localStorage.getItem("eggSales") || "[]"),
      mortality: JSON.parse(localStorage.getItem("mortality") || "[]"),
      purchases: JSON.parse(localStorage.getItem("purchases") || "[]"),
    })
  }

  const filterByDateRange = <T extends { date: string }>(items: T[]) => {
    return items.filter((item) => {
      const itemDate = new Date(item.date)
      const start = new Date(dateRange.start)
      const end = new Date(dateRange.end)
      return itemDate >= start && itemDate <= end
    })
  }

  const filteredData = {
    birdSales: filterByDateRange(data.birdSales),
    eggSales: filterByDateRange(data.eggSales),
    mortality: filterByDateRange(data.mortality),
    purchases: filterByDateRange(data.purchases),
  }

  const stats = {
    birdRevenue: filteredData.birdSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    eggRevenue: filteredData.eggSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalRevenue:
      filteredData.birdSales.reduce((sum, sale) => sum + sale.totalAmount, 0) +
      filteredData.eggSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    totalExpenses: filteredData.purchases.reduce((sum, purchase) => sum + purchase.totalAmount, 0),
    birdsSold: filteredData.birdSales.reduce((sum, sale) => sum + sale.quantity, 0),
    eggsSold: filteredData.eggSales.reduce((sum, sale) => sum + sale.quantity, 0),
    totalMortality: filteredData.mortality.reduce((sum, m) => sum + m.quantity, 0),
  }

  const netProfit = stats.totalRevenue - stats.totalExpenses

  const revenueChartData = [
    { name: "Bird Sales", value: stats.birdRevenue, fill: "hsl(var(--chart-1))" },
    { name: "Egg Sales", value: stats.eggRevenue, fill: "hsl(var(--chart-2))" },
  ]

  const getMonthlyTrends = () => {
    const months: { [key: string]: { revenue: number; expenses: number; profit: number } } = {}

    filteredData.birdSales.forEach((sale) => {
      const month = new Date(sale.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (!months[month]) months[month] = { revenue: 0, expenses: 0, profit: 0 }
      months[month].revenue += sale.totalAmount
    })

    filteredData.eggSales.forEach((sale) => {
      const month = new Date(sale.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (!months[month]) months[month] = { revenue: 0, expenses: 0, profit: 0 }
      months[month].revenue += sale.totalAmount
    })

    filteredData.purchases.forEach((purchase) => {
      const month = new Date(purchase.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })
      if (!months[month]) months[month] = { revenue: 0, expenses: 0, profit: 0 }
      months[month].expenses += purchase.totalAmount
    })

    return Object.entries(months)
      .map(([month, data]) => ({
        month,
        revenue: data.revenue,
        expenses: data.expenses,
        profit: data.revenue - data.expenses,
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
  }

  const monthlyTrends = getMonthlyTrends()

  const salesComparisonData = [
    { category: "Birds Sold", quantity: stats.birdsSold, fill: "hsl(var(--chart-1))" },
    { category: "Egg Crates", quantity: stats.eggsSold, fill: "hsl(var(--chart-2))" },
  ]

  const exportToCSV = (type: string) => {
    let csvContent = ""
    let filename = ""

    switch (type) {
      case "bird-sales":
        csvContent =
          "Date,Buyer,Quantity,Price Per Bird,Total Amount,Notes\n" +
          filteredData.birdSales
            .map((s) => `${s.date},${s.buyer},${s.quantity},${s.pricePerBird},${s.totalAmount},"${s.notes || ""}"`)
            .join("\n")
        filename = "bird-sales-report.csv"
        break
      case "egg-sales":
        csvContent =
          "Date,Buyer,Quantity,Price Per Crate,Total Amount,Notes\n" +
          filteredData.eggSales
            .map((s) => `${s.date},${s.buyer},${s.quantity},${s.pricePerCrate},${s.totalAmount},"${s.notes || ""}"`)
            .join("\n")
        filename = "egg-sales-report.csv"
        break
      case "mortality":
        csvContent =
          "Date,Quantity,Cause,Notes\n" +
          filteredData.mortality.map((m) => `${m.date},${m.quantity},${m.cause},"${m.notes || ""}"`).join("\n")
        filename = "mortality-report.csv"
        break
      case "purchases":
        csvContent =
          "Date,Item,Supplier,Quantity,Unit Price,Total Amount,Notes\n" +
          filteredData.purchases
            .map(
              (p) =>
                `${p.date},${p.item},${p.supplier},${p.quantity},${p.unitPrice},${p.totalAmount},"${p.notes || ""}"`,
            )
            .join("\n")
        filename = "purchases-report.csv"
        break
      case "summary":
        csvContent = `Financial Summary Report
Date Range: ${dateRange.start} to ${dateRange.end}

Revenue
Bird Sales Revenue,$${stats.birdRevenue.toFixed(2)}
Egg Sales Revenue,$${stats.eggRevenue.toFixed(2)}
Total Revenue,$${stats.totalRevenue.toFixed(2)}

Expenses
Total Purchases,$${stats.totalExpenses.toFixed(2)}

Net Profit,$${netProfit.toFixed(2)}

Operations
Birds Sold,${stats.birdsSold}
Egg Crates Sold,${stats.eggsSold}
Total Mortality,${stats.totalMortality}
`
        filename = "summary-report.csv"
        break
    }

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
        <p className="text-muted-foreground">View comprehensive farm performance reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Date Range Filter
          </CardTitle>
          <CardDescription>Select a date range to filter all reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-chart-1" />
              <div className="text-2xl font-bold text-chart-1">${stats.totalRevenue.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <div className="text-2xl font-bold text-destructive">${stats.totalExpenses.toFixed(2)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                ${netProfit.toFixed(2)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Mortality Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMortality}</div>
            <p className="text-xs text-muted-foreground mt-1">birds in period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Distribution of revenue sources</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                birdSales: { label: "Bird Sales", color: "hsl(var(--chart-1))" },
                eggSales: { label: "Egg Sales", color: "hsl(var(--chart-2))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={revenueChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {revenueChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sales Volume Comparison</CardTitle>
            <CardDescription>Quantity of birds vs egg crates sold</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                quantity: { label: "Quantity", color: "hsl(var(--chart-1))" },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantity" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {monthlyTrends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Financial Trends</CardTitle>
            <CardDescription>Revenue, expenses, and profit over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                expenses: { label: "Expenses", color: "hsl(var(--chart-3))" },
                profit: { label: "Profit", color: "hsl(var(--chart-2))" },
              }}
              className="h-[400px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="bird-sales">Bird Sales</TabsTrigger>
          <TabsTrigger value="egg-sales">Egg Sales</TabsTrigger>
          <TabsTrigger value="mortality">Mortality</TabsTrigger>
          <TabsTrigger value="purchases">Purchases</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>Overview of revenue, expenses, and profit</CardDescription>
              </div>
              <Button onClick={() => exportToCSV("summary")} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Revenue Breakdown</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Bird Sales</span>
                    <span className="font-bold text-chart-1">${stats.birdRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                    <span>Egg Sales</span>
                    <span className="font-bold text-chart-2">${stats.eggRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-semibold">Total Revenue</span>
                    <span className="font-bold text-primary text-lg">${stats.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Operations Summary</h3>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Birds Sold</div>
                    <div className="text-2xl font-bold">{stats.birdsSold}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Egg Crates Sold</div>
                    <div className="text-2xl font-bold">{stats.eggsSold}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Mortality</div>
                    <div className="text-2xl font-bold text-destructive">{stats.totalMortality}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bird-sales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Bird Sales Report</CardTitle>
                <CardDescription>{filteredData.birdSales.length} transactions in selected period</CardDescription>
              </div>
              <Button onClick={() => exportToCSV("bird-sales")} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Birds Sold</div>
                    <div className="text-2xl font-bold">{stats.birdsSold}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-2xl font-bold text-chart-1">${stats.birdRevenue.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Average Price/Bird</div>
                    <div className="text-2xl font-bold">
                      ${stats.birdsSold > 0 ? (stats.birdRevenue / stats.birdsSold).toFixed(2) : "0.00"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="egg-sales">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Egg Sales Report</CardTitle>
                <CardDescription>{filteredData.eggSales.length} transactions in selected period</CardDescription>
              </div>
              <Button onClick={() => exportToCSV("egg-sales")} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Crates Sold</div>
                    <div className="text-2xl font-bold">{stats.eggsSold}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                    <div className="text-2xl font-bold text-chart-2">${stats.eggRevenue.toFixed(2)}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Average Price/Crate</div>
                    <div className="text-2xl font-bold">
                      ${stats.eggsSold > 0 ? (stats.eggRevenue / stats.eggsSold).toFixed(2) : "0.00"}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mortality">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Mortality Report</CardTitle>
                <CardDescription>{filteredData.mortality.length} incidents in selected period</CardDescription>
              </div>
              <Button onClick={() => exportToCSV("mortality")} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Incidents</div>
                    <div className="text-2xl font-bold">{filteredData.mortality.length}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Mortality</div>
                    <div className="text-2xl font-bold text-destructive">{stats.totalMortality}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Purchases Report</CardTitle>
                <CardDescription>{filteredData.purchases.length} purchases in selected period</CardDescription>
              </div>
              <Button onClick={() => exportToCSV("purchases")} variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Purchases</div>
                    <div className="text-2xl font-bold">{filteredData.purchases.length}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Spent</div>
                    <div className="text-2xl font-bold text-destructive">${stats.totalExpenses.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
