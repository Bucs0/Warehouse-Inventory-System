// Component na nag-didisplay ng lahat ng activity logs
// Tracks lahat ng changes (add, edit, delete) sa inventory

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Button } from './ui/button'

export default function ActivityLogs({ activityLogs }) {
  // State para sa search at filter
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('all') // all, Added, Edited, Deleted

  // Filter ang logs based sa search at action type
  const filteredLogs = activityLogs.filter(log => {
    // Search filter - search sa item name, user name, or action
    const matchesSearch = 
      log.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Action filter
    const matchesAction = filterAction === 'all' || log.action === filterAction

    return matchesSearch && matchesAction
  }).reverse() // Reverse para latest on top

  // Count ng each action type
  const actionCounts = {
    Added: activityLogs.filter(l => l.action === 'Added').length,
    Edited: activityLogs.filter(l => l.action === 'Edited').length,
    Deleted: activityLogs.filter(l => l.action === 'Deleted').length
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Activity Logs</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Complete history of all changes in inventory
              </p>
            </div>
            
            {/* Export button (placeholder for future) */}
            <Button variant="outline" disabled>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export ()
            </Button>
          </div>

          {/* Search at filter row */}
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            {/* Search bar */}
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search by item name, user, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Action filter buttons */}
            <div className="flex gap-2">
              <Button 
                variant={filterAction === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('all')}
              >
                All ({activityLogs.length})
              </Button>
              <Button 
                variant={filterAction === 'Added' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Added')}
              >
                Added ({actionCounts.Added})
              </Button>
              <Button 
                variant={filterAction === 'Edited' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Edited')}
              >
                Edited ({actionCounts.Edited})
              </Button>
              <Button 
                variant={filterAction === 'Deleted' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterAction('Deleted')}
              >
                Deleted ({actionCounts.Deleted})
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Items Added</p>
                  <p className="text-2xl font-bold text-green-900 mt-1">{actionCounts.Added}</p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Items Edited</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">{actionCounts.Edited}</p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">Items Deleted</p>
                  <p className="text-2xl font-bold text-red-900 mt-1">{actionCounts.Deleted}</p>
                </div>
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Logs table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {searchTerm || filterAction !== 'all'
                        ? 'No activity logs that matched the filter'
                        : 'No activity logs found'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log, index) => (
                    <TableRow key={log.id}>
                      {/* Log number */}
                      <TableCell className="font-medium text-muted-foreground">
                        {filteredLogs.length - index}
                      </TableCell>

                      {/* Item name */}
                      <TableCell className="font-medium">{log.itemName}</TableCell>

                      {/* Action badge */}
                      <TableCell>
                        <Badge variant={
                          log.action === 'Added' ? 'success' :
                          log.action === 'Edited' ? 'default' :
                          'destructive'
                        }>
                          {log.action}
                        </Badge>
                      </TableCell>

                      {/* User name with role */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{log.userName}</span>
                          <Badge variant="outline" className="text-xs">
                            {log.userRole}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* Timestamp */}
                      <TableCell className="text-sm text-muted-foreground">
                        {log.timestamp}
                      </TableCell>

                      {/* Details */}
                      <TableCell className="text-sm text-muted-foreground">
                        {log.details || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Results count */}
          {filteredLogs.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              Showing {filteredLogs.length} of {activityLogs.length} logs
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}