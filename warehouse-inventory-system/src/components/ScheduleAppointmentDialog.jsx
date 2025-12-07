// ============================================
// FILE: src/components/ScheduleAppointmentDialog.jsx (FIXED)
// ============================================

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

export default function ScheduleAppointmentDialog({ 
  open, 
  onOpenChange, 
  suppliers, 
  inventoryData,
  user,
  onSchedule 
}) {
  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    date: '',
    time: '',
    status: 'pending',
    notes: ''
  })

  const [selectedItems, setSelectedItems] = useState([])
  const [itemToAdd, setItemToAdd] = useState({
    itemId: '',
    quantity: ''
  })

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.id === parseInt(supplierId))
    if (supplier) {
      setFormData(prev => ({
        ...prev,
        supplierId: supplier.id,
        supplierName: supplier.supplierName
      }))
      setSelectedItems([])
      setItemToAdd({ itemId: '', quantity: '' })
    }
  }

  // FIX: Convert both supplierId values to numbers for comparison
  const supplierItems = formData.supplierId 
    ? inventoryData.filter(item => {
        // Handle both number and string comparisons
        const itemSupplierId = parseInt(item.supplierId)
        const selectedSupplierId = parseInt(formData.supplierId)
        return itemSupplierId === selectedSupplierId
      })
    : []

  const handleAddItem = () => {
    const itemId = parseInt(itemToAdd.itemId)
    const quantity = parseInt(itemToAdd.quantity)

    if (!itemId || !quantity || quantity <= 0) {
      alert('Please select an item and enter valid quantity')
      return
    }

    if (selectedItems.some(item => item.itemId === itemId)) {
      alert('Item already added to this appointment')
      return
    }

    const item = inventoryData.find(i => i.id === itemId)
    if (item) {
      setSelectedItems(prev => [...prev, {
        itemId: item.id,
        itemName: item.itemName,
        quantity: quantity
      }])
      
      // Reset item selection form
      setItemToAdd({ itemId: '', quantity: '' })
    }
  }

  const handleRemoveItem = (itemId) => {
    setSelectedItems(prev => prev.filter(item => item.itemId !== itemId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    // Validate
    if (!formData.supplierId || !formData.date || !formData.time) {
      alert('Please fill in supplier, date, and time')
      return
    }

    if (selectedItems.length === 0) {
      alert('Please add at least one item to the appointment')
      return
    }

    const selectedDate = new Date(`${formData.date}T${formData.time}`)
    const now = new Date()
    if (selectedDate < now) {
      if (!window.confirm('The selected date/time is in the past. Continue anyway?')) {
        return
      }
    }

    const newAppointment = {
      id: Date.now(),
      ...formData,
      items: selectedItems,
      scheduledBy: user.name,
      scheduledDate: new Date().toLocaleString('en-PH'),
      lastUpdated: new Date().toLocaleString('en-PH')
    }

    onSchedule(newAppointment)

    // Reset form
    setFormData({
      supplierId: '',
      supplierName: '',
      date: '',
      time: '',
      status: 'pending',
      notes: ''
    })
    setSelectedItems([])
    setItemToAdd({ itemId: '', quantity: '' })
    onOpenChange(false)
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Restock Appointment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">
                Supplier <span className="text-red-500">*</span>
              </Label>
              <Select
                id="supplier"
                value={formData.supplierId}
                onChange={(e) => handleSupplierChange(e.target.value)}
                required
              >
                <option value="">Select Supplier...</option>
                {suppliers
                  .filter(s => s.isActive)
                  .map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplierName} - {supplier.contactPerson}
                    </option>
                  ))
                }
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">
                  Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="date"
                  type="date"
                  min={getTodayDate()}
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">
                  Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                id="status"
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
              >
                <option value="pending">Pending - Awaiting confirmation</option>
                <option value="confirmed">Confirmed - Supplier confirmed</option>
              </Select>
            </div>

            {formData.supplierId && (
              <div className="space-y-3 p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold">Items to Restock</h4>
                
                {/* DEBUG INFO - Remove after testing */}
                {supplierItems.length === 0 && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                    <p className="font-medium text-yellow-800">Debug Info:</p>
                    <p className="text-yellow-700">Selected Supplier ID: {formData.supplierId}</p>
                    <p className="text-yellow-700">Total items in inventory: {inventoryData.length}</p>
                    <p className="text-yellow-700">Items for this supplier: {supplierItems.length}</p>
                    <p className="text-yellow-700 mt-2">Inventory items with supplier IDs:</p>
                    <div className="max-h-32 overflow-y-auto mt-1">
                      {inventoryData.map(item => (
                        <p key={item.id} className="text-xs text-yellow-600">
                          {item.itemName} - Supplier ID: {item.supplierId} (Type: {typeof item.supplierId})
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-7">
                    <Select 
                      value={itemToAdd.itemId}
                      onChange={(e) => setItemToAdd(prev => ({ ...prev, itemId: e.target.value }))}
                      disabled={supplierItems.length === 0}
                    >
                      <option value="">
                        {supplierItems.length === 0 
                          ? 'No items from this supplier in inventory' 
                          : 'Select item...'}
                      </option>
                      {supplierItems
                        .filter(item => !selectedItems.some(si => si.itemId === item.id))
                        .map(item => (
                          <option key={item.id} value={item.id}>
                            {item.itemName} (Current: {item.quantity})
                          </option>
                        ))
                      }
                    </Select>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={itemToAdd.quantity}
                      onChange={(e) => setItemToAdd(prev => ({ ...prev, quantity: e.target.value }))}
                      disabled={supplierItems.length === 0}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={handleAddItem}
                      disabled={supplierItems.length === 0}
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {selectedItems.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-sm font-medium">Selected Items:</p>
                    {selectedItems.map((item) => (
                      <div key={item.itemId} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">
                          {item.itemName} <Badge variant="outline">{item.quantity} units</Badge>
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRemoveItem(item.itemId)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {supplierItems.length === 0 && formData.supplierId && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                    <p className="font-medium">No items found for this supplier</p>
                    <p className="mt-1">Make sure items are added to inventory with this supplier selected, or add items through the Suppliers page.</p>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
              />
            </div>

            {selectedItems.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <p className="font-medium">Appointment Summary:</p>
                <p className="mt-1">Supplier: <strong>{formData.supplierName}</strong></p>
                <p>Date: <strong>{formData.date} at {formData.time}</strong></p>
                <p>Items: <strong>{selectedItems.length} item(s)</strong></p>
                <p>Total Units: <strong>{selectedItems.reduce((sum, item) => sum + item.quantity, 0)}</strong></p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedItems.length === 0}>
              Schedule Appointment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}