"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { BarChart3, Coffee, LayoutDashboard, LogOut, Menu, ShoppingBag, Table2, User, X, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { authApi } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"
// Update the imports to include our new loading component
import AdminLoading from "./loading"

// Skip authentication for login page
const publicPaths = ["/admin/login"]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  // Update the state management section to include a loading state
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<{ name: string; username: string; role: string } | null>(null)

  // Check if the current path is public
  const isPublicPath = publicPaths.includes(pathname)

  // Auth check using the backend API
  useEffect(() => {
    setIsMounted(true)

    // Skip auth check for public paths
    if (isPublicPath) {
      setIsLoading(false)
      return
    }

    const checkAuth = async () => {
      try {
        // Use the real API to check authentication
        const { user } = await authApi.getCurrentUser()
        setUser(user)
        // Authentication successful
        setIsLoading(false)
      } catch (error) {
        // If there's an error, redirect to login
        console.error("Authentication failed:", error)
        toast({
          title: "Authentication Required",
          description: "Please log in to access the admin area",
          variant: "destructive",
        })
        router.push("/admin/login")
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [isPublicPath, router, pathname, toast])

  // Handle logout
  const handleLogout = async () => {
    try {
      // Use the real logout API
      await authApi.logout()

      // Clear user state
      setUser(null)

      // Show success message
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      })

      // Redirect to login page after logout
      router.push("/admin/login")
    } catch (error) {
      console.error("Logout failed:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
      // Still redirect to login even if logout fails
      router.push("/admin/login")
    }
  }

  // Update the rendering logic to handle loading state
  // Don't render anything until we've checked auth
  if (!isMounted) return null

  // If it's a public path, just render the children
  if (isPublicPath) {
    return children
  }

  // Show loading screen while checking authentication
  if (isLoading) {
    return <AdminLoading />
  }

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Categories", href: "/admin/categories", icon: Tag },
    { name: "Menu Items", href: "/admin/menu", icon: Coffee },
    { name: "Tables", href: "/admin/tables", icon: Table2 },
    { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:max-w-sm">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
                    <BarChart3 className="h-6 w-6" />
                    <span>FoodEase Admin</span>
                  </Link>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="flex flex-col gap-4 p-4">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                        pathname === item.href
                          ? "bg-muted text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-primary"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  ))}
                  <Button variant="ghost" className="justify-start px-3" onClick={handleLogout}>
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
              <BarChart3 className="h-6 w-6" />
              <span className="hidden md:inline-block">FoodEase Admin</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium ${
                    pathname === item.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <div className="hidden md:block text-sm font-medium">{user?.name || "Admin User"}</div>
              <Button variant="ghost" size="icon" className="rounded-full">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium ${
                  pathname === item.href
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-primary"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            <Button variant="ghost" className="justify-start px-3 mt-auto" onClick={handleLogout}>
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </Button>
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

