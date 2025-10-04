/**
 * Transaction history management utilities
 */

export interface TransactionHistoryItem {
  id: string
  signature: string
  type: 'sol-transfer' | 'token-transfer' | 'alt-create' | 'alt-extend' | 'custom'
  status: 'pending' | 'confirmed' | 'failed'
  timestamp: number
  amount?: number
  token?: {
    mint: string
    symbol: string
    decimals: number
  }
  recipient?: string
  sender?: string
  description?: string
  error?: string
  explorerUrl?: string
}

export interface TransactionHistoryFilters {
  type?: TransactionHistoryItem['type']
  status?: TransactionHistoryItem['status']
  dateFrom?: Date
  dateTo?: Date
  searchTerm?: string
}

/**
 * Transaction History Storage Manager
 */
export class TransactionHistoryManager {
  private storageKey = 'solana-util-tx-history'
  private maxItems = 1000

  /**
   * Add a new transaction to history
   */
  addTransaction(transaction: Omit<TransactionHistoryItem, 'id' | 'timestamp'>): TransactionHistoryItem {
    const item: TransactionHistoryItem = {
      ...transaction,
      id: this.generateId(),
      timestamp: Date.now(),
      explorerUrl: `https://explorer.solana.com/tx/${transaction.signature}`,
    }

    const history = this.getHistory()
    history.unshift(item) // Add to beginning

    // Keep only the latest maxItems
    if (history.length > this.maxItems) {
      history.splice(this.maxItems)
    }

    this.saveHistory(history)
    return item
  }

  /**
   * Update transaction status
   */
  updateTransaction(signature: string, updates: Partial<TransactionHistoryItem>): void {
    const history = this.getHistory()
    const index = history.findIndex(item => item.signature === signature)
    
    if (index >= 0) {
      history[index] = { ...history[index], ...updates }
      this.saveHistory(history)
    }
  }

  /**
   * Get transaction history with optional filters
   */
  getHistory(filters?: TransactionHistoryFilters): TransactionHistoryItem[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      let history: TransactionHistoryItem[] = stored ? JSON.parse(stored) : []

      // Apply filters
      if (filters) {
        history = this.applyFilters(history, filters)
      }

      return history
    } catch (error) {
      console.error('Error getting transaction history:', error)
      return []
    }
  }

  /**
   * Get transaction by signature
   */
  getTransaction(signature: string): TransactionHistoryItem | null {
    const history = this.getHistory()
    return history.find(item => item.signature === signature) || null
  }

  /**
   * Clear transaction history
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Error clearing transaction history:', error)
    }
  }

  /**
   * Export history as JSON
   */
  exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  /**
   * Import history from JSON
   */
  importHistory(jsonData: string): void {
    try {
      const history = JSON.parse(jsonData) as TransactionHistoryItem[]
      if (Array.isArray(history)) {
        this.saveHistory(history)
      } else {
        throw new Error('Invalid history format')
      }
    } catch (error) {
      throw new Error('Failed to import history: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  /**
   * Get history statistics
   */
  getStatistics(): {
    total: number
    confirmed: number
    failed: number
    pending: number
    byType: Record<string, number>
    totalVolume: number
  } {
    const history = this.getHistory()
    
    const stats = {
      total: history.length,
      confirmed: 0,
      failed: 0,
      pending: 0,
      byType: {} as Record<string, number>,
      totalVolume: 0,
    }

    history.forEach(item => {
      // Count by status
      stats[item.status]++

      // Count by type
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1

      // Calculate volume (SOL only)
      if (item.type === 'sol-transfer' && item.amount) {
        stats.totalVolume += item.amount
      }
    })

    return stats
  }

  private saveHistory(history: TransactionHistoryItem[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving transaction history:', error)
    }
  }

  private applyFilters(history: TransactionHistoryItem[], filters: TransactionHistoryFilters): TransactionHistoryItem[] {
    return history.filter(item => {
      // Filter by type
      if (filters.type && item.type !== filters.type) {
        return false
      }

      // Filter by status
      if (filters.status && item.status !== filters.status) {
        return false
      }

      // Filter by date range
      if (filters.dateFrom && item.timestamp < filters.dateFrom.getTime()) {
        return false
      }
      if (filters.dateTo && item.timestamp > filters.dateTo.getTime()) {
        return false
      }

      // Filter by search term
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        const searchFields = [
          item.signature,
          item.recipient || '',
          item.sender || '',
          item.description || '',
          item.token?.symbol || '',
        ].join(' ').toLowerCase()

        if (!searchFields.includes(term)) {
          return false
        }
      }

      return true
    })
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

// Singleton instance
export const transactionHistory = new TransactionHistoryManager()

/**
 * Hook for transaction history management
 */
export function useTransactionHistory() {
  return {
    addTransaction: transactionHistory.addTransaction.bind(transactionHistory),
    updateTransaction: transactionHistory.updateTransaction.bind(transactionHistory),
    getHistory: transactionHistory.getHistory.bind(transactionHistory),
    getTransaction: transactionHistory.getTransaction.bind(transactionHistory),
    clearHistory: transactionHistory.clearHistory.bind(transactionHistory),
    exportHistory: transactionHistory.exportHistory.bind(transactionHistory),
    importHistory: transactionHistory.importHistory.bind(transactionHistory),
    getStatistics: transactionHistory.getStatistics.bind(transactionHistory),
  }
}