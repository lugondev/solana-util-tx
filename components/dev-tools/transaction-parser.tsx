'use client'

import {useState} from 'react'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {TransactionParser, ParsedTransaction} from '@/lib/solana/parsers/transaction-parser'
import {Copy, Download, Eye, AlertCircle, CheckCircle, Zap, Building2, Coins, Waves, Boxes, Rainbow, Search, Settings} from 'lucide-react'
import {PixelToast} from '@/components/ui/pixel-toast'
import {transactionExamples, validateTransactionFormat} from '@/lib/solana/parsers/transaction-parser-test'

interface TransactionParserComponentProps {
	className?: string
}

export function TransactionParserComponent({className}: TransactionParserComponentProps) {
	const [input, setInput] = useState('')
	const [parsedTx, setParsedTx] = useState<ParsedTransaction | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [showToast, setShowToast] = useState(false)

	const handleParse = async () => {
		if (!input.trim()) {
			setError('Please enter a transaction to parse')
			return
		}

		// Validate input format
		const validation = validateTransactionFormat(input)
		if (!validation.valid) {
			setError(validation.error || 'Invalid transaction format')
			return
		}

		setLoading(true)
		setError(null)
		setParsedTx(null)

		try {
			const parsed = TransactionParser.parseTransaction(input.trim())
			setParsedTx(parsed)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to parse transaction')
		} finally {
			setLoading(false)
		}
	}

	const handleLoadExample = (exampleData: string) => {
		setInput(exampleData)
		setError(null)
		setParsedTx(null)
	}

	const handleCopy = async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setShowToast(true)
			setTimeout(() => setShowToast(false), 2000)
		} catch (err) {
			console.error('Failed to copy:', err)
		}
	}

	const handleDownload = () => {
		if (!parsedTx) return

		const formattedText = TransactionParser.formatParsedTransaction(parsedTx)
		const blob = new Blob([formattedText], {type: 'text/plain'})
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `transaction-${parsedTx.feePayer.slice(0, 8)}.txt`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	const formatAmount = (amount: string, decimals = 9) => {
		try {
			const num = BigInt(amount)
			const divisor = BigInt(10 ** decimals)
			const quotient = num / divisor
			const remainder = num % divisor

			if (remainder === BigInt(0)) {
				return quotient.toString()
			}

			const remainderStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '')
			return `${quotient}.${remainderStr}`
		} catch {
			return amount
		}
	}

	const getInstructionIcon = (programName: string) => {
		switch (programName) {
			case 'System Program':
				return Building2
			case 'SPL Token Program':
			case 'SPL Token-2022 Program':
				return Coins
			case 'Compute Budget Program':
				return Zap
			case 'Jupiter V6':
			case 'Jupiter V4':
				return Zap
			case 'Orca Whirlpool':
				return Waves
			case 'Raydium AMM V4':
			case 'Raydium CLMM':
				return Rainbow
			default:
				return Boxes
		}
	}

	const getInstructionColor = (programName: string) => {
		switch (programName) {
			case 'System Program':
				return 'text-blue-400'
			case 'SPL Token Program':
			case 'SPL Token-2022 Program':
				return 'text-green-400'
			case 'Compute Budget Program':
				return 'text-yellow-400'
			case 'Jupiter V6':
			case 'Jupiter V4':
				return 'text-purple-400'
			case 'Orca Whirlpool':
				return 'text-cyan-400'
			case 'Raydium AMM V4':
			case 'Raydium CLMM':
				return 'text-pink-400'
			default:
				return 'text-gray-400'
		}
	}

	return (
		<div className={`space-y-6 ${className}`}>
			{/* Input Section */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-4'>
						<div className='flex items-center gap-2 mb-2'>
							<Search className='h-5 w-5 text-green-400' />
							<h2 className='font-pixel text-lg text-green-400'>TRANSACTION PARSER</h2>
						</div>
						<p className='font-mono text-sm text-gray-400'>Decode raw transactions into human-readable format</p>
					</div>

					<div className='space-y-4'>
						<div>
							<label className='font-mono text-sm text-gray-300 block mb-2'>Transaction (Base58 encoded):</label>
							<textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder='Enter base58 encoded transaction or signature...' className='w-full h-32 bg-gray-800 border-4 border-gray-600 font-mono text-sm text-white p-4 resize-none focus:border-green-400 focus:outline-none' disabled={loading} />
						</div>

						{error && (
							<div className='p-4 bg-red-900/20 border-4 border-red-600/30'>
								<div className='flex items-center gap-3'>
									<AlertCircle className='h-5 w-5 text-red-400 flex-shrink-0' />
									<span className='font-mono text-sm text-red-300'>{error}</span>
								</div>
							</div>
						)}

						<div className='flex flex-wrap gap-3'>
							<PixelButton onClick={handleParse} disabled={loading || !input.trim()} className='flex-1 min-w-0'>
								{loading ? (
									<>
										<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
										[PARSING...]
									</>
								) : (
									<>
										<Eye className='h-4 w-4' />
										[PARSE TRANSACTION]
									</>
								)}
							</PixelButton>

							{parsedTx && (
								<>
									<PixelButton variant='secondary' onClick={() => handleCopy(TransactionParser.formatParsedTransaction(parsedTx))}>
										<Copy className='h-4 w-4' />
										[COPY]
									</PixelButton>
									<PixelButton variant='secondary' onClick={handleDownload}>
										<Download className='h-4 w-4' />
										[DOWNLOAD]
									</PixelButton>
								</>
							)}
						</div>

						{/* Sample Transactions */}
						<div className='pt-4 border-t-4 border-gray-700'>
							<div className='flex items-center gap-2 mb-3'>
								<Zap className='h-4 w-4 text-yellow-400' />
								<span className='font-mono text-sm text-yellow-400'>Sample Transactions:</span>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
								{Object.entries(transactionExamples).map(([key, example]) => (
									<button key={key} onClick={() => handleLoadExample(example.data)} disabled={loading} className='p-3 bg-gray-800 border-2 border-gray-700 hover:border-blue-500 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed'>
										<div className='font-mono text-xs text-blue-400 mb-1'>{example.title}</div>
										<div className='font-mono text-xs text-gray-400 mb-2'>{example.description}</div>
										<div className='flex flex-wrap gap-1'>
											{example.features.map((feature, i) => (
												<span key={i} className='px-1.5 py-0.5 bg-blue-600/20 text-blue-300 font-mono text-xs'>
													{feature}
												</span>
											))}
										</div>
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			</PixelCard>

			{/* Results */}
			{parsedTx && (
				<div className='space-y-6'>
					{/* Transaction Overview */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-blue-400/20 pb-4'>
								<h3 className='font-pixel text-lg text-blue-400 mb-2'>📋 TRANSACTION OVERVIEW</h3>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
								<div className='p-4 bg-gray-800 border-4 border-gray-700'>
									<div className='font-mono text-xs text-gray-400 mb-1'>Version</div>
									<div className='font-pixel text-sm text-white'>{parsedTx.version.toUpperCase()}</div>
								</div>

								<div className='p-4 bg-gray-800 border-4 border-gray-700'>
									<div className='font-mono text-xs text-gray-400 mb-1'>Instructions</div>
									<div className='font-pixel text-sm text-green-400'>{parsedTx.instructions.length}</div>
								</div>

								<div className='p-4 bg-gray-800 border-4 border-gray-700'>
									<div className='font-mono text-xs text-gray-400 mb-1'>Accounts</div>
									<div className='font-pixel text-sm text-purple-400'>{parsedTx.accounts.length}</div>
								</div>

								{parsedTx.priorityFee && (
									<div className='p-4 bg-gray-800 border-4 border-gray-700'>
										<div className='font-mono text-xs text-gray-400 mb-1'>Priority Fee</div>
										<div className='font-pixel text-sm text-yellow-400'>{parsedTx.priorityFee.toFixed(6)} SOL</div>
									</div>
								)}
							</div>

							<div className='space-y-3'>
								<div>
									<div className='font-mono text-xs text-gray-400 mb-1'>Fee Payer:</div>
									<div className='font-mono text-sm text-white break-all'>{parsedTx.feePayer}</div>
								</div>

								<div>
									<div className='font-mono text-xs text-gray-400 mb-1'>Recent Blockhash:</div>
									<div className='font-mono text-sm text-white break-all'>{parsedTx.recentBlockhash}</div>
								</div>
							</div>

							{parsedTx.computeUnitLimit && (
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<div className='font-mono text-xs text-gray-400 mb-1'>Compute Unit Limit:</div>
										<div className='font-mono text-sm text-yellow-400'>{parsedTx.computeUnitLimit.toLocaleString()}</div>
									</div>
									{parsedTx.computeUnitPrice && (
										<div>
											<div className='font-mono text-xs text-gray-400 mb-1'>Compute Unit Price:</div>
											<div className='font-mono text-sm text-yellow-400'>{parsedTx.computeUnitPrice} μLamports</div>
										</div>
									)}
								</div>
							)}
						</div>
					</PixelCard>

					{/* Instructions */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-4'>
								<div className='flex items-center gap-2'>
									<Settings className='h-5 w-5 text-green-400' />
									<h3 className='font-pixel text-lg text-green-400'>INSTRUCTIONS ({parsedTx.instructions.length})</h3>
								</div>
							</div>

							<div className='space-y-4'>
								{parsedTx.instructions.map((instruction, index) => (
									<div key={index} className='p-4 bg-gray-800 border-4 border-gray-700'>
										<div className='space-y-3'>
											{/* Instruction Header */}
											<div className='flex items-center gap-3'>
												<div className='flex items-center gap-2'>
													{(() => {
														const IconComponent = getInstructionIcon(instruction.programName)
														return <IconComponent className='h-6 w-6' />
													})()}
													<div>
														<div className='font-pixel text-sm text-white'>
															{index + 1}. {instruction.instructionType}
														</div>
														<div className={`font-mono text-xs ${getInstructionColor(instruction.programName)}`}>{instruction.programName}</div>
													</div>
												</div>
											</div>

											{/* Program ID */}
											<div>
												<div className='font-mono text-xs text-gray-400 mb-1'>Program ID:</div>
												<div className='font-mono text-xs text-gray-300 break-all'>{instruction.programId}</div>
											</div>

											{/* Instruction Data */}
											{Object.keys(instruction.data).length > 0 && (
												<div>
													<div className='font-mono text-xs text-gray-400 mb-2'>Data:</div>
													<div className='space-y-2'>
														{Object.entries(instruction.data).map(([key, value]) => (
															<div key={key} className='flex justify-between items-start gap-4'>
																<span className='font-mono text-xs text-blue-400 min-w-0 flex-shrink-0'>{key}:</span>
																<span className='font-mono text-xs text-white break-all text-right'>{key.includes('amount') && typeof value === 'string' && value.match(/^\d+$/) ? formatAmount(value) : String(value)}</span>
															</div>
														))}
													</div>
												</div>
											)}

											{/* Accounts */}
											{instruction.accounts.length > 0 && (
												<div>
													<div className='font-mono text-xs text-gray-400 mb-2'>Accounts ({instruction.accounts.length}):</div>
													<div className='space-y-1'>
														{instruction.accounts.map((account, i) => (
															<div key={i} className='flex items-start gap-2'>
																<span className='font-mono text-xs text-gray-500 min-w-0 flex-shrink-0'>{i}:</span>
																<div className='min-w-0 flex-1'>
																	<div className='font-mono text-xs text-white break-all'>{account.pubkey}</div>
																	{account.name && <div className='font-mono text-xs text-green-400'>{account.name}</div>}
																	<div className='flex gap-2 mt-1'>
																		{account.isSigner && <span className='px-2 py-0.5 bg-blue-600/20 border border-blue-600/30 font-mono text-xs text-blue-300'>signer</span>}
																		{account.isWritable && <span className='px-2 py-0.5 bg-yellow-600/20 border border-yellow-600/30 font-mono text-xs text-yellow-300'>writable</span>}
																	</div>
																</div>
															</div>
														))}
													</div>
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					</PixelCard>

					{/* Address Lookup Tables */}
					{parsedTx.addressLookupTables && parsedTx.addressLookupTables.length > 0 && (
						<PixelCard>
							<div className='space-y-4'>
								<div className='border-b-4 border-purple-400/20 pb-4'>
									<h3 className='font-pixel text-lg text-purple-400 mb-2'>📋 ADDRESS LOOKUP TABLES</h3>
								</div>

								<div className='space-y-4'>
									{parsedTx.addressLookupTables.map((alt, index) => (
										<div key={index} className='p-4 bg-gray-800 border-4 border-gray-700'>
											<div className='space-y-3'>
												<div className='font-pixel text-sm text-white'>ALT {index + 1}</div>

												<div>
													<div className='font-mono text-xs text-gray-400 mb-1'>Account Key:</div>
													<div className='font-mono text-xs text-white break-all'>{alt.accountKey}</div>
												</div>

												<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
													<div>
														<div className='font-mono text-xs text-gray-400 mb-1'>Writable Indexes ({alt.writableIndexes.length}):</div>
														<div className='font-mono text-xs text-yellow-400'>[{alt.writableIndexes.join(', ')}]</div>
													</div>

													<div>
														<div className='font-mono text-xs text-gray-400 mb-1'>Readonly Indexes ({alt.readonlyIndexes.length}):</div>
														<div className='font-mono text-xs text-blue-400'>[{alt.readonlyIndexes.join(', ')}]</div>
													</div>
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</PixelCard>
					)}
				</div>
			)}

			{/* Toast */}
			{showToast && <PixelToast message='Copied to clipboard!' type='success' onClose={() => setShowToast(false)} />}
		</div>
	)
}
