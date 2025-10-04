import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { 
  createTransferInstruction, 
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { parseTokenAmount } from '@/lib/solana/tokens/token-info'

export interface BulkRecipient {
  address: string
  amount: string
}

export interface BulkOperationConfig {
  tokenMint: string
  operation: 'multi-send' | 'airdrop'
  recipients: BulkRecipient[]
  batchSize: number
  slippage: number
}

export interface BulkOperationResult {
  batchId: string
  totalRecipients: number
  successfulTransfers: number
  failedTransfers: number
  signatures: string[]
  errors: Array<{ recipient: string; error: string }>
  totalCost: number
}

export interface BulkValidationResult {
  valid: boolean
  invalidAddresses: string[]
  duplicateAddresses: string[]
  invalidAmounts: string[]
  totalRecipients: number
  estimatedCost: number
}

export class BulkTokenService {
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Validate bulk operation data
   */
  async validateBulkOperation(config: BulkOperationConfig): Promise<BulkValidationResult> {
    const invalidAddresses: string[] = []
    const duplicateAddresses: string[] = []
    const invalidAmounts: string[] = []
    const addressSet = new Set<string>()

    // Validate token mint
    try {
      new PublicKey(config.tokenMint)
    } catch {
      invalidAddresses.push(config.tokenMint)
    }

    // Validate recipients
    for (const recipient of config.recipients) {
      // Check address validity
      try {
        new PublicKey(recipient.address)
      } catch {
        invalidAddresses.push(recipient.address)
        continue
      }

      // Check for duplicates
      if (addressSet.has(recipient.address)) {
        duplicateAddresses.push(recipient.address)
      } else {
        addressSet.add(recipient.address)
      }

      // Check amount validity
      if (config.operation === 'airdrop') {
        const amount = parseFloat(recipient.amount)
        if (isNaN(amount) || amount <= 0) {
          invalidAmounts.push(`${recipient.address}: ${recipient.amount}`)
        }
      }
    }

    // Estimate cost (base transaction fee + compute units)
    const baseFeePerTx = 5000 // 0.000005 SOL per transaction
    const numBatches = Math.ceil(config.recipients.length / config.batchSize)
    const estimatedCost = numBatches * baseFeePerTx

    return {
      valid: invalidAddresses.length === 0 && invalidAmounts.length === 0,
      invalidAddresses,
      duplicateAddresses,
      invalidAmounts,
      totalRecipients: config.recipients.length,
      estimatedCost: estimatedCost / 1000000000 // Convert to SOL
    }
  }

  /**
   * Create bulk transfer transactions
   */
  async createBulkTransferTransactions(
    config: BulkOperationConfig,
    senderPublicKey: PublicKey,
    tokenDecimals: number = 9
  ): Promise<Transaction[]> {
    const transactions: Transaction[] = []
    const tokenMint = new PublicKey(config.tokenMint)

    // Get sender's token account
    const senderTokenAccount = await getAssociatedTokenAddress(
      tokenMint,
      senderPublicKey
    )

    // Create batches
    const batches = this.createBatches(config.recipients, config.batchSize)

    for (const batch of batches) {
      const transaction = new Transaction()
      const instructions: TransactionInstruction[] = []

      for (const recipient of batch) {
        try {
          const recipientPublicKey = new PublicKey(recipient.address)
          const recipientTokenAccount = await getAssociatedTokenAddress(
            tokenMint,
            recipientPublicKey
          )

          // Check if recipient token account exists
          let accountExists = true
          try {
            await getAccount(this.connection, recipientTokenAccount)
          } catch {
            accountExists = false
          }

          // Create associated token account if it doesn't exist
          if (!accountExists) {
            const createAccountInstruction = createAssociatedTokenAccountInstruction(
              senderPublicKey, // payer
              recipientTokenAccount, // associated token account
              recipientPublicKey, // owner
              tokenMint // mint
            )
            instructions.push(createAccountInstruction)
          }

          // Determine amount
          const amount = config.operation === 'multi-send' 
            ? config.recipients[0].amount // Use same amount for all
            : recipient.amount // Use individual amounts

          const tokenAmount = parseTokenAmount(amount, tokenDecimals)

          // Create transfer instruction
          const transferInstruction = createTransferInstruction(
            senderTokenAccount,
            recipientTokenAccount,
            senderPublicKey,
            BigInt(tokenAmount)
          )
          instructions.push(transferInstruction)

        } catch (error) {
          console.warn(`Failed to process recipient ${recipient.address}:`, error)
          continue
        }
      }

      // Add instructions to transaction
      transaction.add(...instructions)
      transactions.push(transaction)
    }

    return transactions
  }

  /**
   * Execute bulk token operation
   */
  async executeBulkOperation(
    config: BulkOperationConfig,
    senderPublicKey: PublicKey,
    signTransactions: (transactions: Transaction[]) => Promise<Transaction[]>,
    sendTransaction: (transaction: Transaction) => Promise<string>,
    tokenDecimals: number = 9
  ): Promise<BulkOperationResult> {
    const batchId = `bulk_${Date.now()}`
    const errors: Array<{ recipient: string; error: string }> = []
    const signatures: string[] = []
    let successfulTransfers = 0
    let failedTransfers = 0
    let totalCost = 0

    try {
      // Create transactions
      const transactions = await this.createBulkTransferTransactions(
        config,
        senderPublicKey,
        tokenDecimals
      )

      // Get recent blockhash for all transactions
      const { blockhash } = await this.connection.getLatestBlockhash()
      transactions.forEach(tx => {
        tx.recentBlockhash = blockhash
        tx.feePayer = senderPublicKey
      })

      console.log(`Created ${transactions.length} batch transactions`)

      // Sign all transactions
      const signedTransactions = await signTransactions(transactions)

      // Send transactions one by one
      for (let i = 0; i < signedTransactions.length; i++) {
        const transaction = signedTransactions[i]
        const batch = this.createBatches(config.recipients, config.batchSize)[i]

        try {
          const signature = await sendTransaction(transaction)
          signatures.push(signature)
          successfulTransfers += batch.length
          
          // Wait for confirmation
          await this.connection.confirmTransaction(signature, 'confirmed')
          
          console.log(`Batch ${i + 1} completed: ${signature}`)
        } catch (error: any) {
          console.error(`Batch ${i + 1} failed:`, error)
          failedTransfers += batch.length
          
          // Add errors for each recipient in this batch
          batch.forEach(recipient => {
            errors.push({
              recipient: recipient.address,
              error: error.message || 'Transaction failed'
            })
          })
        }
      }

      // Calculate total cost (approximate)
      totalCost = signatures.length * 0.000005 // 5000 lamports per transaction

    } catch (error: any) {
      console.error('Bulk operation failed:', error)
      failedTransfers = config.recipients.length
      config.recipients.forEach(recipient => {
        errors.push({
          recipient: recipient.address,
          error: error.message || 'Bulk operation failed'
        })
      })
    }

    return {
      batchId,
      totalRecipients: config.recipients.length,
      successfulTransfers,
      failedTransfers,
      signatures,
      errors,
      totalCost
    }
  }

  /**
   * Parse CSV data for bulk operations
   */
  parseCSVData(csvData: string, operation: 'multi-send' | 'airdrop'): BulkRecipient[] {
    const lines = csvData.trim().split('\n').filter(line => line.trim())
    const recipients: BulkRecipient[] = []

    for (const line of lines) {
      if (operation === 'multi-send') {
        // For multi-send, assume each line is just an address
        const address = line.trim()
        if (address) {
          recipients.push({
            address,
            amount: '0' // Will be set by the caller
          })
        }
      } else {
        // For airdrop, expect "address,amount" format
        const parts = line.split(',')
        if (parts.length >= 2) {
          const address = parts[0].trim()
          const amount = parts[1].trim()
          if (address && amount) {
            recipients.push({ address, amount })
          }
        }
      }
    }

    return recipients
  }

  /**
   * Generate CSV template
   */
  generateCSVTemplate(operation: 'multi-send' | 'airdrop'): string {
    if (operation === 'multi-send') {
      return `# Multi-send template - one address per line
# Example:
So11111111111111111111111111111111111111112
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R`
    } else {
      return `# Airdrop template - address,amount format
# Example:
So11111111111111111111111111111111111111112,100
EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v,50
4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R,25`
    }
  }

  /**
   * Create batches from recipients list
   */
  private createBatches(recipients: BulkRecipient[], batchSize: number): BulkRecipient[][] {
    const batches: BulkRecipient[][] = []
    
    for (let i = 0; i < recipients.length; i += batchSize) {
      batches.push(recipients.slice(i, i + batchSize))
    }
    
    return batches
  }

  /**
   * Estimate transaction cost
   */
  async estimateTransactionCost(
    numRecipients: number,
    batchSize: number = 10
  ): Promise<{ totalCost: number; numTransactions: number }> {
    const numTransactions = Math.ceil(numRecipients / batchSize)
    const baseFeePerTx = 5000 // lamports
    const totalCost = (numTransactions * baseFeePerTx) / 1000000000 // Convert to SOL
    
    return { totalCost, numTransactions }
  }
}

export default BulkTokenService