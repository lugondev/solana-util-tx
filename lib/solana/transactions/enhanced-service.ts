import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { createTransferInstruction, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { TransactionBuilder } from './builder'

export interface TransactionTemplate {
  id: string
  name: string
  description: string
  category: 'system' | 'token' | 'defi' | 'nft' | 'advanced'
  icon: string
  parameters: Array<{
    name: string
    type: 'address' | 'amount' | 'number' | 'string' | 'select'
    label: string
    placeholder?: string
    required: boolean
    options?: Array<{value: string, label: string}>
    validation?: (value: string) => string | null
  }>
  estimatedComputeUnits: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface SimulationConfig {
  computeUnits?: number
  priorityFee?: number
  skipPreflight?: boolean
  replaceRecentBlockhash?: boolean
}

export interface EnhancedSimulationResult {
  success: boolean
  computeUnitsConsumed: number
  fee: number
  logs: string[]
  accounts?: Array<{
    pubkey: string
    lamports: number
    data: string
    owner: string
    executable: boolean
  }>
  balanceChanges?: Array<{
    account: string
    before: number
    after: number
    change: number
  }>
  error?: string
  warnings?: string[]
  gasOptimization?: {
    recommendedComputeUnits: number
    potentialSavings: number
  }
}

export class EnhancedTransactionService {
  private connection: Connection

  // Available transaction templates
  private templates: TransactionTemplate[] = [
    {
      id: 'sol_transfer',
      name: 'SOL Transfer',
      description: 'Transfer SOL to another wallet',
      category: 'system',
      icon: '💰',
      parameters: [
        {
          name: 'recipient',
          type: 'address',
          label: 'Recipient Address',
          placeholder: 'Enter Solana address',
          required: true,
          validation: (value) => {
            try {
              new PublicKey(value)
              return null
            } catch {
              return 'Invalid Solana address'
            }
          }
        },
        {
          name: 'amount',
          type: 'amount',
          label: 'Amount (SOL)',
          placeholder: '0.1',
          required: true,
          validation: (value) => {
            const num = parseFloat(value)
            if (isNaN(num) || num <= 0) return 'Amount must be greater than 0'
            return null
          }
        }
      ],
      estimatedComputeUnits: 400,
      riskLevel: 'LOW'
    },
    {
      id: 'token_transfer',
      name: 'SPL Token Transfer',
      description: 'Transfer SPL tokens to another wallet',
      category: 'token',
      icon: '🪙',
      parameters: [
        {
          name: 'tokenMint',
          type: 'address',
          label: 'Token Mint Address',
          placeholder: 'Enter token mint address',
          required: true
        },
        {
          name: 'recipient',
          type: 'address',
          label: 'Recipient Address',
          placeholder: 'Enter recipient address',
          required: true
        },
        {
          name: 'amount',
          type: 'amount',
          label: 'Amount',
          placeholder: '100',
          required: true
        }
      ],
      estimatedComputeUnits: 22000,
      riskLevel: 'MEDIUM'
    },
    {
      id: 'create_ata',
      name: 'Create Associated Token Account',
      description: 'Create an associated token account for a wallet',
      category: 'token',
      icon: '📦',
      parameters: [
        {
          name: 'tokenMint',
          type: 'address',
          label: 'Token Mint Address',
          placeholder: 'Enter token mint address',
          required: true
        },
        {
          name: 'owner',
          type: 'address',
          label: 'Account Owner',
          placeholder: 'Enter owner address',
          required: true
        }
      ],
      estimatedComputeUnits: 17000,
      riskLevel: 'LOW'
    },
    {
      id: 'close_account',
      name: 'Close Token Account',
      description: 'Close a token account and recover rent',
      category: 'token',
      icon: '🗑️',
      parameters: [
        {
          name: 'tokenAccount',
          type: 'address',
          label: 'Token Account Address',
          placeholder: 'Enter token account address',
          required: true
        },
        {
          name: 'destination',
          type: 'address',
          label: 'Rent Destination',
          placeholder: 'Where to send recovered SOL',
          required: true
        }
      ],
      estimatedComputeUnits: 15000,
      riskLevel: 'HIGH'
    },
    {
      id: 'memo',
      name: 'Memo Transaction',
      description: 'Add a memo/note to the blockchain',
      category: 'system',
      icon: '📝',
      parameters: [
        {
          name: 'memo',
          type: 'string',
          label: 'Memo Text',
          placeholder: 'Enter your memo',
          required: true,
          validation: (value) => {
            if (value.length > 566) return 'Memo too long (max 566 chars)'
            return null
          }
        }
      ],
      estimatedComputeUnits: 1000,
      riskLevel: 'LOW'
    },
    {
      id: 'multi_transfer',
      name: 'Multi SOL Transfer',
      description: 'Transfer SOL to multiple recipients',
      category: 'advanced',
      icon: '🔄',
      parameters: [
        {
          name: 'recipients',
          type: 'string',
          label: 'Recipients (JSON)',
          placeholder: '[{"address": "...", "amount": 0.1}]',
          required: true,
          validation: (value) => {
            try {
              const parsed = JSON.parse(value)
              if (!Array.isArray(parsed)) return 'Must be an array'
              for (const item of parsed) {
                if (!item.address || !item.amount) return 'Each item needs address and amount'
                new PublicKey(item.address) // Validate address
              }
              return null
            } catch {
              return 'Invalid JSON format'
            }
          }
        }
      ],
      estimatedComputeUnits: 2000, // Base, will multiply by recipient count
      riskLevel: 'MEDIUM'
    }
  ]

  constructor(connection: Connection) {
    this.connection = connection
  }

  getTemplates(): TransactionTemplate[] {
    return this.templates
  }

  getTemplatesByCategory(category: string): TransactionTemplate[] {
    return this.templates.filter(t => t.category === category)
  }

  getTemplate(id: string): TransactionTemplate | null {
    return this.templates.find(t => t.id === id) || null
  }

  async buildTransaction(
    templateId: string,
    parameters: Record<string, string>,
    feePayer: PublicKey,
    config: SimulationConfig = {}
  ): Promise<Transaction | null> {
    const template = this.getTemplate(templateId)
    if (!template) {
      throw new Error(`Template ${templateId} not found`)
    }

    // Validate parameters
    for (const param of template.parameters) {
      const value = parameters[param.name]
      if (param.required && !value) {
        throw new Error(`Parameter ${param.name} is required`)
      }
      if (value && param.validation) {
        const error = param.validation(value)
        if (error) {
          throw new Error(`${param.label}: ${error}`)
        }
      }
    }

    const instructions = await this.buildInstructions(templateId, parameters, feePayer)
    if (instructions.length === 0) {
      throw new Error('No instructions generated')
    }

    // Calculate compute units based on template and parameters
    let computeUnits = template.estimatedComputeUnits
    if (templateId === 'multi_transfer') {
      try {
        const recipients = JSON.parse(parameters.recipients)
        computeUnits = template.estimatedComputeUnits * recipients.length
      } catch {
        // Use default
      }
    }

    const builder = new TransactionBuilder(this.connection, {
      feePayer,
      computeUnits: config.computeUnits || computeUnits,
      priorityFee: {
        type: 'manual',
        microLamports: config.priorityFee || 1000
      }
    })

    instructions.forEach(ix => builder.addInstruction(ix))

    const result = await builder.buildLegacy()
    return result.transaction as Transaction
  }

  private async buildInstructions(
    templateId: string,
    parameters: Record<string, string>,
    feePayer: PublicKey
  ): Promise<TransactionInstruction[]> {
    const instructions: TransactionInstruction[] = []

    switch (templateId) {
      case 'sol_transfer':
        instructions.push(
          SystemProgram.transfer({
            fromPubkey: feePayer,
            toPubkey: new PublicKey(parameters.recipient),
            lamports: Math.floor(parseFloat(parameters.amount) * LAMPORTS_PER_SOL)
          })
        )
        break

      case 'token_transfer':
        const tokenMint = new PublicKey(parameters.tokenMint)
        const recipient = new PublicKey(parameters.recipient)
        
        // Get source and destination token accounts
        const sourceAta = await getAssociatedTokenAddress(tokenMint, feePayer)
        const destAta = await getAssociatedTokenAddress(tokenMint, recipient)
        
        // Check if destination ATA exists, create if not
        try {
          await this.connection.getAccountInfo(destAta)
        } catch {
          instructions.push(
            createAssociatedTokenAccountInstruction(
              feePayer,
              destAta,
              recipient,
              tokenMint
            )
          )
        }
        
        instructions.push(
          createTransferInstruction(
            sourceAta,
            destAta,
            feePayer,
            parseFloat(parameters.amount) * Math.pow(10, 6) // Assume 6 decimals for now
          )
        )
        break

      case 'create_ata':
        const mintPubkey = new PublicKey(parameters.tokenMint)
        const ownerPubkey = new PublicKey(parameters.owner)
        const ata = await getAssociatedTokenAddress(mintPubkey, ownerPubkey)
        
        instructions.push(
          createAssociatedTokenAccountInstruction(
            feePayer,
            ata,
            ownerPubkey,
            mintPubkey
          )
        )
        break

      case 'memo':
        // Import memo program instruction
        const memoData = Buffer.from(parameters.memo, 'utf8')
        instructions.push({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: memoData
        })
        break

      case 'multi_transfer':
        try {
          const recipients = JSON.parse(parameters.recipients)
          for (const recipient of recipients) {
            instructions.push(
              SystemProgram.transfer({
                fromPubkey: feePayer,
                toPubkey: new PublicKey(recipient.address),
                lamports: Math.floor(recipient.amount * LAMPORTS_PER_SOL)
              })
            )
          }
        } catch (error) {
          throw new Error('Invalid recipients format')
        }
        break

      default:
        throw new Error(`Template ${templateId} not implemented`)
    }

    return instructions
  }

  async simulateWithAnalysis(
    transaction: Transaction,
    config: SimulationConfig = {}
  ): Promise<EnhancedSimulationResult> {
    try {
      const result = await this.connection.simulateTransaction(transaction)

      if (result.value.err) {
        return {
          success: false,
          computeUnitsConsumed: 0,
          fee: 0,
          logs: result.value.logs || [],
          error: JSON.stringify(result.value.err)
        }
      }

      const computeUnitsConsumed = result.value.unitsConsumed || 0
      const fee = 5000 // Base fee in lamports

      // Analyze logs for warnings
      const warnings: string[] = []
      const logs = result.value.logs || []
      
      // Check for common issues
      if (logs.some(log => log.includes('insufficient'))) {
        warnings.push('Transaction may fail due to insufficient balance')
      }
      if (computeUnitsConsumed > 800000) {
        warnings.push('High compute usage - consider optimizing')
      }

      // Gas optimization suggestions
      const gasOptimization = this.analyzeGasUsage(computeUnitsConsumed, config.computeUnits)

      return {
        success: true,
        computeUnitsConsumed,
        fee,
        logs,
        accounts: result.value.accounts?.map((acc, index) => ({
          pubkey: `account_${index}`,
          lamports: acc?.lamports || 0,
          data: Array.isArray(acc?.data) ? acc.data.join('') : (acc?.data || ''),
          owner: acc?.owner || '',
          executable: acc?.executable || false
        })),
        warnings: warnings.length > 0 ? warnings : undefined,
        gasOptimization
      }
    } catch (error) {
      return {
        success: false,
        computeUnitsConsumed: 0,
        fee: 0,
        logs: [],
        error: error instanceof Error ? error.message : 'Unknown simulation error'
      }
    }
  }

  private analyzeGasUsage(consumed: number, requested?: number): any {
    if (!requested) return undefined

    const overhead = 0.1 // 10% overhead
    const recommended = Math.ceil(consumed * (1 + overhead))
    const savings = requested > recommended ? requested - recommended : 0

    return {
      recommendedComputeUnits: recommended,
      potentialSavings: savings
    }
  }

  // Validate transaction before simulation
  validateTransaction(templateId: string, parameters: Record<string, string>): { valid: boolean; errors: string[] } {
    const template = this.getTemplate(templateId)
    if (!template) {
      return { valid: false, errors: ['Invalid template'] }
    }

    const errors: string[] = []

    for (const param of template.parameters) {
      const value = parameters[param.name]
      
      if (param.required && !value) {
        errors.push(`${param.label} is required`)
        continue
      }

      if (value && param.validation) {
        const error = param.validation(value)
        if (error) {
          errors.push(`${param.label}: ${error}`)
        }
      }
    }

    return { valid: errors.length === 0, errors }
  }

  // Get transaction size estimate
  getTransactionSizeEstimate(templateId: string, parameters: Record<string, string>): number {
    const template = this.getTemplate(templateId)
    if (!template) return 0

    // Base transaction size
    let size = 300 // Base transaction overhead

    switch (templateId) {
      case 'sol_transfer':
        size += 64 // Transfer instruction
        break
      case 'token_transfer':
        size += 100 // Token transfer + possible ATA creation
        break
      case 'create_ata':
        size += 100
        break
      case 'memo':
        size += parameters.memo?.length || 0
        break
      case 'multi_transfer':
        try {
          const recipients = JSON.parse(parameters.recipients || '[]')
          size += recipients.length * 64
        } catch {
          size += 64
        }
        break
      default:
        size += 100
    }

    return size
  }
}