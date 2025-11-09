'use client'

import {useState} from 'react'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {PublicKey} from '@solana/web3.js'
import {AccountState} from '@solana/spl-token'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {createToken2022AndMint, validateToken2022Extensions, TOKEN_2022_EXTENSION_PRESETS, type Token2022Extensions, type CreateToken2022AndMintParams} from '@/lib/solana/tokens/spl-token-2022/mint'
import {useTransactionHistory} from '@/lib/transaction-history'
import {Copy, ExternalLink, Info, AlertTriangle, CheckCircle2} from 'lucide-react'

interface TokenMintFormData {
	name: string
	symbol: string
	description: string
	decimals: number
	initialSupply: number
	recipientAddress: string
	useCustomRecipient: boolean
}

interface ExtensionFormData {
	// Transfer Fee
	enableTransferFee: boolean
	transferFeeBasisPoints: number
	maximumFee: string

	// Default Account State
	enableDefaultAccountState: boolean
	defaultState: 'initialized' | 'frozen'

	// Interest Bearing
	enableInterestBearing: boolean
	interestRate: number

	// Other Extensions
	enableNonTransferable: boolean
	enableMintCloseAuthority: boolean
	enableMetadataPointer: boolean
	enablePermanentDelegate: boolean
	permanentDelegateAddress: string
}

export function Token2022MintForm() {
	const {connection} = useConnection()
	const {publicKey, sendTransaction} = useWallet()
	const {addTransaction, updateTransaction} = useTransactionHistory()

	const [formData, setFormData] = useState<TokenMintFormData>({
		name: '',
		symbol: '',
		description: '',
		decimals: 9,
		initialSupply: 1000000,
		recipientAddress: '',
		useCustomRecipient: false,
	})

	const [extensionData, setExtensionData] = useState<ExtensionFormData>({
		enableTransferFee: false,
		transferFeeBasisPoints: 10,
		maximumFee: '10000000',
		enableDefaultAccountState: false,
		defaultState: 'initialized',
		enableInterestBearing: false,
		interestRate: 500,
		enableNonTransferable: false,
		enableMintCloseAuthority: false,
		enableMetadataPointer: false,
		enablePermanentDelegate: false,
		permanentDelegateAddress: '',
	})

	const [selectedPreset, setSelectedPreset] = useState<keyof typeof TOKEN_2022_EXTENSION_PRESETS | ''>('')
	const [isMinting, setIsMinting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [showExtensions, setShowExtensions] = useState(false)
	const [result, setResult] = useState<{
		mintAddress: string
		signature: string
		estimatedCost: number
		enabledExtensions: string[]
	} | null>(null)

	const validateForm = (): boolean => {
		const newErrors: Record<string, string> = {}

		if (!formData.name.trim()) {
			newErrors.name = 'Token name is required'
		}

		if (!formData.symbol.trim()) {
			newErrors.symbol = 'Token symbol is required'
		}

		if (formData.symbol.length > 10) {
			newErrors.symbol = 'Symbol should be 10 characters or less'
		}

		if (formData.decimals < 0 || formData.decimals > 9) {
			newErrors.decimals = 'Decimals must be between 0 and 9'
		}

		if (formData.initialSupply < 0) {
			newErrors.initialSupply = 'Initial supply cannot be negative'
		}

		if (formData.useCustomRecipient && !formData.recipientAddress.trim()) {
			newErrors.recipientAddress = 'Recipient address is required'
		}

		// Validate extensions
		if (extensionData.enableTransferFee) {
			if (extensionData.transferFeeBasisPoints < 0 || extensionData.transferFeeBasisPoints > 10000) {
				newErrors.transferFeeBasisPoints = 'Must be between 0 and 10000'
			}
		}

		if (extensionData.enablePermanentDelegate && !extensionData.permanentDelegateAddress.trim()) {
			newErrors.permanentDelegateAddress = 'Delegate address is required'
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const buildExtensionsConfig = (): Token2022Extensions | undefined => {
		const extensions: Token2022Extensions = {}
		let hasExtensions = false

		if (extensionData.enableTransferFee) {
			extensions.transferFee = {
				transferFeeBasisPoints: extensionData.transferFeeBasisPoints,
				maximumFee: BigInt(extensionData.maximumFee),
			}
			hasExtensions = true
		}

		if (extensionData.enableDefaultAccountState) {
			extensions.defaultAccountState = {
				state: extensionData.defaultState === 'frozen' ? AccountState.Frozen : AccountState.Initialized,
			}
			hasExtensions = true
		}

		if (extensionData.enableInterestBearing && publicKey) {
			extensions.interestBearing = {
				rateAuthority: publicKey,
				rate: extensionData.interestRate,
			}
			hasExtensions = true
		}

		if (extensionData.enableNonTransferable) {
			extensions.nonTransferable = true
			hasExtensions = true
		}

		if (extensionData.enableMintCloseAuthority && publicKey) {
			extensions.mintCloseAuthority = {
				closeAuthority: publicKey,
			}
			hasExtensions = true
		}

		if (extensionData.enableMetadataPointer) {
			extensions.metadataPointer = {}
			hasExtensions = true
		}

		if (extensionData.enablePermanentDelegate && extensionData.permanentDelegateAddress) {
			try {
				extensions.permanentDelegate = {
					delegate: new PublicKey(extensionData.permanentDelegateAddress),
				}
				hasExtensions = true
			} catch (error) {
				console.error('Invalid delegate address:', error)
			}
		}

		return hasExtensions ? extensions : undefined
	}

	const handlePresetSelect = (preset: keyof typeof TOKEN_2022_EXTENSION_PRESETS) => {
		setSelectedPreset(preset)
		const presetConfig = TOKEN_2022_EXTENSION_PRESETS[preset]

		// Reset extensions
		setExtensionData({
			enableTransferFee: false,
			transferFeeBasisPoints: 10,
			maximumFee: '10000000',
			enableDefaultAccountState: false,
			defaultState: 'initialized',
			enableInterestBearing: false,
			interestRate: 500,
			enableNonTransferable: false,
			enableMintCloseAuthority: false,
			enableMetadataPointer: false,
			enablePermanentDelegate: false,
			permanentDelegateAddress: '',
		})

		// Apply preset extensions
		if (presetConfig.extensions) {
			const ext = presetConfig.extensions

			if (ext.transferFee) {
				setExtensionData((prev) => ({
					...prev,
					enableTransferFee: true,
					transferFeeBasisPoints: ext.transferFee!.transferFeeBasisPoints,
					maximumFee: ext.transferFee!.maximumFee.toString(),
				}))
			}

			if (ext.nonTransferable) {
				setExtensionData((prev) => ({...prev, enableNonTransferable: true}))
			}

			if (ext.metadataPointer) {
				setExtensionData((prev) => ({...prev, enableMetadataPointer: true}))
			}

			if (ext.interestBearing) {
				setExtensionData((prev) => ({
					...prev,
					enableInterestBearing: true,
					interestRate: ext.interestBearing!.rate,
				}))
			}
		}

		setShowExtensions(true)
	}

	const handleMintToken = async () => {
		if (!publicKey) {
			alert('Please connect your wallet first')
			return
		}

		if (!validateForm()) return

		const extensions = buildExtensionsConfig()

		// Validate extensions
		const validation = validateToken2022Extensions(extensions)
		if (!validation.isValid) {
			alert(`Extension validation failed:\n${validation.errors.join('\n')}`)
			return
		}

		// Show warnings if any
		if (validation.warnings.length > 0) {
			const confirmed = confirm(`Warning:\n${validation.warnings.join('\n')}\n\nDo you want to continue?`)
			if (!confirmed) return
		}

		setIsMinting(true)
		setResult(null)

		try {
			const params: CreateToken2022AndMintParams = {
				connection,
				payer: publicKey,
				decimals: formData.decimals,
				initialSupply: formData.initialSupply,
				mintAuthority: publicKey,
				freezeAuthority: publicKey,
				extensions,
				// Add metadata for Token-2022
				metadata: {
					name: formData.name,
					symbol: formData.symbol,
					uri: '', // Can be set to metadata JSON URI if needed
					description: formData.description,
				},
			}

			// Set custom recipient if specified
			if (formData.useCustomRecipient && formData.recipientAddress.trim()) {
				params.recipient = new PublicKey(formData.recipientAddress)
			}

			const {transaction, mintKeypair, mintAddress, estimatedCost, enabledExtensions, metadataAddress} = await createToken2022AndMint(params)

			// Partially sign with mint keypair
			transaction.partialSign(mintKeypair)

			// Send transaction
			const signature = await sendTransaction(transaction, connection)

			// Add to transaction history
			addTransaction({
				signature,
				type: 'custom',
				status: 'pending',
				description: `Created Token-2022: ${formData.symbol} (${formData.name})`,
			})

			// Wait for confirmation
			try {
				await connection.confirmTransaction(signature, 'confirmed')
				updateTransaction(signature, {status: 'confirmed'})
			} catch (confirmError) {
				console.error('Confirmation failed:', confirmError)
				updateTransaction(signature, {
					status: 'failed',
					error: confirmError instanceof Error ? confirmError.message : 'Confirmation failed',
				})
			}

			setResult({
				mintAddress: mintAddress.toBase58(),
				signature,
				estimatedCost,
				enabledExtensions: enabledExtensions.map((ext) => ext.toString()),
			})

			// Reset form
			setFormData({
				name: '',
				symbol: '',
				description: '',
				decimals: 9,
				initialSupply: 1000000,
				recipientAddress: '',
				useCustomRecipient: false,
			})
			setSelectedPreset('')
			setShowExtensions(false)
		} catch (error) {
			console.error('Token minting error:', error)
			alert(`Failed to mint token: ${error instanceof Error ? error.message : 'Unknown error'}`)
		} finally {
			setIsMinting(false)
		}
	}

	const handleInputChange = (field: keyof TokenMintFormData, value: string | number | boolean) => {
		setFormData((prev) => ({...prev, [field]: value}))
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = {...prev}
				delete newErrors[field]
				return newErrors
			})
		}
	}

	const handleExtensionChange = (field: keyof ExtensionFormData, value: string | number | boolean) => {
		setExtensionData((prev) => ({...prev, [field]: value}))
		if (errors[field]) {
			setErrors((prev) => {
				const newErrors = {...prev}
				delete newErrors[field]
				return newErrors
			})
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
	}

	const openInExplorer = (address: string) => {
		window.open(`https://explorer.solana.com/address/${address}`, '_blank')
	}

	const hasEnabledExtensions = Object.entries(extensionData).some(([key, value]) => key.startsWith('enable') && value === true)

	return (
		<div className='space-y-6'>
			{/* Token Details */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>TOKEN DETAILS</h3>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<PixelInput label='TOKEN NAME' value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder='My Awesome Token' error={errors.name} disabled={isMinting} />

						<PixelInput label='SYMBOL' value={formData.symbol} onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())} placeholder='MAT' error={errors.symbol} disabled={isMinting} />
					</div>

					<div>
						<label className='block font-pixel text-xs text-gray-400 mb-2'>DESCRIPTION (OPTIONAL)</label>
						<textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} placeholder='Describe your token...' rows={3} disabled={isMinting} className='w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white placeholder-gray-500 resize-none' />
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<PixelInput label='DECIMALS' type='number' value={formData.decimals.toString()} onChange={(e) => handleInputChange('decimals', parseInt(e.target.value) || 0)} min='0' max='9' error={errors.decimals} disabled={isMinting} />

						<PixelInput label='INITIAL SUPPLY' type='number' value={formData.initialSupply.toString()} onChange={(e) => handleInputChange('initialSupply', parseInt(e.target.value) || 0)} min='0' error={errors.initialSupply} disabled={isMinting} />
					</div>
				</div>
			</PixelCard>

			{/* Extension Presets */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>TOKEN-2022 PRESETS</h3>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
						{Object.entries(TOKEN_2022_EXTENSION_PRESETS).map(([key, preset]) => (
							<button key={key} onClick={() => handlePresetSelect(key as keyof typeof TOKEN_2022_EXTENSION_PRESETS)} disabled={isMinting} className={`p-3 border-4 transition-colors text-left ${selectedPreset === key ? 'border-green-400 bg-green-400/10' : 'border-gray-700 hover:border-green-400/50'}`}>
								<div className='font-pixel text-xs text-white mb-1'>{preset.name}</div>
								<div className='font-mono text-xs text-gray-400'>{preset.description}</div>
							</button>
						))}
					</div>

					<PixelButton variant='secondary' onClick={() => setShowExtensions(!showExtensions)} className='w-full' disabled={isMinting}>
						{showExtensions ? '[HIDE EXTENSIONS]' : '[CONFIGURE EXTENSIONS MANUALLY]'}
					</PixelButton>
				</div>
			</PixelCard>

			{/* Extensions Configuration */}
			{showExtensions && (
				<PixelCard>
					<div className='space-y-6'>
						<div className='border-b-4 border-green-400/20 pb-3'>
							<h3 className='font-pixel text-sm text-green-400'>EXTENSION CONFIGURATION</h3>
						</div>

						{/* Transfer Fee */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enableTransferFee} onChange={(e) => handleExtensionChange('enableTransferFee', e.target.checked)} disabled={isMinting || extensionData.enableNonTransferable} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white'>TRANSFER FEE</div>
									<div className='font-mono text-xs text-gray-400'>Charge a fee on each transfer</div>
								</div>
							</label>

							{extensionData.enableTransferFee && (
								<div className='ml-7 grid grid-cols-1 md:grid-cols-2 gap-3'>
									<PixelInput label='FEE BASIS POINTS (0-10000)' type='number' value={extensionData.transferFeeBasisPoints.toString()} onChange={(e) => handleExtensionChange('transferFeeBasisPoints', parseInt(e.target.value) || 0)} min='0' max='10000' error={errors.transferFeeBasisPoints} disabled={isMinting} />
									<PixelInput label='MAXIMUM FEE' value={extensionData.maximumFee} onChange={(e) => handleExtensionChange('maximumFee', e.target.value)} error={errors.maximumFee} disabled={isMinting} />
								</div>
							)}
						</div>

						{/* Default Account State */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enableDefaultAccountState} onChange={(e) => handleExtensionChange('enableDefaultAccountState', e.target.checked)} disabled={isMinting} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white'>DEFAULT ACCOUNT STATE</div>
									<div className='font-mono text-xs text-gray-400'>New accounts start frozen or initialized</div>
								</div>
							</label>

							{extensionData.enableDefaultAccountState && (
								<div className='ml-7 flex gap-4'>
									<label className='flex items-center gap-2 font-pixel text-xs text-gray-400'>
										<input type='radio' checked={extensionData.defaultState === 'initialized'} onChange={() => handleExtensionChange('defaultState', 'initialized')} disabled={isMinting} className='w-4 h-4' />
										INITIALIZED
									</label>
									<label className='flex items-center gap-2 font-pixel text-xs text-gray-400'>
										<input type='radio' checked={extensionData.defaultState === 'frozen'} onChange={() => handleExtensionChange('defaultState', 'frozen')} disabled={isMinting} className='w-4 h-4' />
										FROZEN
									</label>
								</div>
							)}
						</div>

						{/* Interest Bearing */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enableInterestBearing} onChange={(e) => handleExtensionChange('enableInterestBearing', e.target.checked)} disabled={isMinting} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white'>INTEREST BEARING</div>
									<div className='font-mono text-xs text-gray-400'>Token accrues interest over time</div>
								</div>
							</label>

							{extensionData.enableInterestBearing && (
								<div className='ml-7'>
									<PixelInput label='INTEREST RATE (BASIS POINTS)' type='number' value={extensionData.interestRate.toString()} onChange={(e) => handleExtensionChange('interestRate', parseInt(e.target.value) || 0)} error={errors.interestRate} disabled={isMinting} />
									<div className='mt-1 font-mono text-xs text-gray-500'>{(extensionData.interestRate / 100).toFixed(2)}% APY</div>
								</div>
							)}
						</div>

						{/* Non-Transferable */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enableNonTransferable} onChange={(e) => handleExtensionChange('enableNonTransferable', e.target.checked)} disabled={isMinting || extensionData.enableTransferFee} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white flex items-center gap-2'>
										NON-TRANSFERABLE
										<AlertTriangle className='h-3 w-3 text-yellow-400' />
									</div>
									<div className='font-mono text-xs text-gray-400'>Tokens cannot be transferred (soulbound)</div>
								</div>
							</label>
						</div>

						{/* Permanent Delegate */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enablePermanentDelegate} onChange={(e) => handleExtensionChange('enablePermanentDelegate', e.target.checked)} disabled={isMinting} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white flex items-center gap-2'>
										PERMANENT DELEGATE
										<AlertTriangle className='h-3 w-3 text-yellow-400' />
									</div>
									<div className='font-mono text-xs text-gray-400'>Delegate with permanent control over tokens</div>
								</div>
							</label>

							{extensionData.enablePermanentDelegate && (
								<div className='ml-7'>
									<PixelInput label='DELEGATE ADDRESS' value={extensionData.permanentDelegateAddress} onChange={(e) => handleExtensionChange('permanentDelegateAddress', e.target.value)} placeholder='Enter delegate public key' error={errors.permanentDelegateAddress} disabled={isMinting} />
								</div>
							)}
						</div>

						{/* Metadata Pointer */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enableMetadataPointer} onChange={(e) => handleExtensionChange('enableMetadataPointer', e.target.checked)} disabled={isMinting} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white'>METADATA POINTER</div>
									<div className='font-mono text-xs text-gray-400'>Enable on-chain metadata storage</div>
								</div>
							</label>
						</div>

						{/* Mint Close Authority */}
						<div className='space-y-3'>
							<label className='flex items-center gap-3'>
								<input type='checkbox' checked={extensionData.enableMintCloseAuthority} onChange={(e) => handleExtensionChange('enableMintCloseAuthority', e.target.checked)} disabled={isMinting} className='w-4 h-4' />
								<div>
									<div className='font-pixel text-xs text-white'>MINT CLOSE AUTHORITY</div>
									<div className='font-mono text-xs text-gray-400'>Allow closing mint account to reclaim rent</div>
								</div>
							</label>
						</div>

						{hasEnabledExtensions && (
							<div className='p-3 bg-blue-400/10 border-4 border-blue-400/20'>
								<div className='flex items-start gap-2'>
									<Info className='h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0' />
									<div className='font-mono text-xs text-blue-400'>Extensions are permanent and cannot be removed after token creation. Make sure you understand each extension before enabling it.</div>
								</div>
							</div>
						)}
					</div>
				</PixelCard>
			)}

			{/* Recipient Configuration */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>RECIPIENT CONFIGURATION</h3>
					</div>

					<div className='space-y-4'>
						<div className='flex items-center gap-4'>
							<label className='flex items-center gap-2 font-pixel text-xs text-gray-400'>
								<input type='radio' checked={!formData.useCustomRecipient} onChange={() => handleInputChange('useCustomRecipient', false)} disabled={isMinting} className='w-4 h-4' />
								MINT TO SELF
							</label>
							<label className='flex items-center gap-2 font-pixel text-xs text-gray-400'>
								<input type='radio' checked={formData.useCustomRecipient} onChange={() => handleInputChange('useCustomRecipient', true)} disabled={isMinting} className='w-4 h-4' />
								CUSTOM RECIPIENT
							</label>
						</div>

						{formData.useCustomRecipient && <PixelInput label='RECIPIENT ADDRESS' value={formData.recipientAddress} onChange={(e) => handleInputChange('recipientAddress', e.target.value)} placeholder='Enter recipient wallet address' error={errors.recipientAddress} disabled={isMinting} />}
					</div>
				</div>
			</PixelCard>

			{/* Mint Button */}
			<PixelButton variant='primary' onClick={handleMintToken} disabled={!publicKey || isMinting} isLoading={isMinting} className='w-full'>
				{isMinting ? '[MINTING TOKEN-2022...]' : '[MINT TOKEN-2022]'}
			</PixelButton>

			{/* Result */}
			{result && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-green-400/20 pb-3 flex items-center gap-2'>
							<CheckCircle2 className='h-5 w-5 text-green-400' />
							<h3 className='font-pixel text-sm text-green-400'>TOKEN-2022 CREATED SUCCESSFULLY</h3>
						</div>

						<div className='space-y-3'>
							<div>
								<div className='font-mono text-xs text-gray-400 mb-1'>TOKEN MINT ADDRESS:</div>
								<div className='flex items-center gap-2'>
									<div className='font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700 flex-1'>{result.mintAddress}</div>
									<button onClick={() => copyToClipboard(result.mintAddress)} className='text-gray-400 hover:text-green-400 p-2'>
										<Copy className='h-4 w-4' />
									</button>
									<button onClick={() => openInExplorer(result.mintAddress)} className='text-gray-400 hover:text-green-400 p-2'>
										<ExternalLink className='h-4 w-4' />
									</button>
								</div>
							</div>

							{result.enabledExtensions.length > 0 && (
								<div>
									<div className='font-mono text-xs text-gray-400 mb-1'>ENABLED EXTENSIONS:</div>
									<div className='p-2 bg-gray-800 border-4 border-gray-700'>
										{result.enabledExtensions.map((ext, index) => (
											<div key={index} className='font-mono text-xs text-green-400'>
												• {ext}
											</div>
										))}
									</div>
								</div>
							)}

							<div>
								<div className='font-mono text-xs text-gray-400 mb-1'>TRANSACTION SIGNATURE:</div>
								<div className='font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700'>{result.signature}</div>
							</div>

							<div>
								<div className='font-mono text-xs text-gray-400 mb-1'>ESTIMATED COST:</div>
								<div className='font-mono text-xs text-green-400 p-2 bg-gray-800 border-4 border-gray-700'>{result.estimatedCost.toFixed(6)} SOL</div>
							</div>
						</div>
					</div>
				</PixelCard>
			)}

			{/* Info */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>ℹ️ TOKEN-2022 INFO</h3>
					</div>

					<div className='space-y-3 font-mono text-xs text-gray-400'>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Token-2022 is the next generation SPL token program with advanced features</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Extensions are permanent and cannot be changed after token creation</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Some extensions may have limited wallet and DEX support</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Transfer fees require fee withdrawal authority to collect fees</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Non-transferable tokens cannot be moved between accounts (soulbound)</span>
						</div>
					</div>
				</div>
			</PixelCard>
		</div>
	)
}
