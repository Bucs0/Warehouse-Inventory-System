// ============================================
// FILE: src/components/AddSupplierDialog.jsx
// ============================================
// Dialog for adding new supplier

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'

export default function AddSupplierDialog({ open, onOpenChange, onAdd }) {
  const [formData, setFormData] = useState({
    supplierName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    isActive: true
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate required fields
    if (!formData.supplierName || !formData.contactPerson) {
      alert('Please fill in supplier name and contact person')
      return
    }

    // Email validation (basic)
    if (formData.contactEmail && !formData.contactEmail.includes('@')) {
      alert('Please enter a valid email address')
      return
    }

    // Create new supplier
    const newSupplier = {
      id: Date.now(),
      ...formData,
      dateAdded: new Date().toLocaleDateString('en-PH')
    }

    onAdd(newSupplier)

    // Reset form
    setFormData({
      supplierName: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      address: '',
      isActive: true
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Supplier</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Supplier Name */}
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

            {/* Contact Person */}
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

            {/* Contact Email */}
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

            {/* Contact Phone */}
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

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="e.g., Quezon City, Metro Manila"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            {/* Status */}
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Supplier</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}