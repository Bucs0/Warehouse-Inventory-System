// Dialog para sa pag-edit ng existing item

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

const CATEGORIES = ['Office Supplies', 'Equipment', 'Furniture', 'Electronics', 'Other']

export default function EditItemDialog({ open, onOpenChange, item, onEdit }) {
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

  // Load item data kapag bumukas ang dialog
  useEffect(() => {
    if (item) {
      setFormData({
        itemName: item.itemName || '',
        category: item.category || 'Office Supplies',
        quantity: item.quantity?.toString() || '',
        location: item.location || '',
        reorderLevel: item.reorderLevel?.toString() || '',
        damagedStatus: item.damagedStatus || 'Good',
        price: item.price?.toString() || '',
        supplier: item.supplier || ''
      })
    }
  }, [item])

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

    // Create updated item object
    const updatedItem = {
      ...item,
      ...formData,
      quantity: parseInt(formData.quantity) || 0,
      reorderLevel: parseInt(formData.reorderLevel) || 10,
      price: parseFloat(formData.price) || 0
    }

    // Pass to parent component
    onEdit(updatedItem)

    // Close dialog
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Item Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-itemName">
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-itemName"
                placeholder="e.g., A4 Bond Paper"
                value={formData.itemName}
                onChange={(e) => handleChange('itemName', e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select
                id="edit-category"
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
                <Label htmlFor="edit-quantity">
                  Quantity <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-quantity"
                  type="number"
                  min="0"
                  placeholder="e.g., 100"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-reorderLevel">Reorder Level</Label>
                <Input
                  id="edit-reorderLevel"
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
              <Label htmlFor="edit-location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-location"
                placeholder="e.g., Warehouse A, Shelf 3"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                required
              />
            </div>

            {/* Price at Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₱)</Label>
                <Input
                  id="edit-price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 250.00"
                  value={formData.price}
                  onChange={(e) => handleChange('price', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Input
                  id="edit-supplier"
                  placeholder="e.g., Office Warehouse"
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                />
              </div>
            </div>

            {/* Damaged Status */}
            <div className="space-y-2">
              <Label htmlFor="edit-damagedStatus">Status</Label>
              <Select
                id="edit-damagedStatus"
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
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}