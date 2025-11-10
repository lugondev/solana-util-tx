'use client'

import {useState} from 'react'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {PublicKey, Transaction} from '@solana/web3.js'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {extendALT, deactivateALT, freezeALT, closeALT} from '@/lib/solana/alt/manage-alt'
import {Plus, Pause, Snowflake, XCircle} from 'lucide-react'

interface ALTOperationsProps {
	altAddress: string
	authority: string | null
	isDeactivated: boolean
	isFrozen: boolean
	onOperationComplete?: () => void
}

export function ALTOperations({altAddress, authority, isDeactivated, isFrozen, onOperationComplete}: ALTOperationsProps) {
	const {connection} = useConnection()
	const {publicKey, sendTransaction} = useWallet()

	const [operation, setOperation] = useState<'extend' | 'deactivate' | 'freeze' | 'close' | null>(null)
	const [isProcessing, setIsProcessing] = useState(false)
	const [message, setMessage] = useState<{type: 'success' | 'error'; text: string} | null>(null)

	// Extend ALT state
	const [addressesToAdd, setAddressesToAdd] = useState('')

	// Close ALT state
	const [recipientAddress, setRecipientAddress] = useState('')

	const isAuthorized = publicKey && authority && publicKey.toBase58() === authority

	const handleExtend = async () => {
		if (!publicKey || !isAuthorized) {
			setMessage({type: 'error', text: 'Not authorized'})
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const addresses = addressesToAdd
				.split('\n')
				.map((addr) => addr.trim())
				.filter((addr) => addr.length > 0)
				.map((addr) => new PublicKey(addr))

			if (addresses.length === 0) {
				setMessage({type: 'error', text: 'No valid addresses to add'})
				return
			}

			if (addresses.length > 30) {
				setMessage({type: 'error', text: 'Maximum 30 addresses per transaction'})
				return
			}

			const {extendLookupTable} = await import('@solana/web3.js').then((m) => m.AddressLookupTableProgram)

			const extendInstruction = extendLookupTable({
				lookupTable: new PublicKey(altAddress),
				authority: publicKey,
				payer: publicKey,
				addresses,
			})

			const transaction = new Transaction().add(extendInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `Extended ALT with ${addresses.length} addresses. Signature: ${signature}`,
			})
			setAddressesToAdd('')
			onOperationComplete?.()
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to extend ALT',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	const handleDeactivate = async () => {
		if (!publicKey || !isAuthorized) {
			setMessage({type: 'error', text: 'Not authorized'})
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const {deactivateLookupTable} = await import('@solana/web3.js').then((m) => m.AddressLookupTableProgram)

			const deactivateInstruction = deactivateLookupTable({
				lookupTable: new PublicKey(altAddress),
				authority: publicKey,
			})

			const transaction = new Transaction().add(deactivateInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `ALT deactivated. Signature: ${signature}. Can close after ~10 minutes.`,
			})
			onOperationComplete?.()
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to deactivate ALT',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	const handleFreeze = async () => {
		if (!publicKey || !isAuthorized) {
			setMessage({type: 'error', text: 'Not authorized'})
			return
		}

		if (!confirm('Freezing an ALT is permanent. No more addresses can be added. Continue?')) {
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const {freezeLookupTable} = await import('@solana/web3.js').then((m) => m.AddressLookupTableProgram)

			const freezeInstruction = freezeLookupTable({
				lookupTable: new PublicKey(altAddress),
				authority: publicKey,
			})

			const transaction = new Transaction().add(freezeInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `ALT frozen permanently. Signature: ${signature}`,
			})
			onOperationComplete?.()
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to freeze ALT',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	const handleClose = async () => {
		if (!publicKey || !isAuthorized) {
			setMessage({type: 'error', text: 'Not authorized'})
			return
		}

		if (!isDeactivated) {
			setMessage({type: 'error', text: 'ALT must be deactivated first'})
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const recipient = recipientAddress ? new PublicKey(recipientAddress) : publicKey

			const {closeLookupTable} = await import('@solana/web3.js').then((m) => m.AddressLookupTableProgram)

			const closeInstruction = closeLookupTable({
				lookupTable: new PublicKey(altAddress),
				authority: publicKey,
				recipient,
			})

			const transaction = new Transaction().add(closeInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `ALT closed and rent reclaimed. Signature: ${signature}`,
			})
			onOperationComplete?.()
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to close ALT',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	if (!publicKey) {
		return (
			<PixelCard>
				<div className='text-center py-8'>
					<p className='font-mono text-sm text-gray-400'>Connect wallet to manage ALT operations</p>
				</div>
			</PixelCard>
		)
	}

	if (!isAuthorized) {
		return (
			<PixelCard>
				<div className='text-center py-8'>
					<p className='font-mono text-sm text-gray-400'>You are not the authority of this ALT</p>
					<p className='font-mono text-xs text-gray-500 mt-2'>Authority: {authority || 'None (Frozen)'}</p>
				</div>
			</PixelCard>
		)
	}

	return (
		<div className='space-y-4'>
			{/* Operation Selector */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>🛠️ ALT OPERATIONS</h3>
					</div>

					<div className='grid grid-cols-2 gap-3'>
						<PixelButton onClick={() => setOperation('extend')} variant={operation === 'extend' ? 'primary' : 'secondary'} disabled={isFrozen || isDeactivated} className='w-full'>
							<Plus className='h-4 w-4' />
							EXTEND ALT
						</PixelButton>

						<PixelButton onClick={() => setOperation('deactivate')} variant={operation === 'deactivate' ? 'primary' : 'secondary'} disabled={isDeactivated || isFrozen} className='w-full'>
							<Pause className='h-4 w-4' />
							DEACTIVATE
						</PixelButton>

						<PixelButton onClick={() => setOperation('freeze')} variant={operation === 'freeze' ? 'primary' : 'secondary'} disabled={isFrozen || isDeactivated} className='w-full'>
							<Snowflake className='h-4 w-4' />
							FREEZE ALT
						</PixelButton>

						<PixelButton onClick={() => setOperation('close')} variant={operation === 'close' ? 'primary' : 'secondary'} disabled={!isDeactivated} className='w-full'>
							<XCircle className='h-4 w-4' />
							CLOSE ALT
						</PixelButton>
					</div>
				</div>
			</PixelCard>

			{/* Operation Details */}
			{operation === 'extend' && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-blue-400/20 pb-3'>
							<h4 className='font-pixel text-sm text-blue-400'>EXTEND ALT</h4>
						</div>

						<div>
							<label className='font-mono text-xs text-gray-400 mb-2 block'>ADDRESSES TO ADD (one per line, max 30):</label>
							<textarea
								value={addressesToAdd}
								onChange={(e) => setAddressesToAdd(e.target.value)}
								placeholder='Address1&#10;Address2&#10;Address3&#10;...'
								className='w-full h-32 px-3 py-2 bg-gray-900 border-2 border-gray-600 text-white font-mono text-xs focus:border-green-400 focus:outline-none resize-none'
								disabled={isProcessing}
							/>
							<p className='font-mono text-xs text-gray-500 mt-1'>{addressesToAdd.split('\n').filter((a) => a.trim()).length} addresses</p>
						</div>

						<PixelButton onClick={handleExtend} disabled={isProcessing || !addressesToAdd.trim()} className='w-full'>
							{isProcessing ? 'PROCESSING...' : 'EXTEND ALT'}
						</PixelButton>
					</div>
				</PixelCard>
			)}

			{operation === 'deactivate' && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-yellow-400/20 pb-3'>
							<h4 className='font-pixel text-sm text-yellow-400'>DEACTIVATE ALT</h4>
						</div>

						<div className='space-y-3 font-mono text-xs text-gray-400'>
							<p>Deactivating an ALT will:</p>
							<ul className='list-disc list-inside space-y-1 ml-2'>
								<li>Enter a cooldown period (~10 minutes)</li>
								<li>Prevent any new addresses from being added</li>
								<li>Allow closing after cooldown to reclaim rent</li>
							</ul>
							<p className='text-yellow-400'>This action cannot be undone.</p>
						</div>

						<PixelButton onClick={handleDeactivate} disabled={isProcessing} className='w-full' variant='secondary'>
							{isProcessing ? 'PROCESSING...' : 'DEACTIVATE ALT'}
						</PixelButton>
					</div>
				</PixelCard>
			)}

			{operation === 'freeze' && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-purple-400/20 pb-3'>
							<h4 className='font-pixel text-sm text-purple-400'>FREEZE ALT</h4>
						</div>

						<div className='space-y-3 font-mono text-xs text-gray-400'>
							<p>Freezing an ALT will:</p>
							<ul className='list-disc list-inside space-y-1 ml-2'>
								<li>Make the ALT permanently immutable</li>
								<li>Remove the authority (cannot be changed)</li>
								<li>Prevent any future modifications</li>
								<li>ALT can still be used in transactions</li>
							</ul>
							<p className='text-red-400 font-bold'>⚠️ THIS IS PERMANENT AND IRREVERSIBLE!</p>
						</div>

						<PixelButton onClick={handleFreeze} disabled={isProcessing} className='w-full' variant='secondary'>
							{isProcessing ? 'PROCESSING...' : 'FREEZE ALT'}
						</PixelButton>
					</div>
				</PixelCard>
			)}

			{operation === 'close' && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-red-400/20 pb-3'>
							<h4 className='font-pixel text-sm text-red-400'>CLOSE ALT</h4>
						</div>

						<div className='space-y-3 font-mono text-xs text-gray-400'>
							<p>Closing an ALT will:</p>
							<ul className='list-disc list-inside space-y-1 ml-2'>
								<li>Permanently delete the ALT account</li>
								<li>Reclaim rent (~0.00204 SOL)</li>
								<li>Make all references to this ALT invalid</li>
							</ul>
							<p className='text-red-400'>Ensure no transactions use this ALT!</p>
						</div>

						<div>
							<label className='font-mono text-xs text-gray-400 mb-2 block'>RECIPIENT ADDRESS (optional, defaults to your wallet):</label>
							<PixelInput value={recipientAddress} onChange={(e) => setRecipientAddress(e.target.value)} placeholder='Recipient address for rent refund' disabled={isProcessing} />
						</div>

						<PixelButton onClick={handleClose} disabled={isProcessing} className='w-full' variant='secondary'>
							{isProcessing ? 'PROCESSING...' : 'CLOSE ALT'}
						</PixelButton>
					</div>
				</PixelCard>
			)}

			{/* Status Message */}
			{message && (
				<PixelCard>
					<div className={`font-mono text-xs ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
						<p className='font-bold mb-2'>{message.type === 'success' ? '✓ SUCCESS' : '✗ ERROR'}</p>
						<p className='whitespace-pre-wrap break-all'>{message.text}</p>
					</div>
				</PixelCard>
			)}
		</div>
	)
}
