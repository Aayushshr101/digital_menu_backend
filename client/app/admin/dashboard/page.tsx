"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, BarChartHorizontal, LineChart, PieChart } from "@/components/ui/chart"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart as RechartsLineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

// Dummy data for daily revenue
const dailyRevenueData = [
  { name: "Mon", revenue: 420 },
  { name: "Tue", revenue: 380 },
  { name: "Wed", revenue: 510 },
  { name: "Thu", revenue: 470 },
  { name: "Fri", revenue: 650 },
  { name: "Sat", revenue: 780 },
  { name: "Sun", revenue: 720 },
]

// Dummy data for most sold items
const mostSoldItemsData = [
  { name: "Beef Burger", value: 124 },
  { name: "Margherita Pizza", value: 98 },
  { name: "Pasta Carbonara", value: 82 },
  { name: "Garlic Bread", value: 76 },
  { name: "Soft Drink", value: 65 },
]

// Dummy data for monthly revenue
const monthlyRevenueData = [
  { name: "Jan", revenue: 4200 },
  { name: "Feb", revenue: 3800 },
  { name: "Mar", revenue: 5100 },
  { name: "Apr", revenue: 4700 },
  { name: "May", revenue: 6500 },
  { name: "Jun", revenue: 7800 },
  { name: "Jul", revenue: 7200 },
  { name: "Aug", revenue: 6900 },
  { name: "Sep", revenue: 5800 },
  { name: "Oct", revenue: 5200 },
  { name: "Nov", revenue: 4800 },
  { name: "Dec", revenue: 6100 },
]

// Dummy data for revenue by category
const revenueByCategoryData = [
  { name: "Main Courses", value: 12500 },
  { name: "Starters", value: 4800 },
  { name: "Desserts", value: 3200 },
  { name: "Drinks", value: 5500 },
]

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your restaurant's performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs19.25</div>
            <p className="text-xs text-muted-foreground">+4.3% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6/8</div>
            <p className="text-xs text-muted-foreground">75% occupancy rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Revenue</CardTitle>
                <CardDescription>Revenue for the past 7 days</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={dailyRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`Rs${value}`, "Revenue"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </LineChart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Most Sold Items</CardTitle>
                <CardDescription>Top 5 items by quantity sold</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChartHorizontal>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      layout="vertical"
                      data={mostSoldItemsData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                        {mostSoldItemsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </BarChartHorizontal>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="weekly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Revenue</CardTitle>
                <CardDescription>Revenue for the past 4 weeks</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { name: "Week 1", revenue: 2800 },
                        { name: "Week 2", revenue: 3200 },
                        { name: "Week 3", revenue: 2900 },
                        { name: "Week 4", revenue: 3500 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`Rs${value}`, "Revenue"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="revenue" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </BarChart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Distribution of revenue by menu category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <PieChart>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueByCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`Rs${value}`, "Revenue"]} />
                      <Legend />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </PieChart>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="monthly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue for the past 12 months</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <LineChart>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={monthlyRevenueData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`Rs${value}`, "Revenue"]}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </LineChart>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Year-over-Year Growth</CardTitle>
                <CardDescription>Comparing current year with previous year</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <BarChart>
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { name: "Q1", current: 12500, previous: 10200 },
                        { name: "Q2", current: 15800, previous: 12800 },
                        { name: "Q3", current: 19900, previous: 15600 },
                        { name: "Q4", current: 17800, previous: 14500 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="previous" name="Previous Year" fill="#8884d8" />
                      <Bar dataKey="current" name="Current Year" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </BarChart>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

