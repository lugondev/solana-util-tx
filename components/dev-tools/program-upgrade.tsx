'use client'

import {useState} from 'react'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {PublicKey, Transaction, TransactionInstruction} from '@solana/web3.js'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {Upload, Shield, Key, AlertTriangle} from 'lucide-react'

interface ProgramUpgradeProps {
	onUpgradeComplete?: () => void
}

export function ProgramUpgrade({onUpgradeComplete}: ProgramUpgradeProps) {
	const {connection} = useConnection()
	const {publicKey, sendTransaction} = useWallet()

	const [programId, setProgramId] = useState('')
	const [bufferAddress, setBufferAddress] = useState('')
	const [upgradeAuthority, setUpgradeAuthority] = useState('')
	const [spillAddress, setSpillAddress] = useState('')

	const [isProcessing, setIsProcessing] = useState(false)
	const [isValidating, setIsValidating] = useState(false)
	const [validationResult, setValidationResult] = useState<any>(null)
	const [message, setMessage] = useState<{type: 'success' | 'error' | 'info'; text: string} | null>(null)

	const validateUpgrade = async () => {
		if (!programId || !bufferAddress) {
			setMessage({type: 'error', text: 'Program ID and Buffer Address are required'})
			return
		}

		try {
			setIsValidating(true)
			setMessage(null)

			const programPubkey = new PublicKey(programId)
			const bufferPubkey = new PublicKey(bufferAddress)

			// Get program account
			const programAccount = await connection.getAccountInfo(programPubkey)
			if (!programAccount) {
				setMessage({type: 'error', text: 'Program account not found'})
				return
			}

			// Get buffer account
			const bufferAccount = await connection.getAccountInfo(bufferPubkey)
			if (!bufferAccount) {
				setMessage({type: 'error', text: 'Buffer account not found'})
				return
			}

			// Check if program is upgradeable
			const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')
			if (!programAccount.owner.equals(BPF_LOADER_UPGRADEABLE_PROGRAM_ID)) {
				setMessage({type: 'error', text: 'Program is not upgradeable'})
				return
			}

			// Get program data account
			const [programDataAddress] = PublicKey.findProgramAddressSync([programPubkey.toBuffer()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)

			const programDataAccount = await connection.getAccountInfo(programDataAddress)
			if (!programDataAccount) {
				setMessage({type: 'error', text: 'Program data account not found'})
				return
			}

			// Parse upgrade authority from program data account
			// First 45 bytes: slot (8) + option (1) + authority (32) + padding (4)
			const upgradeAuthorityOption = programDataAccount.data[8]
			let currentAuthority: PublicKey | null = null

			if (upgradeAuthorityOption === 1) {
				const authorityBytes = programDataAccount.data.slice(9, 41)
				currentAuthority = new PublicKey(authorityBytes)
			}

			const validation = {
				programSize: programAccount.data.length,
				bufferSize: bufferAccount.data.length,
				programDataSize: programDataAccount.data.length,
				currentAuthority: currentAuthority?.toBase58() || 'None',
				canUpgrade: currentAuthority !== null,
				estimatedCost: bufferAccount.lamports / 1e9,
			}

			setValidationResult(validation)
			setMessage({
				type: 'info',
				text: `Validation successful. Buffer size: ${(bufferAccount.data.length / 1024).toFixed(2)} KB`,
			})
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Validation failed',
			})
			setValidationResult(null)
		} finally {
			setIsValidating(false)
		}
	}

	const handleUpgrade = async () => {
		if (!publicKey) {
			setMessage({type: 'error', text: 'Please connect your wallet'})
			return
		}

		if (!validationResult) {
			setMessage({type: 'error', text: 'Please validate the upgrade first'})
			return
		}

		if (!validationResult.canUpgrade) {
			setMessage({type: 'error', text: 'Program cannot be upgraded (no authority)'})
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const programPubkey = new PublicKey(programId)
			const bufferPubkey = new PublicKey(bufferAddress)
			const authorityPubkey = upgradeAuthority ? new PublicKey(upgradeAuthority) : publicKey
			const spillPubkey = spillAddress ? new PublicKey(spillAddress) : publicKey

			const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')

			// Get program data account
			const [programDataAddress] = PublicKey.findProgramAddressSync([programPubkey.toBuffer()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)

			// Create upgrade instruction
			const upgradeInstruction = new TransactionInstruction({
				programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
				keys: [
					{pubkey: programDataAddress, isSigner: false, isWritable: true},
					{pubkey: programPubkey, isSigner: false, isWritable: true},
					{pubkey: bufferPubkey, isSigner: false, isWritable: true},
					{pubkey: spillPubkey, isSigner: false, isWritable: true},
					{pubkey: new PublicKey('SysvarRent111111111111111111111111111111111'), isSigner: false, isWritable: false},
					{pubkey: new PublicKey('SysvarC1ock11111111111111111111111111111111'), isSigner: false, isWritable: false},
					{pubkey: authorityPubkey, isSigner: true, isWritable: false},
				],
				data: Buffer.from([3, 0, 0, 0]), // Upgrade instruction discriminator
			})

			const transaction = new Transaction().add(upgradeInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `Program upgraded successfully! Signature: ${signature}`,
			})
			setValidationResult(null)
			setProgramId('')
			setBufferAddress('')
			onUpgradeComplete?.()
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Upgrade failed',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	const handleSetAuthority = async () => {
		if (!publicKey) {
			setMessage({type: 'error', text: 'Please connect your wallet'})
			return
		}

		if (!programId) {
			setMessage({type: 'error', text: 'Program ID is required'})
			return
		}

		const newAuthority = upgradeAuthority ? upgradeAuthority : 'None (make immutable)'

		if (!confirm(`Set upgrade authority to: ${newAuthority}?\n\n⚠️ If set to None, the program will become immutable!`)) {
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const programPubkey = new PublicKey(programId)
			const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')

			// Get program data account
			const [programDataAddress] = PublicKey.findProgramAddressSync([programPubkey.toBuffer()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)

			const newAuthorityPubkey = upgradeAuthority ? new PublicKey(upgradeAuthority) : null

			// Create set authority instruction
			const setAuthorityInstruction = new TransactionInstruction({
				programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
				keys: [{pubkey: programDataAddress, isSigner: false, isWritable: true}, {pubkey: publicKey, isSigner: true, isWritable: false}, ...(newAuthorityPubkey ? [{pubkey: newAuthorityPubkey, isSigner: false, isWritable: false}] : [])],
				data: Buffer.from([4, 0, 0, 0, newAuthorityPubkey ? 1 : 0]), // SetAuthority instruction
			})

			const transaction = new Transaction().add(setAuthorityInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `Authority updated successfully! Signature: ${signature}`,
			})
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to set authority',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	return (
		<div className='space-y-6'>
			{/* Program Details */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400 flex items-center gap-2'>
							<Upload className='h-4 w-4' />
							PROGRAM UPGRADE
						</h3>
					</div>

					<div className='space-y-3'>
						<div>
							<label className='font-mono text-xs text-gray-400 mb-2 block'>PROGRAM ID:</label>
							<PixelInput value={programId} onChange={(e) => setProgramId(e.target.value)} placeholder='Program address to upgrade' disabled={isProcessing} />
						</div>

						<div>
							<label className='font-mono text-xs text-gray-400 mb-2 block'>BUFFER ADDRESS:</label>
							<PixelInput value={bufferAddress} onChange={(e) => setBufferAddress(e.target.value)} placeholder='Buffer containing new program data' disabled={isProcessing} />
						</div>

						<div>
							<label className='font-mono text-xs text-gray-400 mb-2 block'>UPGRADE AUTHORITY (optional, defaults to wallet):</label>
							<PixelInput value={upgradeAuthority} onChange={(e) => setUpgradeAuthority(e.target.value)} placeholder='Current upgrade authority' disabled={isProcessing} />
						</div>

						<div>
							<label className='font-mono text-xs text-gray-400 mb-2 block'>SPILL ADDRESS (optional, for refund):</label>
							<PixelInput value={spillAddress} onChange={(e) => setSpillAddress(e.target.value)} placeholder='Address to receive buffer rent refund' disabled={isProcessing} />
						</div>

						<div className='flex gap-3'>
							<PixelButton onClick={validateUpgrade} disabled={isValidating || !programId || !bufferAddress} isLoading={isValidating} variant='secondary' className='flex-1'>
								VALIDATE UPGRADE
							</PixelButton>
							<PixelButton onClick={handleUpgrade} disabled={isProcessing || !validationResult} isLoading={isProcessing} className='flex-1'>
								PERFORM UPGRADE
							</PixelButton>
						</div>
					</div>
				</div>
			</PixelCard>

			{/* Validation Results */}
			{validationResult && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-blue-400/20 pb-3'>
							<h4 className='font-pixel text-sm text-blue-400'>VALIDATION RESULTS</h4>
						</div>

						<div className='grid grid-cols-2 gap-4 font-mono text-xs'>
							<div>
								<div className='text-gray-400 mb-1'>Program Size:</div>
								<div className='text-white'>{(validationResult.programSize / 1024).toFixed(2)} KB</div>
							</div>
							<div>
								<div className='text-gray-400 mb-1'>Buffer Size:</div>
								<div className='text-white'>{(validationResult.bufferSize / 1024).toFixed(2)} KB</div>
							</div>
							<div>
								<div className='text-gray-400 mb-1'>Current Authority:</div>
								<div className='text-white break-all'>{validationResult.currentAuthority}</div>
							</div>
							<div>
								<div className='text-gray-400 mb-1'>Can Upgrade:</div>
								<div className={validationResult.canUpgrade ? 'text-green-400' : 'text-red-400'}>{validationResult.canUpgrade ? 'Yes' : 'No'}</div>
							</div>
							<div className='col-span-2'>
								<div className='text-gray-400 mb-1'>Estimated Cost:</div>
								<div className='text-white'>{validationResult.estimatedCost.toFixed(6)} SOL</div>
							</div>
						</div>

						{!validationResult.canUpgrade && (
							<div className='flex items-start gap-2 p-3 bg-red-900/20 border border-red-600/30 rounded'>
								<AlertTriangle className='h-4 w-4 text-red-400 mt-0.5 flex-shrink-0' />
								<p className='font-mono text-xs text-red-400'>This program cannot be upgraded because it has no upgrade authority (immutable).</p>
							</div>
						)}
					</div>
				</PixelCard>
			)}

			{/* Authority Management */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-purple-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-purple-400 flex items-center gap-2'>
							<Shield className='h-4 w-4' />
							AUTHORITY MANAGEMENT
						</h3>
					</div>

					<div className='space-y-3 font-mono text-xs text-gray-400'>
						<p>Change or remove the upgrade authority for a program.</p>
						<div className='flex items-start gap-2 p-3 bg-yellow-900/20 border border-yellow-600/30 rounded'>
							<AlertTriangle className='h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0' />
							<p className='text-yellow-400'>Setting authority to None will make the program immutable forever!</p>
						</div>
					</div>

					<PixelButton onClick={handleSetAuthority} disabled={isProcessing || !programId} isLoading={isProcessing} variant='secondary' className='w-full'>
						SET AUTHORITY
					</PixelButton>
				</div>
			</PixelCard>

			{/* Status Message */}
			{message && (
				<PixelCard>
					<div className={`font-mono text-xs ${message.type === 'success' ? 'text-green-400' : message.type === 'error' ? 'text-red-400' : 'text-blue-400'}`}>
						<p className='font-bold mb-2'>
							{message.type === 'success' && '✓ SUCCESS'}
							{message.type === 'error' && '✗ ERROR'}
							{message.type === 'info' && 'ℹ INFO'}
						</p>
						<p className='whitespace-pre-wrap break-all'>{message.text}</p>
					</div>
				</PixelCard>
			)}

			{/* Info */}
			<PixelCard>
				<div className='space-y-3 font-mono text-xs text-gray-400'>
					<div className='flex items-start gap-2'>
						<Key className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>Only the current upgrade authority can upgrade a program</span>
					</div>
					<div className='flex items-start gap-2'>
						<Key className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>Buffer must be created with `solana program write-buffer` command</span>
					</div>
					<div className='flex items-start gap-2'>
						<Key className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>Always test upgrades on devnet first before mainnet</span>
					</div>
				</div>
			</PixelCard>
		</div>
	)
}
