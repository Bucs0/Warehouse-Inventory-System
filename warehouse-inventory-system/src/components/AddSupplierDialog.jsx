// ============================================
// FILE: src/components/AddSupplierDialog.jsx (FIXED - WITH ITEM DETAILS FLOW)
// ============================================

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function AddSupplierDialog({ 
  open, 
  onOpenChange, 
  onAdd, 
  inventoryData = [],
  categories = []
}) {
  const [step, setStep] = useState(1) // 1 = supplier info, 2 = new item details
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true
  })

  const [selectedItemIds, setSelectedItemIds] = useState([])
  const [newItemNames, setNewItemNames] = useState([])
  const [newItemInput, setNewItemInput] = useState('')
  
  // For collecting new item details
  const [newItemsDetails, setNewItemsDetails] = useState([])
  const [currentNewItemIndex, setCurrentNewItemIndex] = useState(0)
  const [currentItemForm, setCurrentItemForm] = useState({
    category: 'Office Supplies',
    quantity: '',
    location: '',
    reorderLevel: '10',
    price: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemToggle = (itemId) => {
    setSelectedItemIds(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleAddNewItem = () => {
    const trimmedName = newItemInput.trim()
    if (!trimmedName) {
      alert('Please enter an item name')
      return
    }

    const existsInInventory = inventoryData.some(
      item => item.itemName.toLowerCase() === trimmedName.toLowerCase()
    )
    if (existsInInventory) {
      alert('This item already exists in inventory. Please select it from the list above.')
      return
    }

    if (newItemNames.includes(trimmedName)) {
      alert('This item is already in the new items list')
      return
    }

    setNewItemNames(prev => [...prev, trimmedName])
    setNewItemInput('')
  }

  const handleRemoveNewItem = (itemName) => {
    setNewItemNames(prev => prev.filter(name => name !== itemName))
  }

  const handleNextToItemDetails = () => {
    // Validate supplier info
    if (!formData.supplierName || !formData.contactPerson) {
      alert('Please fill in supplier name and contact person')
      return
    }

    if (formData.contactEmail && !formData.contactEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    // If there are new items, go to step 2 to collect details
    if (newItemNames.length > 0) {
      setStep(2)
      setCurrentNewItemIndex(0)
    } else {
      // No new items, just submit
      handleFinalSubmit()
    }
  }

  const handleItemFormChange = (field, value) => {
    setCurrentItemForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveCurrentItem = () => {
    // Validate current item form
    if (!currentItemForm.quantity || !currentItemForm.location) {
      alert('Please fill in quantity and location')
      return
    }

    const itemDetails = {
      itemName: newItemNames[currentNewItemIndex],
      ...currentItemForm,
      quantity: parseInt(currentItemForm.quantity) || 0,
      reorderLevel: parseInt(currentItemForm.reorderLevel) || 10,
      price: parseFloat(currentItemForm.price) || 0
    }

    setNewItemsDetails(prev => [...prev, itemDetails])

    // Reset form for next item
    setCurrentItemForm({
      category: 'Office Supplies',
      quantity: '',
      location: '',
      reorderLevel: '10',
      price: ''
    })

    // Move to next item or finish
    if (currentNewItemIndex < newItemNames.length - 1) {
      setCurrentNewItemIndex(prev => prev + 1)
    } else {
      // All items done, submit everything
      handleFinalSubmit()
    }
  }

  const handleFinalSubmit = () => {
    const supplierData = {
      ...formData,
      suppliedItemIds: selectedItemIds,
      newItems: newItemsDetails.length > 0 ? newItemsDetails : []
    }

    onAdd(supplierData)

    // Reset everything
    setFormData({
      supplierName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true
    })
    setSelectedItemIds([])
    setNewItemNames([])
    setNewItemInput('')
    setNewItemsDetails([])
    setCurrentNewItemIndex(0)
    setStep(1)
    onOpenChange(false)
  }

  const handleCancel = () => {
    // Reset everything
    setFormData({
      supplierName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true
    })
    setSelectedItemIds([])
    setNewItemNames([])
    setNewItemInput('')
    setNewItemsDetails([])
    setCurrentNewItemIndex(0)
    setStep(1)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleCancel}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? 'Add New Supplier' : `Add Details for Item ${currentNewItemIndex + 1} of ${newItemNames.length}`}
          </DialogTitle>
        </DialogHeader>

        {step === 1 ? (
          // STEP 1: Supplier Information
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              
              <div className="space-y-2">
                <Label htmlFor="supplierName">
                  Supplier Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="supplierName"
                  placeholder="e.g., Office Warehouse"
                  value={formData.supplierName}
                  onChange={(e) => handleChange('supplierName', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  placeholder="e.g., Juan Dela Cruz"
                  value={formData.contactPerson}
                  onChange={(e) => handleChange('contactPerson', e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="e.g., sales@supplier.com"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="e.g., +63-912-345-6789"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="e.g., Quezon City, Metro Manila"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Status</Label>
                <Select
                  id="isActive"
                  value={formData.isActive.toString()}
                  onChange={(e) => handleChange('isActive', e.target.value === 'true')}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </Select>
              </div>
            </div>

            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Items This Supplier Can Supply</h3>
              
              {inventoryData.length > 0 && (
                <div className="space-y-2">
                  <Label>Select from existing inventory:</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-lg p-3 space-y-2 bg-gray-50">
                    {inventoryData.map(item => (
                      <label 
                        key={item.id} 
                        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => handleItemToggle(item.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm">{item.itemName}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedItemIds.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {selectedItemIds.length} item(s) selected
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label>Add new items (not in inventory yet):</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type item name and click Add..."
                    value={newItemInput}
                    onChange={(e) => setNewItemInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddNewItem()
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    onClick={handleAddNewItem}
                    variant="outline"
                  >
                    Add
                  </Button>
                </div>
                
                {newItemNames.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-xs font-medium">New items to be added:</p>
                    <div className="space-y-1">
                      {newItemNames.map((itemName, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded"
                        >
                          <span className="text-sm font-medium">{itemName}</span>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveNewItem(itemName)}
                            className="h-6 text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-blue-600">
                      ℹ️ You'll provide details for these items in the next step
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleNextToItemDetails}>
                {newItemNames.length > 0 ? 'Next: Add Item Details' : 'Add Supplier'}
                {(selectedItemIds.length > 0 || newItemNames.length > 0) && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedItemIds.length + newItemNames.length} items
                  </Badge>
                )}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          // STEP 2: New Item Details
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="font-semibold text-lg">{newItemNames[currentNewItemIndex]}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Item {currentNewItemIndex + 1} of {newItemNames.length}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-category">Category</Label>
              <Select
                id="item-category"
                value={currentItemForm.category}
                onChange={(e) => handleItemFormChange('category', e.target.value)}
              >
                {categories && categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.categoryName}>
                      {cat.categoryName}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="item-quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="item-quantity"
                  type="number"
                  min="0"
                  placeholder="e.g., 100"
                  value={currentItemForm.quantity}
                  onChange={(e) => handleItemFormChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="item-reorderLevel">Reorder Level</Label>
                <Input
                  id="item-reorderLevel"
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  value={currentItemForm.reorderLevel}
                  onChange={(e) => handleItemFormChange('reorderLevel', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="item-location"
                placeholder="e.g., Warehouse A, Shelf 3"
                value={currentItemForm.location}
                onChange={(e) => handleItemFormChange('location', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item-price">Price (₱)</Label>
              <Input
                id="item-price"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 250.00"
                value={currentItemForm.price}
                onChange={(e) => handleItemFormChange('price', e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSaveCurrentItem}>
                {currentNewItemIndex < newItemNames.length - 1 ? 'Next Item' : 'Finish & Add Supplier'}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}