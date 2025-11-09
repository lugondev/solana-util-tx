'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {Copy, ExternalLink, Wallet, RefreshCw, AlertCircle, FileText, Signature} from 'lucide-react'
import {useWallet, useConnection} from '@solana/wallet-adapter-react'
import {LAMPORTS_PER_SOL, VersionedTransaction, Transaction} from '@solana/web3.js'
import bs58 from 'bs58'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelWalletButton} from '@/components/ui/pixel-wallet-button'

/**
 * Wallet information page that displays real wallet connection status
 * Uses Solana wallet adapter for real wallet integration
 */
export default function WalletPage() {
	const [copied, setCopied] = useState(false)
	const [balance, setBalance] = useState<number | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	// Sign transaction states
	const [rawTransaction, setRawTransaction] = useState('')
	const [transactionFormat, setTransactionFormat] = useState<'base64' | 'hex' | 'base58'>('base64')
	const [signLoading, setSignLoading] = useState(false)
	const [signError, setSignError] = useState<string | null>(null)
	const [signature, setSignature] = useState<string | null>(null)
	const [signatureCopied, setSignatureCopied] = useState(false)
	const [broadcastMode, setBroadcastMode] = useState<'sign' | 'broadcast'>('sign')

	const {publicKey, connected, wallet, disconnect, signTransaction, sendTransaction} = useWallet()
	const {connection} = useConnection()

	/**
	 * Fetch wallet balance from Solana network
	 */
	const fetchBalance = useCallback(async () => {
		if (!connected || !publicKey) {
			setBalance(null)
			return
		}

		setLoading(true)
		setError(null)

		try {
			const balance = await connection.getBalance(publicKey)
			setBalance(balance / LAMPORTS_PER_SOL)
		} catch (err: any) {
			console.error('Failed to fetch balance:', err)
			setError(err?.message || 'Failed to fetch balance')
		} finally {
			setLoading(false)
		}
	}, [connected, publicKey, connection])

	/**
	 * Handle wallet disconnect
	 */
	const handleDisconnect = async () => {
		try {
			await disconnect()
			setBalance(null)
			setError(null)
		} catch (err: any) {
			console.error('Failed to disconnect:', err)
			setError(err?.message || 'Failed to disconnect')
		}
	}

	/**
	 * Handle transaction signing - streamlined direct approach
	 */
	const handleSignTransaction = async () => {
		if (!connected || !signTransaction || !publicKey) {
			setSignError('Wallet not connected')
			return
		}

		if (!rawTransaction.trim()) {
			setSignError('Please enter a raw transaction')
			return
		}

		setSignLoading(true)
		setSignError(null)
		setSignature(null)

		try {
			console.log('🎯 Signing transaction - auto-detecting type...')

			const input = rawTransaction.trim()
			let transactionBuffer: Buffer

			// Convert to buffer based on format
			switch (transactionFormat) {
				case 'base64':
					transactionBuffer = Buffer.from(input, 'base64')
					break
				case 'hex':
					const cleanHex = input.startsWith('0x') ? input.slice(2) : input
					transactionBuffer = Buffer.from(cleanHex, 'hex')
					break
				case 'base58':
					transactionBuffer = Buffer.from(bs58.decode(input))
					break
				default:
					throw new Error('Unsupported format')
			}

			console.log('📦 Transaction buffer:', transactionBuffer.length, 'bytes')

			// Try to deserialize as VersionedTransaction first (common with Metaplex)
			let transaction: VersionedTransaction | Transaction
			let isVersioned = false

			try {
				// Try versioned transaction first
				transaction = VersionedTransaction.deserialize(new Uint8Array(transactionBuffer))
				isVersioned = true
				console.log('✅ Versioned transaction deserialized:', {
					version: transaction.version,
					signatures: transaction.signatures.length,
					instructions: transaction.message.compiledInstructions.length,
				})
			} catch (versionedError) {
				console.log('⚠️ Failed to parse as versioned transaction, trying legacy...')
				try {
					// Fallback to legacy transaction
					transaction = Transaction.from(transactionBuffer)
					console.log('✅ Legacy transaction deserialized:', {
						signatures: transaction.signatures.length,
						instructions: transaction.instructions.length,
					})
				} catch (legacyError) {
					const versionedMsg = versionedError instanceof Error ? versionedError.message : 'Unknown versioned error'
					const legacyMsg = legacyError instanceof Error ? legacyError.message : 'Unknown legacy error'
					console.error('❌ Failed to deserialize as both versioned and legacy:', {
						versionedError: versionedMsg,
						legacyError: legacyMsg,
					})
					throw new Error(`Failed to deserialize transaction: ${versionedMsg}`)
				}
			}

			// Sign the transaction
			console.log(`🔐 Signing ${isVersioned ? 'versioned' : 'legacy'} transaction...`)
			const signedTransaction = await signTransaction(transaction)

			console.log('✅ Transaction signed successfully!')

			if (broadcastMode === 'broadcast') {
				// Broadcast the signed transaction
				console.log('🚀 Broadcasting transaction...')

				let txSignature: string
				if (isVersioned) {
					// For versioned transactions, send raw transaction
					txSignature = await connection.sendRawTransaction(signedTransaction.serialize(), {
						skipPreflight: false,
						preflightCommitment: 'confirmed',
					})
				} else {
					// For legacy transactions, use sendTransaction
					txSignature = await sendTransaction(signedTransaction, connection, {
						skipPreflight: false,
						preflightCommitment: 'confirmed',
					})
				}

				setSignature(txSignature)
				console.log('🎉 Transaction broadcasted! Signature:', txSignature)
			} else {
				// Just sign mode - return the serialized signed transaction
				const serialized = Buffer.from(signedTransaction.serialize()).toString('base64')
				setSignature(serialized)
				console.log('🎉 Transaction signed! Serialized transaction ready.')
			}
		} catch (error: any) {
			console.error('💥 Signing failed:', error)
			setSignError(`Error: ${error?.message || 'Unknown error'}`)
		} finally {
			setSignLoading(false)
		}
	}

	/**
	 * Copy address to clipboard
	 */
	const copyAddress = async () => {
		if (!publicKey) return

		try {
			await navigator.clipboard.writeText(publicKey.toString())
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy address:', err)
		}
	}

	/**
	 * Copy signature to clipboard
	 */
	const copySignature = async () => {
		if (!signature) return

		try {
			await navigator.clipboard.writeText(signature)
			setSignatureCopied(true)
			setTimeout(() => setSignatureCopied(false), 2000)
		} catch (err) {
			console.error('Failed to copy signature:', err)
		}
	}

	// Fetch balance when wallet connects
	useEffect(() => {
		if (connected && publicKey) {
			fetchBalance()
		}
	}, [connected, publicKey, fetchBalance])

	// Not connected view
	if (!connected) {
		return (
			<div className='min-h-screen p-4' style={{backgroundColor: 'var(--pixel-bg-primary)'}}>
				<div className='max-w-2xl mx-auto'>
					<PixelCard>
						<div className='text-center py-8'>
							<span className='text-6xl mb-4 block'>💼</span>
							<h1 className='font-pixel text-xl mb-2' style={{color: 'var(--pixel-accent)'}}>
								WALLET NOT CONNECTED
							</h1>
							<p className='font-mono text-sm mb-6' style={{color: 'var(--pixel-text-secondary)'}}>
								Please connect your wallet to view wallet information.
							</p>
							<div className='space-y-4'>
								<PixelWalletButton variant='success' />
								<PixelButton variant='secondary' onClick={() => (window.location.href = '/')}>
									[GO TO HOME]
								</PixelButton>
							</div>
						</div>
					</PixelCard>
				</div>
			</div>
		)
	}

	return (
		<div className='min-h-screen p-4' style={{backgroundColor: 'var(--pixel-bg-primary)'}}>
			<div className='max-w-4xl mx-auto space-y-6'>
				{/* Header */}
				<PixelCard>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center space-x-3'>
							<Wallet className='h-8 w-8' style={{color: 'var(--pixel-accent)'}} />
							<h1 className='font-pixel text-2xl' style={{color: 'var(--pixel-text)'}}>
								SOLANA WALLET
							</h1>
						</div>
						<PixelWalletButton variant='primary' />
					</div>

					{/* Connection Status */}
					<div className='flex items-center space-x-2 mb-4 font-mono text-sm'>
						<div className={`w-3 h-3 ${connected ? 'bg-green-500' : 'bg-red-500'}`} style={{imageRendering: 'pixelated'}}></div>
						<span style={{color: 'var(--pixel-text-secondary)'}}>{connected ? 'Connected' : 'Not Connected'}</span>
						{wallet && <span style={{color: 'var(--pixel-accent)'}}>({wallet.adapter.name})</span>}
					</div>

					{/* Wallet Info */}
					<div className='space-y-4'>
						{/* Address */}
						<div className='p-4' style={{backgroundColor: 'var(--pixel-bg-secondary)', border: '2px solid var(--pixel-border)', imageRendering: 'pixelated'}}>
							<div className='flex items-center justify-between'>
								<div className='flex-1'>
									<p className='font-pixel text-sm mb-2' style={{color: 'var(--pixel-text-secondary)'}}>
										WALLET ADDRESS
									</p>
									<p className='font-mono text-sm break-all' style={{color: 'var(--pixel-text)'}}>
										{publicKey?.toString()}
									</p>
								</div>
								<PixelButton variant='secondary' size='sm' onClick={copyAddress} className='ml-4'>
									{copied ? '✓' : <Copy className='h-4 w-4' />}
								</PixelButton>
							</div>
						</div>

						{/* Balance */}
						<div className='p-4' style={{backgroundColor: 'var(--pixel-bg-secondary)', border: '2px solid var(--pixel-border)', imageRendering: 'pixelated'}}>
							<div className='flex items-center justify-between'>
								<div>
									<p className='font-pixel text-sm mb-2' style={{color: 'var(--pixel-text-secondary)'}}>
										BALANCE
									</p>
									{loading ? (
										<div className='flex items-center space-x-2 font-mono text-sm'>
											<RefreshCw className='h-4 w-4 animate-spin' style={{color: 'var(--pixel-accent)'}} />
											<span style={{color: 'var(--pixel-text)'}}>Loading...</span>
										</div>
									) : balance !== null ? (
										<p className='font-pixel text-lg' style={{color: 'var(--pixel-success)'}}>
											{balance.toFixed(4)} SOL
										</p>
									) : (
										<p className='font-mono text-sm' style={{color: 'var(--pixel-error)'}}>
											Unable to load
										</p>
									)}
								</div>
								<PixelButton variant='secondary' size='sm' onClick={fetchBalance} disabled={loading}>
									<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
								</PixelButton>
							</div>
						</div>

						{/* Disconnect Button */}
						<PixelButton variant='danger' onClick={handleDisconnect} className='w-full'>
							[DISCONNECT WALLET]
						</PixelButton>
					</div>

					{/* Error Display */}
					{error && (
						<div className='mt-4 p-3' style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--pixel-error)'}}>
							<div className='flex items-center space-x-2'>
								<AlertCircle className='h-4 w-4' style={{color: 'var(--pixel-error)'}} />
								<p className='font-mono text-sm' style={{color: 'var(--pixel-error)'}}>
									{error}
								</p>
							</div>
						</div>
					)}
				</PixelCard>

				{/* Transaction Signing Section */}
				<PixelCard>
					<h2 className='font-pixel text-xl mb-4 flex items-center space-x-2' style={{color: 'var(--pixel-text)'}}>
						<Signature className='h-5 w-5' style={{color: 'var(--pixel-accent)'}} />
						<span>SIGN TRANSACTION</span>
					</h2>

					<div className='space-y-4'>
						{/* Mode Selection */}
						<div>
							<label className='block font-pixel text-sm mb-2' style={{color: 'var(--pixel-text-secondary)'}}>
								OPERATION MODE
							</label>
							<select
								value={broadcastMode}
								onChange={(e) => setBroadcastMode(e.target.value as 'sign' | 'broadcast')}
								className='w-full px-3 py-2 font-mono text-sm'
								style={{
									backgroundColor: 'var(--pixel-bg-secondary)',
									color: 'var(--pixel-text)',
									border: '2px solid var(--pixel-border)',
									imageRendering: 'pixelated',
								}}>
								<option value='sign'>Sign Only (return serialized transaction)</option>
								<option value='broadcast'>Sign & Broadcast (send to network)</option>
							</select>
						</div>

						{/* Format Selection */}
						<div>
							<label className='block font-pixel text-sm mb-2' style={{color: 'var(--pixel-text-secondary)'}}>
								TRANSACTION FORMAT
							</label>
							<select
								value={transactionFormat}
								onChange={(e) => setTransactionFormat(e.target.value as 'base64' | 'hex' | 'base58')}
								className='w-full px-3 py-2 font-mono text-sm'
								style={{
									backgroundColor: 'var(--pixel-bg-secondary)',
									color: 'var(--pixel-text)',
									border: '2px solid var(--pixel-border)',
									imageRendering: 'pixelated',
								}}>
								<option value='base64'>Base64</option>
								<option value='hex'>Hex</option>
								<option value='base58'>Base58</option>
							</select>
						</div>

						{/* Transaction Input */}
						<div>
							<label className='block font-pixel text-sm mb-2' style={{color: 'var(--pixel-text-secondary)'}}>
								RAW TRANSACTION DATA
							</label>
							<textarea
								value={rawTransaction}
								onChange={(e) => setRawTransaction(e.target.value)}
								placeholder='Paste your transaction data here...'
								className='w-full h-32 px-3 py-2 font-mono text-sm'
								style={{
									backgroundColor: 'var(--pixel-bg-secondary)',
									color: 'var(--pixel-text)',
									border: '2px solid var(--pixel-border)',
									imageRendering: 'pixelated',
								}}
							/>
						</div>

						{/* Sign Button */}
						<PixelButton onClick={handleSignTransaction} disabled={signLoading || !rawTransaction.trim()} variant={broadcastMode === 'broadcast' ? 'success' : 'primary'} className='w-full'>
							{signLoading ? (
								<>
									<RefreshCw className='h-4 w-4 animate-spin inline mr-2' />
									{broadcastMode === 'broadcast' ? '[BROADCASTING...]' : '[SIGNING...]'}
								</>
							) : (
								<>
									<Signature className='h-4 w-4 inline mr-2' />
									{broadcastMode === 'broadcast' ? '[SIGN & BROADCAST]' : '[SIGN TRANSACTION]'}
								</>
							)}
						</PixelButton>

						{/* Help text */}
						<div className='font-mono text-xs space-y-1' style={{color: 'var(--pixel-text-secondary)'}}>
							<p>💡 Paste your transaction data above and click {broadcastMode === 'broadcast' ? 'Sign & Broadcast' : 'Sign Transaction'}.</p>
							<p>🎯 Auto-detects transaction type (versioned or legacy).</p>
							<p>📋 Supports both Creator API (Metaplex) and NFT API (Anchor) transactions.</p>
							<p>✅ {broadcastMode === 'broadcast' ? 'Signs and broadcasts to Solana network.' : 'Signs transaction and returns serialized data.'}</p>
						</div>
					</div>

					{/* Error Display */}
					{signError && (
						<div className='mt-4 p-3' style={{backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '2px solid var(--pixel-error)'}}>
							<div className='flex items-center space-x-2'>
								<AlertCircle className='h-4 w-4' style={{color: 'var(--pixel-error)'}} />
								<p className='font-mono text-sm' style={{color: 'var(--pixel-error)'}}>
									{signError}
								</p>
							</div>
						</div>
					)}

					{/* Result Display */}
					{signature && (
						<div className='mt-4 p-4' style={{backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '2px solid var(--pixel-success)'}}>
							<div className='flex items-center justify-between mb-2'>
								<h3 className='font-pixel text-sm' style={{color: 'var(--pixel-success)'}}>
									{broadcastMode === 'broadcast' ? 'TRANSACTION BROADCASTED!' : 'TRANSACTION SIGNED!'}
								</h3>
								<PixelButton variant='success' size='sm' onClick={copySignature}>
									{signatureCopied ? '✓' : <Copy className='h-4 w-4' />}
								</PixelButton>
							</div>
							<div className='mb-2'>
								<p className='font-mono text-xs' style={{color: 'var(--pixel-success)'}}>
									{broadcastMode === 'broadcast' ? (
										<>
											🔗 Transaction Signature:{' '}
											<a href={`https://explorer.solana.com/tx/${signature}`} target='_blank' rel='noopener noreferrer' className='underline' style={{color: 'var(--pixel-accent)'}}>
												View on Explorer
											</a>
										</>
									) : (
										'📦 Serialized Signed Transaction (Base64):'
									)}
								</p>
							</div>
							<div
								className='p-3 break-all font-mono text-xs'
								style={{
									backgroundColor: 'var(--pixel-bg-secondary)',
									border: '2px solid var(--pixel-border)',
									color: 'var(--pixel-text)',
								}}>
								{signature}
							</div>
						</div>
					)}
				</PixelCard>
			</div>
		</div>
	)
}
