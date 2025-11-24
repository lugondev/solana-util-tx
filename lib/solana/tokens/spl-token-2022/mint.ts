import {
	Connection,
	PublicKey,
	Transaction,
	Keypair,
	SystemProgram,
	LAMPORTS_PER_SOL,
	TransactionInstruction,
} from '@solana/web3.js'
import {
	TOKEN_2022_PROGRAM_ID,
	ASSOCIATED_TOKEN_PROGRAM_ID,
	getAssociatedTokenAddress,
	createInitializeMintInstruction,
	createAssociatedTokenAccountInstruction,
	createMintToInstruction,
	getMintLen,
	ExtensionType,
	createInitializeTransferFeeConfigInstruction,
	createInitializeDefaultAccountStateInstruction,
	createInitializePermanentDelegateInstruction,
	createInitializeNonTransferableMintInstruction,
	createInitializeMintCloseAuthorityInstruction,
	createInitializeInterestBearingMintInstruction,
	createInitializeTransferHookInstruction,
	createInitializeMetadataPointerInstruction,
	AccountState,
} from '@solana/spl-token'
import { createCreateMetadataAccountV3Instruction, PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata'

/**
 * SPL Token-2022 Extension Types
 */
export interface TransferFeeConfig {
	transferFeeBasisPoints: number // 0-10000 (0-100%)
	maximumFee: bigint
	transferFeeConfigAuthority?: PublicKey
	withdrawWithheldAuthority?: PublicKey
}

export interface DefaultAccountState {
	state: AccountState.Initialized | AccountState.Frozen
}

export interface InterestBearingConfig {
	rateAuthority: PublicKey
	rate: number // Interest rate in basis points per year
}

export interface TransferHookConfig {
	authority: PublicKey
	programId: PublicKey
}

export interface MetadataPointerConfig {
	authority?: PublicKey
	metadataAddress?: PublicKey
}

export interface PermanentDelegateConfig {
	delegate: PublicKey
}

export interface MintCloseAuthorityConfig {
	closeAuthority: PublicKey
}

export interface Token2022Metadata {
	name: string
	symbol: string
	uri?: string
	description?: string
}

/**
 * Token-2022 Extensions Configuration
 */
export interface Token2022Extensions {
	transferFee?: TransferFeeConfig
	defaultAccountState?: DefaultAccountState
	interestBearing?: InterestBearingConfig
	transferHook?: TransferHookConfig
	metadataPointer?: MetadataPointerConfig
	permanentDelegate?: PermanentDelegateConfig
	mintCloseAuthority?: MintCloseAuthorityConfig
	nonTransferable?: boolean
	confidentialTransfer?: boolean // Note: requires additional setup
	memoTransfer?: boolean // Note: requires additional setup
}

export interface CreateToken2022Params {
	connection: Connection
	payer: PublicKey
	mintAuthority?: PublicKey
	freezeAuthority?: PublicKey
	decimals?: number
	extensions?: Token2022Extensions
	metadata?: Token2022Metadata
}

export interface CreateToken2022Result {
	transaction: Transaction
	mintKeypair: Keypair
	mintAddress: PublicKey
	estimatedCost: number
	enabledExtensions: ExtensionType[]
	metadataAddress?: PublicKey
}

/**
 * Get enabled extension types from config
 */
function getExtensionTypes(extensions?: Token2022Extensions): ExtensionType[] {
	if (!extensions) return []

	const types: ExtensionType[] = []

	if (extensions.transferFee) types.push(ExtensionType.TransferFeeConfig)
	if (extensions.defaultAccountState) types.push(ExtensionType.DefaultAccountState)
	if (extensions.interestBearing) types.push(ExtensionType.InterestBearingConfig)
	if (extensions.transferHook) types.push(ExtensionType.TransferHook)
	if (extensions.metadataPointer) types.push(ExtensionType.MetadataPointer)
	if (extensions.permanentDelegate) types.push(ExtensionType.PermanentDelegate)
	if (extensions.mintCloseAuthority) types.push(ExtensionType.MintCloseAuthority)
	if (extensions.nonTransferable) types.push(ExtensionType.NonTransferable)
	if (extensions.confidentialTransfer) types.push(ExtensionType.ConfidentialTransferMint)
	if (extensions.memoTransfer) types.push(ExtensionType.MemoTransfer)

	return types
}

/**
 * Create extension initialization instructions
 */
function createExtensionInstructions(
	mintAddress: PublicKey,
	mintAuthority: PublicKey,
	extensions?: Token2022Extensions
): TransactionInstruction[] {
	if (!extensions) return []

	const instructions: TransactionInstruction[] = []

	// Transfer Fee Config - must be initialized before mint initialization
	if (extensions.transferFee) {
		const { transferFeeBasisPoints, maximumFee, transferFeeConfigAuthority, withdrawWithheldAuthority } = extensions.transferFee

		instructions.push(
			createInitializeTransferFeeConfigInstruction(
				mintAddress,
				transferFeeConfigAuthority || mintAuthority,
				withdrawWithheldAuthority || mintAuthority,
				transferFeeBasisPoints,
				maximumFee,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Default Account State
	if (extensions.defaultAccountState) {
		instructions.push(
			createInitializeDefaultAccountStateInstruction(
				mintAddress,
				extensions.defaultAccountState.state,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Interest Bearing Config
	if (extensions.interestBearing) {
		instructions.push(
			createInitializeInterestBearingMintInstruction(
				mintAddress,
				extensions.interestBearing.rateAuthority,
				extensions.interestBearing.rate,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Transfer Hook
	if (extensions.transferHook) {
		instructions.push(
			createInitializeTransferHookInstruction(
				mintAddress,
				extensions.transferHook.authority,
				extensions.transferHook.programId,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Metadata Pointer
	if (extensions.metadataPointer) {
		instructions.push(
			createInitializeMetadataPointerInstruction(
				mintAddress,
				extensions.metadataPointer.authority || mintAuthority,
				extensions.metadataPointer.metadataAddress || mintAddress,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Permanent Delegate
	if (extensions.permanentDelegate) {
		instructions.push(
			createInitializePermanentDelegateInstruction(
				mintAddress,
				extensions.permanentDelegate.delegate,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Mint Close Authority
	if (extensions.mintCloseAuthority) {
		instructions.push(
			createInitializeMintCloseAuthorityInstruction(
				mintAddress,
				extensions.mintCloseAuthority.closeAuthority,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Non Transferable
	if (extensions.nonTransferable) {
		instructions.push(
			createInitializeNonTransferableMintInstruction(
				mintAddress,
				TOKEN_2022_PROGRAM_ID
			)
		)
	}

	// Note: Confidential Transfer and Memo Transfer require additional setup
	// and are not included in this basic implementation

	return instructions
}

/**
 * Create a new SPL Token-2022 mint with extensions
 */
export async function createToken2022({
	connection,
	payer,
	mintAuthority,
	freezeAuthority,
	decimals = 9,
	extensions,
}: CreateToken2022Params): Promise<CreateToken2022Result> {
	const mintKeypair = Keypair.generate()
	const mintAddress = mintKeypair.publicKey

	// Use payer as default authorities
	const mintAuth = mintAuthority || payer
	const freezeAuth = freezeAuthority || payer

	const transaction = new Transaction()

	// Get extension types
	const extensionTypes = getExtensionTypes(extensions)

	// Calculate space needed for mint account with extensions
	const mintLen = getMintLen(extensionTypes)

	// Get minimum balance for rent exemption
	const rentExemption = await connection.getMinimumBalanceForRentExemption(mintLen)

	// Create mint account
	const createAccountInstruction = SystemProgram.createAccount({
		fromPubkey: payer,
		newAccountPubkey: mintAddress,
		space: mintLen,
		lamports: rentExemption,
		programId: TOKEN_2022_PROGRAM_ID,
	})

	transaction.add(createAccountInstruction)

	// Add extension initialization instructions (must be before mint initialization)
	const extensionInstructions = createExtensionInstructions(mintAddress, mintAuth, extensions)
	extensionInstructions.forEach(ix => transaction.add(ix))

	// Initialize mint (must be last)
	const initializeMintInstruction = createInitializeMintInstruction(
		mintAddress,
		decimals,
		mintAuth,
		freezeAuth,
		TOKEN_2022_PROGRAM_ID
	)

	transaction.add(initializeMintInstruction)

	// Get recent blockhash
	const { blockhash } = await connection.getLatestBlockhash()
	transaction.recentBlockhash = blockhash
	transaction.feePayer = payer

	// Calculate estimated cost
	const baseInstructionCost = 0.000005 // Per instruction
	const estimatedCost = rentExemption / LAMPORTS_PER_SOL + (transaction.instructions.length * baseInstructionCost)

	return {
		transaction,
		mintKeypair,
		mintAddress,
		estimatedCost,
		enabledExtensions: extensionTypes,
	}
}

export interface CreateToken2022AndMintParams extends CreateToken2022Params {
	recipient?: PublicKey
	initialSupply?: number
	metadata?: Token2022Metadata
}

export interface CreateToken2022AndMintResult extends CreateToken2022Result {
	recipientATA?: PublicKey
	metadataAddress?: PublicKey
}

/**
 * Create a new Token-2022 and mint initial supply
 */
export async function createToken2022AndMint({
	connection,
	payer,
	recipient,
	initialSupply = 0,
	decimals = 9,
	mintAuthority,
	freezeAuthority,
	extensions,
	metadata,
}: CreateToken2022AndMintParams): Promise<CreateToken2022AndMintResult> {
	const mintKeypair = Keypair.generate()
	const mintAddress = mintKeypair.publicKey

	// Use payer as default authorities and recipient
	const mintAuth = mintAuthority || payer
	const freezeAuth = freezeAuthority || payer
	const tokenRecipient = recipient || payer

	// Auto-enable metadata pointer if metadata is provided
	let finalExtensions = extensions
	if (metadata && !extensions?.metadataPointer) {
		finalExtensions = {
			...extensions,
			metadataPointer: {
				authority: mintAuth,
				metadataAddress: mintAddress, // Store metadata in mint account itself
			}
		}
	}

	const transaction = new Transaction()

	// Get extension types
	const extensionTypes = getExtensionTypes(finalExtensions)

	// Calculate space needed for mint account with extensions
	const mintLen = getMintLen(extensionTypes)

	// Get minimum balance for rent exemption
	const rentExemption = await connection.getMinimumBalanceForRentExemption(mintLen)

	// Create mint account
	const createAccountInstruction = SystemProgram.createAccount({
		fromPubkey: payer,
		newAccountPubkey: mintAddress,
		space: mintLen,
		lamports: rentExemption,
		programId: TOKEN_2022_PROGRAM_ID,
	})

	transaction.add(createAccountInstruction)

	// Add extension initialization instructions (must be before mint initialization)
	const extensionInstructions = createExtensionInstructions(mintAddress, mintAuth, finalExtensions)
	extensionInstructions.forEach(ix => transaction.add(ix))

	// Initialize mint (must be last of mint setup)
	const initializeMintInstruction = createInitializeMintInstruction(
		mintAddress,
		decimals,
		mintAuth,
		freezeAuth,
		TOKEN_2022_PROGRAM_ID
	)

	transaction.add(initializeMintInstruction)

	let recipientATA: PublicKey | undefined
	let metadataAddress: PublicKey | undefined
	let totalCost = rentExemption / LAMPORTS_PER_SOL

	// Create metadata on-chain if provided
	if (metadata) {
		const [metadataPDA] = PublicKey.findProgramAddressSync(
			[
				Buffer.from('metadata'),
				TOKEN_METADATA_PROGRAM_ID.toBuffer(),
				mintAddress.toBuffer(),
			],
			TOKEN_METADATA_PROGRAM_ID
		)

		metadataAddress = metadataPDA

		// Create metadata account instruction
		const createMetadataInstruction = createCreateMetadataAccountV3Instruction(
			{
				metadata: metadataPDA,
				mint: mintAddress,
				mintAuthority: mintAuth,
				payer: payer,
				updateAuthority: mintAuth,
			},
			{
				createMetadataAccountArgsV3: {
					data: {
						name: metadata.name,
						symbol: metadata.symbol,
						uri: metadata.uri || '',
						sellerFeeBasisPoints: 0,
						creators: null,
						collection: null,
						uses: null,
					},
					isMutable: true,
					collectionDetails: null,
				},
			}
		)

		transaction.add(createMetadataInstruction)
		totalCost += 0.00144 // Metadata account rent
	}

	// Mint initial supply if specified
	if (initialSupply > 0) {
		recipientATA = await getAssociatedTokenAddress(
			mintAddress,
			tokenRecipient,
			false,
			TOKEN_2022_PROGRAM_ID,
			ASSOCIATED_TOKEN_PROGRAM_ID
		)

		// Create recipient ATA
		const createATAInstruction = createAssociatedTokenAccountInstruction(
			payer,
			recipientATA,
			tokenRecipient,
			mintAddress,
			TOKEN_2022_PROGRAM_ID,
			ASSOCIATED_TOKEN_PROGRAM_ID
		)

		// Mint initial supply
		const mintAmount = BigInt(Math.floor(initialSupply * Math.pow(10, decimals)))
		const mintInstruction = createMintToInstruction(
			mintAddress,
			recipientATA,
			mintAuth,
			mintAmount,
			[],
			TOKEN_2022_PROGRAM_ID
		)

		transaction.add(createATAInstruction, mintInstruction)
		totalCost += 0.00204 // ATA creation cost
	}

	// Get recent blockhash
	const { blockhash } = await connection.getLatestBlockhash()
	transaction.recentBlockhash = blockhash
	transaction.feePayer = payer

	// Add instruction fees
	const baseInstructionCost = 0.000005
	totalCost += transaction.instructions.length * baseInstructionCost

	return {
		transaction,
		mintKeypair,
		mintAddress,
		recipientATA,
		estimatedCost: totalCost,
		enabledExtensions: extensionTypes,
		metadataAddress,
	}
}

/**
 * Token-2022 Extension Presets
 */
export const TOKEN_2022_EXTENSION_PRESETS = {
	STANDARD: {
		name: 'Standard Token-2022',
		description: 'Basic Token-2022 without extensions',
		extensions: undefined,
	},
	STABLECOIN: {
		name: 'Stablecoin with Transfer Fee',
		description: 'Token with transfer fees (common for stablecoins)',
		extensions: {
			transferFee: {
				transferFeeBasisPoints: 10, // 0.1%
				maximumFee: BigInt(10_000_000), // 10 tokens with 6 decimals
			},
			metadataPointer: {},
		} as Token2022Extensions,
	},
	LOYALTY: {
		name: 'Loyalty Points (Non-Transferable)',
		description: 'Non-transferable loyalty points or reputation tokens',
		extensions: {
			nonTransferable: true,
			metadataPointer: {},
		} as Token2022Extensions,
	},
	MEMBERSHIP: {
		name: 'Membership Token',
		description: 'Token with permanent delegate for membership control',
		extensions: {
			permanentDelegate: {
				delegate: PublicKey.default, // Should be set to actual authority
			},
			metadataPointer: {},
		} as Token2022Extensions,
	},
	INTEREST_BEARING: {
		name: 'Interest Bearing Token',
		description: 'Token that accrues interest over time',
		extensions: {
			interestBearing: {
				rateAuthority: PublicKey.default, // Should be set to actual authority
				rate: 500, // 5% APY
			},
			metadataPointer: {},
		} as Token2022Extensions,
	},
}

/**
 * Validate Token-2022 extension configuration
 */
export function validateToken2022Extensions(extensions?: Token2022Extensions): {
	isValid: boolean
	errors: string[]
	warnings: string[]
} {
	const errors: string[] = []
	const warnings: string[] = []

	if (!extensions) {
		return { isValid: true, errors, warnings }
	}

	// Validate Transfer Fee
	if (extensions.transferFee) {
		const { transferFeeBasisPoints, maximumFee } = extensions.transferFee

		if (transferFeeBasisPoints < 0 || transferFeeBasisPoints > 10000) {
			errors.push('Transfer fee basis points must be between 0 and 10000 (0-100%)')
		}

		if (transferFeeBasisPoints > 1000) {
			warnings.push('High transfer fee (>10%) may discourage token usage')
		}

		if (maximumFee <= 0) {
			errors.push('Maximum fee must be greater than 0')
		}
	}

	// Validate Interest Bearing
	if (extensions.interestBearing) {
		const { rate } = extensions.interestBearing

		if (Math.abs(rate) > 32767) {
			errors.push('Interest rate must be between -32767 and 32767 basis points')
		}

		warnings.push('Interest bearing tokens require regular rate updates')
	}

	// Check for conflicting extensions
	if (extensions.nonTransferable) {
		if (extensions.transferFee) {
			errors.push('Non-transferable tokens cannot have transfer fees')
		}

		if (extensions.transferHook) {
			errors.push('Non-transferable tokens cannot have transfer hooks')
		}

		warnings.push('Non-transferable tokens may have limited wallet and DEX support')
	}

	// Warnings for complex extensions
	if (extensions.transferHook) {
		warnings.push('Transfer hooks require custom program and may break wallet compatibility')
	}

	if (extensions.confidentialTransfer) {
		warnings.push('Confidential transfers require special client implementation')
	}

	if (extensions.permanentDelegate) {
		warnings.push('Permanent delegate has full control over all token accounts')
	}

	return {
		isValid: errors.length === 0,
		errors,
		warnings,
	}
}
