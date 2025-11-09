'use client'

import React, {useState, useEffect, useCallback} from 'react'
import {Copy, ExternalLink, Wallet, RefreshCw, AlertCircle, FileText, Signature} from 'lucide-react'
import {useWallet, useConnection} from '@solana/wallet-adapter-react'
import {WalletMultiButton} from '@solana/wallet-adapter-react-ui'
import {LAMPORTS_PER_SOL, VersionedTransaction, Transaction} from '@solana/web3.js'
import bs58 from 'bs58'

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

	return (
		<div className='min-h-screen bg-gray-50 p-4'>
			<div className='max-w-4xl mx-auto space-y-6'>
				{/* Header */}
				<div className='bg-white rounded-lg shadow p-6'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex items-center space-x-3'>
							<Wallet className='h-8 w-8 text-blue-600' />
							<h1 className='text-2xl font-bold text-gray-900'>Solana Wallet</h1>
						</div>
						<WalletMultiButton />
					</div>

					{/* Connection Status */}
					<div className='flex items-center space-x-2 mb-4'>
						<div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
						<span className='text-sm text-gray-600'>{connected ? 'Connected' : 'Not Connected'}</span>
						{wallet && <span className='text-sm text-blue-600'>({wallet.adapter.name})</span>}
					</div>

					{/* Wallet Info */}
					{connected && publicKey && (
						<div className='space-y-4'>
							{/* Address */}
							<div className='bg-gray-50 p-4 rounded border'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm text-gray-600 mb-1'>Wallet Address</p>
										<p className='font-mono text-sm break-all'>{publicKey.toString()}</p>
									</div>
									<button onClick={copyAddress} className='ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors' title='Copy address'>
										{copied ? '✓' : <Copy className='h-4 w-4' />}
									</button>
								</div>
							</div>

							{/* Balance */}
							<div className='bg-gray-50 p-4 rounded border'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='text-sm text-gray-600 mb-1'>Balance</p>
										{loading ? (
											<div className='flex items-center space-x-2'>
												<RefreshCw className='h-4 w-4 animate-spin' />
												<span className='text-sm'>Loading...</span>
											</div>
										) : balance !== null ? (
											<p className='text-lg font-semibold'>{balance.toFixed(4)} SOL</p>
										) : (
											<p className='text-sm text-gray-500'>Unable to load</p>
										)}
									</div>
									<button onClick={fetchBalance} disabled={loading} className='p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50' title='Refresh balance'>
										<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
									</button>
								</div>
							</div>

							{/* Disconnect Button */}
							<button onClick={handleDisconnect} className='w-full px-4 py-2 text-red-600 border border-red-300 rounded hover:bg-red-50 transition-colors'>
								Disconnect Wallet
							</button>
						</div>
					)}

					{/* Error Display */}
					{error && (
						<div className='mt-4 bg-red-50 border border-red-200 p-3 rounded'>
							<div className='flex items-center space-x-2'>
								<AlertCircle className='h-4 w-4 text-red-600' />
								<p className='text-sm text-red-800'>{error}</p>
							</div>
						</div>
					)}
				</div>

				{/* Transaction Signing Section */}
				{connected && (
					<div className='bg-white rounded-lg shadow p-6'>
						<h2 className='text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2'>
							<Signature className='h-5 w-5' />
							<span>Sign Transaction</span>
						</h2>

						<div className='space-y-4'>
							{/* Mode Selection */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Operation Mode</label>
								<select value={broadcastMode} onChange={(e) => setBroadcastMode(e.target.value as 'sign' | 'broadcast')} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
									<option value='sign'>Sign Only (return serialized transaction)</option>
									<option value='broadcast'>Sign & Broadcast (send to network)</option>
								</select>
							</div>

							{/* Format Selection */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Transaction Format</label>
								<select value={transactionFormat} onChange={(e) => setTransactionFormat(e.target.value as 'base64' | 'hex' | 'base58')} className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
									<option value='base64'>Base64</option>
									<option value='hex'>Hex</option>
									<option value='base58'>Base58</option>
								</select>
							</div>

							{/* Transaction Input */}
							<div>
								<label className='block text-sm font-medium text-gray-700 mb-2'>Raw Transaction Data</label>
								<textarea value={rawTransaction} onChange={(e) => setRawTransaction(e.target.value)} placeholder='Paste your transaction data here...' className='w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm' />
							</div>

							{/* Sign Button */}
							<button onClick={handleSignTransaction} disabled={signLoading || !rawTransaction.trim()} className='w-full flex items-center justify-center space-x-2 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 rounded-md'>
								{signLoading ? <RefreshCw className='h-4 w-4 animate-spin' /> : <Signature className='h-4 w-4' />}
								<span>{signLoading ? (broadcastMode === 'broadcast' ? 'Broadcasting...' : 'Signing...') : broadcastMode === 'broadcast' ? 'Sign & Broadcast' : 'Sign Transaction'}</span>
							</button>

							{/* Help text */}
							<div className='text-xs text-gray-500 space-y-1'>
								<p>💡 Paste your transaction data above and click {broadcastMode === 'broadcast' ? 'Sign & Broadcast' : 'Sign Transaction'}.</p>
								<p>🎯 Auto-detects transaction type (versioned or legacy).</p>
								<p>📋 Supports both Creator API (Metaplex) and NFT API (Anchor) transactions.</p>
								<p>✅ {broadcastMode === 'broadcast' ? 'Signs and broadcasts to Solana network.' : 'Signs transaction and returns serialized data.'}</p>
							</div>
						</div>

						{/* Error Display */}
						{signError && (
							<div className='mt-4 bg-red-50 border border-red-200 p-3 rounded'>
								<div className='flex items-center space-x-2'>
									<AlertCircle className='h-4 w-4 text-red-600' />
									<p className='text-sm text-red-800'>{signError}</p>
								</div>
							</div>
						)}

						{/* Result Display */}
						{signature && (
							<div className='mt-4 bg-green-50 border border-green-200 p-4 rounded'>
								<div className='flex items-center justify-between mb-2'>
									<h3 className='text-sm font-medium text-green-800'>{broadcastMode === 'broadcast' ? 'Transaction Broadcasted Successfully!' : 'Transaction Signed Successfully!'}</h3>
									<button onClick={copySignature} className='p-1 text-green-600 hover:bg-green-100 rounded transition-colors' title={broadcastMode === 'broadcast' ? 'Copy transaction signature' : 'Copy serialized transaction'}>
										{signatureCopied ? '✓' : <Copy className='h-4 w-4' />}
									</button>
								</div>
								<div className='mb-2'>
									<p className='text-xs text-green-700'>
										{broadcastMode === 'broadcast' ? (
											<>
												🔗 Transaction Signature:{' '}
												<a href={`https://explorer.solana.com/tx/${signature}`} target='_blank' rel='noopener noreferrer' className='underline hover:text-green-900'>
													View on Explorer
												</a>
											</>
										) : (
											'📦 Serialized Signed Transaction (Base64):'
										)}
									</p>
								</div>
								<div className='bg-white p-3 rounded border break-all font-mono text-xs'>{signature}</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
