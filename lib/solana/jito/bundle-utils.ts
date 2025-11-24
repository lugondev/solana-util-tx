import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { JitoBundleService, BundleTransaction, JitoBundleConfig } from './bundle-service'

/**
 * Bundle utility functions and helpers
 */

/**
 * Validate bundle transactions before submission
 */
export function validateBundle(transactions: BundleTransaction[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Check bundle size (Jito maximum is 5 transactions)
  if (transactions.length === 0) {
    errors.push('Bundle must contain at least 1 transaction')
  }

  if (transactions.length > 5) {
    errors.push('Bundle exceeds maximum size of 5 transactions (Jito limit)')
  }

  // Check for duplicate transaction IDs
  const ids = transactions.map(tx => tx.id)
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index)
  if (duplicates.length > 0) {
    errors.push(`Duplicate transaction IDs found: ${duplicates.join(', ')}`)
  }

  // Check estimated compute units
  const totalCU = transactions.reduce((sum, tx) => sum + tx.estimatedCU, 0)
  if (totalCU > 1_400_000) {
    warnings.push(`High total CU (${totalCU.toLocaleString()}). May exceed block limits.`)
  }

  // Check for empty descriptions
  transactions.forEach((tx, index) => {
    if (!tx.description || tx.description.trim() === '') {
      warnings.push(`Transaction #${index + 1} has empty description`)
    }
  })

  // Check transaction priority distribution
  const highPriority = transactions.filter(tx => tx.priority === 'high').length
  if (highPriority === transactions.length && transactions.length > 2) {
    warnings.push('All transactions marked as high priority. Consider varying priorities.')
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

/**
 * Calculate bundle metrics and statistics
 */
export function calculateBundleMetrics(transactions: BundleTransaction[], tipAmount: number) {
  const totalCU = transactions.reduce((sum, tx) => sum + tx.estimatedCU, 0)
  const avgCU = transactions.length > 0 ? totalCU / transactions.length : 0

  const priorityCounts = {
    high: transactions.filter(tx => tx.priority === 'high').length,
    medium: transactions.filter(tx => tx.priority === 'medium').length,
    low: transactions.filter(tx => tx.priority === 'low').length
  }

  // Rough estimate of fees (actual fees depend on network conditions)
  const estimatedBaseFee = totalCU * 0.000001
  const totalEstimatedCost = estimatedBaseFee + tipAmount

  return {
    transactionCount: transactions.length,
    totalCU,
    avgCU: Math.round(avgCU),
    priorityCounts,
    estimatedBaseFee,
    tipAmount,
    totalEstimatedCost,
    maxTransactions: 5
  }
}

/**
 * Sort transactions by priority for optimal bundle ordering
 */
export function sortBundleByPriority(transactions: BundleTransaction[]): BundleTransaction[] {
  const priorityOrder = { high: 0, medium: 1, low: 2 }

  return [...transactions].sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (priorityDiff !== 0) return priorityDiff

    // If same priority, maintain original order (stable sort)
    return 0
  })
}

/**
 * Estimate bundle success probability based on tip and network conditions
 */
export function estimateBundleSuccess(
  tipAmount: number,
  networkConditions?: {
    avgTip?: number
    competition?: 'LOW' | 'MEDIUM' | 'HIGH'
  }
): {
  probability: number
  confidence: 'low' | 'medium' | 'high'
  recommendation: string
} {
  const avgTip = networkConditions?.avgTip || 0.01
  const competition = networkConditions?.competition || 'MEDIUM'

  let baseProbability = 0.5

  // Adjust based on tip relative to average
  if (tipAmount >= avgTip * 2) {
    baseProbability = 0.9
  } else if (tipAmount >= avgTip * 1.5) {
    baseProbability = 0.8
  } else if (tipAmount >= avgTip) {
    baseProbability = 0.7
  } else if (tipAmount >= avgTip * 0.75) {
    baseProbability = 0.5
  } else {
    baseProbability = 0.3
  }

  // Adjust for competition
  if (competition === 'HIGH') {
    baseProbability *= 0.8
  } else if (competition === 'LOW') {
    baseProbability *= 1.1
  }

  // Cap at 95%
  const probability = Math.min(0.95, baseProbability)

  // Determine confidence
  let confidence: 'low' | 'medium' | 'high' = 'medium'
  if (networkConditions && networkConditions.avgTip) {
    confidence = 'high'
  } else {
    confidence = 'low'
  }

  // Generate recommendation
  let recommendation = ''
  if (probability >= 0.8) {
    recommendation = 'High chance of success. Tip amount is competitive.'
  } else if (probability >= 0.6) {
    recommendation = 'Moderate chance of success. Consider increasing tip for better odds.'
  } else {
    recommendation = 'Low chance of success. Increase tip significantly for better results.'
  }

  return {
    probability,
    confidence,
    recommendation
  }
}

/**
 * Format bundle for display/logging
 */
export function formatBundleInfo(
  transactions: BundleTransaction[],
  config: Partial<JitoBundleConfig>
): string {
  const metrics = calculateBundleMetrics(transactions, config.tip || 0)

  return `
Bundle Information:
-------------------
Transactions: ${metrics.transactionCount}/${metrics.maxTransactions}
Total CU: ${metrics.totalCU.toLocaleString()}
Average CU: ${metrics.avgCU.toLocaleString()}

Priority Distribution:
  High:   ${metrics.priorityCounts.high}
  Medium: ${metrics.priorityCounts.medium}
  Low:    ${metrics.priorityCounts.low}

Cost Estimate:
  Base Fee: ${metrics.estimatedBaseFee.toFixed(6)} SOL
  Tip:      ${metrics.tipAmount.toFixed(6)} SOL
  Total:    ${metrics.totalEstimatedCost.toFixed(6)} SOL

Configuration:
  Region:   ${config.region || 'ny'}
  Encoding: ${config.encoding || 'base64'}
  Timeout:  ${config.timeout || 30000}ms
`.trim()
}

/**
 * Create a bundle builder for fluent API
 */
export class BundleBuilder {
  private transactions: BundleTransaction[] = []

  /**
   * Add a transaction to the bundle
   */
  addTransaction(transaction: BundleTransaction): this {
    if (this.transactions.length >= 5) {
      throw new Error('Cannot add more than 5 transactions to a bundle')
    }
    this.transactions.push(transaction)
    return this
  }

  /**
   * Add multiple transactions at once
   */
  addTransactions(transactions: BundleTransaction[]): this {
    transactions.forEach(tx => this.addTransaction(tx))
    return this
  }

  /**
   * Remove a transaction by ID
   */
  removeTransaction(id: string): this {
    this.transactions = this.transactions.filter(tx => tx.id !== id)
    return this
  }

  /**
   * Clear all transactions
   */
  clear(): this {
    this.transactions = []
    return this
  }

  /**
   * Sort transactions by priority
   */
  sortByPriority(): this {
    this.transactions = sortBundleByPriority(this.transactions)
    return this
  }

  /**
   * Validate the current bundle
   */
  validate(): { valid: boolean; errors: string[]; warnings: string[] } {
    return validateBundle(this.transactions)
  }

  /**
   * Get current transactions
   */
  getTransactions(): BundleTransaction[] {
    return [...this.transactions]
  }

  /**
   * Get bundle metrics
   */
  getMetrics(tipAmount: number) {
    return calculateBundleMetrics(this.transactions, tipAmount)
  }

  /**
   * Build and return the final bundle
   */
  build(): BundleTransaction[] {
    const validation = this.validate()
    if (!validation.valid) {
      throw new Error(`Invalid bundle: ${validation.errors.join(', ')}`)
    }
    return this.getTransactions()
  }
}

/**
 * Wait for bundle confirmation with timeout
 */
export async function waitForBundleConfirmation(
  bundleService: JitoBundleService,
  bundleId: string,
  options: {
    timeout?: number
    pollInterval?: number
    onUpdate?: (status: string) => void
  } = {}
): Promise<{
  confirmed: boolean
  status: 'pending' | 'landed' | 'failed' | 'dropped'
  slot?: number
}> {
  const timeout = options.timeout || 30000
  const pollInterval = options.pollInterval || 2000
  const startTime = Date.now()

  while (Date.now() - startTime < timeout) {
    try {
      const status = await bundleService.getBundleStatus(bundleId)

      if (options.onUpdate) {
        options.onUpdate(status.status)
      }

      if (status.status === 'landed') {
        return {
          confirmed: true,
          status: status.status,
          slot: status.landedSlot
        }
      }

      if (status.status === 'failed' || status.status === 'dropped') {
        return {
          confirmed: false,
          status: status.status
        }
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval))
    } catch (error) {
      console.error('Error checking bundle status:', error)
      // Continue polling
    }
  }

  // Timeout
  return {
    confirmed: false,
    status: 'pending'
  }
}
