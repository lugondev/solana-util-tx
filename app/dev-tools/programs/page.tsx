'use client'

import {useState, useEffect} from 'react'
import {useConnection} from '@solana/wallet-adapter-react'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {ProgramService, ProgramInfo, IdlMetadata} from '@/lib/solana/programs/program-service'
import {IDLManager} from '@/components/dev-tools/idl-manager'
import {Search, Upload, Download, Code, Terminal, FileText, ExternalLink, Info, AlertTriangle, CheckCircle, AlertCircle, Zap, Database, Shield} from 'lucide-react'

export default function ProgramsPage() {
	const {connection} = useConnection()
	const [programId, setProgramId] = useState('')
	const [programInfo, setProgramInfo] = useState<ProgramInfo | null>(null)
	const [idlInfo, setIdlInfo] = useState<IdlMetadata | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [validationResult, setValidationResult] = useState<any>(null)
	const [programService, setProgramService] = useState<ProgramService | null>(null)

	useEffect(() => {
		if (connection) {
			setProgramService(new ProgramService(connection))
		}
	}, [connection])

	const searchProgram = async () => {
		if (!programId.trim()) {
			setError('Please enter Program ID')
			return
		}

		if (!ProgramService.isValidPublicKey(programId.trim())) {
			setError('Invalid Program ID')
			return
		}

		if (!programService) {
			setError('Not connected to Solana network')
			return
		}

		setLoading(true)
		setError(null)
		setProgramInfo(null)
		setIdlInfo(null)
		setValidationResult(null)

		try {
			// Validate program first
			const validation = await programService.validateProgram(programId.trim())
			setValidationResult(validation)

			if (validation.exists) {
				// Get program info
				const info = await programService.getProgramInfo(programId.trim())
				setProgramInfo(info)

				// Try to discover IDL
				try {
					const idl = await programService.tryDiscoverIdl(programId.trim())
					setIdlInfo(idl)
				} catch (idlError) {
					console.warn('Could not discover IDL:', idlError)
				}
			}
		} catch (err) {
			console.error('Program search error:', err)
			setError(err instanceof Error ? err.message : 'Error searching for program')
		} finally {
			setLoading(false)
		}
	}

	const formatLamports = (lamports: number) => {
		return (lamports / 1e9).toFixed(6) + ' SOL'
	}

	const getStatusColor = (isValid: boolean, exists: boolean) => {
		if (!exists) return 'text-red-400'
		if (isValid) return 'text-green-400'
		return 'text-yellow-400'
	}

	const getStatusText = (isValid: boolean, exists: boolean) => {
		if (!exists) return 'NOT FOUND'
		if (isValid) return 'VALID PROGRAM'
		return 'ISSUES DETECTED'
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					PROGRAM TOOLS
				</h1>
				<p className='font-mono text-sm text-gray-400'>Analyze and interact with Solana programs</p>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
				{/* Left Column: Program Search */}
				<div className='xl:col-span-2 space-y-6'>
					{/* Program Search */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🔍 PROGRAM INSPECTOR</h3>
							</div>

							<div className='flex gap-3'>
								<div className='flex-1'>
									<PixelInput label='PROGRAM ID' value={programId} onChange={(e) => setProgramId(e.target.value)} placeholder='Enter program address (e.g., 11111111111111111111111111111112)' />
								</div>
								<div className='flex items-end'>
									<PixelButton onClick={searchProgram} disabled={loading || !programId.trim()}>
										{loading ? (
											<>
												<div className='animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full' />
												[SEARCHING...]
											</>
										) : (
											<>
												<Search className='h-4 w-4' />
												[ANALYZE]
											</>
										)}
									</PixelButton>
								</div>
							</div>

							{/* Popular Programs */}
							<div className='p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-gray-400 mb-2'>Popular programs:</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
									{[
										{name: 'Token Program', id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'},
										{name: 'System Program', id: '11111111111111111111111111111112'},
										{name: 'SPL Associated Token', id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'},
										{name: 'Raydium AMM', id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'},
									].map((program) => (
										<button key={program.name} className='p-2 text-left font-mono text-xs border border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400 transition-colors' onClick={() => setProgramId(program.id)}>
											<div className='font-pixel text-xs text-white'>{program.name}</div>
											<div className='text-xs break-all'>{program.id.slice(0, 20)}...</div>
										</button>
									))}
								</div>
							</div>
						</div>
					</PixelCard>

					{/* Program Search Results */}
					{(programInfo || validationResult) && (
						<PixelCard>
							<div className='space-y-4'>
								<div className='border-b-4 border-green-400/20 pb-3'>
									<h3 className='font-pixel text-sm text-green-400'>📊 PROGRAM ANALYSIS RESULTS</h3>
								</div>

								{validationResult && (
									<div className='space-y-3'>
										<div className='flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700'>
											<div className='flex items-center gap-2'>
												{validationResult.isValid && validationResult.exists ? <CheckCircle className='h-4 w-4 text-green-400' /> : validationResult.exists ? <AlertCircle className='h-4 w-4 text-yellow-400' /> : <AlertTriangle className='h-4 w-4 text-red-400' />}
												<span className='font-pixel text-xs text-gray-400'>STATUS</span>
											</div>
											<span className={`font-pixel text-xs ${getStatusColor(validationResult.isValid, validationResult.exists)}`}>{getStatusText(validationResult.isValid, validationResult.exists)}</span>
										</div>

										{validationResult.issues.length > 0 && (
											<div className='p-3 bg-yellow-900/20 border-2 border-yellow-600/30'>
												<div className='font-pixel text-xs text-yellow-400 mb-2'>VALIDATION ISSUES:</div>
												<ul className='font-mono text-xs text-yellow-300 space-y-1'>
													{validationResult.issues.map((issue: string, idx: number) => (
														<li key={idx}>• {issue}</li>
													))}
												</ul>
											</div>
										)}
									</div>
								)}

								{programInfo && (
									<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
										<div className='space-y-3'>
											<div className='p-3 bg-gray-800 border-2 border-gray-700'>
												<div className='font-pixel text-xs text-green-400 mb-1'>PROGRAM ID:</div>
												<div className='font-mono text-xs text-gray-300 break-all'>{programInfo.programId}</div>
											</div>

											<div className='p-3 bg-gray-800 border-2 border-gray-700'>
												<div className='font-pixel text-xs text-blue-400 mb-1'>OWNER:</div>
												<div className='font-mono text-xs text-gray-300 break-all'>{programInfo.owner}</div>
											</div>

											<div className='p-3 bg-gray-800 border-2 border-gray-700'>
												<div className='font-pixel text-xs text-yellow-400 mb-1'>TYPE:</div>
												<div className='flex items-center gap-2'>
													<span className={`font-pixel text-xs ${programInfo.type === 'native' ? 'text-green-400' : programInfo.type === 'anchor' ? 'text-purple-400' : 'text-blue-400'}`}>{programInfo.type.toUpperCase()}</span>
													{programInfo.isUpgradeable && <span className='font-pixel text-xs text-orange-400'>[UPGRADEABLE]</span>}
												</div>
											</div>
										</div>

										<div className='space-y-3'>
											<div className='p-3 bg-gray-800 border-2 border-gray-700'>
												<div className='font-pixel text-xs text-green-400 mb-1'>BALANCE:</div>
												<div className='font-mono text-xs text-gray-300'>{formatLamports(programInfo.lamports)}</div>
											</div>

											<div className='p-3 bg-gray-800 border-2 border-gray-700'>
												<div className='font-pixel text-xs text-blue-400 mb-1'>DATA SIZE:</div>
												<div className='font-mono text-xs text-gray-300'>{programInfo.dataLength.toLocaleString()} bytes</div>
											</div>

											<div className='p-3 bg-gray-800 border-2 border-gray-700'>
												<div className='font-pixel text-xs text-purple-400 mb-1'>EXECUTABLE:</div>
												<div className={`font-pixel text-xs ${programInfo.executable ? 'text-green-400' : 'text-red-400'}`}>{programInfo.executable ? 'YES' : 'NO'}</div>
											</div>
										</div>
									</div>
								)}

								{programInfo?.programData && (
									<div className='p-4 bg-blue-900/20 border-2 border-blue-600/30'>
										<div className='font-pixel text-xs text-blue-400 mb-2'>UPGRADEABLE PROGRAM DATA:</div>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
											<div>
												<span className='font-mono text-xs text-gray-400'>Slot: </span>
												<span className='font-mono text-xs text-blue-300'>{programInfo.programData.slot}</span>
											</div>
											{programInfo.programData.authority && (
												<div>
													<span className='font-mono text-xs text-gray-400'>Authority: </span>
													<span className='font-mono text-xs text-blue-300 break-all'>
														{programInfo.programData.authority.slice(0, 8)}...{programInfo.programData.authority.slice(-8)}
													</span>
												</div>
											)}
										</div>
									</div>
								)}

								{idlInfo && (
									<div className='p-4 bg-purple-900/20 border-2 border-purple-600/30'>
										<div className='font-pixel text-xs text-purple-400 mb-2'>IDL DISCOVERED:</div>
										<div className='space-y-2'>
											<div>
												<span className='font-mono text-xs text-gray-400'>Name: </span>
												<span className='font-mono text-xs text-purple-300'>{idlInfo.name}</span>
											</div>
											<div>
												<span className='font-mono text-xs text-gray-400'>Version: </span>
												<span className='font-mono text-xs text-purple-300'>{idlInfo.version}</span>
											</div>
											<div>
												<span className='font-mono text-xs text-gray-400'>Instructions: </span>
												<span className='font-mono text-xs text-purple-300'>{idlInfo.instructions.length}</span>
											</div>
											{idlInfo.description && (
												<div>
													<span className='font-mono text-xs text-gray-400'>Description: </span>
													<span className='font-mono text-xs text-purple-300'>{idlInfo.description}</span>
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</PixelCard>
					)}

					{/* No Program Data */}
					{!programInfo && !validationResult && !loading && (
						<PixelCard>
							<div className='space-y-4'>
								<div className='border-b-4 border-green-400/20 pb-3'>
									<h3 className='font-pixel text-sm text-green-400'>📊 PROGRAM DETAILS</h3>
								</div>

								<div className='text-center py-12'>
									<Code className='h-16 w-16 text-gray-600 mx-auto mb-4' />
									<h3 className='font-pixel text-lg text-gray-400 mb-2'>NO PROGRAM LOADED</h3>
									<p className='font-mono text-sm text-gray-500 mb-4'>Enter a program ID above to analyze</p>
									<div className='p-4 bg-blue-900/20 border-2 border-blue-600/30 max-w-md mx-auto'>
										<div className='flex items-start gap-2'>
											<Info className='h-4 w-4 text-blue-400 mt-0.5' />
											<div className='font-mono text-xs text-blue-400'>
												Now using real Solana RPC:
												<br />
												• Program account parsing ✓<br />
												• Validation checks ✓<br />
												• IDL discovery ✓<br />• Live program analysis ✓
											</div>
										</div>
									</div>
								</div>
							</div>
						</PixelCard>
					)}

					{error && (
						<PixelCard>
							<div className='p-4 bg-red-900/20 border-2 border-red-600/30'>
								<div className='flex items-start gap-2'>
									<AlertTriangle className='h-4 w-4 text-red-400 mt-0.5' />
									<div className='font-mono text-xs text-red-400'>Error: {error}</div>
								</div>
							</div>
						</PixelCard>
					)}

					{/* IDL Manager */}
					<IDLManager programId={programId} programService={programService} />
				</div>

				{/* Right Column: Tools & Resources */}
				<div className='space-y-6'>
					{/* Program Development */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🛠️ DEVELOPMENT TOOLS</h3>
							</div>

							<div className='space-y-3'>
								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-pixel text-xs text-green-400 mb-1'>ANCHOR:</div>
									<p className='font-mono text-xs text-gray-400'>Framework for Solana program development</p>
								</div>

								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-pixel text-xs text-blue-400 mb-1'>NATIVE:</div>
									<p className='font-mono text-xs text-gray-400'>Raw Solana program development in Rust</p>
								</div>

								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-pixel text-xs text-purple-400 mb-1'>SEAHORSE:</div>
									<p className='font-mono text-xs text-gray-400'>Python-based Solana program framework</p>
								</div>
							</div>
						</div>
					</PixelCard>

					{/* Program Types */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>📋 PROGRAM TYPES</h3>
							</div>

							<div className='space-y-3'>
								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center justify-between mb-2'>
										<span className='font-pixel text-sm text-green-400'>🪙 TOKEN</span>
										<CheckCircle className='h-4 w-4 text-green-400' />
									</div>
									<p className='font-mono text-xs text-gray-400'>SPL Token standard implementation</p>
								</div>

								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center justify-between mb-2'>
										<span className='font-pixel text-sm text-blue-400'>🔄 AMM</span>
									</div>
									<p className='font-mono text-xs text-gray-400'>Automated Market Maker protocols</p>
								</div>

								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center justify-between mb-2'>
										<span className='font-pixel text-sm text-purple-400'>🎮 NFT</span>
									</div>
									<p className='font-mono text-xs text-gray-400'>Non-fungible token collections</p>
								</div>
							</div>
						</div>
					</PixelCard>

					{/* External Resources */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🔗 EXTERNAL TOOLS</h3>
							</div>

							<div className='space-y-2'>
								<PixelButton onClick={() => window.open('https://solscan.io', '_blank')} variant='secondary' className='w-full'>
									<ExternalLink className='h-4 w-4' />
									[SOLSCAN]
								</PixelButton>
								<PixelButton onClick={() => window.open('https://explorer.solana.com', '_blank')} variant='secondary' className='w-full'>
									<ExternalLink className='h-4 w-4' />
									[SOLANA EXPLORER]
								</PixelButton>
								<PixelButton onClick={() => window.open('https://anchor.so', '_blank')} variant='secondary' className='w-full'>
									<ExternalLink className='h-4 w-4' />
									[ANCHOR DOCS]
								</PixelButton>
							</div>
						</div>
					</PixelCard>

					{/* Implementation Status */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>✅ IMPLEMENTATION STATUS</h3>
							</div>

							<div className='space-y-3'>
								<div className='p-3 bg-green-900/20 border-2 border-green-600/30'>
									<div className='font-pixel text-xs text-green-400 mb-1'>COMPLETED:</div>
									<ul className='font-mono text-xs text-gray-400 space-y-1'>
										<li>• ✅ Solana RPC integration</li>
										<li>• ✅ Program account parsing</li>
										<li>• ✅ Program validation</li>
										<li>• ✅ Program info analysis</li>
										<li>• ✅ IDL discovery framework</li>
										<li>• ✅ Popular programs database</li>
										<li>• ✅ Real-time program analysis</li>
										<li>• ✅ IDL file upload & validation</li>
										<li>• ✅ IDL export & download</li>
										<li>• ✅ TypeScript type generation</li>
										<li>• ✅ Instruction list viewer</li>
									</ul>
								</div>

								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-pixel text-xs text-yellow-400 mb-1'>COMING SOON:</div>
									<ul className='font-mono text-xs text-gray-400 space-y-1'>
										<li>• Instruction decoder & simulator</li>
										<li>• Program deployment tools</li>
										<li>• Advanced IDL comparison</li>
										<li>• Account data parser</li>
									</ul>
								</div>
							</div>
						</div>
					</PixelCard>
				</div>
			</div>
		</div>
	)
}
