// ============================================
// FILE: src/components/StockTransactions.jsx
// ============================================
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import TransactionDialog from './TransactionDialog'

export default function StockTransactions({ 
  user, 
  inventoryData, 
  transactionHistory, 
  onTransaction 
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  // Filter transactions
  const filteredTransactions = transactionHistory.filter(transaction => {
    const matchesSearch = 
      transaction.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.reason.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === 'all' || transaction.transactionType === filterType

    return matchesSearch && matchesType
  }).reverse()

  // Calculate statistics
  const totalIn = transactionHistory.filter(t => t.transactionType === 'IN')
    .reduce((sum, t) => sum + t.quantity, 0)
  const totalOut = transactionHistory.filter(t => t.transactionType === 'OUT')
    .reduce((sum, t) => sum + t.quantity, 0)

  const handleOpenTransaction = (item) => {
    setSelectedItem(item)
    setIsTransactionDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Stock Transactions</h1>
        <p className="text-muted-foreground mt-1">
          Record stock IN (restock) and OUT (usage/sales) transactions
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total IN</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{totalIn}</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total OUT</p>
                <h3 className="text-3xl font-bold text-red-600 mt-2">{totalOut}</h3>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Net Movement</p>
                <h3 className={`text-3xl font-bold mt-2 ${totalIn - totalOut >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalIn - totalOut >= 0 ? '+' : ''}{totalIn - totalOut}
                </h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Items */}
      <Card>
        <CardHeader>
          <CardTitle>Available Items for Transaction</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Click on an item to record a transaction
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventoryData.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenTransaction(item)}
                className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold">{item.itemName}</h4>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <Badge variant={item.quantity <= item.reorderLevel ? 'warning' : 'success'}>
                    {item.quantity}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{item.location}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Transaction History</CardTitle>
            
            <div className="flex gap-2">
              <Input
                type="search"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-xs"
              />
              <Button 
                variant={filterType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('all')}
              >
                All
              </Button>
              <Button 
                variant={filterType === 'IN' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('IN')}
              >
                IN
              </Button>
              <Button 
                variant={filterType === 'OUT' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterType('OUT')}
              >
                OUT
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Stock After</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No transactions found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm">{transaction.timestamp}</TableCell>
                      <TableCell className="font-medium">{transaction.itemName}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.transactionType === 'IN' ? 'success' : 'destructive'}>
                          {transaction.transactionType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={transaction.transactionType === 'IN' ? 'text-green-600' : 'text-red-600'}>
                          {transaction.transactionType === 'IN' ? '+' : '-'}{transaction.quantity}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">{transaction.reason}</TableCell>
                      <TableCell className="text-sm">{transaction.userName}</TableCell>
                      <TableCell className="font-medium">{transaction.stockAfter}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredTransactions.length} of {transactionHistory.length} transactions
            </p>
          )}
        </CardContent>
      </Card>

      {selectedItem && (
        <TransactionDialog
          open={isTransactionDialogOpen}
          onOpenChange={setIsTransactionDialogOpen}
          item={selectedItem}
          user={user}
          onTransaction={onTransaction}
        />
      )}
    </div>
  )
}