'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Trash2, RefreshCw, Download, Filter, X } from 'lucide-react'

interface Credential {
  id: string
  teamId: string
  teamName?: string
  createdAt: string
  credentialSource: string
  lastUsedAt?: string
  ipAddress?: string
  userAgent?: string
  platform?: string
  browser?: string | { name: string; version: string }
  cookies: Record<string, any>
  localStorage: Record<string, any>
  sessionStorage: Record<string, any>
  fingerprint?: Record<string, any>
  geoLocation?: Record<string, any> | null
  isActive: boolean
}

export default function CredentialsManagement() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [filteredCredentials, setFilteredCredentials] = useState<Credential[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const [viewingCredential, setViewingCredential] = useState<Credential | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all', // all, active, expired
    hasCookies: 'all', // all, yes, no
    hasLocalStorage: 'all', // all, yes, no
    hasSessionStorage: 'all', // all, yes, no
    teamId: 'all', // all, specific team ID
    searchText: '' // search in ID, IP, user agent
  })

  // Helper function to check if credential is expired based on all available expiry data
  const isCredentialExpired = (credential: Credential) => {
    const now = Date.now() / 1000; // Current time in seconds

    // Check cookies for expiry
    if (credential.cookies) {
      for (const [name, cookieData] of Object.entries(credential.cookies)) {
        if (cookieData && typeof cookieData === 'object') {
          // Check if cookie has expirationDate (Chrome cookie format)
          if (cookieData.expirationDate && cookieData.expirationDate < now) {
            console.log(`Cookie ${name} expired:`, new Date(cookieData.expirationDate * 1000));
            return true;
          }
          // Check if cookie has expires field (standard cookie format)
          if (cookieData.expires) {
            const expiryTime = new Date(cookieData.expires).getTime() / 1000;
            if (expiryTime < now) {
              console.log(`Cookie ${name} expired:`, new Date(expiryTime * 1000));
              return true;
            }
          }
        }
      }
    }

    // Check localStorage for JWT tokens or expiry data
    if (credential.localStorage) {
      for (const [key, value] of Object.entries(credential.localStorage)) {
        if (isTokenExpired(value, now)) {
          console.log(`LocalStorage ${key} token expired`);
          return true;
        }
      }
    }

    // Check sessionStorage for JWT tokens or expiry data
    if (credential.sessionStorage) {
      for (const [key, value] of Object.entries(credential.sessionStorage)) {
        if (isTokenExpired(value, now)) {
          console.log(`SessionStorage ${key} token expired`);
          return true;
        }
      }
    }

    // If no expiry data found or nothing is expired, consider it active
    return false;
  };

  // Helper function to check if a token (JWT or other) is expired
  const isTokenExpired = (tokenValue: any, currentTime: number) => {
    if (!tokenValue || typeof tokenValue !== 'string') {
      return false;
    }

    // Try to parse as JWT token
    try {
      const parts = tokenValue.split('.');
      if (parts.length === 3) {
        // Looks like a JWT token
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp < currentTime) {
          return true;
        }
      }
    } catch (e) {
      // Not a valid JWT, ignore
    }

    // Check if the value itself contains expiry information
    try {
      const parsed = JSON.parse(tokenValue);
      if (parsed.exp && parsed.exp < currentTime) {
        return true;
      }
      if (parsed.expires_at && parsed.expires_at < currentTime) {
        return true;
      }
      if (parsed.expiry && new Date(parsed.expiry).getTime() / 1000 < currentTime) {
        return true;
      }
    } catch (e) {
      // Not JSON, ignore
    }

    return false;
  };

  // Filter credentials based on current filters
  const applyFilters = (credentialsList: Credential[]) => {
    return credentialsList.filter(credential => {
      // Status filter
      if (filters.status !== 'all') {
        const isExpired = isCredentialExpired(credential);
        const isActive = !isExpired && credential.isActive !== false;
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'expired' && isActive) return false;
      }

      // Has cookies filter
      if (filters.hasCookies !== 'all') {
        const hasCookies = credential.cookies && Object.keys(credential.cookies).length > 0;
        if (filters.hasCookies === 'yes' && !hasCookies) return false;
        if (filters.hasCookies === 'no' && hasCookies) return false;
      }

      // Has local storage filter
      if (filters.hasLocalStorage !== 'all') {
        const hasLocalStorage = credential.localStorage && Object.keys(credential.localStorage).length > 0;
        if (filters.hasLocalStorage === 'yes' && !hasLocalStorage) return false;
        if (filters.hasLocalStorage === 'no' && hasLocalStorage) return false;
      }

      // Has session storage filter
      if (filters.hasSessionStorage !== 'all') {
        const hasSessionStorage = credential.sessionStorage && Object.keys(credential.sessionStorage).length > 0;
        if (filters.hasSessionStorage === 'yes' && !hasSessionStorage) return false;
        if (filters.hasSessionStorage === 'no' && hasSessionStorage) return false;
      }

      // Team ID filter
      if (filters.teamId !== 'all' && credential.teamId !== filters.teamId) {
        return false;
      }

      // Search text filter
      if (filters.searchText.trim()) {
        const searchLower = filters.searchText.toLowerCase();
        const searchableText = [
          credential.id,
          credential.ipAddress || '',
          credential.userAgent || '',
          credential.credentialSource || '',
          credential.platform || ''
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchLower)) return false;
      }

      return true;
    });
  };

  // Get unique teams for filter dropdown
  const getUniqueTeams = () => {
    const teamMap = new Map();
    credentials.forEach(c => {
      if (!teamMap.has(c.teamId)) {
        teamMap.set(c.teamId, {
          id: c.teamId,
          name: c.teamName || c.teamId
        });
      }
    });
    return Array.from(teamMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  };

  // Update filtered credentials when credentials or filters change
  useEffect(() => {
    setFilteredCredentials(applyFilters(credentials));
  }, [credentials, filters]);

  // Reset selected credentials when filters change
  useEffect(() => {
    setSelectedCredentials([]);
  }, [filters]);

  const loadCredentials = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const token = localStorage.getItem('choco_token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      const response = await fetch('/api/credentials/get?teamId=all', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch credentials')
      }

      const data = await response.json()
      if (data.success) {
        const credentialsList = data.data.credentials || [];
        setCredentials(credentialsList);
        setFilteredCredentials(applyFilters(credentialsList));
      } else {
        setError(data.message || data.error || 'Failed to load credentials')
      }
    } catch (error) {
      console.error('Failed to load credentials:', error)
      setError('Failed to load credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (credentialId: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) return
    
    setActionLoading(credentialId)
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      // Find the credential to get its teamId
      const credential = credentials.find(c => c.id === credentialId)
      if (!credential) {
        alert('Credential not found')
        return
      }

      const response = await fetch(`/api/credentials/cleanup?teamId=${credential.teamId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credentialIds: [credentialId] })
      })

      const result = await response.json()
      if (result.success) {
        setCredentials(prev => prev.filter(c => c.id !== credentialId))
        alert('Credential deleted successfully')
      } else {
        alert(result.message || 'Failed to delete credential')
      }
    } catch (error) {
      console.error('Failed to delete credential:', error)
      alert('Failed to delete credential')
    } finally {
      setActionLoading(null)
    }
  }

  const handleView = (credential: Credential) => {
    setViewingCredential(credential)
  }

  const closeViewModal = () => {
    setViewingCredential(null)
  }

  const handleRefresh = () => {
    loadCredentials()
  }

  const clearAllFilters = () => {
    setFilters({
      status: 'all',
      hasCookies: 'all',
      hasLocalStorage: 'all',
      hasSessionStorage: 'all',
      teamId: 'all',
      searchText: ''
    });
  };

  const hasActiveFilters = () => {
    return filters.status !== 'all' || 
           filters.hasCookies !== 'all' || 
           filters.hasLocalStorage !== 'all' || 
           filters.hasSessionStorage !== 'all' || 
           filters.teamId !== 'all' || 
           filters.searchText.trim() !== '';
  };

  useEffect(() => {
    loadCredentials();
  }, [])

  const handleSelectAll = () => {
    if (selectedCredentials.length === filteredCredentials.length) {
      setSelectedCredentials([])
    } else {
      setSelectedCredentials(filteredCredentials.map(c => c.id))
    }
  }

  const handleSelectCredential = (credentialId: string) => {
    setSelectedCredentials(prev => 
      prev.includes(credentialId) 
        ? prev.filter(id => id !== credentialId)
        : [...prev, credentialId]
    )
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedCredentials.length} credentials?`)) return
    
    setActionLoading('bulk')
    try {
      const token = localStorage.getItem('choco_token')
      if (!token) {
        alert('No authentication token found')
        return
      }

      // Group credentials by teamId for efficient deletion
      const credentialsByTeam = new Map<string, string[]>()
      selectedCredentials.forEach(credId => {
        const credential = credentials.find(c => c.id === credId)
        if (credential) {
          if (!credentialsByTeam.has(credential.teamId)) {
            credentialsByTeam.set(credential.teamId, [])
          }
          credentialsByTeam.get(credential.teamId)!.push(credId)
        }
      })

      // Delete credentials team by team
      const deletePromises = Array.from(credentialsByTeam.entries()).map(([teamId, credIds]) =>
        fetch(`/api/credentials/cleanup?teamId=${teamId}`, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ credentialIds: credIds })
        })
      )

      const results = await Promise.all(deletePromises)
      const allSuccessful = results.every(r => r.ok)

      if (allSuccessful) {
        setCredentials(prev => prev.filter(c => !selectedCredentials.includes(c.id)))
        setSelectedCredentials([])
        alert(`Successfully deleted ${selectedCredentials.length} credentials`)
      } else {
        alert('Some deletions failed. Please refresh and try again.')
      }
    } catch (error) {
      console.error('Failed to delete credentials:', error)
      alert('Failed to delete credentials')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCookieCount = (cookies: Record<string, any>) => {
    return Object.keys(cookies || {}).length
  }

  const getStorageCount = (storage: Record<string, any>) => {
    return Object.keys(storage || {}).length
  }

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Credentials Management</h2>
          <p className="text-slate-600">Manage team credentials and browser data</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedCredentials.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={actionLoading === 'bulk'}
              className="flex items-center space-x-2"
            >
              {actionLoading === 'bulk' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              <span>
                {actionLoading === 'bulk' 
                  ? 'Deleting...' 
                  : `Delete Selected (${selectedCredentials.length})`
                }
              </span>
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 ${hasActiveFilters() ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {hasActiveFilters() && (
              <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
                {Object.values(filters).filter(v => v !== 'all' && v !== '').length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-slate-900">Filter Credentials</h3>
            <div className="flex items-center space-x-2">
              {hasActiveFilters() && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="flex items-center space-x-1 text-xs"
                >
                  <X className="w-3 h-3" />
                  <span>Clear All</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Has Cookies Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Has Cookies</label>
              <select
                value={filters.hasCookies}
                onChange={(e) => setFilters(prev => ({ ...prev, hasCookies: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Has Local Storage Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Has Local Storage</label>
              <select
                value={filters.hasLocalStorage}
                onChange={(e) => setFilters(prev => ({ ...prev, hasLocalStorage: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Has Session Storage Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Has Session Storage</label>
              <select
                value={filters.hasSessionStorage}
                onChange={(e) => setFilters(prev => ({ ...prev, hasSessionStorage: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Team Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Team</label>
              <select
                value={filters.teamId}
                onChange={(e) => setFilters(prev => ({ ...prev, teamId: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Teams</option>
                {getUniqueTeams().map(team => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Text Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Search</label>
              <input
                type="text"
                placeholder="ID, IP, User Agent..."
                value={filters.searchText}
                onChange={(e) => setFilters(prev => ({ ...prev, searchText: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          {/* Filter Results Summary */}
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>
                Showing {filteredCredentials.length} of {credentials.length} credentials
              </span>
              {hasActiveFilters() && (
                <span className="text-blue-600">
                  {Object.values(filters).filter(v => v !== 'all' && v !== '').length} filter(s) active
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <div className="flex items-center justify-center space-x-3">
            <RefreshCw className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-slate-600">Loading credentials...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 font-medium">Error loading credentials</div>
          <div className="text-red-600 text-sm mt-1">{error}</div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-3"
          >
            Try Again 
          </Button>
        </div>
      )}

      {/* Credentials Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedCredentials.length === filteredCredentials.length && filteredCredentials.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-slate-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  ID & Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Browser Info
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Data Summary
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {filteredCredentials.map((credential) => (
                <tr key={credential.id} className="hover:bg-slate-50">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedCredentials.includes(credential.id)}
                      onChange={() => handleSelectCredential(credential.id)}
                      className="rounded border-slate-300"
                    />
                  </td>
                  
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-slate-600">
                        {credential.id.substring(0, 8)}...
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          className={(!isCredentialExpired(credential) && credential.isActive !== false)
                            ? "bg-green-100 text-green-700" 
                            : "bg-red-100 text-red-700"
                          }
                        >
                          {(!isCredentialExpired(credential) && credential.isActive !== false) ? 'Active' : 'Expired'}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {credential.credentialSource}
                        </Badge>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">
                        {credential.teamName || 'Unknown Team'}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {credential.teamId.substring(0, 8)}...
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-slate-900">
                        {typeof credential.browser === 'object' && credential.browser 
                          ? `${credential.browser.name || 'Unknown'} ${credential.browser.version || ''}`.trim()
                          : credential.browser || 'Unknown'
                        }
                      </div>
                      <div className="text-xs text-slate-500">
                        {credential.platform || 'Unknown Platform'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {credential.ipAddress || 'No IP'}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-3 text-xs">
                        <span className="text-slate-600">
                          🍪 {getCookieCount(credential.cookies)}
                        </span>
                        <span className="text-slate-600">
                          💾 {getStorageCount(credential.localStorage)}
                        </span>
                        <span className="text-slate-600">
                          📱 {getStorageCount(credential.sessionStorage)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {credential.fingerprint && (
                          <Badge variant="outline" className="text-xs">Fingerprint</Badge>
                        )}
                        {credential.geoLocation && (
                          <Badge variant="outline" className="text-xs">Location</Badge>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="text-sm text-slate-900">
                      {formatDate(credential.createdAt)}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(credential)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(credential.id)}
                        disabled={actionLoading === credential.id}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {actionLoading === credential.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                        <span>{actionLoading === credential.id ? 'Deleting...' : 'Delete'}</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCredentials.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg mb-2">
              {credentials.length === 0 ? 'No credentials found' : 'No credentials match your filters'}
            </div>
            <div className="text-slate-500 text-sm">
              {credentials.length === 0 
                ? 'Team members haven\'t set up any credentials yet'
                : 'Try adjusting your filter criteria'
              }
            </div>
            {hasActiveFilters() && credentials.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-3"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>
      )}

      {/* Summary Footer */}
      {!isLoading && !error && (credentials.length > 0 || hasActiveFilters()) && (
        <div className="bg-slate-50 rounded-lg p-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>Total: {credentials.length} credentials</span>
            <span>Filtered: {filteredCredentials.length} credentials</span>
            <span>Active: {filteredCredentials.filter(c => !isCredentialExpired(c) && c.isActive !== false).length}</span>
            <span>Selected: {selectedCredentials.length}</span>
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {viewingCredential && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-slate-900">
                Credential Details - {viewingCredential.id.substring(0, 8)}...
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={closeViewModal}
                className="flex items-center space-x-1"
              >
                <span>Close</span>
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Basic Information</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-slate-600">ID:</span>
                        <div className="font-mono text-slate-900">{viewingCredential.id}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Status:</span>
                        <div>
                          <Badge className={(!isCredentialExpired(viewingCredential) && viewingCredential.isActive !== false) ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                            {(!isCredentialExpired(viewingCredential) && viewingCredential.isActive !== false) ? 'Active' : 'Expired'}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Source:</span>
                        <div className="text-slate-900">{viewingCredential.credentialSource}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Browser:</span>
                        <div className="text-slate-900">
                          {typeof viewingCredential.browser === 'object' && viewingCredential.browser 
                            ? `${viewingCredential.browser.name || 'Unknown'} ${viewingCredential.browser.version || ''}`.trim()
                            : viewingCredential.browser || 'Unknown'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Platform:</span>
                        <div className="text-slate-900">{viewingCredential.platform || 'Unknown'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">IP Address:</span>
                        <div className="text-slate-900">{viewingCredential.ipAddress || 'N/A'}</div>
                      </div>
                      <div>
                        <span className="font-medium text-slate-600">Created:</span>
                        <div className="text-slate-900">{formatDate(viewingCredential.createdAt)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cookies */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Cookies ({getCookieCount(viewingCredential.cookies)})</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingCredential.cookies, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Local Storage */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Local Storage ({getStorageCount(viewingCredential.localStorage)})</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingCredential.localStorage, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* Session Storage */}
                <div>
                  <h4 className="font-medium text-slate-900 mb-3">Session Storage ({getStorageCount(viewingCredential.sessionStorage)})</h4>
                  <div className="bg-slate-50 rounded-lg p-4">
                    <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(viewingCredential.sessionStorage, null, 2)}
                    </pre>
                  </div>
                </div>

                {/* User Agent */}
                {viewingCredential.userAgent && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">User Agent</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="text-xs text-slate-700 break-all">
                        {viewingCredential.userAgent}
                      </div>
                    </div>
                  </div>
                )}

                {/* Fingerprint */}
                {viewingCredential.fingerprint && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Fingerprint</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(viewingCredential.fingerprint, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Geo Location */}
                {viewingCredential.geoLocation && (
                  <div>
                    <h4 className="font-medium text-slate-900 mb-3">Geo Location</h4>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(viewingCredential.geoLocation, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
