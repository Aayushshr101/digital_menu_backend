"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { tableApi, type Table } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function TablesPage() {
  const { toast } = useToast()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTables = async () => {
      setIsLoading(true)
      try {
        const { tables } = await tableApi.getAllTables()

        // Sort tables by table number
        const sortedTables = [...tables].sort((a, b) => a.table_number - b.table_number)

        setTables(sortedTables)
      } catch (error) {
        console.error("Failed to fetch tables:", error)
        toast({
          title: "Error",
          description: "Failed to load tables. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTables()
  }, [toast])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <span className="font-bold text-xl">FoodEase</span>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="outline" size="sm" className="mr-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Select a Table</h1>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>Loading tables...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <p className="text-muted-foreground">No tables available. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {tables.map((table) => (
              <Link
                key={table._id}
                href={table.status === "available" ? `/menu?table=${table._id}` : "#"}
                className={table.status !== "available" ? "pointer-events-none" : ""}
              >
                <Card
                  className={`cursor-pointer hover:shadow-md transition-shadow ${table.status !== "available" ? "opacity-50" : ""}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle>Table {table.table_number}</CardTitle>
                    <CardDescription>{table.capacity} seats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        table.status === "available"
                          ? "bg-green-100 text-green-800"
                          : table.status === "occupied"
                            ? "bg-red-100 text-red-800"
                            : table.status === "reserved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 FoodEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

