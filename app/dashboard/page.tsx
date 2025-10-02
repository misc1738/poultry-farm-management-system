"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bird, Egg, Activity, Package, AlertTriangle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface DashboardStats {
  totalFlocks: number
  totalBirds: number
  activeFlocks: number
  totalFeedKg: number
  weeklyEggs: number
  weeklyMortality: number
  recentHealthIssues: number
  lowFeedItems: number
}

interface ProductionData {
  date: string
  eggs: number
  mortality: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFlocks: 0,
    totalBirds: 0,
    activeFlocks: 0,
    totalFeedKg: 0,
    weeklyEggs: 0,
    weeklyMortality: 0,
    recentHealthIssues: 0,
    lowFeedItems: 0,
  })
  const [productionData, setProductionData] = useState<ProductionData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      const supabase = createClient()

      try {
        // Fetch flocks data
        const { data: flocks } = await supabase.from("flocks").select("*")

        // Fetch birds data
        const { data: birds } = await supabase.from("birds").select("*")

        // Fetch feed inventory
        const { data: feedInventory } = await supabase.from("feed_inventory").select("*")

        // Fetch recent production records (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: productionRecords } = await supabase
          .from("production_records")
          .select("*")
          .gte("record_date", sevenDaysAgo.toISOString().split("T")[0])
          .order("record_date", { ascending: true })

        // Fetch recent health records (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        const { data: healthRecords } = await supabase
          .from("health_records")
          .select("*")
          .gte("record_date", thirtyDaysAgo.toISOString().split("T")[0])

        // Calculate stats
        const activeFlocks = flocks?.filter((f) => f.status === "active") || []
        const totalBirds = flocks?.reduce((sum, f) => sum + (f.quantity || 0), 0) || 0
        const totalFeed = feedInventory?.reduce((sum, f) => sum + (f.quantity_kg || 0), 0) || 0
        const weeklyEggs = productionRecords?.reduce((sum, r) => sum + (r.eggs_collected || 0), 0) || 0
        const weeklyMortality = productionRecords?.reduce((sum, r) => sum + (r.mortality_count || 0), 0) || 0
        const lowFeedItems = feedInventory?.filter((f) => f.quantity_kg < 100).length || 0

        setStats({
          totalFlocks: flocks?.length || 0,
          totalBirds,
          activeFlocks: activeFlocks.length,
          totalFeedKg: totalFeed,
          weeklyEggs,
          weeklyMortality,
          recentHealthIssues: healthRecords?.length || 0,
          lowFeedItems,
        })

        // Format production data for charts
        const chartData =
          productionRecords?.map((record) => ({
            date: new Date(record.record_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            eggs: record.eggs_collected || 0,
            mortality: record.mortality_count || 0,
          })) || []

        setProductionData(chartData)
      } catch (error) {
        console.error("[v0] Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: "Total Flocks",
      value: stats.totalFlocks,
      subtitle: `${stats.activeFlocks} active`,
      icon: Bird,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Birds",
      value: stats.totalBirds.toLocaleString(),
      subtitle: "Across all flocks",
      icon: Bird,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
    },
    {
      title: "Weekly Egg Production",
      value: stats.weeklyEggs.toLocaleString(),
      subtitle: "Last 7 days",
      icon: Egg,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      title: "Feed Inventory",
      value: `${stats.totalFeedKg.toFixed(0)} kg`,
      subtitle: stats.lowFeedItems > 0 ? `${stats.lowFeedItems} items low` : "Stock healthy",
      icon: Package,
      color: stats.lowFeedItems > 0 ? "text-destructive" : "text-chart-1",
      bgColor: stats.lowFeedItems > 0 ? "bg-destructive/10" : "bg-chart-1/10",
    },
  ]

  const alertCards = [
    {
      title: "Weekly Mortality",
      value: stats.weeklyMortality,
      subtitle: "Last 7 days",
      icon: AlertTriangle,
      color: stats.weeklyMortality > 10 ? "text-destructive" : "text-muted-foreground",
      bgColor: stats.weeklyMortality > 10 ? "bg-destructive/10" : "bg-muted/10",
    },
    {
      title: "Health Records",
      value: stats.recentHealthIssues,
      subtitle: "Last 30 days",
      icon: Activity,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-48 mb-2"></div>
          <div className="h-4 bg-muted rounded w-64"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-balance">Farm Dashboard</h1>
        <p className="text-muted-foreground">Overview of your poultry farm operations</p>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Alert Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {alertCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Production Charts */}
      {productionData.length > 0 && (
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
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={productionData}>
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
              <CardTitle>Mortality Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  mortality: {
                    label: "Mortality Count",
                    color: "hsl(var(--destructive))",
                  },
                }}
                className="h-[200px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="mortality" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
