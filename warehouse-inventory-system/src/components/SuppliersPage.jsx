// ============================================
// FILE: src/components/SuppliersPage.jsx (FIXED - TYPE-SAFE COMPARISON)
// ============================================

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import AddSupplierDialog from './AddSupplierDialog'
import EditSupplierDialog from './EditSupplierDialog'

export default function SuppliersPage({ 
  user, 
  suppliers, 
  inventoryData, 
  categories,
  onAddSupplier, 
  onEditSupplier, 
  onDeleteSupplier
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = 
      supplier.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (supplier.contactEmail && supplier.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    
    let matchesStatus = true
    if (filterStatus === 'active') {
      matchesStatus = supplier.isActive === true || supplier.isActive === 1
    } else if (filterStatus === 'inactive') {
      matchesStatus = supplier.isActive === false || supplier.isActive === 0
    }

    return matchesSearch && matchesStatus
  })

  // FIX: Type-safe comparison for supplier item count
  const getSupplierItemCount = (supplierId) => {
    const count = inventoryData.filter(item => {
      // Convert both to numbers for comparison
      const itemSupplierId = parseInt(item.supplierId)
      const targetSupplierId = parseInt(supplierId)
      return itemSupplierId === targetSupplierId
    }).length
    
    // Debug log (remove after testing)
    console.log(`Supplier ID ${supplierId}: Found ${count} items`, {
      allItems: inventoryData.map(i => ({ name: i.itemName, supplierId: i.supplierId }))
    })
    
    return count
  }

  const handleDelete = async (supplier) => {
    const itemCount = getSupplierItemCount(supplier.id)
    if (itemCount > 0) {
      if (!window.confirm(`This supplier has ${itemCount} item(s) in inventory. Items will be unlinked. Delete "${supplier.supplierName}"?`)) {
        return
      }
    } else {
      if (!window.confirm(`Delete supplier "${supplier.supplierName}"?`)) {
        return
      }
    }
    await onDeleteSupplier(supplier.id)
  }

  const activeSuppliers = suppliers.filter(s => s.isActive === true || s.isActive === 1).length
  const inactiveSuppliers = suppliers.filter(s => s.isActive === false || s.isActive === 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Supplier Management</h1>
        <p className="text-muted-foreground mt-1">
          Manage supplier information and contacts
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Suppliers</p>
                <h3 className="text-3xl font-bold mt-2">{suppliers.length}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Suppliers</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{activeSuppliers}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Inactive Suppliers</p>
                <h3 className="text-3xl font-bold text-gray-600 mt-2">{inactiveSuppliers}</h3>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Suppliers List</CardTitle>
            
            {user.role === 'Admin' && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Supplier
              </Button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by name, contact person, or email..."
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
                All ({suppliers.length})
              </Button>
              <Button 
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('active')}
              >
                Active ({activeSuppliers})
              </Button>
              <Button 
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('inactive')}
              >
                Inactive ({inactiveSuppliers})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier Name</TableHead>
                  <TableHead>Contact Person</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSuppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterStatus !== 'all'
                        ? 'No suppliers found matching filters'
                        : 'No suppliers yet. Add your first supplier to get started.'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSuppliers.map((supplier) => {
                    const itemCount = getSupplierItemCount(supplier.id)
                    return (
                      <TableRow key={supplier.id}>
                        <TableCell className="font-medium">{supplier.supplierName}</TableCell>
                        <TableCell>{supplier.contactPerson}</TableCell>
                        <TableCell>
                          {supplier.contactEmail ? (
                            <a href={`mailto:${supplier.contactEmail}`} className="text-blue-600 hover:underline">
                              {supplier.contactEmail}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{supplier.contactPhone || '-'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={(supplier.isActive === true || supplier.isActive === 1) ? 'success' : 'secondary'}>
                            {(supplier.isActive === true || supplier.isActive === 1) ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingSupplier(supplier)}
                            >
                              {user.role === 'Admin' ? 'Edit' : 'View'}
                            </Button>
                            
                            {user.role === 'Admin' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(supplier)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {filteredSuppliers.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </p>
          )}
        </CardContent>
      </Card>

      <AddSupplierDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={onAddSupplier}
        inventoryData={inventoryData}
        categories={categories}
      />

      {editingSupplier && (
        <EditSupplierDialog
          open={!!editingSupplier}
          onOpenChange={(open) => !open && setEditingSupplier(null)}
          supplier={editingSupplier}
          onEdit={onEditSupplier}
          isReadOnly={user.role !== 'Admin'}
        />
      )}
    </div>
  )
}