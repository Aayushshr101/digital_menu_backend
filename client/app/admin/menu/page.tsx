"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Edit, MoreHorizontal, Plus, Trash, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { menuApi, categoryApi, type MenuItem, type MenuItemInput, type Category } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function AdminMenuPage() {
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<Record<string, MenuItem[]>>({})
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentItem, setCurrentItem] = useState<(MenuItem & { imageFile?: File }) | null>(null)
  const [newItem, setNewItem] = useState<Partial<MenuItemInput> & { imageFile?: File }>({
    name: "",
    description: "",
    price: 0,
    category: "",
    image_url: "",
    is_available: true,
    customization_options: [],
    imageFile: undefined,
  })

  // Fetch menu items and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch categories first
        const { categories } = await categoryApi.getAllCategories()

        // Sort categories by display_order if available
        const sortedCategories = [...categories].sort((a, b) => {
          if (a.display_order !== undefined && b.display_order !== undefined) {
            return a.display_order - b.display_order
          }
          return 0
        })

        setCategories(sortedCategories)

        // Then fetch menu items
        await fetchMenuItems()
      } catch (error) {
        console.error("Failed to fetch initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load initial data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Fetch all menu items from the API
  const fetchMenuItems = async () => {
    try {
      const { menuItems } = await menuApi.getAllItems()

      // Group items by category
      const groupedItems: Record<string, MenuItem[]> = {}

      // Create an "Uncategorized" section for items with null category
      const uncategorizedId = "uncategorized"

      menuItems.forEach((item) => {
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
      console.error("Failed to fetch menu items:", error)
      toast({
        title: "Error",
        description: "Failed to load menu items. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Add a new customization option to the new item
  const addCustomizationOption = () => {
    setNewItem({
      ...newItem,
      customization_options: [
        ...(newItem.customization_options || []),
        {
          name: "",
          options: [{ name: "", price_addition: 0 }],
        },
      ],
    })
  }

  // Remove a customization option from the new item
  const removeCustomizationOption = (index: number) => {
    const updatedOptions = [...(newItem.customization_options || [])]
    updatedOptions.splice(index, 1)
    setNewItem({
      ...newItem,
      customization_options: updatedOptions,
    })
  }

  // Add a new option to a customization option
  const addOption = (customizationIndex: number) => {
    const updatedCustomizations = [...(newItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options.push({
      name: "",
      price_addition: 0,
    })
    setNewItem({
      ...newItem,
      customization_options: updatedCustomizations,
    })
  }

  // Remove an option from a customization option
  const removeOption = (customizationIndex: number, optionIndex: number) => {
    const updatedCustomizations = [...(newItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options.splice(optionIndex, 1)
    setNewItem({
      ...newItem,
      customization_options: updatedCustomizations,
    })
  }

  // Update customization option name
  const updateCustomizationName = (index: number, name: string) => {
    const updatedCustomizations = [...(newItem.customization_options || [])]
    updatedCustomizations[index].name = name
    setNewItem({
      ...newItem,
      customization_options: updatedCustomizations,
    })
  }

  // Update option name
  const updateOptionName = (customizationIndex: number, optionIndex: number, name: string) => {
    const updatedCustomizations = [...(newItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options[optionIndex].name = name
    setNewItem({
      ...newItem,
      customization_options: updatedCustomizations,
    })
  }

  // Update option price addition
  const updateOptionPrice = (customizationIndex: number, optionIndex: number, price: number) => {
    const updatedCustomizations = [...(newItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options[optionIndex].price_addition = price
    setNewItem({
      ...newItem,
      customization_options: updatedCustomizations,
    })
  }

  // Edit customization functions for current item
  const addEditCustomizationOption = () => {
    if (!currentItem) return
    setCurrentItem({
      ...currentItem,
      customization_options: [
        ...(currentItem.customization_options || []),
        {
          name: "",
          options: [{ name: "", price_addition: 0 }],
        },
      ],
    })
  }

  const removeEditCustomizationOption = (index: number) => {
    if (!currentItem) return
    const updatedOptions = [...(currentItem.customization_options || [])]
    updatedOptions.splice(index, 1)
    setCurrentItem({
      ...currentItem,
      customization_options: updatedOptions,
    })
  }

  const addEditOption = (customizationIndex: number) => {
    if (!currentItem) return
    const updatedCustomizations = [...(currentItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options.push({
      name: "",
      price_addition: 0,
    })
    setCurrentItem({
      ...currentItem,
      customization_options: updatedCustomizations,
    })
  }

  const removeEditOption = (customizationIndex: number, optionIndex: number) => {
    if (!currentItem) return
    const updatedCustomizations = [...(currentItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options.splice(optionIndex, 1)
    setCurrentItem({
      ...currentItem,
      customization_options: updatedCustomizations,
    })
  }

  const updateEditCustomizationName = (index: number, name: string) => {
    if (!currentItem) return
    const updatedCustomizations = [...(currentItem.customization_options || [])]
    updatedCustomizations[index].name = name
    setCurrentItem({
      ...currentItem,
      customization_options: updatedCustomizations,
    })
  }

  const updateEditOptionName = (customizationIndex: number, optionIndex: number, name: string) => {
    if (!currentItem) return
    const updatedCustomizations = [...(currentItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options[optionIndex].name = name
    setCurrentItem({
      ...currentItem,
      customization_options: updatedCustomizations,
    })
  }

  const updateEditOptionPrice = (customizationIndex: number, optionIndex: number, price: number) => {
    if (!currentItem) return
    const updatedCustomizations = [...(currentItem.customization_options || [])]
    updatedCustomizations[customizationIndex].options[optionIndex].price_addition = price
    setCurrentItem({
      ...currentItem,
      customization_options: updatedCustomizations,
    })
  }

  // Add a new menu item
  const handleAddItem = async () => {
    if (!newItem.name || !newItem.description || !newItem.category || !newItem.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate customization options
    if (newItem.customization_options && newItem.customization_options.length > 0) {
      for (const customization of newItem.customization_options) {
        if (!customization.name.trim()) {
          toast({
            title: "Validation Error",
            description: "All customization options must have a name",
            variant: "destructive",
          })
          return
        }

        for (const option of customization.options) {
          if (!option.name.trim()) {
            toast({
              title: "Validation Error",
              description: `All options in "${customization.name}" must have a name`,
              variant: "destructive",
            })
            return
          }
        }
      }
    }

    try {
      // Step 1: Create the menu item without the image
      const itemToAdd: MenuItemInput = {
        name: newItem.name,
        description: newItem.description,
        price: typeof newItem.price === "string" ? Number.parseFloat(newItem.price) : newItem.price,
        category: newItem.category,
        is_available: newItem.is_available,
        customization_options: newItem.customization_options,
      }

      const { menuItem } = await menuApi.createItem(itemToAdd)

      // Step 2: If there's an image file, upload it
      if (newItem.imageFile) {
        try {
          await menuApi.uploadImage(menuItem._id, newItem.imageFile)
          toast({
            title: "Success",
            description: "Menu item and image added successfully",
          })
        } catch (error) {
          console.error("Failed to upload image:", error)
          toast({
            title: "Warning",
            description: "Menu item created but image upload failed",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Menu item added successfully",
        })
      }

      // Refresh menu items
      fetchMenuItems()

      // Reset form and close dialog
      setNewItem({
        name: "",
        description: "",
        price: 0,
        category: "",
        image_url: "",
        is_available: true,
        customization_options: [],
        imageFile: undefined,
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add menu item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add menu item",
        variant: "destructive",
      })
    }
  }

  // Edit an existing menu item
  const handleEditItem = async () => {
    if (!currentItem) return

    // Validate customization options
    if (currentItem.customization_options && currentItem.customization_options.length > 0) {
      for (const customization of currentItem.customization_options) {
        if (!customization.name.trim()) {
          toast({
            title: "Validation Error",
            description: "All customization options must have a name",
            variant: "destructive",
          })
          return
        }

        for (const option of customization.options) {
          if (!option.name.trim()) {
            toast({
              title: "Validation Error",
              description: `All options in "${customization.name}" must have a name`,
              variant: "destructive",
            })
            return
          }
        }
      }
    }

    try {
      // Step 1: Update the menu item details
      const itemToUpdate: Partial<MenuItemInput> = {
        name: currentItem.name,
        description: currentItem.description,
        price:
          typeof currentItem.price === "string"
            ? Number.parseFloat(currentItem.price as unknown as string)
            : currentItem.price,
        category: typeof currentItem.category === "string" ? currentItem.category : currentItem.category._id,
        is_available: currentItem.is_available,
        customization_options: currentItem.customization_options,
      }

      await menuApi.updateItem(currentItem._id, itemToUpdate)

      // Step 2: If there's a new image file, upload it
      if (currentItem.imageFile) {
        try {
          await menuApi.uploadImage(currentItem._id, currentItem.imageFile)
          toast({
            title: "Success",
            description: "Menu item and image updated successfully",
          })
        } catch (error) {
          console.error("Failed to upload image:", error)
          toast({
            title: "Warning",
            description: "Menu item updated but image upload failed",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Success",
          description: "Menu item updated successfully",
        })
      }

      // Refresh menu items
      fetchMenuItems()

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update menu item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update menu item",
        variant: "destructive",
      })
    }
  }

  // Delete a menu item
  const handleDeleteItem = async () => {
    if (!currentItem) return

    try {
      await menuApi.deleteItem(currentItem._id)

      toast({
        title: "Success",
        description: "Menu item deleted successfully",
      })

      // Refresh menu items
      fetchMenuItems()

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete menu item:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete menu item",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (item: MenuItem) => {
    setCurrentItem(item)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (item: MenuItem) => {
    setCurrentItem(item)
    setIsDeleteDialogOpen(true)
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10000000) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 10MB",
          variant: "destructive",
        })
        return
      }

      setNewItem({ ...newItem, imageFile: file })

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setNewItem((prev) => ({ ...prev, image_url: event.target?.result as string }))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleEditImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentItem) return

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid File",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // Validate file size (10MB limit)
      if (file.size > 10000000) {
        toast({
          title: "File Too Large",
          description: "Image must be less than 10MB",
          variant: "destructive",
        })
        return
      }

      setCurrentItem({ ...currentItem, imageFile: file })

      // Create a preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result && currentItem) {
          setCurrentItem((prev) => (prev ? { ...prev, image_url: event.target?.result as string } : null))
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove menu items</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Menu Item</DialogTitle>
              <DialogDescription>Add a new item to your menu. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price (Rs)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex flex-col gap-2">
                  <Input id="image" type="file" accept="image/*" onChange={handleImageFileChange} />
                  {newItem.image_url && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Preview:</p>
                      <Image
                        src={newItem.image_url || "/placeholder.svg"}
                        alt="Preview"
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="is_available">Availability</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_available"
                    checked={newItem.is_available}
                    onCheckedChange={(checked) => setNewItem({ ...newItem, is_available: checked })}
                  />
                  <Label htmlFor="is_available" className="cursor-pointer">
                    {newItem.is_available ? "Available" : "Unavailable"}
                  </Label>
                </div>
              </div>

              {/* Customization Options Section */}
              <div className="border rounded-md p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Customization Options</h3>
                  <Button type="button" onClick={addCustomizationOption} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Option Group
                  </Button>
                </div>

                {newItem.customization_options && newItem.customization_options.length > 0 ? (
                  <div className="space-y-6">
                    {newItem.customization_options.map((customization, customizationIndex) => (
                      <div key={customizationIndex} className="border rounded-md p-3 bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex-1 mr-2">
                            <Label htmlFor={`customization-${customizationIndex}`}>Option Group Name</Label>
                            <Input
                              id={`customization-${customizationIndex}`}
                              value={customization.name}
                              onChange={(e) => updateCustomizationName(customizationIndex, e.target.value)}
                              placeholder="e.g. Size, Toppings, etc."
                              className="mt-1"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeCustomizationOption(customizationIndex)}
                            variant="ghost"
                            size="icon"
                            className="mt-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-3 space-y-3">
                          {customization.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-end gap-2">
                              <div className="flex-1">
                                <Label htmlFor={`option-name-${customizationIndex}-${optionIndex}`}>Option Name</Label>
                                <Input
                                  id={`option-name-${customizationIndex}-${optionIndex}`}
                                  value={option.name}
                                  onChange={(e) => updateOptionName(customizationIndex, optionIndex, e.target.value)}
                                  placeholder="e.g. Small, Extra Cheese, etc."
                                  className="mt-1"
                                />
                              </div>
                              <div className="w-24">
                                <Label htmlFor={`option-price-${customizationIndex}-${optionIndex}`}>Price (Rs)</Label>
                                <Input
                                  id={`option-price-${customizationIndex}-${optionIndex}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={option.price_addition}
                                  onChange={(e) =>
                                    updateOptionPrice(
                                      customizationIndex,
                                      optionIndex,
                                      Number.parseFloat(e.target.value),
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeOption(customizationIndex, optionIndex)}
                                variant="ghost"
                                size="icon"
                                className="mb-1"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          onClick={() => addOption(customizationIndex)}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No customization options added yet. Click the button above to add one.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddItem}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading menu items...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <p className="text-muted-foreground">No categories found. Please create categories first.</p>
          <Button variant="outline" className="mt-4" onClick={() => (window.location.href = "/admin/categories")}>
            Go to Category Management
          </Button>
        </div>
      ) : (
        <Tabs defaultValue={categories.length > 0 ? categories[0]?._id : "uncategorized"}>
          <TabsList className="mb-4">
            {categories.map((category) => (
              <TabsTrigger key={category._id} value={category._id}>
                {category.name}
              </TabsTrigger>
            ))}
            {menuItems["uncategorized"] && menuItems["uncategorized"].length > 0 && (
              <TabsTrigger key="uncategorized" value="uncategorized">
                Uncategorized
              </TabsTrigger>
            )}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category._id} value={category._id} className="space-y-4">
              {!menuItems[category._id] || menuItems[category._id].length === 0 ? (
                <div className="text-center p-8 border rounded-md">
                  <p className="text-muted-foreground">No items in this category</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => {
                      setNewItem({ ...newItem, category: category._id })
                      setIsAddDialogOpen(true)
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Item
                  </Button>
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
                        {item.customization_options && item.customization_options.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">Customization options available</p>
                          </div>
                        )}
                      </CardContent>
                      <div className="flex justify-end p-4 pt-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openDeleteDialog(item)}>
                              <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
                      {item.customization_options && item.customization_options.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground">Customization options available</p>
                        </div>
                      )}
                      <p className="text-sm text-amber-600 mt-1">No category assigned</p>
                    </CardContent>
                    <div className="flex justify-end p-4 pt-0">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(item)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(item)}>
                            <Trash className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Menu Item</DialogTitle>
            <DialogDescription>Make changes to the menu item. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={currentItem.name}
                  onChange={(e) => setCurrentItem({ ...currentItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem({ ...currentItem, description: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price (Rs)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={currentItem.price}
                  onChange={(e) => setCurrentItem({ ...currentItem, price: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={typeof currentItem.category === "string" ? currentItem.category : currentItem.category._id}
                  onValueChange={(value) => setCurrentItem({ ...currentItem, category: value })}
                >
                  <SelectTrigger id="edit-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-image">Image</Label>
                <div className="flex flex-col gap-2">
                  <Input id="edit-image" type="file" accept="image/*" onChange={handleEditImageFileChange} />
                  {currentItem.image_url && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground mb-1">Current image:</p>
                      <Image
                        src={currentItem.image_url || "/placeholder.svg"}
                        alt={currentItem.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-availability">Availability</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-availability"
                    checked={currentItem.is_available !== false}
                    onCheckedChange={(checked) => setCurrentItem({ ...currentItem, is_available: checked })}
                  />
                  <Label htmlFor="edit-availability" className="cursor-pointer">
                    {currentItem.is_available !== false ? "Available" : "Unavailable"}
                  </Label>
                </div>
              </div>

              {/* Customization Options Section */}
              <div className="border rounded-md p-4 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Customization Options</h3>
                  <Button type="button" onClick={addEditCustomizationOption} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Option Group
                  </Button>
                </div>

                {currentItem.customization_options && currentItem.customization_options.length > 0 ? (
                  <div className="space-y-6">
                    {currentItem.customization_options.map((customization, customizationIndex) => (
                      <div key={customizationIndex} className="border rounded-md p-3 bg-muted/30">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex-1 mr-2">
                            <Label htmlFor={`edit-customization-${customizationIndex}`}>Option Group Name</Label>
                            <Input
                              id={`edit-customization-${customizationIndex}`}
                              value={customization.name}
                              onChange={(e) => updateEditCustomizationName(customizationIndex, e.target.value)}
                              placeholder="e.g. Size, Toppings, etc."
                              className="mt-1"
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => removeEditCustomizationOption(customizationIndex)}
                            variant="ghost"
                            size="icon"
                            className="mt-6"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="mt-3 space-y-3">
                          {customization.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-end gap-2">
                              <div className="flex-1">
                                <Label htmlFor={`edit-option-name-${customizationIndex}-${optionIndex}`}>
                                  Option Name
                                </Label>
                                <Input
                                  id={`edit-option-name-${customizationIndex}-${optionIndex}`}
                                  value={option.name}
                                  onChange={(e) =>
                                    updateEditOptionName(customizationIndex, optionIndex, e.target.value)
                                  }
                                  placeholder="e.g. Small, Extra Cheese, etc."
                                  className="mt-1"
                                />
                              </div>
                              <div className="w-24">
                                <Label htmlFor={`edit-option-price-${customizationIndex}-${optionIndex}`}>
                                  Price (Rs)
                                </Label>
                                <Input
                                  id={`edit-option-price-${customizationIndex}-${optionIndex}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={option.price_addition}
                                  onChange={(e) =>
                                    updateEditOptionPrice(
                                      customizationIndex,
                                      optionIndex,
                                      Number.parseFloat(e.target.value),
                                    )
                                  }
                                  className="mt-1"
                                />
                              </div>
                              <Button
                                type="button"
                                onClick={() => removeEditOption(customizationIndex, optionIndex)}
                                variant="ghost"
                                size="icon"
                                className="mb-1"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        <Button
                          type="button"
                          onClick={() => addEditOption(customizationIndex)}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add Option
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No customization options added yet. Click the button above to add one.
                  </p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditItem}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this menu item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentItem && (
            <div className="py-4">
              <p>
                <strong>Item:</strong> {currentItem.name}
              </p>
              <p>
                <strong>Price:</strong> Rs
                {typeof currentItem.price === "number" ? currentItem.price.toFixed(2) : currentItem.price}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteItem}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

