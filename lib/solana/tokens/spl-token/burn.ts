import {
  Connection,
  PublicKey,
  Transaction,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createBurnInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  getMint,
} from '@solana/spl-token'

/**
 * SPL Token burning utilities
 */

export interface BurnTokensParams {
  connection: Connection
  owner: PublicKey
  mintAddress: PublicKey
  amount: number
  decimals?: number
}

export interface BurnTokensResult {
  transaction: Transaction
  tokenAccount: PublicKey
  burnAmount: number
  estimatedCost: number
}

/**
 * Burn SPL tokens from owner's account
 */
export async function burnTokens({
  connection,
  owner,
  mintAddress,
  amount,
  decimals,
}: BurnTokensParams): Promise<BurnTokensResult> {
  const transaction = new Transaction()

  // Get mint info if decimals not provided
  let tokenDecimals = decimals
  if (tokenDecimals === undefined) {
    const mintInfo = await getMint(connection, mintAddress)
    tokenDecimals = mintInfo.decimals
  }

  // Calculate amount in token's smallest unit
  const burnAmount = Math.floor(amount * Math.pow(10, tokenDecimals))

  // Get owner's ATA
  const tokenAccount = await getAssociatedTokenAddress(
    mintAddress,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  // Verify token account exists and has sufficient balance
  try {
    const accountInfo = await getAccount(connection, tokenAccount)
    const currentBalance = Number(accountInfo.amount)
    
    if (currentBalance < burnAmount) {
      throw new Error(`Insufficient balance. Available: ${currentBalance / Math.pow(10, tokenDecimals)}, Required: ${amount}`)
    }
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
      throw new Error('Token account not found or invalid owner')
    }
    throw error
  }

  // Create burn instruction
  const burnInstruction = createBurnInstruction(
    tokenAccount,
    mintAddress,
    owner,
    burnAmount,
    [],
    TOKEN_PROGRAM_ID
  )

  transaction.add(burnInstruction)

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = owner

  const estimatedCost = 0.000005 // SOL

  return {
    transaction,
    tokenAccount,
    burnAmount,
    estimatedCost,
  }
}

/**
 * Get burnable token balance
 */
export async function getBurnableBalance(
  connection: Connection,
  owner: PublicKey,
  mintAddress: PublicKey
): Promise<{
  balance: number
  decimals: number
  uiAmount: number
  canBurn: boolean
} | null> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      mintAddress,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const accountInfo = await getAccount(connection, tokenAccount)
    const mintInfo = await getMint(connection, mintAddress)

    const balance = Number(accountInfo.amount)
    const uiAmount = balance / Math.pow(10, mintInfo.decimals)

    return {
      balance,
      decimals: mintInfo.decimals,
      uiAmount,
      canBurn: balance > 0,
    }
  } catch (error) {
    console.error('Error getting burnable balance:', error)
    return null
  }
}

/**
 * Validate burn amount
 */
export async function validateBurnAmount(
  connection: Connection,
  owner: PublicKey,
  mintAddress: PublicKey,
  amount: number
): Promise<{
  valid: boolean
  error?: string
  currentBalance?: number
  maxBurnable?: number
}> {
  try {
    if (amount <= 0) {
      return {
        valid: false,
        error: 'Amount must be greater than 0',
      }
    }

    const burnableBalance = await getBurnableBalance(connection, owner, mintAddress)
    
    if (!burnableBalance) {
      return {
        valid: false,
        error: 'Token account not found or no balance available',
      }
    }

    if (!burnableBalance.canBurn) {
      return {
        valid: false,
        error: 'No tokens available to burn',
        currentBalance: burnableBalance.uiAmount,
        maxBurnable: 0,
      }
    }

    if (amount > burnableBalance.uiAmount) {
      return {
        valid: false,
        error: `Insufficient balance. Maximum burnable: ${burnableBalance.uiAmount}`,
        currentBalance: burnableBalance.uiAmount,
        maxBurnable: burnableBalance.uiAmount,
      }
    }

    return {
      valid: true,
      currentBalance: burnableBalance.uiAmount,
      maxBurnable: burnableBalance.uiAmount,
    }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    }
  }
}

/**
 * Burn all tokens (close account after burn)
 */
export async function burnAllTokens({
  connection,
  owner,
  mintAddress,
}: Omit<BurnTokensParams, 'amount' | 'decimals'>): Promise<BurnTokensResult> {
  const burnableBalance = await getBurnableBalance(connection, owner, mintAddress)
  
  if (!burnableBalance || !burnableBalance.canBurn) {
    throw new Error('No tokens available to burn')
  }

  return burnTokens({
    connection,
    owner,
    mintAddress,
    amount: burnableBalance.uiAmount,
    decimals: burnableBalance.decimals,
  })
}

/**
 * Burn presets
 */
export const BURN_PRESETS = {
  QUARTER: { percentage: 25, label: '25%' },
  HALF: { percentage: 50, label: '50%' },
  THREE_QUARTER: { percentage: 75, label: '75%' },
  ALL: { percentage: 100, label: '100% (All)' },
}

/**
 * Calculate burn amount by percentage
 */
export function calculateBurnByPercentage(
  totalBalance: number,
  percentage: number
): number {
  if (percentage < 0 || percentage > 100) {
    throw new Error('Percentage must be between 0 and 100')
  }
  return (totalBalance * percentage) / 100
}