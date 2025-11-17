// Table component na nag-didisplay ng inventory items

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddItemDialog from './AddItemDialog'
import EditItemDialog from './EditItemDialog'

export default function InventoryTable({ user, inventoryData, onAddItem, onEditItem, onDeleteItem }) {
  // State para sa search at dialogs
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all') // all, low-stock, damaged

  // Filter ang items based sa search at status
  const filteredItems = inventoryData.filter(item => {
    // Search filter
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    let matchesStatus = true
    if (filterStatus === 'low-stock') {
      matchesStatus = item.quantity <= item.reorderLevel
    } else if (filterStatus === 'damaged') {
      matchesStatus = item.damagedStatus === 'Damaged'
    }

    return matchesSearch && matchesStatus
  })

  // Function para sa delete with confirmation
  const handleDelete = (item) => {
    if (window.confirm(`Are you sure you want to delete "${item.itemName}"?`)) {
      onDeleteItem(item.id)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with search and filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Inventory Management</CardTitle>
            
            {/* Add button - only for Admin */}
            {user.role === 'Admin' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Item
              </Button>
            )}
          </div>

          {/* Search and filter row */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Search bar */}
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by name, category, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Status filter buttons */}
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
          {/* Table */}
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
                        ? 'No item matched in the filter'
                        : 'Still no item with this kind in the inventory'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      {/* Item Name */}
                      <TableCell className="font-medium">{item.itemName}</TableCell>
                      
                      {/* Category */}
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      
                      {/* Quantity with low stock indicator */}
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
                      
                      {/* Location */}
                      <TableCell>{item.location}</TableCell>
                      
                      {/* Status */}
                      <TableCell>
                        <Badge variant={item.damagedStatus === 'Good' ? 'success' : 'destructive'}>
                          {item.damagedStatus}
                        </Badge>
                      </TableCell>
                      
                      {/* Price */}
                      <TableCell>
                        ₱{item.price ? item.price.toLocaleString('en-PH', { minimumFractionDigits: 2 }) : '0.00'}
                      </TableCell>
                      
                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {/* Edit button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingItem(item)}
                          >
                            Edit
                          </Button>
                          
                          {/* Delete button - Admin only */}
                          {user.role === 'Admin' && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(item)}
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

          {/* Results count */}
          {filteredItems.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredItems.length} of {inventoryData.length} items
            </p>
          )}
        </CardContent>
      </Card>

      {/* Add Item Dialog */}
      <AddItemDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={onAddItem}
      />

      {/* Edit Item Dialog */}
      {editingItem && (
        <EditItemDialog
          open={!!editingItem}
          onOpenChange={(open) => !open && setEditingItem(null)}
          item={editingItem}
          onEdit={onEditItem}
        />
      )}
    </div>
  )
}