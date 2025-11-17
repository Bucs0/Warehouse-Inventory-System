// Dialog para sa pag-add ng bagong item

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

// Predefined categories
const CATEGORIES = ['Office Supplies', 'Equipment', 'Furniture', 'Electronics', 'Other']

export default function AddItemDialog({ open, onOpenChange, onAdd }) {
  // State para sa form fields
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'Office Supplies',
    quantity: '',
    location: '',
    reorderLevel: '',
    damagedStatus: 'Good',
    price: '',
    supplier: ''
  })

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    if (!formData.itemName || !formData.quantity || !formData.location) {
      alert('Please fill in all required fields')
      return
    }

    // Create new item object
    const newItem = {
      id: Date.now(), // Simple ID generation
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0,
      dateAdded: new Date().toLocaleDateString('en-PH')
    }

    // Pass to parent component
    onAdd(newItem)

    // Reset form at close dialog
    setFormData({
      itemName: '',
      category: 'Office Supplies',
      quantity: '',
      location: '',
      reorderLevel: '',
      damagedStatus: 'Good',
      price: '',
      supplier: ''
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="itemName">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="itemName"
                placeholder="e.g., A4 Bond Paper"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Select>
            </div>

            {/* Quantity at Reorder Level */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  min="0"
                  placeholder="e.g., 10"
                  value={formData.reorderLevel}
                  onChange={(e) => handleChange('reorderLevel', e.target.value)}
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                placeholder="e.g., Warehouse A, Shelf 3"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>

            {/* Price at Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (₱)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 250.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  placeholder="e.g., Office Warehouse"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                />
              </div>
            </div>

            {/* Damaged Status */}
            <div className="space-y-2">
              <Label htmlFor="damagedStatus">Status</Label>
              <Select
                id="damagedStatus"
                value={formData.damagedStatus}
                onChange={(e) => handleChange('damagedStatus', e.target.value)}
              >
                <option value="Good">Good</option>
                <option value="Damaged">Damaged</option>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
