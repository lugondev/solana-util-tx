import {
  Connection,
  Transaction,
  VersionedTransaction,
  SendOptions,
  TransactionSignature,
  SignatureStatus,
  Commitment,
} from '@solana/web3.js'
import {
  RetryConfig,
  TransactionStatus,
  TransactionUpdate,
  DEFAULT_RETRY_CONFIG,
  SendTransactionResult,
} from './types'

/**
 * Transaction Retry Manager
 * Handles transaction sending with exponential backoff retry logic
 */
export class RetryManager {
  private connection: Connection
  private config: RetryConfig

  constructor(connection: Connection, config: Partial<RetryConfig> = {}) {
    this.connection = connection
    this.config = { ...DEFAULT_RETRY_CONFIG, ...config }
  }

  /**
   * Send transaction with retry logic
   */
  public async sendTransaction(
    transaction: Transaction | VersionedTransaction,
    options: SendOptions = {},
    onUpdate?: (update: TransactionUpdate) => void
  ): Promise<SendTransactionResult> {
    let attempt = 0
    let lastError: Error | null = null
    const startTime = Date.now()

    while (attempt < this.config.maxRetries) {
      attempt++

      try {
        // Notify attempt start
        onUpdate?.({
          status: TransactionStatus.SENDING,
          attempt,
          message: `Sending transaction (attempt ${attempt}/${this.config.maxRetries})`,
        })

        // Send transaction
        const signature = await this.sendTransactionAttempt(transaction, options)

        // Notify sent
        onUpdate?.({
          status: TransactionStatus.CONFIRMING,
          attempt,
          signature,
          message: 'Transaction sent, awaiting confirmation',
        })

        // Wait for confirmation
        const confirmation = await this.confirmTransaction(
          signature,
          transaction,
          onUpdate
        )

        if (confirmation.success) {
          const duration = Date.now() - startTime

          onUpdate?.({
            status: TransactionStatus.CONFIRMED,
            attempt,
            signature,
            message: `Transaction confirmed in ${duration}ms`,
          })

          return {
            signature,
            success: true,
            attempts: attempt,
            duration,
          }
        }

        // Transaction failed
        lastError = new Error(confirmation.error || 'Transaction failed')

        if (!this.shouldRetry(confirmation.error)) {
          break
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        console.error(`[RetryManager] Attempt ${attempt} failed:`, error)

        // Check if error is retryable
        if (!this.isRetryableError(lastError)) {
          break
        }
      }

      // Check if we should retry
      if (attempt < this.config.maxRetries) {
        const delay = this.calculateBackoff(attempt)

        onUpdate?.({
          status: TransactionStatus.RETRYING,
          attempt,
          message: `Retrying in ${delay}ms...`,
        })

        await this.sleep(delay)

        // Refresh blockhash for next attempt
        if (transaction instanceof Transaction) {
          await this.refreshBlockhash(transaction)
        }
      }
    }

    // All attempts failed
    const duration = Date.now() - startTime

    onUpdate?.({
      status: TransactionStatus.FAILED,
      attempt,
      message: lastError?.message || 'Transaction failed after all retries',
      error: lastError?.message,
    })

    return {
      success: false,
      attempts: attempt,
      duration,
      error: lastError?.message || 'Transaction failed',
    }
  }

  /**
   * Send single transaction attempt
   */
  private async sendTransactionAttempt(
    transaction: Transaction | VersionedTransaction,
    options: SendOptions
  ): Promise<TransactionSignature> {
    if (transaction instanceof Transaction) {
      return await this.connection.sendTransaction(transaction, [], {
        skipPreflight: this.config.skipPreflight,
        maxRetries: 0, // We handle retries ourselves
        ...options,
      })
    } else {
      return await this.connection.sendTransaction(transaction, {
        skipPreflight: this.config.skipPreflight,
        maxRetries: 0,
        ...options,
      })
    }
  }

  /**
   * Confirm transaction
   */
  private async confirmTransaction(
    signature: TransactionSignature,
    transaction: Transaction | VersionedTransaction,
    onUpdate?: (update: TransactionUpdate) => void
  ): Promise<{ success: boolean; error?: string }> {
    const timeout = this.config.confirmationTimeout
    const startTime = Date.now()
    const commitment: Commitment = 'confirmed'

    while (Date.now() - startTime < timeout) {
      try {
        const status = await this.connection.getSignatureStatus(signature)

        if (status?.value) {
          if (status.value.err) {
            return {
              success: false,
              error: JSON.stringify(status.value.err),
            }
          }

          if (status.value.confirmationStatus === commitment) {
            return { success: true }
          }

          // Update progress
          onUpdate?.({
            status: TransactionStatus.CONFIRMING,
            signature,
            message: `Confirmation status: ${status.value.confirmationStatus}`,
            confirmations: status.value.confirmations || 0,
          })
        }

        // Wait before checking again
        await this.sleep(1000)
      } catch (error) {
        console.error('[RetryManager] Error checking status:', error)
      }
    }

    return {
      success: false,
      error: 'Confirmation timeout',
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoff(attempt: number): number {
    const delay = this.config.initialDelay * Math.pow(2, attempt - 1)
    return Math.min(delay, this.config.maxDelay)
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: Error): boolean {
    const message = error.message.toLowerCase()

    const retryablePatterns = [
      'blockhash not found',
      'block height exceeded',
      'timeout',
      'network error',
      'connection',
      'econnrefused',
      'etimedout',
      'esockettimedout',
    ]

    return retryablePatterns.some(pattern => message.includes(pattern))
  }

  /**
   * Check if transaction error suggests retry
   */
  private shouldRetry(error?: string): boolean {
    if (!error) return true

    const message = error.toLowerCase()

    const retryablePatterns = [
      'blockhash not found',
      'block height exceeded',
      'timeout',
    ]

    return retryablePatterns.some(pattern => message.includes(pattern))
  }

  /**
   * Refresh transaction blockhash
   */
  private async refreshBlockhash(transaction: Transaction): Promise<void> {
    const blockhashInfo = await this.connection.getLatestBlockhash('confirmed')
    transaction.recentBlockhash = blockhashInfo.blockhash
    transaction.lastValidBlockHeight = blockhashInfo.lastValidBlockHeight
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Update retry configuration
   */
  public updateConfig(config: Partial<RetryConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  public getConfig(): RetryConfig {
    return { ...this.config }
  }
}

/**
 * Create retry manager instance
 */
export function createRetryManager(
  connection: Connection,
  config?: Partial<RetryConfig>
): RetryManager {
  return new RetryManager(connection, config)
}

/**
 * Send transaction with default retry logic
 */
export async function sendTransactionWithRetry(
  connection: Connection,
  transaction: Transaction | VersionedTransaction,
  options?: SendOptions,
  config?: Partial<RetryConfig>,
  onUpdate?: (update: TransactionUpdate) => void
): Promise<SendTransactionResult> {
  const manager = new RetryManager(connection, config)
  return await manager.sendTransaction(transaction, options, onUpdate)
}

/**
 * Format retry status for display
 */
export function formatRetryStatus(update: TransactionUpdate): string {
  const parts: string[] = []

  if (update.attempt) {
    parts.push(`Attempt ${update.attempt}`)
  }

  if (update.signature) {
    parts.push(`Sig: ${update.signature.slice(0, 8)}...`)
  }

  if (update.confirmations !== undefined) {
    parts.push(`${update.confirmations} confirmations`)
  }

  parts.push(update.message)

  return parts.join(' | ')
}

/**
 * Calculate retry success rate
 */
export function calculateSuccessRate(
  results: SendTransactionResult[]
): number {
  if (results.length === 0) return 0

  const successCount = results.filter(r => r.success).length
  return (successCount / results.length) * 100
}

/**
 * Get average retry attempts
 */
export function getAverageAttempts(results: SendTransactionResult[]): number {
  if (results.length === 0) return 0

  const totalAttempts = results.reduce((sum, r) => sum + r.attempts, 0)
  return totalAttempts / results.length
}
