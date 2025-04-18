"use client"

import { useState, useEffect } from "react"
import { Edit, MoreHorizontal, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { tableApi, type Table, type TableInput, type TableStatusInput } from "@/lib/api"
import { useToast } from "@/components/ui/use-toast"

export default function AdminTablesPage() {
  const { toast } = useToast()
  const [tables, setTables] = useState<Table[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [currentTable, setCurrentTable] = useState<Table | null>(null)
  const [newTable, setNewTable] = useState<TableInput>({
    table_number: 1,
    capacity: 4,
  })

  // Fetch tables on component mount
  useEffect(() => {
    fetchTables()
  }, [])

  // Fetch all tables from the API
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

  // Add a new table
  const handleAddTable = async () => {
    if (!newTable.table_number || !newTable.capacity) {
      toast({
        title: "Validation Error",
        description: "Please provide table number and capacity",
        variant: "destructive",
      })
      return
    }

    try {
      await tableApi.createTable(newTable)

      toast({
        title: "Success",
        description: "Table added successfully",
      })

      // Refresh tables
      fetchTables()

      // Reset form and close dialog
      setNewTable({
        table_number: 1,
        capacity: 4,
      })
      setIsAddDialogOpen(false)
    } catch (error) {
      console.error("Failed to add table:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add table",
        variant: "destructive",
      })
    }
  }

  // Edit an existing table
  const handleEditTable = async () => {
    if (!currentTable) return

    if (!currentTable.table_number || !currentTable.capacity) {
      toast({
        title: "Validation Error",
        description: "Please provide table number and capacity",
        variant: "destructive",
      })
      return
    }

    try {
      const tableToUpdate: Partial<TableInput> = {
        table_number: currentTable.table_number,
        capacity: currentTable.capacity,
      }

      await tableApi.updateTable(currentTable._id, tableToUpdate)

      toast({
        title: "Success",
        description: "Table updated successfully",
      })

      // Refresh tables
      fetchTables()

      setIsEditDialogOpen(false)
    } catch (error) {
      console.error("Failed to update table:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update table",
        variant: "destructive",
      })
    }
  }

  // Update table status
  const handleUpdateStatus = async () => {
    if (!currentTable) return

    try {
      const statusData: TableStatusInput = {
        status: currentTable.status,
      }

      await tableApi.updateTableStatus(currentTable._id, statusData)

      toast({
        title: "Success",
        description: "Table status updated successfully",
      })

      // Refresh tables
      fetchTables()

      setIsStatusDialogOpen(false)
    } catch (error) {
      console.error("Failed to update table status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update table status",
        variant: "destructive",
      })
    }
  }

  // Delete a table
  const handleDeleteTable = async () => {
    if (!currentTable) return

    try {
      await tableApi.deleteTable(currentTable._id)

      toast({
        title: "Success",
        description: "Table deleted successfully",
      })

      // Refresh tables
      fetchTables()

      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Failed to delete table:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete table",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (table: Table) => {
    setCurrentTable(table)
    setIsEditDialogOpen(true)
  }

  const openStatusDialog = (table: Table) => {
    setCurrentTable(table)
    setIsStatusDialogOpen(true)
  }

  const openDeleteDialog = (table: Table) => {
    setCurrentTable(table)
    setIsDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Table Management</h1>
          <p className="text-muted-foreground">Add, edit, or remove tables</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Table
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Table</DialogTitle>
              <DialogDescription>Add a new table to your restaurant. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="table_number">Table Number</Label>
                <Input
                  id="table_number"
                  type="number"
                  min="1"
                  value={newTable.table_number}
                  onChange={(e) => setNewTable({ ...newTable, table_number: Number.parseInt(e.target.value) })}
                  placeholder="e.g. 9"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Number of Seats</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={newTable.capacity}
                  onChange={(e) => setNewTable({ ...newTable, capacity: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTable}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading tables...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.length === 0 ? (
            <div className="col-span-full text-center p-8 border rounded-md">
              <p className="text-muted-foreground">No tables found</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Add Table
              </Button>
            </div>
          ) : (
            tables.map((table) => (
              <Card key={table._id}>
                <CardHeader>
                  <CardTitle>Table {table.table_number}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seats:</span>
                      <span>{table.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
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
                    </div>
                    {table.current_order && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Order:</span>
                        <span className="text-xs">
                          {typeof table.current_order === "string" ? table.current_order : table.current_order._id}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(table)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openStatusDialog(table)}>
                        <Edit className="mr-2 h-4 w-4" /> Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteDialog(table)}>
                        <Trash className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Make changes to the table. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentTable && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-table_number">Table Number</Label>
                <Input
                  id="edit-table_number"
                  type="number"
                  min="1"
                  value={currentTable.table_number}
                  onChange={(e) => setCurrentTable({ ...currentTable, table_number: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Number of Seats</Label>
                <Input
                  id="edit-capacity"
                  type="number"
                  min="1"
                  value={currentTable.capacity}
                  onChange={(e) => setCurrentTable({ ...currentTable, capacity: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTable}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Table Status</DialogTitle>
            <DialogDescription>Update the status of Table {currentTable?.table_number}.</DialogDescription>
          </DialogHeader>
          {currentTable && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={currentTable.status}
                  onValueChange={(value: "available" | "occupied" | "reserved" | "maintenance") =>
                    setCurrentTable({ ...currentTable, status: value })
                  }
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Table</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this table? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentTable && (
            <div className="py-4">
              <p>
                <strong>Table:</strong> Table {currentTable.table_number}
              </p>
              <p>
                <strong>Seats:</strong> {currentTable.capacity}
              </p>
              <p>
                <strong>Status:</strong> {currentTable.status}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTable}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

