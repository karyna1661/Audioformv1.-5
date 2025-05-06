"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { calculateMetrics } from "@/app/actions/analytics"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily")
  const [metrics, setMetrics] = useState<any[]>([])
  const [funnelData, setFunnelData] = useState<any[]>([])
  const [conversionRate, setConversionRate] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalyticsData(timeframe)
  }, [timeframe])

  const fetchAnalyticsData = async (period: "daily" | "weekly" | "monthly") => {
    setLoading(true)
    try {
      // Calculate metrics first
      await calculateMetrics(period)

      // Fetch metrics
      const { data: metricsData } = await supabase
        .from("analytics_metrics")
        .select("*")
        .eq("time_period", period)
        .order("created_at", { ascending: false })
        .limit(10)

      if (metricsData) {
        setMetrics(metricsData)

        // Find conversion rate
        const conversionRateMetric = metricsData.find((m) => m.metric_name === "conversion_rate")
        if (conversionRateMetric) {
          setConversionRate(conversionRateMetric.metric_value)
        }
      }

      // Fetch funnel data
      const { data: funnelSteps } = await supabase.rpc("get_funnel_conversion_rates", {
        funnel_name: "Demo to Waitlist Conversion",
        time_period_days: period === "daily" ? 1 : period === "weekly" ? 7 : 30,
      })

      if (funnelSteps) {
        setFunnelData(funnelSteps)
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for charts
  const funnelChartData = funnelData.map((step) => ({
    name: step.step_name.replace(/_/g, " ").replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value: step.count,
  }))

  const conversionChartData = [
    { name: "Converted", value: conversionRate },
    { name: "Not Converted", value: 100 - conversionRate },
  ]

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B"]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)}>
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Demo Surveys Created</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">
                {metrics.find((m) => m.metric_name === "demo_count")?.metric_value || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {timeframe === "daily"
                  ? "In the last 24 hours"
                  : timeframe === "weekly"
                    ? "In the last 7 days"
                    : "In the last 30 days"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Waitlist Signups</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">
                {metrics.find((m) => m.metric_name === "waitlist_count")?.metric_value || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                {timeframe === "daily"
                  ? "In the last 24 hours"
                  : timeframe === "weekly"
                    ? "In the last 7 days"
                    : "In the last 30 days"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold">{conversionRate.toFixed(1)}%</div>
              <p className="text-sm text-muted-foreground">Demo to Waitlist conversion</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelChartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" name="Users" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={conversionChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {conversionChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Button onClick={() => fetchAnalyticsData(timeframe)}>Refresh Data</Button>
      </div>
    </div>
  )
}
