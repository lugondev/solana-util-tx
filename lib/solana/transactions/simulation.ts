import {
  Connection,
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  SimulatedTransactionResponse,
} from '@solana/web3.js'
import { SimulationResult, SimulationError } from './types'

/**
 * Transaction Simulation Service
 * Simulates transactions before sending to detect errors
 */
export class TransactionSimulator {
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Simulate legacy transaction
   */
  public async simulateTransaction(
    transaction: Transaction
  ): Promise<SimulationResult> {
    try {
      const simulation = await this.connection.simulateTransaction(transaction)

      return this.parseSimulationResponse(simulation.value)
    } catch (error) {
      console.error('[TransactionSimulator] Simulation error:', error)
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  /**
   * Simulate versioned transaction
   */
  public async simulateVersionedTransaction(
    transaction: VersionedTransaction
  ): Promise<SimulationResult> {
    try {
      const simulation = await this.connection.simulateTransaction(transaction, {
        sigVerify: false,
      })

      return this.parseSimulationResponse(simulation.value)
    } catch (error) {
      console.error('[TransactionSimulator] Simulation error:', error)
      return {
        success: false,
        error: this.parseError(error),
      }
    }
  }

  /**
   * Parse simulation response
   */
  private parseSimulationResponse(
    response: SimulatedTransactionResponse
  ): SimulationResult {
    if (response.err) {
      return {
        success: false,
        error: this.formatSimulationError(response.err),
        logs: response.logs || [],
        unitsConsumed: response.unitsConsumed,
      }
    }

    return {
      success: true,
      logs: response.logs || [],
      unitsConsumed: response.unitsConsumed,
      returnData: response.returnData
        ? {
            programId: response.returnData.programId.toString(),
            data: [Buffer.from(response.returnData.data[0], 'base64').toString('hex'), response.returnData.data[1]],
          }
        : undefined,
      accounts: response.accounts || undefined,
    }
  }

  /**
   * Format simulation error for display
   */
  private formatSimulationError(error: any): string {
    if (typeof error === 'string') {
      return error
    }

    if (error.InstructionError) {
      const [index, instructionError] = error.InstructionError
      
      if (typeof instructionError === 'string') {
        return `Instruction ${index}: ${instructionError}`
      }

      if (instructionError.Custom !== undefined) {
        return `Instruction ${index}: Custom error ${instructionError.Custom}`
      }

      return `Instruction ${index}: ${JSON.stringify(instructionError)}`
    }

    return JSON.stringify(error)
  }

  /**
   * Parse generic error
   */
  private parseError(error: any): string {
    if (error instanceof Error) {
      return error.message
    }

    if (typeof error === 'string') {
      return error
    }

    return 'Unknown simulation error'
  }

  /**
   * Get detailed error information
   */
  public parseSimulationError(result: SimulationResult): SimulationError | null {
    if (result.success || !result.error) {
      return null
    }

    return {
      code: this.extractErrorCode(result.error),
      message: result.error,
      details: this.extractErrorDetails(result.error),
      logs: result.logs,
    }
  }

  /**
   * Extract error code from error message
   */
  private extractErrorCode(error: string): string {
    // Common error patterns
    const patterns = [
      /Custom error (\d+)/,
      /Instruction (\d+)/,
      /Error Code: (\w+)/,
    ]

    for (const pattern of patterns) {
      const match = error.match(pattern)
      if (match) {
        return match[1]
      }
    }

    return 'UNKNOWN'
  }

  /**
   * Extract error details
   */
  private extractErrorDetails(error: string): any {
    const details: any = {}

    // Extract instruction index
    const instructionMatch = error.match(/Instruction (\d+)/)
    if (instructionMatch) {
      details.instructionIndex = parseInt(instructionMatch[1])
    }

    // Extract custom error code
    const customMatch = error.match(/Custom error (\d+)/)
    if (customMatch) {
      details.customErrorCode = parseInt(customMatch[1])
    }

    return details
  }

  /**
   * Check if error is retryable
   */
  public isRetryableError(result: SimulationResult): boolean {
    if (result.success) {
      return false
    }

    const error = result.error?.toLowerCase() || ''

    // Retryable error patterns
    const retryablePatterns = [
      'blockhash not found',
      'block height exceeded',
      'timeout',
      'network error',
      'connection',
    ]

    return retryablePatterns.some(pattern => error.includes(pattern))
  }

  /**
   * Get user-friendly error message
   */
  public getUserFriendlyError(result: SimulationResult): string {
    if (result.success) {
      return 'Transaction simulation successful'
    }

    const error = result.error || 'Unknown error'

    // Map technical errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'insufficient funds': 'Insufficient SOL balance to complete transaction',
      'account not found': 'Account does not exist on chain',
      'invalid account data': 'Account data is invalid or corrupted',
      'program failed': 'Smart contract execution failed',
      'blockhash not found': 'Transaction expired, please try again',
      'block height exceeded': 'Transaction expired, please try again',
    }

    for (const [pattern, message] of Object.entries(errorMappings)) {
      if (error.toLowerCase().includes(pattern)) {
        return message
      }
    }

    return error
  }

  /**
   * Estimate compute units needed
   */
  public estimateComputeUnits(result: SimulationResult): number {
    if (!result.unitsConsumed) {
      return 200_000 // Default estimate
    }

    // Add 20% buffer for safety
    return Math.ceil(result.unitsConsumed * 1.2)
  }
}

/**
 * Format compute units for display
 */
export function formatComputeUnits(units: number): string {
  if (units < 1_000) {
    return `${units} CU`
  }

  if (units < 1_000_000) {
    return `${(units / 1_000).toFixed(1)}K CU`
  }

  return `${(units / 1_000_000).toFixed(2)}M CU`
}

/**
 * Calculate compute unit cost
 */
export function calculateComputeCost(
  units: number,
  microLamportsPerUnit: number
): number {
  return Math.ceil((units * microLamportsPerUnit) / 1_000_000)
}

/**
 * Validate compute units
 */
export function validateComputeUnits(units: number): {
  valid: boolean
  error?: string
} {
  if (units < 0) {
    return { valid: false, error: 'Compute units cannot be negative' }
  }

  if (units > 1_400_000) {
    return { valid: false, error: 'Compute units exceed maximum (1.4M)' }
  }

  return { valid: true }
}
