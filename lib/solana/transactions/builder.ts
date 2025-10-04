import {
  Connection,
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  TransactionMessage,
  Keypair,
  PublicKey,
  ComputeBudgetProgram,
} from '@solana/web3.js'
import {
  TransactionBuilderOptions,
  BuildTransactionResult,
  TransactionVersion,
  ComputeBudgetConfig,
  DEFAULT_COMPUTE_UNITS,
} from './types'

/**
 * Transaction Builder
 * Fluent API for building Solana transactions
 */
export class TransactionBuilder {
  private connection: Connection
  private instructions: TransactionInstruction[] = []
  private signers: Keypair[] = []
  private options: TransactionBuilderOptions

  constructor(connection: Connection, options: TransactionBuilderOptions) {
    this.connection = connection
    this.options = options
  }

  /**
   * Add instruction to transaction
   */
  public addInstruction(instruction: TransactionInstruction): this {
    this.instructions.push(instruction)
    return this
  }

  /**
   * Add multiple instructions
   */
  public addInstructions(instructions: TransactionInstruction[]): this {
    this.instructions.push(...instructions)
    return this
  }

  /**
   * Add signer
   */
  public addSigner(signer: Keypair): this {
    this.signers.push(signer)
    return this
  }

  /**
   * Add multiple signers
   */
  public addSigners(signers: Keypair[]): this {
    this.signers.push(...signers)
    return this
  }

  /**
   * Set priority fee
   */
  public setPriorityFee(microLamports: number): this {
    this.options.priorityFee = {
      type: 'manual',
      microLamports,
    }
    return this
  }

  /**
   * Set compute units
   */
  public setComputeUnits(units: number): this {
    this.options.computeUnits = units
    return this
  }

  /**
   * Set compute budget (units + priority fee)
   */
  public setComputeBudget(config: ComputeBudgetConfig): this {
    this.options.computeUnits = config.units
    this.options.priorityFee = {
      type: 'manual',
      microLamports: config.microLamports,
    }
    return this
  }

  /**
   * Build legacy transaction
   */
  public async buildLegacy(): Promise<BuildTransactionResult> {
    const transaction = new Transaction()

    // Add compute budget instructions if needed
    const budgetInstructions = this.buildComputeBudgetInstructions()
    if (budgetInstructions.length > 0) {
      transaction.add(...budgetInstructions)
    }

    // Add user instructions
    transaction.add(...this.instructions)

    // Get recent blockhash
    const blockhashInfo = await this.getBlockhashInfo()
    transaction.recentBlockhash = blockhashInfo.blockhash
    transaction.lastValidBlockHeight = blockhashInfo.lastValidBlockHeight
    transaction.feePayer = this.options.feePayer

    return {
      transaction,
      blockhashInfo,
    }
  }

  /**
   * Build versioned transaction (v0)
   */
  public async buildVersioned(): Promise<BuildTransactionResult> {
    // Add compute budget instructions if needed
    const budgetInstructions = this.buildComputeBudgetInstructions()
    const allInstructions = [...budgetInstructions, ...this.instructions]

    // Get recent blockhash
    const blockhashInfo = await this.getBlockhashInfo()

    // Create transaction message
    const message = new TransactionMessage({
      payerKey: this.options.feePayer,
      recentBlockhash: blockhashInfo.blockhash,
      instructions: allInstructions,
    }).compileToV0Message()

    const transaction = new VersionedTransaction(message)

    return {
      transaction,
      blockhashInfo,
    }
  }

  /**
   * Build compute budget instructions
   */
  private buildComputeBudgetInstructions(): TransactionInstruction[] {
    const instructions: TransactionInstruction[] = []

    // Add compute unit limit if specified
    if (this.options.computeUnits) {
      instructions.push(
        ComputeBudgetProgram.setComputeUnitLimit({
          units: this.options.computeUnits,
        })
      )
    }

    // Add compute unit price (priority fee) if specified
    if (this.options.priorityFee?.microLamports) {
      instructions.push(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: this.options.priorityFee.microLamports,
        })
      )
    }

    return instructions
  }

  /**
   * Get blockhash info
   */
  private async getBlockhashInfo() {
    if (this.options.recentBlockhash && this.options.lastValidBlockHeight) {
      return {
        blockhash: this.options.recentBlockhash,
        lastValidBlockHeight: this.options.lastValidBlockHeight,
      }
    }

    return await this.connection.getLatestBlockhash('confirmed')
  }

  /**
   * Reset builder state
   */
  public reset(): this {
    this.instructions = []
    this.signers = []
    return this
  }

  /**
   * Get current instructions
   */
  public getInstructions(): TransactionInstruction[] {
    return [...this.instructions]
  }

  /**
   * Get current signers
   */
  public getSigners(): Keypair[] {
    return [...this.signers]
  }

  /**
   * Get instruction count
   */
  public getInstructionCount(): number {
    return this.instructions.length
  }
}

/**
 * Create transaction builder
 */
export function createTransactionBuilder(
  connection: Connection,
  options: TransactionBuilderOptions
): TransactionBuilder {
  return new TransactionBuilder(connection, options)
}

/**
 * Helper: Build simple transfer transaction
 */
export async function buildTransferTransaction(
  connection: Connection,
  from: PublicKey,
  to: PublicKey,
  lamports: number
): Promise<Transaction> {
  const builder = new TransactionBuilder(connection, {
    feePayer: from,
  })

  const transferInstruction = {
    keys: [
      { pubkey: from, isSigner: true, isWritable: true },
      { pubkey: to, isSigner: false, isWritable: true },
    ],
    programId: new PublicKey('11111111111111111111111111111111'),
    data: Buffer.from([
      2, 0, 0, 0, // Transfer instruction
      ...new Uint8Array(new BigUint64Array([BigInt(lamports)]).buffer),
    ]),
  }

  builder.addInstruction(transferInstruction)

  const result = await builder.buildLegacy()
  return result.transaction as Transaction
}

/**
 * Estimate transaction size
 */
export function estimateTransactionSize(
  instructionCount: number,
  signerCount: number
): number {
  const SIGNATURE_SIZE = 64
  const PUBKEY_SIZE = 32
  const INSTRUCTION_OVERHEAD = 10

  return (
    signerCount * SIGNATURE_SIZE +
    instructionCount * (PUBKEY_SIZE + INSTRUCTION_OVERHEAD) +
    100 // Base overhead
  )
}

/**
 * Validate transaction before sending
 */
export function validateTransaction(
  transaction: Transaction | VersionedTransaction
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (transaction instanceof Transaction) {
    // Legacy transaction
    if (transaction.instructions.length === 0) {
      errors.push('Transaction has no instructions')
    }

    if (transaction.instructions.length > 64) {
      errors.push('Too many instructions (max 64)')
    }

    if (!transaction.recentBlockhash) {
      errors.push('Missing recent blockhash')
    }

    if (!transaction.feePayer) {
      errors.push('Missing fee payer')
    }
  } else {
    // Versioned transaction
    if (transaction.message.compiledInstructions.length === 0) {
      errors.push('Transaction has no instructions')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
