import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  getMint,
} from '@solana/spl-token'

/**
 * SPL Token transfer utilities
 */

export interface TokenTransferParams {
  connection: Connection
  sender: PublicKey
  recipient: PublicKey
  mintAddress: PublicKey
  amount: number
  decimals?: number
  createRecipientATA?: boolean
}

export interface TokenTransferResult {
  transaction: Transaction
  senderATA: PublicKey
  recipientATA: PublicKey
  needsRecipientATA: boolean
  estimatedFee: number
}

/**
 * Build SPL token transfer transaction
 */
export async function buildTokenTransfer({
  connection,
  sender,
  recipient,
  mintAddress,
  amount,
  decimals,
  createRecipientATA = true,
}: TokenTransferParams): Promise<TokenTransferResult> {
  const transaction = new Transaction()

  // Get mint info if decimals not provided
  let tokenDecimals = decimals
  if (tokenDecimals === undefined) {
    const mintInfo = await getMint(connection, mintAddress)
    tokenDecimals = mintInfo.decimals
  }

  // Calculate amount in token's smallest unit
  const transferAmount = Math.floor(amount * Math.pow(10, tokenDecimals))

  // Get Associated Token Addresses
  const senderATA = await getAssociatedTokenAddress(
    mintAddress,
    sender,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  const recipientATA = await getAssociatedTokenAddress(
    mintAddress,
    recipient,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  )

  // Check if recipient ATA exists
  let needsRecipientATA = false
  try {
    await getAccount(connection, recipientATA)
  } catch (error) {
    if (error instanceof TokenAccountNotFoundError || error instanceof TokenInvalidAccountOwnerError) {
      needsRecipientATA = true
    } else {
      throw error
    }
  }

  // Create recipient ATA if needed and requested
  if (needsRecipientATA && createRecipientATA) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      sender, // payer
      recipientATA,
      recipient, // owner
      mintAddress,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    transaction.add(createATAInstruction)
  }

  // Create transfer instruction
  const transferInstruction = createTransferInstruction(
    senderATA,
    recipientATA,
    sender,
    transferAmount,
    [],
    TOKEN_PROGRAM_ID
  )
  transaction.add(transferInstruction)

  // Estimate fees (simplified)
  const estimatedFee = needsRecipientATA ? 0.00204 : 0.000005 // SOL

  return {
    transaction,
    senderATA,
    recipientATA,
    needsRecipientATA,
    estimatedFee,
  }
}

/**
 * Get token account balance
 */
export async function getTokenBalance(
  connection: Connection,
  tokenAccount: PublicKey
): Promise<{
  balance: number
  decimals: number
  uiAmount: number
} | null> {
  try {
    const accountInfo = await getAccount(connection, tokenAccount)
    const mintInfo = await getMint(connection, accountInfo.mint)

    const balance = Number(accountInfo.amount)
    const uiAmount = balance / Math.pow(10, mintInfo.decimals)

    return {
      balance,
      decimals: mintInfo.decimals,
      uiAmount,
    }
  } catch (error) {
    console.error('Error getting token balance:', error)
    return null
  }
}

/**
 * Get all token accounts for an owner
 */
export async function getTokenAccounts(
  connection: Connection,
  owner: PublicKey
): Promise<Array<{
  pubkey: PublicKey
  mint: PublicKey
  balance: number
  decimals: number
  uiAmount: number
}>> {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(owner, {
      programId: TOKEN_PROGRAM_ID,
    })

    return tokenAccounts.value.map((accountInfo) => {
      const data = accountInfo.account.data.parsed.info
      return {
        pubkey: accountInfo.pubkey,
        mint: new PublicKey(data.mint),
        balance: parseInt(data.tokenAmount.amount),
        decimals: data.tokenAmount.decimals,
        uiAmount: parseFloat(data.tokenAmount.uiAmount || '0'),
      }
    })
  } catch (error) {
    console.error('Error getting token accounts:', error)
    return []
  }
}

/**
 * Check if address has sufficient token balance
 */
export async function hasTokenBalance(
  connection: Connection,
  owner: PublicKey,
  mintAddress: PublicKey,
  requiredAmount: number
): Promise<{
  hasBalance: boolean
  currentBalance: number
  ata: PublicKey
}> {
  try {
    const ata = await getAssociatedTokenAddress(
      mintAddress,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    const balance = await getTokenBalance(connection, ata)
    
    return {
      hasBalance: balance ? balance.uiAmount >= requiredAmount : false,
      currentBalance: balance ? balance.uiAmount : 0,
      ata,
    }
  } catch (error) {
    return {
      hasBalance: false,
      currentBalance: 0,
      ata: PublicKey.default,
    }
  }
}

/**
 * Popular token mint addresses
 */
export const POPULAR_TOKENS = {
  USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
  USDT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  SOL: new PublicKey('So11111111111111111111111111111111111111112'), // Wrapped SOL
  BONK: new PublicKey('DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  WIF: new PublicKey('EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
  JUP: new PublicKey('JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'),
  RAY: new PublicKey('4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R'),
  ORCA: new PublicKey('orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE'),
}

/**
 * Get token metadata (simplified)
 */
export interface TokenMetadata {
  name: string
  symbol: string
  decimals: number
  mint: PublicKey
  logoURI?: string
}

export const TOKEN_METADATA: Record<string, TokenMetadata> = {
  [POPULAR_TOKENS.USDC.toBase58()]: {
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    mint: POPULAR_TOKENS.USDC,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  },
  [POPULAR_TOKENS.USDT.toBase58()]: {
    name: 'Tether USD',
    symbol: 'USDT',
    decimals: 6,
    mint: POPULAR_TOKENS.USDT,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.svg',
  },
  [POPULAR_TOKENS.SOL.toBase58()]: {
    name: 'Wrapped SOL',
    symbol: 'SOL',
    decimals: 9,
    mint: POPULAR_TOKENS.SOL,
  },
  [POPULAR_TOKENS.BONK.toBase58()]: {
    name: 'Bonk',
    symbol: 'BONK',
    decimals: 5,
    mint: POPULAR_TOKENS.BONK,
  },
  [POPULAR_TOKENS.WIF.toBase58()]: {
    name: 'dogwifhat',
    symbol: 'WIF',
    decimals: 6,
    mint: POPULAR_TOKENS.WIF,
  },
  [POPULAR_TOKENS.JUP.toBase58()]: {
    name: 'Jupiter',
    symbol: 'JUP',
    decimals: 6,
    mint: POPULAR_TOKENS.JUP,
  },
  [POPULAR_TOKENS.RAY.toBase58()]: {
    name: 'Raydium',
    symbol: 'RAY',
    decimals: 6,
    mint: POPULAR_TOKENS.RAY,
  },
  [POPULAR_TOKENS.ORCA.toBase58()]: {
    name: 'Orca',
    symbol: 'ORCA',
    decimals: 6,
    mint: POPULAR_TOKENS.ORCA,
  },
}

/**
 * Get token metadata by mint address
 */
export async function getTokenMetadata(
  connection: Connection,
  mintAddress: PublicKey
): Promise<TokenMetadata | null> {
  const mintStr = mintAddress.toBase58()
  
  // Check if it's a known token
  if (TOKEN_METADATA[mintStr]) {
    return TOKEN_METADATA[mintStr]
  }

  // Fallback: get basic info from mint account
  try {
    const mintInfo = await getMint(connection, mintAddress)
    return {
      name: 'Unknown Token',
      symbol: 'UNK',
      decimals: mintInfo.decimals,
      mint: mintAddress,
    }
  } catch (error) {
    console.error('Error getting token metadata:', error)
    return null
  }
}