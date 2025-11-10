'use client'

import {useState} from 'react'
import {useConnection, useWallet} from '@solana/wallet-adapter-react'
import {PublicKey, Transaction, TransactionInstruction} from '@solana/web3.js'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {Shield, Trash2, Info, ExternalLink, Copy} from 'lucide-react'

export function ProgramManagement() {
	const {connection} = useConnection()
	const {publicKey, sendTransaction} = useWallet()

	const [programId, setProgramId] = useState('')
	const [programInfo, setProgramInfo] = useState<any>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isProcessing, setIsProcessing] = useState(false)
	const [message, setMessage] = useState<{type: 'success' | 'error' | 'info'; text: string} | null>(null)

	const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')

	const loadProgramInfo = async () => {
		if (!programId) return

		try {
			setIsLoading(true)
			setMessage(null)

			const programPubkey = new PublicKey(programId)
			const programAccount = await connection.getAccountInfo(programPubkey)

			if (!programAccount) {
				setMessage({type: 'error', text: 'Program not found'})
				setProgramInfo(null)
				return
			}

			// Check if upgradeable
			const isUpgradeable = programAccount.owner.equals(BPF_LOADER_UPGRADEABLE_PROGRAM_ID)

			let info: any = {
				address: programId,
				owner: programAccount.owner.toBase58(),
				dataSize: programAccount.data.length,
				lamports: programAccount.lamports,
				executable: programAccount.executable,
				isUpgradeable,
			}

			if (isUpgradeable) {
				// Get program data account
				const [programDataAddress] = PublicKey.findProgramAddressSync([programPubkey.toBuffer()], BPF_LOADER_UPGRADEABLE_PROGRAM_ID)

				const programDataAccount = await connection.getAccountInfo(programDataAddress)

				if (programDataAccount) {
					// Parse upgrade authority
					const upgradeAuthorityOption = programDataAccount.data[8]
					let upgradeAuthority: string | null = null

					if (upgradeAuthorityOption === 1) {
						const authorityBytes = programDataAccount.data.slice(9, 41)
						upgradeAuthority = new PublicKey(authorityBytes).toBase58()
					}

					info.programDataAddress = programDataAddress.toBase58()
					info.programDataSize = programDataAccount.data.length
					info.upgradeAuthority = upgradeAuthority
					info.isImmutable = upgradeAuthority === null
				}
			}

			setProgramInfo(info)
			setMessage({type: 'info', text: 'Program information loaded successfully'})
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to load program info',
			})
			setProgramInfo(null)
		} finally {
			setIsLoading(false)
		}
	}

	const handleCloseProgram = async () => {
		if (!publicKey || !programInfo) return

		if (!programInfo.isUpgradeable) {
			setMessage({type: 'error', text: 'Only upgradeable programs can be closed'})
			return
		}

		if (programInfo.upgradeAuthority !== publicKey.toBase58()) {
			setMessage({type: 'error', text: 'You are not the upgrade authority'})
			return
		}

		if (!confirm('Are you sure you want to close this program? This action cannot be undone and the program will be permanently deleted.')) {
			return
		}

		try {
			setIsProcessing(true)
			setMessage(null)

			const programPubkey = new PublicKey(programId)
			const programDataPubkey = new PublicKey(programInfo.programDataAddress)

			// Create close instruction
			const closeInstruction = new TransactionInstruction({
				programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
				keys: [
					{pubkey: programDataPubkey, isSigner: false, isWritable: true},
					{pubkey: publicKey, isSigner: false, isWritable: true},
					{pubkey: publicKey, isSigner: true, isWritable: false},
					{pubkey: programPubkey, isSigner: false, isWritable: true},
				],
				data: Buffer.from([5, 0, 0, 0]), // Close instruction discriminator
			})

			const transaction = new Transaction().add(closeInstruction)
			const signature = await sendTransaction(transaction, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({
				type: 'success',
				text: `Program closed successfully! Rent reclaimed. Signature: ${signature}`,
			})
			setProgramInfo(null)
			setProgramId('')
		} catch (error) {
			setMessage({
				type: 'error',
				text: error instanceof Error ? error.message : 'Failed to close program',
			})
		} finally {
			setIsProcessing(false)
		}
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
		setMessage({type: 'info', text: 'Copied to clipboard!'})
	}

	const openInExplorer = (address: string) => {
		window.open(`https://explorer.solana.com/address/${address}`, '_blank')
	}

	return (
		<div className='space-y-6'>
			{/* Load Program */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400 flex items-center gap-2'>
							<Info className='h-4 w-4' />
							PROGRAM INFORMATION
						</h3>
					</div>

					<div className='flex gap-3'>
						<PixelInput value={programId} onChange={(e) => setProgramId(e.target.value)} placeholder='Enter program ID' disabled={isLoading} className='flex-1' />
						<PixelButton onClick={loadProgramInfo} disabled={isLoading || !programId} isLoading={isLoading}>
							LOAD INFO
						</PixelButton>
					</div>
				</div>
			</PixelCard>

			{/* Program Details */}
			{programInfo && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-blue-400/20 pb-3 flex items-center justify-between'>
							<h4 className='font-pixel text-sm text-blue-400'>PROGRAM DETAILS</h4>
							<div className='flex gap-2'>
								{programInfo.isUpgradeable ? <span className='px-2 py-1 bg-green-600/20 text-green-400 border border-green-600/30 font-pixel text-xs'>UPGRADEABLE</span> : <span className='px-2 py-1 bg-gray-600/20 text-gray-400 border border-gray-600/30 font-pixel text-xs'>NOT UPGRADEABLE</span>}
								{programInfo.isImmutable && <span className='px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 font-pixel text-xs'>IMMUTABLE</span>}
							</div>
						</div>

						<div className='space-y-3 font-mono text-xs'>
							<div className='grid grid-cols-1 gap-3'>
								<div>
									<div className='text-gray-400 mb-1'>Program Address:</div>
									<div className='flex items-center gap-2 p-2 bg-gray-900 border border-gray-700 rounded'>
										<span className='text-white break-all flex-1'>{programInfo.address}</span>
										<button onClick={() => copyToClipboard(programInfo.address)} className='text-gray-400 hover:text-green-400'>
											<Copy className='h-4 w-4' />
										</button>
										<button onClick={() => openInExplorer(programInfo.address)} className='text-gray-400 hover:text-green-400'>
											<ExternalLink className='h-4 w-4' />
										</button>
									</div>
								</div>

								{programInfo.programDataAddress && (
									<div>
										<div className='text-gray-400 mb-1'>Program Data Address:</div>
										<div className='flex items-center gap-2 p-2 bg-gray-900 border border-gray-700 rounded'>
											<span className='text-white break-all flex-1'>{programInfo.programDataAddress}</span>
											<button onClick={() => copyToClipboard(programInfo.programDataAddress)} className='text-gray-400 hover:text-green-400'>
												<Copy className='h-4 w-4' />
											</button>
										</div>
									</div>
								)}

								{programInfo.upgradeAuthority && (
									<div>
										<div className='text-gray-400 mb-1'>Upgrade Authority:</div>
										<div className='flex items-center gap-2 p-2 bg-gray-900 border border-gray-700 rounded'>
											<span className='text-white break-all flex-1'>{programInfo.upgradeAuthority}</span>
											<button onClick={() => copyToClipboard(programInfo.upgradeAuthority)} className='text-gray-400 hover:text-green-400'>
												<Copy className='h-4 w-4' />
											</button>
										</div>
									</div>
								)}
							</div>

							<div className='grid grid-cols-2 gap-4 pt-3 border-t border-gray-700'>
								<div>
									<div className='text-gray-400 mb-1'>Program Size:</div>
									<div className='text-white'>{(programInfo.dataSize / 1024).toFixed(2)} KB</div>
								</div>
								{programInfo.programDataSize && (
									<div>
										<div className='text-gray-400 mb-1'>Data Account Size:</div>
										<div className='text-white'>{(programInfo.programDataSize / 1024).toFixed(2)} KB</div>
									</div>
								)}
								<div>
									<div className='text-gray-400 mb-1'>Rent (SOL):</div>
									<div className='text-white'>{(programInfo.lamports / 1e9).toFixed(6)}</div>
								</div>
								<div>
									<div className='text-gray-400 mb-1'>Owner:</div>
									<div className='text-white break-all'>{programInfo.owner.slice(0, 20)}...</div>
								</div>
							</div>
						</div>
					</div>
				</PixelCard>
			)}

			{/* Actions */}
			{programInfo && programInfo.isUpgradeable && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-red-400/20 pb-3'>
							<h4 className='font-pixel text-sm text-red-400 flex items-center gap-2'>
								<Trash2 className='h-4 w-4' />
								DANGER ZONE
							</h4>
						</div>

						<div className='space-y-3 font-mono text-xs text-gray-400'>
							<p>Close the program and reclaim rent.</p>
							<div className='p-3 bg-red-900/20 border border-red-600/30 rounded'>
								<p className='text-red-400'>⚠️ This action is permanent and cannot be undone. The program will be deleted and all data will be lost.</p>
							</div>
							{programInfo.upgradeAuthority !== publicKey?.toBase58() && (
								<div className='p-3 bg-yellow-900/20 border border-yellow-600/30 rounded'>
									<p className='text-yellow-400'>You are not the upgrade authority. Only the authority can close this program.</p>
								</div>
							)}
						</div>

						<PixelButton onClick={handleCloseProgram} disabled={isProcessing || programInfo.upgradeAuthority !== publicKey?.toBase58()} isLoading={isProcessing} variant='secondary' className='w-full'>
							CLOSE PROGRAM
						</PixelButton>
					</div>
				</PixelCard>
			)}

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
						<Shield className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>View detailed information about any Solana program</span>
					</div>
					<div className='flex items-start gap-2'>
						<Shield className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>Check if a program is upgradeable or immutable</span>
					</div>
					<div className='flex items-start gap-2'>
						<Shield className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>Verify upgrade authority and ownership</span>
					</div>
					<div className='flex items-start gap-2'>
						<Shield className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
						<span>Close programs to reclaim rent (authority only)</span>
					</div>
				</div>
			</PixelCard>
		</div>
	)
}
