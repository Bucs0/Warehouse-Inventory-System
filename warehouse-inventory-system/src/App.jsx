import { useState } from 'react'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import InventoryTable from './components/InventoryTable'
import ActivityLogs from './components/ActivityLogs'

// Ito ang main component na nag-oorganize ng buong system
// May state management para sa user, inventory, at activity logs

export default function App() {
  
  // Current logged-in user (null kung walang naka-login)
  const [currentUser, setCurrentUser] = useState(null)
  
  // Current active page (dashboard, inventory, logs)
  const [currentPage, setCurrentPage] = useState('dashboard')
  
  // Inventory data - stored locally sa memory (walang database pa)
  const [inventoryData, setInventoryData] = useState([
    {
      id: 1,
      itemName: 'A4 Bond Paper',
      category: 'Office Supplies',
      quantity: 50,
      location: 'Warehouse A, Shelf 1',
      reorderLevel: 20,
      damagedStatus: 'Good',
      price: 250.00,
      supplier: 'Office Warehouse',
      dateAdded: '11/15/2025'
    },
    {
      id: 2,
      itemName: 'HP Printer',
      category: 'Equipment',
      quantity: 5,
      location: 'Warehouse B, Section 2',
      reorderLevel: 10,
      damagedStatus: 'Good',
      price: 15000.00,
      supplier: 'Tech Supplies Inc.',
      dateAdded: '11/14/2025'
    },
    {
      id: 3,
      itemName: 'Office Desk',
      category: 'Furniture',
      quantity: 3,
      location: 'Warehouse C, Area 1',
      reorderLevel: 5,
      damagedStatus: 'Damaged',
      price: 8500.00,
      supplier: 'Furniture Plus',
      dateAdded: '11/10/2025'
    },
    {
      id: 4,
      itemName: 'Ballpen (Black)',
      category: 'Office Supplies',
      quantity: 200,
      location: 'Warehouse A, Shelf 3',
      reorderLevel: 50,
      damagedStatus: 'Good',
      price: 10.00,
      supplier: 'Office Warehouse',
      dateAdded: '11/16/2025'
    },
    {
      id: 5,
      itemName: 'Laptop Stand',
      category: 'Electronics',
      quantity: 8,
      location: 'Warehouse B, Section 4',
      reorderLevel: 15,
      damagedStatus: 'Good',
      price: 1200.00,
      supplier: 'Tech Supplies Inc.',
      dateAdded: '11/12/2025'
    }
  ])
  
  // Activity logs - tracks lahat ng changes
  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      itemName: 'A4 Bond Paper',
      action: 'Added',
      userName: 'Mark Jade Bucao',
      userRole: 'Admin',
      timestamp: '11/15/2025 10:30 AM',
      details: 'Initial stock entry'
    },
    {
      id: 2,
      itemName: 'HP Printer',
      action: 'Added',
      userName: 'Mark Jade Bucao',
      userRole: 'Admin',
      timestamp: '11/14/2025 2:15 PM',
      details: 'New equipment received'
    },
    {
      id: 3,
      itemName: 'Office Desk',
      action: 'Edited',
      userName: 'Chadrick Arsenal',
      userRole: 'Staff',
      timestamp: '11/16/2025 9:45 AM',
      details: 'Updated damaged status'
    }
  ])

  // HANDLER FUNCTIONS
  
  // Handle user login
  const handleLogin = (user) => {
    setCurrentUser(user)
    setCurrentPage('dashboard')
  }

  // Handle user logout
  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentPage('dashboard')
  }

  // Handle page navigation
  const handleNavigate = (page) => {
    setCurrentPage(page)
  }

  // Handle adding new item (Admin only)
  const handleAddItem = (newItem) => {
    // Add item sa inventory
    setInventoryData(prev => [...prev, newItem])

    // Log the activity
    const newLog = {
      id: Date.now(),
      itemName: newItem.itemName,
      action: 'Added',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: `Added ${newItem.quantity} units`
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  // Handle editing item
  const handleEditItem = (updatedItem) => {
    // Update inventory
    setInventoryData(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    )

    // Log the activity
    const newLog = {
      id: Date.now(),
      itemName: updatedItem.itemName,
      action: 'Edited',
      userName: currentUser.name,
      userRole: currentUser.role,
      timestamp: new Date().toLocaleString('en-PH', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      details: 'Updated item information'
    }
    setActivityLogs(prev => [...prev, newLog])
  }

  // Handle deleting item (Admin only)
  const handleDeleteItem = (itemId) => {
    // Find item para sa log
    const item = inventoryData.find(i => i.id === itemId)
    
    // Remove from inventory
    setInventoryData(prev => prev.filter(item => item.id !== itemId))

    // Log the activity
    if (item) {
      const newLog = {
        id: Date.now(),
        itemName: item.itemName,
        action: 'Deleted',
        userName: currentUser.name,
        userRole: currentUser.role,
        timestamp: new Date().toLocaleString('en-PH', {
          month: '2-digit',
          day: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        }),
        details: 'Item removed from inventory'
      }
      setActivityLogs(prev => [...prev, newLog])
    }
  }


  // Kung walang naka-login, show Login page
  if (!currentUser) {
    return <Login onLogin={handleLogin} />
  }

  // Main layout with sidebar navigation
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-screen">
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
                currentPage === 'dashboard'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="font-medium">Dashboard</span>
            </button>

            <button
              onClick={() => handleNavigate('inventory')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'inventory'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span className="font-medium">Inventory</span>
            </button>

            <button
              onClick={() => handleNavigate('logs')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentPage === 'logs'
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100'
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
        {/* Render current page based sa state */}
        {currentPage === 'dashboard' && (
          <Dashboard
            user={currentUser}
            inventoryData={inventoryData}
            activityLogs={activityLogs}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'inventory' && (
          <InventoryTable
            user={currentUser}
            inventoryData={inventoryData}
            onAddItem={handleAddItem}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {currentPage === 'logs' && (
          <ActivityLogs activityLogs={activityLogs} />
        )}
      </main>
    </div>
  )
}