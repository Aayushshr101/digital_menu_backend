"use client"

import { DialogFooter } from "@/components/ui/dialog"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  categoryApi,
  menuApi,
  tableApi,
  orderApi,
  type Category,
  type MenuItem,
  type Table,
  type OrderInput,
} from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function MenuPage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const tableId = searchParams.get("table") || ""

  const [table, setTable] = useState<Table | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)
  const [cart, setCart] = useState<
    {
      id: string
      itemId: string
      name: string
      price: number
      quantity: number
      customOptions?: Record<string, { name: string; price: number }>
    }[]
  >([])

  const [isCustomizeDialogOpen, setIsCustomizeDialogOpen] = useState(false)
  const [currentCustomizeItem, setCurrentCustomizeItem] = useState<MenuItem | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, { name: string; price: number }>>({})
  const [customizationPrice, setCustomizationPrice] = useState(0)

  // Fetch table, categories, and menu items on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Validate table ID
        if (!tableId) {
          toast({
            title: "Error",
            description: "No table selected. Please select a table first.",
            variant: "destructive",
          })
          router.push("/tables")
          return
        }

        // Fetch table
        const { table } = await tableApi.getTable(tableId)

        // Check if table is available
        if (table.status !== "available") {
          toast({
            title: "Table Unavailable",
            description: `Table ${table.table_number} is currently ${table.status}. Please select another table.`,
            variant: "destructive",
          })
          router.push("/tables")
          return
        }

        setTable(table)

        // Fetch categories
        const { categories } = await categoryApi.getAllCategories()

        // Sort categories by display_order
        const sortedCategories = [...categories].sort((a, b) => {
          if (a.display_order !== undefined && b.display_order !== undefined) {
            return a.display_order - b.display_order
          }
          return 0
        })

        setCategories(sortedCategories)

        // Fetch menu items
        const { menuItems } = await menuApi.getAllItems()

        // Group items by category
        const groupedItems: Record<string, MenuItem[]> = {}
        const uncategorizedId = "uncategorized"

        menuItems.forEach((item) => {
          // Skip unavailable items
          if (item.is_available === false) return

          if (!item.category) {
            // Handle items with null category
            if (!groupedItems[uncategorizedId]) {
              groupedItems[uncategorizedId] = []
            }
            groupedItems[uncategorizedId].push({
              ...item,
              category: {
                _id: uncategorizedId,
                name: "Uncategorized",
              },
            })
          } else {
            // Handle items with valid category
            const categoryId = item.category._id
            if (!groupedItems[categoryId]) {
              groupedItems[categoryId] = []
            }
            groupedItems[categoryId].push(item)
          }
        })

        setMenuItems(groupedItems)
      } catch (error) {
        console.error("Failed to fetch data:", error)
        toast({
          title: "Error",
          description: "Failed to load menu data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [tableId, toast, router])

  const openCustomizeDialog = (item: MenuItem) => {
    setCurrentCustomizeItem(item)
    setSelectedOptions({})
    setCustomizationPrice(0)
    setIsCustomizeDialogOpen(true)
  }

  const addToCart = (
    item: MenuItem,
    customOptions?: Record<string, { name: string; price: number }>,
    additionalPrice = 0,
  ) => {
    setCart((prev) => {
      const cartItemId = customOptions ? `${item._id}-${JSON.stringify(customOptions)}` : item._id
      const existingItemIndex = prev.findIndex((cartItem) => cartItem.id === cartItemId)

      if (existingItemIndex >= 0) {
        // Item with same customizations exists, update quantity
        const updatedCart = [...prev]
        updatedCart[existingItemIndex].quantity += 1
        return updatedCart
      } else {
        // Add new item with customizations
        return [
          ...prev,
          {
            id: cartItemId,
            itemId: item._id,
            name: item.name,
            price: item.price + additionalPrice,
            quantity: 1,
            customOptions: customOptions || {},
          },
        ]
      }
    })
  }

  const handleOptionSelect = (groupName: string, option: { name: string; price_addition: number }) => {
    setSelectedOptions((prev) => {
      const newOptions = {
        ...prev,
        [groupName]: {
          name: option.name,
          price: option.price_addition,
        },
      }

      // Recalculate total customization price
      let totalCustomPrice = 0
      Object.values(newOptions).forEach((option) => {
        totalCustomPrice += option.price
      })

      setCustomizationPrice(totalCustomPrice)
      return newOptions
    })
  }

  const addCustomizedItemToCart = () => {
    if (!currentCustomizeItem) return

    addToCart(currentCustomizeItem, selectedOptions, customizationPrice)
    setIsCustomizeDialogOpen(false)
  }

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === cartItemId)
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((item) => (item.id === cartItemId ? { ...item, quantity: item.quantity - 1 } : item))
      } else {
        return prev.filter((item) => item.id !== cartItemId)
      }
    })
  }

  const placeOrder = async () => {
    if (!table || cart.length === 0) return

    setIsPlacingOrder(true)
    try {
      // Prepare order items with customizations
      const orderItems = cart.map((item) => {
        // Convert customOptions from Record to array of objects with option_name, selection, and price_addition
        const customizations = Object.entries(item.customOptions || {}).map(([group, option]) => ({
          option_name: group,
          selection: option.name,
          price_addition: option.price,
        }))

        return {
          item: item.itemId,
          quantity: item.quantity,
          price: item.price,
          customizations: customizations,
        }
      })

      // Calculate total amount
      const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Create order input
      const orderInput: OrderInput = {
        table: table._id,
        items: orderItems,
        total_amount: totalAmount,
      }

      console.log("Sending order:", orderInput)

      // Place order
      const { order } = await orderApi.createOrder(orderInput)

      // Show success message
      toast({
        title: "Order Placed",
        description: "Your order has been placed successfully!",
      })

      // Clear cart
      setCart([])

      // Redirect directly to order details page
      router.push(`/order/${order._id}`)
    } catch (error) {
      console.error("Failed to place order:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPlacingOrder(false)
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <p>Loading menu...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/tables">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <span className="font-bold text-xl ml-2">FoodEase</span>
          </div>
          <div className="flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Your Order
                  {totalItems > 0 && <Badge className="absolute -top-2 -right-2">{totalItems}</Badge>}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Your Order - Table {table?.table_number}</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground">Your cart is empty</p>
                  ) : (
                    <>
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Rs{item.price.toFixed(2)} x {item.quantity}
                            </p>
                            {Object.keys(item.customOptions || {}).length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {Object.entries(item.customOptions || {}).map(([group, option]) => (
                                  <div key={group}>
                                    {group}: {option.name} {option.price > 0 && `(+Rs${option.price.toFixed(2)})`}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center">
                            <Button variant="outline" size="icon" onClick={() => removeFromCart(item.id)}>
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => {
                                // Find the original menu item
                                const menuItem = Object.values(menuItems)
                                  .flat()
                                  .find((mi) => mi._id === item.itemId)

                                if (menuItem) {
                                  if (item.customOptions && Object.keys(item.customOptions).length > 0) {
                                    // For customized items, just increment quantity
                                    addToCart(menuItem, item.customOptions, item.price - menuItem.price)
                                  } else {
                                    // For regular items
                                    addToCart(menuItem)
                                  }
                                }
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Separator />
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>Rs{totalPrice.toFixed(2)}</span>
                      </div>
                      <Button className="w-full" onClick={placeOrder} disabled={isPlacingOrder}>
                        {isPlacingOrder ? "Placing Order..." : "Place Order"}
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1 container py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Menu - Table {table?.table_number}</h1>
          <p className="text-muted-foreground">Browse our menu and add items to your order</p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center p-8 border rounded-md">
            <p className="text-muted-foreground">No menu categories available.</p>
          </div>
        ) : (
          <Tabs defaultValue={categories.length > 0 ? categories[0]?._id : "uncategorized"}>
            <TabsList className="mb-4 flex w-full overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger key={category._id} value={category._id} className="flex-1">
                  {category.name}
                </TabsTrigger>
              ))}
              {menuItems["uncategorized"] && menuItems["uncategorized"].length > 0 && (
                <TabsTrigger key="uncategorized" value="uncategorized" className="flex-1">
                  Other Items
                </TabsTrigger>
              )}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category._id} value={category._id} className="space-y-4">
                {!menuItems[category._id] || menuItems[category._id].length === 0 ? (
                  <div className="text-center p-8 border rounded-md">
                    <p className="text-muted-foreground">No items in this category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menuItems[category._id]?.map((item) => (
                      <Card key={item._id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{item.name}</CardTitle>
                              <CardDescription className="mt-1">{item.description}</CardDescription>
                            </div>
                            <Image
                              src={item.image_url || "/placeholder.svg?height=100&width=100"}
                              alt={item.name}
                              width={80}
                              height={80}
                              className="rounded-md object-cover"
                            />
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="font-bold">Rs{item.price.toFixed(2)}</p>
                          {item.is_available === false && (
                            <p className="text-sm text-red-500 mt-1">Currently unavailable</p>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button
                            onClick={() => {
                              if (item.customization_options && item.customization_options.length > 0) {
                                openCustomizeDialog(item)
                              } else {
                                addToCart(item)
                              }
                            }}
                            className="w-full"
                            disabled={item.is_available === false}
                          >
                            <Plus className="mr-2 h-4 w-4" /> Add to Order
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            ))}

            {menuItems["uncategorized"] && menuItems["uncategorized"].length > 0 && (
              <TabsContent key="uncategorized" value="uncategorized" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuItems["uncategorized"]?.map((item) => (
                    <Card key={item._id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{item.name}</CardTitle>
                            <CardDescription className="mt-1">{item.description}</CardDescription>
                          </div>
                          <Image
                            src={item.image_url || "/placeholder.svg?height=100&width=100"}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="rounded-md object-cover"
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="font-bold">Rs{item.price.toFixed(2)}</p>
                        {item.is_available === false && (
                          <p className="text-sm text-red-500 mt-1">Currently unavailable</p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Button
                          onClick={() => {
                            if (item.customization_options && item.customization_options.length > 0) {
                              openCustomizeDialog(item)
                            } else {
                              addToCart(item)
                            }
                          }}
                          className="w-full"
                          disabled={item.is_available === false}
                        >
                          <Plus className="mr-2 h-4 w-4" /> Add to Order
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}
          </Tabs>
        )}
      </main>
      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2024 FoodEase. All rights reserved.
          </p>
        </div>
      </footer>
      <Dialog open={isCustomizeDialogOpen} onOpenChange={setIsCustomizeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Your Order</DialogTitle>
            <DialogDescription>{currentCustomizeItem?.name}</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            {/* Display base price and current total at the top */}
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-muted-foreground">Base price:</span>
              <span>Rs{currentCustomizeItem?.price.toFixed(2)}</span>
            </div>

            {currentCustomizeItem?.customization_options?.map((group, groupIndex) => (
              <div key={groupIndex} className="space-y-2">
                <h3 className="font-medium">{group.name}</h3>
                <div className="grid gap-2">
                  {group.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id={`option-${groupIndex}-${optionIndex}`}
                          name={`group-${groupIndex}`}
                          checked={selectedOptions[group.name]?.name === option.name}
                          onChange={() => handleOptionSelect(group.name, option)}
                          className="h-4 w-4 rounded-full"
                        />
                        <label htmlFor={`option-${groupIndex}-${optionIndex}`} className="text-sm">
                          {option.name}
                        </label>
                      </div>
                      {option.price_addition > 0 && (
                        <span className="text-sm text-muted-foreground">+Rs{option.price_addition.toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Display the current total price prominently */}
            <div className="mt-4 pt-4 border-t">
              {customizationPrice > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Additional cost:</span>
                  <span>Rs{customizationPrice.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg mt-1">
                <span>Total price:</span>
                <span>Rs{((currentCustomizeItem?.price || 0) + customizationPrice).toFixed(2)}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomizeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addCustomizedItemToCart}>Add to Order</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

