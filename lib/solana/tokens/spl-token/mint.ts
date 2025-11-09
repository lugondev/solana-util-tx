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
import { Metaplex } from '@metaplex-foundation/js'

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

export interface TokenMetadata {
  name: string
  symbol: string
  uri?: string
  description?: string
}

export interface CreateTokenAndMintParams {
  connection: Connection
  payer: PublicKey
  recipient?: PublicKey
  initialSupply?: number
  decimals?: number
  mintAuthority?: PublicKey
  freezeAuthority?: PublicKey
  metadata?: TokenMetadata
}

export interface CreateTokenAndMintResult {
  transaction: Transaction
  mintKeypair: Keypair
  mintAddress: PublicKey
  recipientATA?: PublicKey
  estimatedCost: number
  metadataAddress?: PublicKey
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
  metadata,
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
  let metadataAddress: PublicKey | undefined
  let totalCost = rentExemption / LAMPORTS_PER_SOL + 0.000005

  // Store metadata info for later creation
  // Note: Metaplex metadata creation requires separate transaction
  // This should be handled in the component after mint is created
  if (metadata) {
    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

    const [metadataPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )

    metadataAddress = metadataPDA
  }

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
    metadataAddress,
  }
}

/**
 * Create metadata for an existing token mint using Metaplex
 */
export async function createTokenMetadata({
  connection,
  mintAddress,
  metadata,
  payer,
  mintAuthority,
}: {
  connection: Connection
  mintAddress: PublicKey
  metadata: TokenMetadata
  payer: PublicKey
  mintAuthority?: PublicKey
}): Promise<{
  signature: string
  metadataAddress: PublicKey
}> {
  const metaplex = Metaplex.make(connection)

  try {
    // Create NFT metadata for the token
    const { nft } = await metaplex.nfts().create({
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri || '',
      sellerFeeBasisPoints: 0,
      useExistingMint: mintAddress,
    })

    const TOKEN_METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
    const [metadataAddress] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('metadata'),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mintAddress.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID
    )

    return {
      signature: '', // Metaplex handles the transaction
      metadataAddress,
    }
  } catch (error) {
    throw new Error(`Failed to create token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`)
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