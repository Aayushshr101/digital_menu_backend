"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { CheckCircle, ArrowLeft, Home } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { tableApi, type Table } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function OrderConfirmationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const tableId = searchParams.get("table") || ""

  const [table, setTable] = useState<Table | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTable = async () => {
      if (!tableId) {
        router.push("/tables")
        return
      }

      setIsLoading(true)
      try {
        const { table } = await tableApi.getTable(tableId)
        setTable(table)
      } catch (error) {
        console.error("Failed to fetch table:", error)
        toast({
          title: "Error",
          description: "Failed to load table information.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTable()
  }, [tableId, router, toast])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

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
      <main className="flex-1 container py-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>Your order has been placed successfully for Table {table?.table_number}.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Your order is being prepared. Please wait at your table and our staff will serve you shortly.
            </p>
            <p className="text-sm text-muted-foreground">
              Order number:{" "}
              {table?.current_order && typeof table.current_order !== "string"
                ? table.current_order.order_number
                : "Processing"}
            </p>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/tables">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Tables
              </Link>
            </Button>
            <Button asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" /> Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
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

