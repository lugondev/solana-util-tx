import {
  Transaction,
  VersionedTransaction,
  TransactionInstruction,
  Commitment,
  Keypair,
  PublicKey,
  TransactionSignature,
  BlockhashWithExpiryBlockHeight,
} from '@solana/web3.js'

/**
 * Priority fee configuration types
 */
export interface PriorityFeeConfig {
  type: 'auto' | 'manual'
  microLamports?: number
  percentile?: number // For auto calculation (0-1)
}

export interface PriorityFeeEstimate {
  min: number
  low: number
  medium: number
  high: number
  veryHigh: number
  unsafeMax: number
}

export type FeeSpeed = 'slow' | 'normal' | 'fast' | 'turbo'

export interface FeeRecommendation {
  speed: FeeSpeed
  microLamports: number
  estimatedTime: string
  description: string
}

/**
 * Transaction builder types
 */
export interface TransactionBuilderOptions {
  feePayer: PublicKey
  recentBlockhash?: string
  lastValidBlockHeight?: number
  priorityFee?: PriorityFeeConfig
  computeUnits?: number
}

export interface BuildTransactionResult {
  transaction: Transaction | VersionedTransaction
  blockhashInfo: BlockhashWithExpiryBlockHeight
}

/**
 * Transaction simulation types
 */
export interface SimulationResult {
  success: boolean
  error?: string
  logs?: string[]
  unitsConsumed?: number
  returnData?: {
    programId: string
    data: string[]
  }
  accounts?: any[]
}

export interface SimulationError {
  code: string
  message: string
  details?: any
  logs?: string[]
}

/**
 * Transaction retry types
 */
export interface RetryConfig {
  maxRetries: number
  initialDelay: number
  maxDelay: number
  backoffMultiplier: number
  confirmationTimeout: number
  skipPreflight?: boolean
  refreshBlockhash?: boolean
}

export interface SendTransactionResult {
  signature?: string
  success: boolean
  attempts: number
  duration: number
  error?: string
}

export interface RetryResult<T> {
  success: boolean
  result?: T
  error?: Error
  attempts: number
  lastBlockhash?: string
}

export interface RetryAttempt {
  attemptNumber: number
  timestamp: number
  error?: Error
  blockhash?: string
}

/**
 * Transaction status types
 */
export enum TransactionStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  CONFIRMING = 'confirming',
  CONFIRMED = 'confirmed',
  FINALIZED = 'finalized',
  RETRYING = 'retrying',
  FAILED = 'failed',
  EXPIRED = 'expired',
}

export interface TransactionUpdate {
  signature?: string
  status: TransactionStatus
  attempt?: number
  message: string
  slot?: number
  blockTime?: number
  confirmations?: number
  error?: string
  logs?: string[]
}

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  confirmationTimeout: 30000, // 30 seconds
  skipPreflight: false,
  refreshBlockhash: true,
}

export interface TransactionInfo {
  signature: TransactionSignature
  slot: number
  blockTime: number | null
  status: TransactionStatus
  fee?: number
  computeUnitsConsumed?: number
  instructions: TransactionInstruction[]
  logs?: string[]
  error?: string
}

/**
 * Transaction builder state
 */
export interface TransactionBuilderState {
  instructions: TransactionInstruction[]
  signers: Keypair[]
  feePayer?: PublicKey
  recentBlockhash?: string
  priorityFee?: number
  computeUnits?: number
}

/**
 * Versioned transaction types
 */
export type TransactionVersion = 'legacy' | 'v0'

export interface VersionedTransactionOptions {
  version: TransactionVersion
  addressLookupTables?: PublicKey[]
}

/**
 * Send transaction options
 */
export interface SendTransactionOptions {
  skipPreflight?: boolean
  preflightCommitment?: Commitment
  maxRetries?: number
  minContextSlot?: number
}

/**
 * Transaction history types
 */
export interface TransactionHistoryItem {
  signature: string
  timestamp: number
  status: TransactionStatus
  type: string
  amount?: number
  fee: number
  from?: string
  to?: string
  error?: string
}

export interface TransactionHistoryFilter {
  status?: TransactionStatus
  type?: string
  dateFrom?: Date
  dateTo?: Date
  limit?: number
  offset?: number
}

/**
 * Compute budget types
 */
export interface ComputeBudgetConfig {
  units: number
  microLamports: number
}

export const DEFAULT_COMPUTE_UNITS = 200_000
export const MAX_COMPUTE_UNITS = 1_400_000
export const DEFAULT_PRIORITY_FEE = 1_000 // microLamports

/**
 * Transaction constants
 */
export const TRANSACTION_CONSTANTS = {
  MAX_TRANSACTION_SIZE: 1232, // bytes
  MAX_INSTRUCTIONS: 64,
  SIGNATURE_LENGTH: 64,
  BLOCKHASH_LENGTH: 32,
  DEFAULT_SIGNATURE_FEE: 5000, // lamports
} as const

/**
 * Fee presets
 */
export const FEE_PRESETS: Record<FeeSpeed, { multiplier: number; description: string }> = {
  slow: {
    multiplier: 0.5,
    description: 'Low priority - may take longer',
  },
  normal: {
    multiplier: 1.0,
    description: 'Standard priority - recommended',
  },
  fast: {
    multiplier: 2.0,
    description: 'High priority - faster confirmation',
  },
  turbo: {
    multiplier: 5.0,
    description: 'Maximum priority - fastest confirmation',
  },
} as const
