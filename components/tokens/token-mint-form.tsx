'use client'

import {useState} from 'react'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {Keypair} from '@solana/web3.js'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {createTokenAndMint, TOKEN_PRESETS, type CreateTokenAndMintParams} from '@/lib/solana/tokens/spl-token/mint'
import {useTransactionHistory} from '@/lib/transaction-history'
import {Copy, ExternalLink, Coins} from 'lucide-react'

interface TokenMintFormData {
	name: string
	symbol: string
	description: string
	decimals: number
	initialSupply: number
	recipientAddress: string
	useCustomRecipient: boolean
}

export function TokenMintForm() {
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

	const [selectedPreset, setSelectedPreset] = useState<keyof typeof TOKEN_PRESETS | ''>('')
	const [isMinting, setIsMinting] = useState(false)
	const [errors, setErrors] = useState<Record<string, string>>({})
	const [result, setResult] = useState<{
		mintAddress: string
		signature: string
		estimatedCost: number
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

		if (formData.useCustomRecipient && formData.recipientAddress.trim()) {
			try {
				// Basic validation - should be valid base58
				if (formData.recipientAddress.length < 32 || formData.recipientAddress.length > 44) {
					newErrors.recipientAddress = 'Invalid address length'
				}
			} catch {
				newErrors.recipientAddress = 'Invalid recipient address'
			}
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handlePresetSelect = (preset: keyof typeof TOKEN_PRESETS) => {
		setSelectedPreset(preset)
		setFormData((prev) => ({
			...prev,
			decimals: TOKEN_PRESETS[preset].decimals,
		}))
	}

	const handleMintToken = async () => {
		if (!publicKey) {
			alert('Please connect your wallet first')
			return
		}

		if (!validateForm()) return

		setIsMinting(true)
		setResult(null)

		try {
			const params: CreateTokenAndMintParams = {
				connection,
				payer: publicKey,
				decimals: formData.decimals,
				initialSupply: formData.initialSupply,
				mintAuthority: publicKey,
				freezeAuthority: publicKey,
				// Add metadata for the token
				metadata: {
					name: formData.name,
					symbol: formData.symbol,
					uri: '', // Can be set to metadata JSON URI if needed
					description: formData.description,
				},
			}

			// Set custom recipient if specified
			if (formData.useCustomRecipient && formData.recipientAddress.trim()) {
				// Create a PublicKey from the address string
				const {PublicKey} = await import('@solana/web3.js')
				params.recipient = new PublicKey(formData.recipientAddress)
			}

			const {transaction, mintKeypair, mintAddress, estimatedCost, metadataAddress} = await createTokenAndMint(params)

			// Partially sign with mint keypair
			transaction.partialSign(mintKeypair)

			// Send transaction
			const signature = await sendTransaction(transaction, connection)

			// Add to transaction history
			addTransaction({
				signature,
				type: 'custom',
				status: 'pending',
				description: `Created token: ${formData.symbol} (${formData.name})`,
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
		} catch (error) {
			console.error('Token minting error:', error)
			alert(`Failed to mint token: ${error instanceof Error ? error.message : 'Unknown error'}`)
		} finally {
			setIsMinting(false)
		}
	}

	const handleInputChange = (field: keyof TokenMintFormData, value: string | number | boolean) => {
		setFormData((prev) => ({...prev, [field]: value}))
		// Clear error for this field
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
				</div>
			</PixelCard>

			{/* Token Configuration */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>TOKEN CONFIGURATION</h3>
					</div>

					{/* Presets */}
					<div>
						<label className='block font-pixel text-xs text-gray-400 mb-2'>QUICK PRESETS:</label>
						<div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
							{Object.entries(TOKEN_PRESETS).map(([key, preset]) => (
								<button key={key} onClick={() => handlePresetSelect(key as keyof typeof TOKEN_PRESETS)} disabled={isMinting} className={`p-2 border-4 transition-colors font-pixel text-xs ${selectedPreset === key ? 'border-green-400 bg-green-400/10 text-green-400' : 'border-gray-700 hover:border-green-400/50 text-gray-400'}`}>
									<div className='text-white mb-1'>{preset.name}</div>
									<div>{preset.decimals} decimals</div>
								</button>
							))}
						</div>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<PixelInput label='DECIMALS' type='number' value={formData.decimals.toString()} onChange={(e) => handleInputChange('decimals', parseInt(e.target.value) || 0)} min='0' max='9' error={errors.decimals} disabled={isMinting} />

						<PixelInput label='INITIAL SUPPLY' type='number' value={formData.initialSupply.toString()} onChange={(e) => handleInputChange('initialSupply', parseInt(e.target.value) || 0)} min='0' error={errors.initialSupply} disabled={isMinting} />
					</div>

					<div className='p-3 bg-gray-800 border-4 border-gray-700'>
						<div className='font-mono text-xs text-gray-400 mb-1'>TOTAL SUPPLY PREVIEW:</div>
						<div className='font-mono text-sm text-green-400'>
							{formData.initialSupply.toLocaleString()} {formData.symbol || 'TOKENS'}
						</div>
						<div className='font-mono text-xs text-gray-500 mt-1'>With {formData.decimals} decimal places</div>
					</div>
				</div>
			</PixelCard>

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

						{publicKey && !formData.useCustomRecipient && (
							<div className='p-3 bg-gray-800 border-4 border-gray-700'>
								<div className='font-mono text-xs text-gray-400 mb-1'>TOKENS WILL BE MINTED TO:</div>
								<div className='font-mono text-xs text-green-400 break-all'>{publicKey.toBase58()}</div>
							</div>
						)}
					</div>
				</div>
			</PixelCard>

			{/* Mint Button */}
			<PixelButton variant='primary' onClick={handleMintToken} disabled={!publicKey || isMinting} isLoading={isMinting} className='w-full'>
				{isMinting ? '[MINTING TOKEN...]' : '[MINT TOKEN]'}
			</PixelButton>

			{/* Result */}
			{result && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-green-400/20 pb-3'>
							<h3 className='font-pixel text-sm text-green-400'>✅ TOKEN CREATED SUCCESSFULLY</h3>
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

							<div>
								<div className='font-mono text-xs text-gray-400 mb-1'>TRANSACTION SIGNATURE:</div>
								<div className='font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700'>{result.signature}</div>
							</div>

							<div>
								<div className='font-mono text-xs text-gray-400 mb-1'>ESTIMATED COST:</div>
								<div className='font-mono text-xs text-green-400 p-2 bg-gray-800 border-4 border-gray-700'>{result.estimatedCost.toFixed(6)} SOL</div>
							</div>

							<div className='p-3 bg-green-400/10 border-4 border-green-400/20'>
								<div className='font-mono text-xs text-green-400'>🎉 Your token has been created! You can now transfer, mint more, or burn tokens using the token operations. Save the mint address to interact with your token later.</div>
							</div>
						</div>
					</div>
				</PixelCard>
			)}

			{/* Info */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>ℹ️ TOKEN CREATION INFO</h3>
					</div>

					<div className='space-y-3 font-mono text-xs text-gray-400'>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Creates a new SPL token mint with you as the mint authority</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Decimals determine the smallest unit (e.g., 9 decimals = divisible by 1,000,000,000)</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Initial supply will be minted to the specified recipient</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>As mint authority, you can mint more tokens later or transfer/revoke the authority</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Cost includes rent for mint account (~0.00144 SOL) plus transaction fees</span>
						</div>
					</div>
				</div>
			</PixelCard>
		</div>
	)
}
