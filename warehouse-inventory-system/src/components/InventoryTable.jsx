// ============================================
// FILE: src/components/InventoryTable.jsx (DATABASE READY)
// ============================================

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddItemDialog from './AddItemDialog'
import EditItemDialog from './EditItemDialog'

export default function InventoryTable({ 
  user, 
  inventoryData, 
  suppliers,
  categories,
  onAddItem, 
  onEditItem, 
  onDeleteItem 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [isProcessing, setIsProcessing] = useState(false)

  const filteredItems = inventoryData.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesStatus = true
    if (filterStatus === 'low-stock') {
      matchesStatus = item.quantity <= item.reorderLevel
    } else if (filterStatus === 'damaged') {
      matchesStatus = item.damagedStatus === 'Damaged'
    }

    return matchesSearch && matchesStatus
  })

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      return
    }

    setIsProcessing(true)
    try {
      await onDeleteItem(item.id)
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete item: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleAdd = async (newItem) => {
    setIsProcessing(true)
    try {
      await onAddItem(newItem)
    } catch (error) {
      console.error('Add error:', error)
      alert('Failed to add item: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEdit = async (updatedItem) => {
    setIsProcessing(true)
    try {
      await onEditItem(updatedItem)
    } catch (error) {
      console.error('Edit error:', error)
      alert('Failed to update item: ' + error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Inventory Management</CardTitle>
            
            {user.role === 'Admin' && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                disabled={isProcessing}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({inventoryData.length})
              </Button>
              <Button 
                variant={filterStatus === 'low-stock' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('low-stock')}
              >
                Low Stock ({inventoryData.filter(i => i.quantity <= i.reorderLevel).length})
              </Button>
              <Button 
                variant={filterStatus === 'damaged' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('damaged')}
              >
                Damaged ({inventoryData.filter(i => i.damagedStatus === 'Damaged').length})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isProcessing && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm">
              ⏳ Processing... Please wait
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterStatus !== 'all' 
                        ? 'No items found matching filters'
                        : 'No items in inventory yet'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={item.quantity <= item.reorderLevel ? 'text-orange-600 font-semibold' : ''}>
                            {item.quantity}
                          </span>
                          {item.quantity <= item.reorderLevel && (
                            <Badge variant="warning" className="text-xs">Low</Badge>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>{item.location}</TableCell>
                      
                      <TableCell>
                        <Badge variant={item.damagedStatus === 'Good' ? 'success' : 'destructive'}>
                          {item.damagedStatus}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        ₱{item.price ? item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(item)}
                            disabled={isProcessing}
                          >
                            Edit
                          </Button>
                          
                          {user.role === 'Admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item)}
                              disabled={isProcessing}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredItems.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredItems.length} of {inventoryData.length} items
            </p>
          )}
        </CardContent>
      </Card>

      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAdd}
        suppliers={suppliers}
        categories={categories}
      />

      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onEdit={handleEdit}
          suppliers={suppliers}
          categories={categories}
        />
      )}
    </div>
  )
}