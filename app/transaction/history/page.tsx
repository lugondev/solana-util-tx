'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  useTransactionHistory, 
  type TransactionHistoryItem, 
  type TransactionHistoryFilters 
} from '@/lib/transaction-history'
import { 
  ExternalLink, 
  Copy, 
  Download, 
  Upload, 
  Trash2, 
  Filter,
  Search,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Coins,
} from 'lucide-react'

export default function TransactionHistoryPage() {
  const {
    getHistory,
    clearHistory,
    exportHistory,
    importHistory,
    getStatistics,
  } = useTransactionHistory()

  const [history, setHistory] = useState<TransactionHistoryItem[]>([])
  const [filteredHistory, setFilteredHistory] = useState<TransactionHistoryItem[]>([])
  const [filters, setFilters] = useState<TransactionHistoryFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statistics, setStatistics] = useState<any>(null)

  // Load history on mount
  useEffect(() => {
    loadHistory()
    loadStatistics()
  }, [])

  // Apply filters when history or filters change
  useEffect(() => {
    const filtered = getHistory(filters)
    setFilteredHistory(filtered)
  }, [history, filters])

  const loadHistory = () => {
    const allHistory = getHistory()
    setHistory(allHistory)
  }

  const loadStatistics = () => {
    const stats = getStatistics()
    setStatistics(stats)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setFilters(prev => ({ ...prev, searchTerm: term || undefined }))
  }

  const handleFilterChange = (key: keyof TransactionHistoryFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({})
    setSearchTerm('')
  }

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all transaction history? This cannot be undone.')) {
      clearHistory()
      loadHistory()
      loadStatistics()
    }
  }

  const handleExport = () => {
    try {
      const data = exportHistory()
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `solana-tx-history-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        importHistory(data)
        loadHistory()
        loadStatistics()
        alert('History imported successfully!')
      } catch (error) {
        alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
      }
    }
    reader.readAsText(file)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = (signature: string) => {
    window.open(`https://explorer.solana.com/tx/${signature}`, '_blank')
  }

  const getStatusIcon = (status: TransactionHistoryItem['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-400" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeIcon = (type: TransactionHistoryItem['type']) => {
    switch (type) {
      case 'sol-transfer':
        return <ArrowUpRight className="h-4 w-4 text-blue-400" />
      case 'token-transfer':
        return <Coins className="h-4 w-4 text-green-400" />
      default:
        return <ArrowUpRight className="h-4 w-4 text-gray-400" />
    }
  }

  const formatAmount = (item: TransactionHistoryItem) => {
    if (!item.amount) return '-'
    
    if (item.type === 'sol-transfer') {
      return `${item.amount.toLocaleString()} SOL`
    }
    
    if (item.type === 'token-transfer' && item.token) {
      return `${item.amount.toLocaleString()} ${item.token.symbol}`
    }
    
    return item.amount.toLocaleString()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          TRANSACTION HISTORY
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Track and manage your transaction history
        </p>
      </div>

      {/* Statistics */}
      {statistics && (
        <PixelCard className="mb-6">
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400">
                📊 STATISTICS
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-white">{statistics.total}</div>
                <div className="font-mono text-xs text-gray-400">Total</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-green-400">{statistics.confirmed}</div>
                <div className="font-mono text-xs text-gray-400">Confirmed</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-red-400">{statistics.failed}</div>
                <div className="font-mono text-xs text-gray-400">Failed</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-yellow-400">{statistics.pending}</div>
                <div className="font-mono text-xs text-gray-400">Pending</div>
              </div>
            </div>

            {statistics.totalVolume > 0 && (
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-blue-400">
                  {statistics.totalVolume.toLocaleString()} SOL
                </div>
                <div className="font-mono text-xs text-gray-400">Total Volume</div>
              </div>
            )}
          </div>
        </PixelCard>
      )}

      {/* Controls */}
      <PixelCard className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-sm text-green-400">CONTROLS</h3>
            <div className="flex items-center gap-2">
              <PixelButton
                variant="secondary"
                onClick={() => setShowFilters(!showFilters)}
                className="!py-1 !px-3 !text-xs"
              >
                <Filter className="h-3 w-3" />
              </PixelButton>
              <PixelButton
                variant="secondary"
                onClick={handleExport}
                disabled={history.length === 0}
                className="!py-1 !px-3 !text-xs"
              >
                <Download className="h-3 w-3" />
              </PixelButton>
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
                <div className="inline-flex items-center gap-1 px-3 py-1 border-4 border-gray-700 hover:border-green-400/50 transition-colors font-pixel text-xs">
                  <Upload className="h-3 w-3" />
                </div>
              </label>
              <PixelButton
                variant="secondary"
                onClick={handleClearHistory}
                disabled={history.length === 0}
                className="!py-1 !px-3 !text-xs !text-red-400 !border-red-600/30"
              >
                <Trash2 className="h-3 w-3" />
              </PixelButton>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <PixelInput
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search transactions..."
                className="!pr-10"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {Object.keys(filters).length > 0 && (
              <PixelButton
                variant="secondary"
                onClick={clearFilters}
                className="!py-2 !px-4 !text-xs"
              >
                CLEAR
              </PixelButton>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t-4 border-gray-700">
              <div>
                <label className="block font-mono text-xs text-gray-400 mb-2">TYPE:</label>
                <select
                  value={filters.type || ''}
                  onChange={(e) => handleFilterChange('type', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white"
                >
                  <option value="">All Types</option>
                  <option value="sol-transfer">SOL Transfer</option>
                  <option value="token-transfer">Token Transfer</option>
                  <option value="alt-create">ALT Create</option>
                  <option value="alt-extend">ALT Extend</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-400 mb-2">STATUS:</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white"
                >
                  <option value="">All Status</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-xs text-gray-400 mb-2">DATE FROM:</label>
                <input
                  type="date"
                  value={filters.dateFrom ? filters.dateFrom.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white"
                />
              </div>
            </div>
          )}
        </div>
      </PixelCard>

      {/* History List */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              TRANSACTIONS ({filteredHistory.length})
            </h3>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="font-mono text-gray-500 mb-2">
                {history.length === 0 ? 'No transactions yet' : 'No transactions match your filters'}
              </div>
              <div className="font-mono text-xs text-gray-600">
                {history.length === 0 
                  ? 'Start using the app to build transaction history'
                  : 'Try adjusting your search or filters'
                }
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusIcon(item.status)}
                        {getTypeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-pixel text-sm text-white capitalize">
                            {item.type.replace('-', ' ')}
                          </span>
                          <span className={`px-2 py-0.5 font-pixel text-xs border ${
                            item.status === 'confirmed' 
                              ? 'text-green-400 border-green-600/30 bg-green-600/10'
                              : item.status === 'failed'
                              ? 'text-red-400 border-red-600/30 bg-red-600/10'
                              : 'text-yellow-400 border-yellow-600/30 bg-yellow-600/10'
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-gray-400 break-all mb-2">
                          {item.signature}
                        </div>

                        {item.recipient && (
                          <div className="font-mono text-xs text-gray-300 mb-1">
                            To: {item.recipient}
                          </div>
                        )}

                        {item.amount && (
                          <div className="font-mono text-sm text-green-400 mb-1">
                            {formatAmount(item)}
                          </div>
                        )}

                        {item.description && (
                          <div className="font-mono text-xs text-gray-400 mb-1">
                            {item.description}
                          </div>
                        )}

                        <div className="font-mono text-xs text-gray-500">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>

                        {item.error && (
                          <div className="font-mono text-xs text-red-400 mt-1">
                            Error: {item.error}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(item.signature)}
                        className="text-gray-400 hover:text-green-400 p-1"
                        title="Copy signature"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openInExplorer(item.signature)}
                        className="text-gray-400 hover:text-green-400 p-1"
                        title="View in explorer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PixelCard>
    </div>
  )
}