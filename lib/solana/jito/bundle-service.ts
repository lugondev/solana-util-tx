import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  VersionedTransaction
} from '@solana/web3.js'
import bs58 from 'bs58'
import { JitoRegion, getBlockEngineEndpoint, DEFAULT_JITO_CONFIG } from './config'

export interface BundleTransaction {
  id: string
  transaction: Transaction
  description: string
  estimatedCU: number
  priority: 'low' | 'medium' | 'high'
}

export interface JitoBundleConfig {
  region: JitoRegion | string
  tip: number // in SOL
  maxRetries: number
  timeout: number
  encoding?: 'base64' | 'base58'
}

export interface JitoBundleResult {
  bundleId: string
  landed: boolean
  signatures: string[]
  error?: string
  cost: number
  landedSlot?: number
}

export interface JitoSendBundleRequest {
  jsonrpc: '2.0'
  id: number
  method: 'sendBundle'
  params: [string[]]
}

export interface JitoSendBundleResponse {
  jsonrpc: '2.0'
  id: number
  result?: string // bundle_id
  error?: {
    code: number
    message: string
  }
}

export interface JitoBundleStatus {
  jsonrpc: '2.0'
  id: number
  result: {
    context: {
      slot: number
    }
    value: Array<{
      bundle_id: string
      transactions: string[]
      slot: number
      confirmation_status: 'processed' | 'confirmed' | 'finalized'
      err: any
    }>
  }
}

export interface JitoTipAccount {
  address: PublicKey
  isActive: boolean
}

export class JitoBundleService {
  private connection: Connection
  private config: JitoBundleConfig
  private tipAccounts: JitoTipAccount[] = []
  private lastTipAccountUpdate: number = 0
  private readonly TIP_ACCOUNT_CACHE_MS = 60000 // 1 minute

  constructor(connection: Connection, config: Partial<JitoBundleConfig> = {}) {
    this.connection = connection
    this.config = {
      region: config.region || DEFAULT_JITO_CONFIG.defaultRegion,
      tip: config.tip || DEFAULT_JITO_CONFIG.bundleTip,
      maxRetries: config.maxRetries || DEFAULT_JITO_CONFIG.maxRetries,
      timeout: config.timeout || DEFAULT_JITO_CONFIG.timeout,
      encoding: config.encoding || 'base64' // base64 is recommended by Jito
    }
  }

  /**
   * Fetch active tip accounts from Jito
   */
  private async getTipAccounts(): Promise<JitoTipAccount[]> {
    const now = Date.now()
    
    // Return cached tip accounts if still valid
    if (this.tipAccounts.length > 0 && now - this.lastTipAccountUpdate < this.TIP_ACCOUNT_CACHE_MS) {
      return this.tipAccounts
    }

    try {
      const endpoint = getBlockEngineEndpoint(this.config.region)
      const response = await fetch(`${endpoint}/api/v1/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTipAccounts',
          params: []
        })
      })

      if (!response.ok) {
        throw new Error(`getTipAccounts failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      if (data.result && Array.isArray(data.result)) {
        this.tipAccounts = data.result.map((addr: string) => ({
          address: new PublicKey(addr),
          isActive: true
        }))
        this.lastTipAccountUpdate = now
        return this.tipAccounts
      }
    } catch (error) {
      console.warn('Failed to fetch tip accounts from Jito, using fallback:', error)
    }

    // Fallback to known tip accounts if API fails
    this.tipAccounts = [
      { address: new PublicKey('96gYZGLnJYVFmbjzopPSU6QiEV5fGqZNyN9nmNhvrZU5'), isActive: true },
      { address: new PublicKey('HFqU5x63VTqvQss8hp11i4wVV8bD44PvwucfZ2bU7gRe'), isActive: true },
      { address: new PublicKey('Cw8CFyM9FkoMi7K7Crf6HNQqf4uEMzpKw6QNghXLvLkY'), isActive: true },
      { address: new PublicKey('ADaUMid9yfUytqMBgopwjb2DTLSokTSzL1zt6iGPaS49'), isActive: true },
      { address: new PublicKey('DfXygSm4jCyNCybVYYK6DwvWqjKee8pbDmJGcLWNDXjh'), isActive: true },
      { address: new PublicKey('ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt'), isActive: true },
      { address: new PublicKey('DttWaMuVvTiduZRnguLF7jNxTgiMBZ1hyAumKUiL2KRL'), isActive: true },
      { address: new PublicKey('3AVi9Tg9Uo68tJfuvoKvqKNWKkC5wPdSSdeBnizKZ6jT'), isActive: true }
    ]
    this.lastTipAccountUpdate = now
    return this.tipAccounts
  }

  /**
   * Create a tip transaction for Jito validators
   */
  private async createTipTransaction(payer: PublicKey, tipAmount: number): Promise<Transaction> {
    const tipAccounts = await this.getTipAccounts()
    
    if (tipAccounts.length === 0) {
      throw new Error('No active tip accounts available')
    }
    
    // Pick a random tip account for load balancing
    const randomTipAccount = tipAccounts[Math.floor(Math.random() * tipAccounts.length)]
    
    const tipTransaction = new Transaction()
    
    // Add tip instruction
    const tipInstruction = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: randomTipAccount.address,
      lamports: Math.floor(tipAmount * LAMPORTS_PER_SOL)
    })
    
    tipTransaction.add(tipInstruction)
    
    return tipTransaction
  }

  /**
   * Estimate the total cost of a bundle including tips and fees
   */
  estimateBundleCost(transactions: BundleTransaction[]): number {
    const totalCU = transactions.reduce((sum, tx) => sum + tx.estimatedCU, 0)
    const estimatedFees = totalCU * 0.000001 // rough estimate
    const tipCost = this.config.tip
    
    return tipCost + estimatedFees
  }

  /**
   * Simulate a bundle before submission
   */
  async simulateBundle(
    transactions: BundleTransaction[],
    payer: PublicKey
  ): Promise<{
    success: boolean
    errors: string[]
    estimatedCost: number
  }> {
    const errors: string[] = []
    
    // Validate bundle size
    if (transactions.length === 0) {
      errors.push('Bundle must contain at least 1 transaction')
      return { success: false, errors, estimatedCost: 0 }
    }
    
    if (transactions.length > 5) {
      errors.push('Bundle cannot exceed 5 transactions (Jito limit)')
      return { success: false, errors, estimatedCost: 0 }
    }
    
    try {
      // Create tip transaction
      const tipTransaction = await this.createTipTransaction(payer, this.config.tip)
      const allTransactions = [...transactions.map(t => t.transaction), tipTransaction]
      
      // Simulate each transaction
      for (let i = 0; i < allTransactions.length; i++) {
        const tx = allTransactions[i]
        const isLastTx = i === allTransactions.length - 1
        
        try {
          // Get recent blockhash
          const { blockhash } = await this.connection.getLatestBlockhash()
          tx.recentBlockhash = blockhash
          tx.feePayer = payer
          
          // Simulate transaction
          const simulation = await this.connection.simulateTransaction(tx)
          
          if (simulation.value.err) {
            errors.push(`Transaction ${i + 1} ${isLastTx ? '(tip)' : ''}: ${JSON.stringify(simulation.value.err)}`)
          }
        } catch (error) {
          errors.push(`Transaction ${i + 1} ${isLastTx ? '(tip)' : ''}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }
      
      const estimatedCost = this.estimateBundleCost(transactions)
      
      return {
        success: errors.length === 0,
        errors,
        estimatedCost
      }
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Simulation failed'],
        estimatedCost: 0
      }
    }
  }

  /**
   * Submit a bundle to Jito block engine using official sendBundle API
   */
  async submitBundle(
    transactions: BundleTransaction[],
    payer: PublicKey,
    signTransactions: (transactions: Transaction[]) => Promise<Transaction[]>
  ): Promise<JitoBundleResult> {
    try {
      // Validate bundle size (Jito maximum is 5 transactions)
      if (transactions.length === 0) {
        throw new Error('Bundle must contain at least 1 transaction')
      }
      
      if (transactions.length > 5) {
        throw new Error('Bundle cannot exceed 5 transactions (Jito limit)')
      }

      // Create tip transaction
      const tipTransaction = await this.createTipTransaction(payer, this.config.tip)
      
      // Prepare all transactions
      const allTransactions = [...transactions.map(t => t.transaction), tipTransaction]
      
      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed')
      
      // Set blockhash and fee payer for all transactions
      allTransactions.forEach(tx => {
        tx.recentBlockhash = blockhash
        tx.feePayer = payer
      })
      
      // Sign all transactions
      const signedTransactions = await signTransactions(allTransactions)
      
      // Serialize transactions with proper encoding (base64 recommended by Jito)
      const serializedTransactions = signedTransactions.map(tx => {
        const serialized = tx.serialize()
        if (this.config.encoding === 'base58') {
          return bs58.encode(serialized)
        }
        return Buffer.from(serialized).toString('base64')
      })
      
      // Send bundle to Jito Block Engine
      const endpoint = getBlockEngineEndpoint(this.config.region)
      
      const sendBundleRequest: JitoSendBundleRequest = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'sendBundle',
        params: [serializedTransactions]
      }
      
      const response = await fetch(`${endpoint}/api/v1/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sendBundleRequest),
        signal: AbortSignal.timeout(this.config.timeout)
      })
      
      if (!response.ok) {
        throw new Error(`Bundle submission failed: ${response.status} ${response.statusText}`)
      }
      
      const result: JitoSendBundleResponse = await response.json()
      
      if (result.error) {
        throw new Error(`Jito API error: ${result.error.message} (code: ${result.error.code})`)
      }
      
      if (!result.result) {
        throw new Error('No bundle ID returned from Jito')
      }
      
      const bundleId = result.result
      
      // Extract signatures from signed transactions
      const signatures = signedTransactions.map(tx => {
        const sig = tx.signatures[0]
        return sig ? bs58.encode(sig.signature!) : ''
      }).filter(sig => sig !== '')
      
      // Poll for bundle status with retries
      let landed = false
      let landedSlot: number | undefined
      let attempts = 0
      const maxAttempts = Math.ceil(this.config.timeout / 2000) // Check every 2 seconds
      
      while (attempts < maxAttempts) {
        try {
          const status = await this.getBundleStatus(bundleId)
          
          if (status.status === 'landed') {
            landed = true
            landedSlot = status.landedSlot
            break
          } else if (status.status === 'failed' || status.status === 'dropped') {
            landed = false
            break
          }
          
          // Wait before next check
          await new Promise(resolve => setTimeout(resolve, 2000))
          attempts++
        } catch (error) {
          console.warn('Error checking bundle status:', error)
          attempts++
        }
      }
      
      // Calculate total cost
      const totalCost = this.estimateBundleCost(transactions) + this.config.tip
      
      return {
        bundleId,
        landed,
        signatures,
        cost: totalCost,
        landedSlot,
        ...(!landed && { error: 'Bundle did not land within timeout period' })
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      return {
        bundleId: '',
        landed: false,
        signatures: [],
        error: errorMessage,
        cost: 0
      }
    }
  }

  /**
   * Get bundle status using Jito getBundleStatuses API
   */
  async getBundleStatus(bundleId: string): Promise<{
    bundleId: string
    status: 'pending' | 'landed' | 'failed' | 'dropped'
    landedSlot?: number
    transactions: string[]
  }> {
    try {
      const endpoint = getBlockEngineEndpoint(this.config.region)
      
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'getBundleStatuses',
        params: [[bundleId]]
      }
      
      const response = await fetch(`${endpoint}/api/v1/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Bundle status request failed: ${response.status} ${response.statusText}`)
      }

      const result: JitoBundleStatus = await response.json()
      
      if (result.result && result.result.value && result.result.value.length > 0) {
        const bundleStatus = result.result.value[0]
        
        let status: 'pending' | 'landed' | 'failed' | 'dropped' = 'pending'
        
        if (bundleStatus.err) {
          status = 'failed'
        } else if (bundleStatus.confirmation_status === 'finalized' || 
                   bundleStatus.confirmation_status === 'confirmed') {
          status = 'landed'
        }
        
        return {
          bundleId,
          status,
          landedSlot: bundleStatus.slot,
          transactions: bundleStatus.transactions || []
        }
      }
      
      // Bundle not found yet
      return {
        bundleId,
        status: 'pending',
        transactions: []
      }
    } catch (error) {
      console.error('Error fetching bundle status:', error)
      
      // Fallback: check if any transactions are confirmed on-chain
      return {
        bundleId,
        status: 'pending',
        transactions: []
      }
    }
  }
  
  /**
   * Get bundle statuses for multiple bundles at once
   */
  async getBundleStatuses(bundleIds: string[]): Promise<Map<string, {
    status: 'pending' | 'landed' | 'failed' | 'dropped'
    landedSlot?: number
    transactions: string[]
  }>> {
    const statusMap = new Map()
    
    try {
      const endpoint = getBlockEngineEndpoint(this.config.region)
      
      const request = {
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'getBundleStatuses',
        params: [bundleIds]
      }
      
      const response = await fetch(`${endpoint}/api/v1/bundles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      })

      if (!response.ok) {
        throw new Error(`Batch bundle status request failed: ${response.status}`)
      }

      const result: JitoBundleStatus = await response.json()
      
      if (result.result && result.result.value) {
        result.result.value.forEach((bundleStatus, index) => {
          const bundleId = bundleIds[index]
          
          let status: 'pending' | 'landed' | 'failed' | 'dropped' = 'pending'
          
          if (bundleStatus.err) {
            status = 'failed'
          } else if (bundleStatus.confirmation_status === 'finalized' || 
                     bundleStatus.confirmation_status === 'confirmed') {
            status = 'landed'
          }
          
          statusMap.set(bundleId, {
            status,
            landedSlot: bundleStatus.slot,
            transactions: bundleStatus.transactions || []
          })
        })
      }
    } catch (error) {
      console.error('Error fetching bundle statuses:', error)
    }
    
    return statusMap
  }

  /**
   * Update bundle configuration
   */
  updateConfig(newConfig: Partial<JitoBundleConfig>) {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): JitoBundleConfig {
    return { ...this.config }
  }
}