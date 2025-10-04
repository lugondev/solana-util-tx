import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js'
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMinimumBalanceForRentExemptMint,
  MINT_SIZE,
  getMint,
} from '@solana/spl-token'

/**
 * SPL Token minting utilities
 */

export interface CreateTokenParams {
  connection: Connection
  payer: PublicKey
  mintAuthority?: PublicKey
  freezeAuthority?: PublicKey
  decimals?: number
}

export interface CreateTokenResult {
  transaction: Transaction
  mintKeypair: Keypair
  mintAddress: PublicKey
  estimatedCost: number
}

/**
 * Create a new SPL token mint
 */
export async function createToken({
  connection,
  payer,
  mintAuthority,
  freezeAuthority,
  decimals = 9,
}: CreateTokenParams): Promise<CreateTokenResult> {
  const mintKeypair = Keypair.generate()
  const mintAddress = mintKeypair.publicKey

  // Use payer as default authorities
  const mintAuth = mintAuthority || payer
  const freezeAuth = freezeAuthority || payer

  const transaction = new Transaction()

  // Get minimum balance for rent exemption
  const rentExemption = await getMinimumBalanceForRentExemptMint(connection)

  // Create mint account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mintAddress,
    space: MINT_SIZE,
    lamports: rentExemption,
    programId: TOKEN_PROGRAM_ID,
  })

  // Initialize mint
  const initializeMintInstruction = createInitializeMintInstruction(
    mintAddress,
    decimals,
    mintAuth,
    freezeAuth,
    TOKEN_PROGRAM_ID
  )

  transaction.add(createAccountInstruction, initializeMintInstruction)

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payer

  const estimatedCost = rentExemption / LAMPORTS_PER_SOL + 0.000005 // ~0.00144 SOL

  return {
    transaction,
    mintKeypair,
    mintAddress,
    estimatedCost,
  }
}

export interface MintTokensParams {
  connection: Connection
  payer: PublicKey
  mintAddress: PublicKey
  recipient: PublicKey
  amount: number
  mintAuthority: PublicKey
  decimals?: number
  createRecipientATA?: boolean
}

export interface MintTokensResult {
  transaction: Transaction
  recipientATA: PublicKey
  needsRecipientATA: boolean
  estimatedCost: number
}

/**
 * Mint tokens to a recipient
 */
export async function mintTokens({
  connection,
  payer,
  mintAddress,
  recipient,
  amount,
  mintAuthority,
  decimals,
  createRecipientATA = true,
}: MintTokensParams): Promise<MintTokensResult> {
  const transaction = new Transaction()

  // Get mint info if decimals not provided
  let tokenDecimals = decimals
  if (tokenDecimals === undefined) {
    const mintInfo = await getMint(connection, mintAddress)
    tokenDecimals = mintInfo.decimals
  }

  // Calculate amount in token's smallest unit
  const mintAmount = Math.floor(amount * Math.pow(10, tokenDecimals))

  // Get recipient's ATA
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
    await connection.getAccountInfo(recipientATA)
  } catch (error) {
    needsRecipientATA = true
  }

  // Create recipient ATA if needed
  if (needsRecipientATA && createRecipientATA) {
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      payer,
      recipientATA,
      recipient,
      mintAddress,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
    transaction.add(createATAInstruction)
  }

  // Mint tokens
  const mintInstruction = createMintToInstruction(
    mintAddress,
    recipientATA,
    mintAuthority,
    mintAmount,
    [],
    TOKEN_PROGRAM_ID
  )
  transaction.add(mintInstruction)

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payer

  const estimatedCost = needsRecipientATA ? 0.00204 : 0.000005 // SOL

  return {
    transaction,
    recipientATA,
    needsRecipientATA,
    estimatedCost,
  }
}

export interface CreateTokenAndMintParams {
  connection: Connection
  payer: PublicKey
  recipient?: PublicKey
  initialSupply?: number
  decimals?: number
  mintAuthority?: PublicKey
  freezeAuthority?: PublicKey
}

export interface CreateTokenAndMintResult {
  transaction: Transaction
  mintKeypair: Keypair
  mintAddress: PublicKey
  recipientATA?: PublicKey
  estimatedCost: number
}

/**
 * Create a new token and mint initial supply
 */
export async function createTokenAndMint({
  connection,
  payer,
  recipient,
  initialSupply = 0,
  decimals = 9,
  mintAuthority,
  freezeAuthority,
}: CreateTokenAndMintParams): Promise<CreateTokenAndMintResult> {
  const mintKeypair = Keypair.generate()
  const mintAddress = mintKeypair.publicKey

  // Use payer as default authorities and recipient
  const mintAuth = mintAuthority || payer
  const freezeAuth = freezeAuthority || payer
  const tokenRecipient = recipient || payer

  const transaction = new Transaction()

  // Get minimum balance for rent exemption
  const rentExemption = await getMinimumBalanceForRentExemptMint(connection)

  // Create mint account
  const createAccountInstruction = SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: mintAddress,
    space: MINT_SIZE,
    lamports: rentExemption,
    programId: TOKEN_PROGRAM_ID,
  })

  // Initialize mint
  const initializeMintInstruction = createInitializeMintInstruction(
    mintAddress,
    decimals,
    mintAuth,
    freezeAuth,
    TOKEN_PROGRAM_ID
  )

  transaction.add(createAccountInstruction, initializeMintInstruction)

  let recipientATA: PublicKey | undefined
  let totalCost = rentExemption / LAMPORTS_PER_SOL + 0.000005

  // Mint initial supply if specified
  if (initialSupply > 0) {
    recipientATA = await getAssociatedTokenAddress(
      mintAddress,
      tokenRecipient,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Create recipient ATA
    const createATAInstruction = createAssociatedTokenAccountInstruction(
      payer,
      recipientATA,
      tokenRecipient,
      mintAddress,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )

    // Mint initial supply
    const mintAmount = Math.floor(initialSupply * Math.pow(10, decimals))
    const mintInstruction = createMintToInstruction(
      mintAddress,
      recipientATA,
      mintAuth,
      mintAmount,
      [],
      TOKEN_PROGRAM_ID
    )

    transaction.add(createATAInstruction, mintInstruction)
    totalCost += 0.00204 // ATA creation cost
  }

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payer

  return {
    transaction,
    mintKeypair,
    mintAddress,
    recipientATA,
    estimatedCost: totalCost,
  }
}

/**
 * Token creation presets
 */
export const TOKEN_PRESETS = {
  STANDARD: {
    decimals: 9,
    name: 'Standard Token',
    description: 'Standard SPL token with 9 decimals (like SOL)',
  },
  CURRENCY: {
    decimals: 6,
    name: 'Currency Token', 
    description: 'Currency-style token with 6 decimals (like USDC)',
  },
  NFT: {
    decimals: 0,
    name: 'NFT Token',
    description: 'Non-fungible token with 0 decimals',
  },
  UTILITY: {
    decimals: 8,
    name: 'Utility Token',
    description: 'Utility token with 8 decimals',
  },
}