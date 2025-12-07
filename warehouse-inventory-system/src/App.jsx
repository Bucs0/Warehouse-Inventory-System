// ============================================
// UPDATED APP.JSX - MYSQL DATABASE READY
// ============================================

import { useState, useEffect } from 'react'
import { api } from './services/api'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import InventoryTable from './components/InventoryTable'
import StockTransactions from './components/StockTransactions'
import SuppliersPage from './components/SuppliersPage'
import CategoriesPage from './components/CategoriesPage'
import AppointmentsPage from './components/AppointmentsPage'
import DamagedItemsPage from './components/DamagedItemsPage'
import ActivityLogs from './components/ActivityLogs'

export default function App() {
  // ========== STATE MANAGEMENT ==========
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)
  
  // Data from database
  const [inventoryData, setInventoryData] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [categories, setCategories] = useState([])
  const [activityLogs, setActivityLogs] = useState([])
  const [transactionHistory, setTransactionHistory] = useState([])
  const [appointments, setAppointments] = useState([])
  const [damagedItems, setDamagedItems] = useState([])

  // ========== CHECK FOR EXISTING SESSION ==========
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user data
      verifyToken()
    }
  }, [])

  const verifyToken = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'))
      if (userData) {
        setCurrentUser(userData)
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
    }
  }

  // ========== LOAD DATA FROM DATABASE ==========
  useEffect(() => {
    if (currentUser) {
      loadAllData()
    }
  }, [currentUser])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      const [
        inventory,
        supplierList,
        categoryList,
        logs,
        transactions,
        appointmentList,
        damaged
      ] = await Promise.all([
        api.getInventory(),
        api.getSuppliers(),
        api.getCategories(),
        api.getActivityLogs(),
        api.getTransactions(),
        api.getAppointments(),
        api.getDamagedItems()
      ])

      // Process data to ensure proper types (MySQL returns some values as 0/1 for booleans)
      const processedInventory = inventory.map(item => ({
        ...item,
        quantity: parseInt(item.quantity) || 0,
        reorderLevel: parseInt(item.reorderLevel) || 0,
        price: parseFloat(item.price) || 0,
        supplierId: item.supplierId || null,
        // Ensure dates are in proper format
        dateAdded: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-PH') : item.dateAdded
      }))

      const processedSuppliers = supplierList.map(supplier => ({
        ...supplier,
        isActive: Boolean(supplier.isActive) // Convert 0/1 to true/false
      }))

      const processedAppointments = appointmentList.map(apt => ({
        ...apt,
        // Parse items if stored as JSON string
        items: typeof apt.items === 'string' ? JSON.parse(apt.items) : apt.items
      }))

      setInventoryData(processedInventory)
      setSuppliers(processedSuppliers)
      setCategories(categoryList)
      setActivityLogs(logs)
      setTransactionHistory(transactions)
      setAppointments(processedAppointments)
      setDamagedItems(damaged)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data from database: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // ========== HANDLER FUNCTIONS ==========
  
  const handleLogin = (user) => {
    // Save user data to localStorage for session persistence
    localStorage.setItem('userData', JSON.stringify(user))
    setCurrentUser(user)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setCurrentUser(null)
    setCurrentPage('dashboard')
  }

  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  // ========== INVENTORY HANDLERS ==========
  const handleAddItem = async (newItem) => {
    try {
      await api.addInventoryItem(newItem)
      await loadAllData()
      alert('Item added successfully!')
    } catch (error) {
      console.error('Error adding item:', error)
      alert('Error adding item: ' + error.message)
    }
  }

  const handleEditItem = async (updatedItem) => {
    try {
      await api.updateInventoryItem(updatedItem.id, updatedItem)
      await loadAllData()
      alert('Item updated successfully!')
    } catch (error) {
      console.error('Error updating item:', error)
      alert('Error updating item: ' + error.message)
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      await api.deleteInventoryItem(itemId)
      await loadAllData()
      alert('Item deleted successfully!')
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error deleting item: ' + error.message)
    }
  }

  // ========== TRANSACTION HANDLER ==========
  const handleTransaction = async (transaction) => {
    try {
      await api.addTransaction(transaction)
      await loadAllData()
      alert('Transaction recorded successfully!')
    } catch (error) {
      console.error('Error recording transaction:', error)
      alert('Error recording transaction: ' + error.message)
    }
  }

  // ========== SUPPLIER HANDLERS ==========
  const handleAddSupplier = async (newSupplier) => {
    try {
      await api.addSupplier(newSupplier)
      await loadAllData()
      alert('Supplier added successfully!')
    } catch (error) {
      console.error('Error adding supplier:', error)
      alert('Error adding supplier: ' + error.message)
    }
  }

  const handleEditSupplier = async (updatedSupplier) => {
    try {
      await api.updateSupplier(updatedSupplier.id, updatedSupplier)
      await loadAllData()
      alert('Supplier updated successfully!')
    } catch (error) {
      console.error('Error updating supplier:', error)
      alert('Error updating supplier: ' + error.message)
    }
  }

  const handleDeleteSupplier = async (supplierId) => {
    try {
      await api.deleteSupplier(supplierId)
      await loadAllData()
      alert('Supplier deleted successfully!')
    } catch (error) {
      console.error('Error deleting supplier:', error)
      alert('Error deleting supplier: ' + error.message)
    }
  }

  // ========== CATEGORY HANDLERS ==========
  const handleAddCategory = async (newCategory) => {
    try {
      await api.addCategory(newCategory)
      await loadAllData()
      alert('Category added successfully!')
    } catch (error) {
      console.error('Error adding category:', error)
      alert('Error adding category: ' + error.message)
    }
  }

  const handleEditCategory = async (updatedCategory) => {
    try {
      await api.updateCategory(updatedCategory.id, updatedCategory)
      await loadAllData()
      alert('Category updated successfully!')
    } catch (error) {
      console.error('Error updating category:', error)
      alert('Error updating category: ' + error.message)
    }
  }

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.deleteCategory(categoryId)
      await loadAllData()
      alert('Category deleted successfully!')
    } catch (error) {
      console.error('Error deleting category:', error)
      alert('Error deleting category: ' + error.message)
    }
  }

  // ========== APPOINTMENT HANDLERS ==========
  const handleScheduleAppointment = async (appointment) => {
    try {
      await api.addAppointment(appointment)
      await loadAllData()
      alert('Appointment scheduled successfully!')
    } catch (error) {
      console.error('Error scheduling appointment:', error)
      alert('Error scheduling appointment: ' + error.message)
    }
  }

  const handleEditAppointment = async (updatedAppointment) => {
    try {
      await api.updateAppointment(updatedAppointment.id, updatedAppointment)
      await loadAllData()
      alert('Appointment updated successfully!')
    } catch (error) {
      console.error('Error updating appointment:', error)
      alert('Error updating appointment: ' + error.message)
    }
  }

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      await api.completeAppointment(appointmentId)
      await loadAllData()
      alert('Appointment completed successfully!')
    } catch (error) {
      console.error('Error completing appointment:', error)
      alert('Error completing appointment: ' + error.message)
    }
  }

  const handleCancelAppointment = async (appointmentId) => {
    try {
      await api.cancelAppointment(appointmentId)
      await loadAllData()
      alert('Appointment cancelled successfully!')
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      alert('Error cancelling appointment: ' + error.message)
    }
  }

  // ========== DAMAGED ITEMS HANDLERS ==========
  const handleUpdateDamagedItem = async (updatedItem) => {
    try {
      await api.updateDamagedItem(updatedItem.id, updatedItem)
      await loadAllData()
      alert('Damaged item updated successfully!')
    } catch (error) {
      console.error('Error updating damaged item:', error)
      alert('Error updating damaged item: ' + error.message)
    }
  }

  const handleRemoveDamagedItem = async (itemId) => {
    try {
      await api.removeDamagedItem(itemId)
      await loadAllData()
      alert('Damaged item removed successfully!')
    } catch (error) {
      console.error('Error removing damaged item:', error)
      alert('Error removing damaged item: ' + error.message)
    }
  }

  // ========== RENDER ==========

  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading data from database...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        <div className="p-6">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <h2 className="font-bold text-lg">Warehouse</h2>
              <p className="text-xs text-muted-foreground">Inventory System</p>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">{currentUser.name}</p>
            <p className="text-sm text-muted-foreground">{currentUser.role}</p>
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-2">
            <button
              onClick={() => handleNavigate('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium text-left">Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigate('transactions')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'transactions' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="font-medium text-left">Stock Transactions</span>
            </button>

            {currentUser.role === 'Admin' && (
              <button
                onClick={() => handleNavigate('inventory')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'inventory' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-left">Manage Inventory</span>
              </button>
            )}

            <button
              onClick={() => handleNavigate('suppliers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'suppliers' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-medium">Suppliers</span>
            </button>

            <button
              onClick={() => handleNavigate('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'categories' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span className="font-medium">Categories</span>
            </button>

            <button
              onClick={() => handleNavigate('appointments')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'appointments' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Appointments</span>
            </button>

            <button
              onClick={() => handleNavigate('damaged')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'damaged' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium">Damaged Items</span>
            </button>

            <button
              onClick={() => handleNavigate('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'logs' ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Activity Logs</span>
            </button>
          </nav>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors mt-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-64 p-8">
        {currentPage === 'dashboard' && (
          <Dashboard
            user={currentUser}
            inventoryData={inventoryData}
            activityLogs={activityLogs}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'transactions' && (
          <StockTransactions
            user={currentUser}
            inventoryData={inventoryData}
            transactionHistory={transactionHistory}
            onTransaction={handleTransaction}
          />
        )}

        {currentPage === 'inventory' && currentUser.role === 'Admin' && (
          <InventoryTable
            user={currentUser}
            inventoryData={inventoryData}
            suppliers={suppliers}
            categories={categories}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {currentPage === 'suppliers' && (
          <SuppliersPage
            user={currentUser}
            suppliers={suppliers}
            inventoryData={inventoryData}
            categories={categories}
            onAddSupplier={handleAddSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        )}

        {currentPage === 'categories' && (
          <CategoriesPage
            user={currentUser}
            categories={categories}
            inventoryData={inventoryData}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
            onDeleteCategory={handleDeleteCategory}
          />
        )}

        {currentPage === 'appointments' && (
          <AppointmentsPage
            user={currentUser}
            appointments={appointments}
            suppliers={suppliers}
            inventoryData={inventoryData}
            onScheduleAppointment={handleScheduleAppointment}
            onEditAppointment={handleEditAppointment}
            onCancelAppointment={handleCancelAppointment}
            onCompleteAppointment={handleCompleteAppointment}
          />
        )}

        {currentPage === 'damaged' && (
          <DamagedItemsPage
            user={currentUser}
            damagedItems={damagedItems}
            onUpdateDamagedItem={handleUpdateDamagedItem}
            onRemoveDamagedItem={handleRemoveDamagedItem}
          />
        )}

        {currentPage === 'logs' && (
          <ActivityLogs activityLogs={activityLogs} />
        )}
      </main>
    </div>
  )
}