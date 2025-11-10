'use client'

import {useState, useEffect} from 'react'
import {useConnection} from '@solana/wallet-adapter-react'
import {PublicKey} from '@solana/web3.js'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {getALTInfo, ALTStorage, type ALTInfo} from '@/lib/solana/alt/manage-alt'
import {ALTOperations} from './alt-operations'
import {ChevronDown, ChevronRight, ExternalLink, Copy, Trash2, Settings} from 'lucide-react'

interface StoredALT {
	address: string
	name?: string
	description?: string
	lastUpdated: number
}

export function ALTManager() {
	const {connection} = useConnection()

	const [storedALTs, setStoredALTs] = useState<StoredALT[]>([])
	const [altInfos, setAltInfos] = useState<Record<string, ALTInfo>>({})
	const [expandedALTs, setExpandedALTs] = useState<Set<string>>(new Set())
	const [selectedALTForOps, setSelectedALTForOps] = useState<string | null>(null)
	const [newALTAddress, setNewALTAddress] = useState('')
	const [isAdding, setIsAdding] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// Load stored ALTs on mount
	useEffect(() => {
		loadStoredALTs()
	}, [])

	// Load ALT info when ALTs change
	useEffect(() => {
		if (storedALTs.length > 0) {
			loadALTInfos()
		}
	}, [storedALTs, connection])

	const loadStoredALTs = () => {
		const stored = ALTStorage.getStoredALTs()
		const altList = Object.entries(stored).map(([address, data]) => ({
			address,
			...data,
		}))
		setStoredALTs(altList)
	}

	const loadALTInfos = async () => {
		setIsLoading(true)
		const infos: Record<string, ALTInfo> = {}

		for (const alt of storedALTs) {
			try {
				const altInfo = await getALTInfo(connection, new PublicKey(alt.address))
				if (altInfo) {
					infos[alt.address] = altInfo
				}
			} catch (error) {
				console.error(`Error loading ALT ${alt.address}:`, error)
			}
		}

		setAltInfos(infos)
		setIsLoading(false)
	}

	const handleAddALT = async () => {
		if (!newALTAddress.trim()) return

		try {
			const altAddress = new PublicKey(newALTAddress)
			setIsAdding(true)

			// Fetch ALT info
			const altInfo = await getALTInfo(connection, altAddress)

			if (!altInfo) {
				alert('ALT not found or invalid address')
				return
			}

			// Save to storage
			ALTStorage.saveALT(altAddress.toBase58(), {
				name: `ALT ${altAddress.toBase58().slice(0, 8)}...`,
				description: 'Imported ALT',
			})

			// Reload
			loadStoredALTs()
			setNewALTAddress('')
		} catch (error) {
			alert('Invalid ALT address')
		} finally {
			setIsAdding(false)
		}
	}

	const handleRemoveALT = (address: string) => {
		if (confirm('Are you sure you want to remove this ALT from tracking?')) {
			ALTStorage.removeALT(address)
			loadStoredALTs()
		}
	}

	const toggleExpanded = (address: string) => {
		const newExpanded = new Set(expandedALTs)
		if (newExpanded.has(address)) {
			newExpanded.delete(address)
		} else {
			newExpanded.add(address)
		}
		setExpandedALTs(newExpanded)
	}

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text)
	}

	const openInExplorer = (address: string) => {
		window.open(`https://explorer.solana.com/address/${address}`, '_blank')
	}

	return (
		<div className='space-y-6'>
			{/* Add ALT */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>ADD EXISTING ALT</h3>
					</div>

					<div className='flex gap-3'>
						<PixelInput value={newALTAddress} onChange={(e) => setNewALTAddress(e.target.value)} placeholder='Enter ALT address to track' disabled={isAdding} className='flex-1' />
						<PixelButton variant='primary' onClick={handleAddALT} disabled={!newALTAddress.trim() || isAdding} isLoading={isAdding}>
							[ADD]
						</PixelButton>
					</div>
				</div>
			</PixelCard>

			{/* ALT List */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3 flex items-center justify-between'>
						<h3 className='font-pixel text-sm text-green-400'>MANAGED ALTS ({storedALTs.length})</h3>
						<PixelButton variant='secondary' onClick={loadALTInfos} disabled={isLoading} isLoading={isLoading} className='!py-1 !px-2 !text-xs'>
							[REFRESH]
						</PixelButton>
					</div>

					{storedALTs.length === 0 ? (
						<div className='text-center py-8'>
							<div className='font-mono text-gray-500'>No ALTs tracked yet</div>
							<div className='font-mono text-xs text-gray-600 mt-2'>Create a new ALT or add an existing one to start managing</div>
						</div>
					) : (
						<div className='space-y-3'>
							{storedALTs.map((alt) => {
								const altInfo = altInfos[alt.address]
								const isExpanded = expandedALTs.has(alt.address)

								return (
									<div key={alt.address} className='border-4 border-gray-700 bg-gray-800'>
										{/* Header */}
										<div className='p-4'>
											<div className='flex items-center justify-between'>
												<div className='flex items-center gap-3'>
													<button onClick={() => toggleExpanded(alt.address)} className='text-gray-400 hover:text-green-400'>
														{isExpanded ? <ChevronDown className='h-4 w-4' /> : <ChevronRight className='h-4 w-4' />}
													</button>

													<div>
														<div className='font-pixel text-sm text-white'>{alt.name || 'Unnamed ALT'}</div>
														<div className='font-mono text-xs text-gray-400 break-all'>{alt.address}</div>
													</div>
												</div>

												<div className='flex items-center gap-2'>
													{/* Status badges */}
													{altInfo && (
														<div className='flex gap-2'>
															{altInfo.isDeactivated && <span className='px-2 py-1 bg-red-600/20 text-red-400 border border-red-600/30 font-pixel text-xs'>DEACTIVATED</span>}
															{altInfo.isFrozen && <span className='px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 font-pixel text-xs'>FROZEN</span>}
															{altInfo.canBeClosed && <span className='px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 font-pixel text-xs'>CLOSABLE</span>}
														</div>
													)}

													{/* Actions */}
													<button onClick={() => setSelectedALTForOps(selectedALTForOps === alt.address ? null : alt.address)} className='text-gray-400 hover:text-blue-400 p-1' title='Manage operations'>
														<Settings className='h-4 w-4' />
													</button>
													<button onClick={() => copyToClipboard(alt.address)} className='text-gray-400 hover:text-green-400 p-1' title='Copy address'>
														<Copy className='h-4 w-4' />
													</button>
													<button onClick={() => openInExplorer(alt.address)} className='text-gray-400 hover:text-green-400 p-1' title='View in explorer'>
														<ExternalLink className='h-4 w-4' />
													</button>
													<button onClick={() => handleRemoveALT(alt.address)} className='text-gray-400 hover:text-red-400 p-1' title='Remove from tracking'>
														<Trash2 className='h-4 w-4' />
													</button>
												</div>
											</div>
										</div>

										{/* Operations Panel */}
										{selectedALTForOps === alt.address && altInfo && (
											<div className='border-t-4 border-blue-400/20 p-4'>
												<ALTOperations
													altAddress={alt.address}
													authority={altInfo.authority?.toBase58() || null}
													isDeactivated={altInfo.isDeactivated}
													isFrozen={altInfo.isFrozen}
													onOperationComplete={() => {
														loadALTInfos()
														setSelectedALTForOps(null)
													}}
												/>
											</div>
										)}

										{/* Expanded Details */}
										{isExpanded && altInfo && (
											<div className='border-t-4 border-gray-700 p-4'>
												<div className='space-y-4'>
													{/* Basic Info */}
													<div className='grid grid-cols-2 gap-4'>
														<div>
															<div className='font-mono text-xs text-gray-400 mb-1'>AUTHORITY:</div>
															<div className='font-mono text-xs text-white break-all p-2 bg-gray-900 border-2 border-gray-600'>{altInfo.authority?.toBase58() || 'None (Frozen)'}</div>
														</div>
														<div>
															<div className='font-mono text-xs text-gray-400 mb-1'>ADDRESSES:</div>
															<div className='font-mono text-xs text-white p-2 bg-gray-900 border-2 border-gray-600'>{altInfo.addresses.length} / 256</div>
														</div>
													</div>

													{/* Addresses List */}
													{altInfo.addresses.length > 0 && (
														<div>
															<div className='font-mono text-xs text-gray-400 mb-2'>ADDRESSES IN ALT:</div>
															<div className='max-h-48 overflow-y-auto border-2 border-gray-600 bg-gray-900'>
																{altInfo.addresses.map((address, index) => (
																	<div key={index} className='flex items-center justify-between px-3 py-2 border-b border-gray-700 last:border-b-0'>
																		<div className='flex items-center gap-3'>
																			<span className='font-mono text-xs text-gray-500 w-8'>[{index}]</span>
																			<span className='font-mono text-xs text-white break-all'>{address.toBase58()}</span>
																		</div>
																		<button onClick={() => copyToClipboard(address.toBase58())} className='text-gray-400 hover:text-green-400 p-1'>
																			<Copy className='h-3 w-3' />
																		</button>
																	</div>
																))}
															</div>
														</div>
													)}

													{alt.description && (
														<div>
															<div className='font-mono text-xs text-gray-400 mb-1'>DESCRIPTION:</div>
															<div className='font-mono text-xs text-gray-300 p-2 bg-gray-900 border-2 border-gray-600'>{alt.description}</div>
														</div>
													)}
												</div>
											</div>
										)}
									</div>
								)
							})}
						</div>
					)}
				</div>
			</PixelCard>

			{/* Info */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>ℹ️ ALT MANAGEMENT</h3>
					</div>

					<div className='space-y-3 font-mono text-xs text-gray-400'>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Track and manage your Address Lookup Tables from one place</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>View all addresses stored in each ALT and their indices</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Monitor ALT status: active, deactivated, frozen, or closable</span>
						</div>
						<div className='flex items-start gap-2'>
							<span className='text-green-400 mt-0.5'>▸</span>
							<span>Only the authority can extend, deactivate, or close an ALT</span>
						</div>
					</div>
				</div>
			</PixelCard>
		</div>
	)
}
