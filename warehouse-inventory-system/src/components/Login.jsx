// ============================================
// Updated Login Component with API Integration
// ============================================

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { api } from '../services/api'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await api.login(username, password)
      
      if (response.error) {
        setError(response.error)
      } else {
        // Save token to localStorage
        localStorage.setItem('token', response.token)
        // Pass user data to parent
        onLogin(response.user)
      }
    } catch (error) {
      setError(error.message || 'Connection error. Please check if the backend server is running.')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <svg 
                className="w-10 h-10 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" 
                />
              </svg>
            </div>
            <CardTitle className="text-2xl text-center">
              Warehouse Inventory System
            </CardTitle>
            <p className="text-sm text-muted-foreground text-center">
              Login to access the system
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-3">
              Demo Credentials:
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Admin:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded">admin / admin123</code>
                  <Badge variant="destructive">Full Access</Badge>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Staff:</span>
                <div className="flex items-center gap-2">
                  <code className="bg-white px-2 py-1 rounded">staff / staff123</code>
                  <Badge variant="secondary">Limited Access</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}