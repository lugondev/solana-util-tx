'use client'

import {useState, useRef, useCallback} from 'react'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {PixelToast} from '@/components/ui/pixel-toast'
import {useWallet, useConnection} from '@solana/wallet-adapter-react'
import {PublicKey, Transaction} from '@solana/web3.js'
import {Idl, IdlInstruction, ProgramInteractionHelper, IdlValidator} from '@/lib/solana/program-interaction'
import {Upload, FileJson, Code, Zap, CheckCircle, AlertTriangle, Info, ExternalLink, Trash2, ChevronDown, ChevronRight, Search, Copy} from 'lucide-react'

interface FormValues {
	[key: string]: any
}

export function ProgramInteractionComponent() {
	const [idlJson, setIdlJson] = useState('')
	const [parsedIDL, setParsedIDL] = useState<Idl | null>(null)
	const [programIdInput, setProgramIdInput] = useState('')
	const [selectedInstruction, setSelectedInstruction] = useState<IdlInstruction | null>(null)
	const [formValues, setFormValues] = useState<FormValues>({})
	const [isExecuting, setIsExecuting] = useState(false)
	const [txSignature, setTxSignature] = useState<string | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [showToast, setShowToast] = useState<{message: string; type: 'success' | 'error'} | null>(null)
	const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['accounts', 'args']))
	const [helper, setHelper] = useState<ProgramInteractionHelper | null>(null)

	// Read account states
	const [accountAddress, setAccountAddress] = useState('')
	const [isReading, setIsReading] = useState(false)
	const [accountData, setAccountData] = useState<any>(null)

	const fileInputRef = useRef<HTMLInputElement>(null)
	const {publicKey, signTransaction, sendTransaction} = useWallet()
	const {connection} = useConnection()

	// Handle file upload
	const handleFileUpload = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (!file) return

			const reader = new FileReader()
			reader.onload = (e) => {
				const content = e.target?.result as string
				setIdlJson(content)
				try {
					const parsed = JSON.parse(content) as Idl

					// Validate IDL structure
					const validation = IdlValidator.validate(parsed)
					if (!validation.valid) {
						throw new Error(`Invalid IDL:\n${validation.errors.join('\n')}`)
					}

					setParsedIDL(parsed)

					// Create helper instance
					const programAddress = IdlValidator.getProgramAddress(parsed)
					if (programAddress) {
						const programId = new PublicKey(programAddress)
						const newHelper = new ProgramInteractionHelper(connection, programId, parsed)
						setHelper(newHelper)
						setProgramIdInput(programAddress)
					} else {
						setHelper(null)
						setProgramIdInput('')
					}

					setError(null)

					// Show success with warnings if any
					let message = 'IDL loaded successfully!'
					if (validation.warnings && validation.warnings.length > 0) {
						message += '\n\nWarnings:\n' + validation.warnings.join('\n')
					}
					if (!programAddress) {
						message += '\n\n⚠️ Warning: Program ID not found in IDL. Please enter it manually.'
					}
					setShowToast({message, type: 'success'})
				} catch (err) {
					setError(err instanceof Error ? err.message : 'Invalid JSON format')
					setParsedIDL(null)
					setHelper(null)
					setProgramIdInput('')
				}
			}
			reader.readAsText(file)
		},
		[connection],
	)

	// Parse JSON from textarea
	const handleParseJson = useCallback(() => {
		if (!idlJson.trim()) {
			setError('Please enter or upload IDL JSON')
			return
		}

		try {
			const parsed = JSON.parse(idlJson) as Idl

			// Validate IDL structure
			const validation = IdlValidator.validate(parsed)
			if (!validation.valid) {
				throw new Error(`Invalid IDL:\n${validation.errors.join('\n')}`)
			}

			setParsedIDL(parsed)

			// Create helper instance
			const programAddress = IdlValidator.getProgramAddress(parsed)
			if (programAddress) {
				const programId = new PublicKey(programAddress)
				const newHelper = new ProgramInteractionHelper(connection, programId, parsed)
				setHelper(newHelper)
				setProgramIdInput(programAddress)
			} else {
				setHelper(null)
				setProgramIdInput('')
			}

			setError(null)

			// Show success with warnings if any
			let message = 'IDL parsed successfully!'
			if (validation.warnings && validation.warnings.length > 0) {
				message += '\n\nWarnings:\n' + validation.warnings.join('\n')
			}
			if (!programAddress) {
				message += '\n\n⚠️ Warning: Program ID not found in IDL. Please enter it manually.'
			}
			setShowToast({message, type: 'success'})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to parse JSON')
			setParsedIDL(null)
			setHelper(null)
			setProgramIdInput('')
		}
	}, [idlJson, connection])

	// Clear all
	const handleClear = useCallback(() => {
		setIdlJson('')
		setParsedIDL(null)
		setProgramIdInput('')
		setSelectedInstruction(null)
		setFormValues({})
		setTxSignature(null)
		setError(null)
		setHelper(null)
		setAccountAddress('')
		setAccountData(null)
	}, [])

	// Handle program ID input change
	const handleProgramIdChange = useCallback(
		(value: string) => {
			setProgramIdInput(value)

			// Try to create helper if we have both IDL and valid program ID
			if (parsedIDL && value.trim()) {
				try {
					const programId = new PublicKey(value)
					const newHelper = new ProgramInteractionHelper(connection, programId, parsedIDL)
					setHelper(newHelper)
					setError(null)
				} catch (err) {
					setHelper(null)
					setError('Invalid Program ID format')
				}
			} else {
				setHelper(null)
			}
		},
		[parsedIDL, connection],
	)

	// Select instruction
	const handleSelectInstruction = useCallback((instruction: IdlInstruction) => {
		setSelectedInstruction(instruction)
		setFormValues({})
		setTxSignature(null)
		setError(null)
	}, [])

	// Toggle section
	const toggleSection = useCallback((section: string) => {
		setExpandedSections((prev) => {
			const next = new Set(prev)
			if (next.has(section)) {
				next.delete(section)
			} else {
				next.add(section)
			}
			return next
		})
	}, [])

	// Update form value
	const updateFormValue = useCallback((key: string, value: any) => {
		setFormValues((prev) => ({...prev, [key]: value}))
	}, [])

	// Safe type description getter
	const getSafeTypeDescription = useCallback(
		(type: any): string => {
			try {
				if (!helper) return typeof type === 'string' ? type : JSON.stringify(type)
				const desc = helper.getTypeDescription(type)
				return typeof desc === 'string' ? desc : 'unknown'
			} catch {
				return typeof type === 'string' ? type : 'unknown'
			}
		},
		[helper],
	)

	// Render input field based on type
	const renderInputField = useCallback(
		(name: string, type: any, value: any, onChange: (val: any) => void) => {
			const typeDescription = getSafeTypeDescription(type)
			const isOptional = helper?.isOptionalType(type) || false

			// Determine base type for rendering
			let baseType = type
			if (typeof type === 'object' && 'option' in type) {
				baseType = type.option
			}

			const baseTypeStr = typeof baseType === 'string' ? baseType : ''

			// PublicKey type
			if (baseTypeStr === 'publicKey') {
				return <PixelInput value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={isOptional ? 'Enter public key (optional)' : 'Enter public key address'} className='font-mono text-sm' />
			}

			// Numeric types
			if (baseTypeStr.match(/^u(8|16|32|64|128)$/) || baseTypeStr.match(/^i(8|16|32|64|128)$/)) {
				return <PixelInput type='number' value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${baseTypeStr} value${isOptional ? ' (optional)' : ''}`} className='font-mono text-sm' />
			}

			// Boolean type
			if (baseTypeStr === 'bool') {
				return (
					<div className='flex items-center gap-4'>
						<label className='flex items-center gap-2'>
							<input type='radio' checked={value === true} onChange={() => onChange(true)} className='w-4 h-4' />
							<span className='font-mono text-sm text-gray-300'>True</span>
						</label>
						<label className='flex items-center gap-2'>
							<input type='radio' checked={value === false} onChange={() => onChange(false)} className='w-4 h-4' />
							<span className='font-mono text-sm text-gray-300'>False</span>
						</label>
						{isOptional && (
							<label className='flex items-center gap-2'>
								<input type='radio' checked={value === null || value === undefined} onChange={() => onChange(null)} className='w-4 h-4' />
								<span className='font-mono text-sm text-gray-300'>None</span>
							</label>
						)}
					</div>
				)
			}

			// String type
			if (baseTypeStr === 'string') {
				return <PixelInput value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={`Enter string value${isOptional ? ' (optional)' : ''}`} className='font-mono text-sm' />
			}

			// Vector/Array type
			if (typeof type === 'object' && ('vec' in type || 'array' in type)) {
				return (
					<div className='space-y-2'>
						<PixelInput value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={`Enter comma-separated values${isOptional ? ' (optional)' : ''}`} className='font-mono text-sm' />
						<p className='font-mono text-xs text-gray-400'>Type: {typeDescription} - Separate values with commas</p>
					</div>
				)
			}

			// Default to text input
			return (
				<div className='space-y-2'>
					<PixelInput value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={`Enter ${typeDescription}${isOptional ? ' (optional)' : ''}`} className='font-mono text-sm' />
					<p className='font-mono text-xs text-gray-400'>Type: {typeDescription}</p>
				</div>
			)
		},
		[helper, getSafeTypeDescription],
	)

	// Validate form
	const validateForm = useCallback((): boolean => {
		if (!selectedInstruction || !helper) return false

		// Build accounts and args objects
		const accounts: Record<string, string> = {}
		const args: Record<string, any> = {}

		for (const account of selectedInstruction.accounts) {
			accounts[account.name] = formValues[`account_${account.name}`] || ''
		}

		for (const arg of selectedInstruction.args) {
			args[arg.name] = formValues[`arg_${arg.name}`]
		}

		// Use helper to validate
		const validation = helper.validateInputs(selectedInstruction, accounts, args)
		if (!validation.valid) {
			setError(validation.errors.join('\n'))
			return false
		}

		return true
	}, [selectedInstruction, formValues, helper])

	// Read account data
	const handleReadAccount = useCallback(async () => {
		if (!accountAddress.trim()) {
			setError('Please enter an account address to read')
			return
		}

		if (!programIdInput) {
			setError('Program ID is required to read account data')
			return
		}

		setIsReading(true)
		setError(null)
		setAccountData(null)

		try {
			const accountPubkey = new PublicKey(accountAddress)
			const accountInfo = await connection.getAccountInfo(accountPubkey)

			if (!accountInfo) {
				throw new Error('Account not found or has no data')
			}

			// Check if account is owned by the program
			if (accountInfo.owner.toString() !== programIdInput) {
				setShowToast({
					message: `Warning: Account is owned by ${accountInfo.owner.toString()}, not ${programIdInput}`,
					type: 'error',
				})
			}

			setAccountData({
				address: accountAddress,
				owner: accountInfo.owner.toString(),
				lamports: accountInfo.lamports,
				dataLength: accountInfo.data.length,
				executable: accountInfo.executable,
				rentEpoch: accountInfo.rentEpoch,
				rawData: accountInfo.data.toString('hex'),
				base64: accountInfo.data.toString('base64'),
			})

			setShowToast({
				message: 'Account data fetched successfully!',
				type: 'success',
			})
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Failed to read account'
			setError(errorMsg)
			setShowToast({message: errorMsg, type: 'error'})
		} finally {
			setIsReading(false)
		}
	}, [accountAddress, programIdInput, helper, parsedIDL, connection])

	// Copy to clipboard
	const copyToClipboard = useCallback(async (text: string) => {
		try {
			await navigator.clipboard.writeText(text)
			setShowToast({message: 'Copied to clipboard!', type: 'success'})
		} catch {
			setShowToast({message: 'Failed to copy', type: 'error'})
		}
	}, [])

	// Execute instruction
	const handleExecute = useCallback(async () => {
		if (!publicKey) {
			setError('Please connect your wallet first')
			return
		}

		if (!parsedIDL || !selectedInstruction) {
			setError('No instruction selected')
			return
		}

		if (!helper || !programIdInput) {
			setError('Program ID is required. Please enter a valid program address.')
			return
		}

		if (!validateForm()) {
			return
		}

		setIsExecuting(true)
		setError(null)
		setTxSignature(null)

		try {
			// Build accounts and args objects
			const accounts: Record<string, string> = {}
			const args: Record<string, any> = {}

			for (const account of selectedInstruction.accounts) {
				accounts[account.name] = formValues[`account_${account.name}`] || ''
			}

			for (const arg of selectedInstruction.args) {
				args[arg.name] = formValues[`arg_${arg.name}`]
			}

			// Create instruction using helper
			const ix = await helper.createInstruction(selectedInstruction.name, accounts, args)

			// Create transaction
			const transaction = new Transaction().add(ix)

			setShowToast({
				message: 'Transaction created. Please sign and send...',
				type: 'success',
			})

			// Send transaction
			const signature = await sendTransaction(transaction, connection)

			// Wait for confirmation
			await connection.confirmTransaction(signature, 'confirmed')

			setTxSignature(signature)
			setShowToast({
				message: 'Transaction confirmed!',
				type: 'success',
			})
		} catch (err) {
			const errorMsg = err instanceof Error ? err.message : 'Transaction failed'
			setError(errorMsg)
			setShowToast({message: errorMsg, type: 'error'})
		} finally {
			setIsExecuting(false)
		}
	}, [publicKey, parsedIDL, selectedInstruction, helper, formValues, validateForm, sendTransaction, connection])

	return (
		<div className='space-y-6'>
			{/* Upload Section */}
			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-4'>
						<h2 className='font-pixel text-lg text-green-400 mb-2'>📤 IMPORT IDL</h2>
						<p className='font-mono text-sm text-gray-400'>Upload IDL file or paste JSON to get started</p>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						{/* File Upload */}
						<div className='space-y-3'>
							<label className='font-mono text-sm text-gray-300 block'>Upload IDL File:</label>
							<input ref={fileInputRef} type='file' accept='.json' onChange={handleFileUpload} className='hidden' />
							<PixelButton onClick={() => fileInputRef.current?.click()} variant='secondary' className='w-full'>
								<Upload className='h-4 w-4' />
								[SELECT FILE]
							</PixelButton>
						</div>

						{/* Quick Actions */}
						<div className='space-y-3'>
							<label className='font-mono text-sm text-gray-300 block'>Actions:</label>
							<div className='flex gap-2'>
								<PixelButton onClick={handleParseJson} disabled={!idlJson.trim()} className='flex-1'>
									<Code className='h-4 w-4' />
									[PARSE]
								</PixelButton>
								<PixelButton onClick={handleClear} variant='secondary' className='flex-1'>
									<Trash2 className='h-4 w-4' />
									[CLEAR]
								</PixelButton>
							</div>
						</div>
					</div>

					{/* JSON Input */}
					<div className='space-y-2'>
						<label className='font-mono text-sm text-gray-300 block'>Or Paste IDL JSON:</label>
						<textarea value={idlJson} onChange={(e) => setIdlJson(e.target.value)} placeholder='{"version": "0.1.0", "name": "my_program", "instructions": [...]}' className='w-full h-32 p-3 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-mono text-sm text-white resize-none' />
					</div>

					{/* Error Display */}
					{error && (
						<div className='p-4 bg-red-900/20 border-4 border-red-600/30'>
							<div className='flex items-center gap-3'>
								<AlertTriangle className='h-5 w-5 text-red-400 flex-shrink-0' />
								<span className='font-mono text-sm text-red-300'>{error}</span>
							</div>
						</div>
					)}
				</div>
			</PixelCard>

			{/* Program Info */}
			{parsedIDL && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-blue-400/20 pb-4'>
							<div className='flex items-center gap-3'>
								<CheckCircle className='h-6 w-6 text-green-400' />
								<h3 className='font-pixel text-lg text-green-400'>✅ IDL LOADED</h3>
							</div>
						</div>

						<div className='grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4'>
							<div className='p-2 md:p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-mono text-[10px] md:text-xs text-gray-400 mb-1'>Program:</div>
								<div className='font-pixel text-xs md:text-sm text-green-400 word-break-word'>{String(parsedIDL.name)}</div>
							</div>
							<div className='p-2 md:p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-mono text-[10px] md:text-xs text-gray-400 mb-1'>Version:</div>
								<div className='font-pixel text-xs md:text-sm text-blue-400'>{parsedIDL.version}</div>
							</div>
							<div className='p-2 md:p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-mono text-[10px] md:text-xs text-gray-400 mb-1'>Instructions:</div>
								<div className='font-pixel text-xs md:text-sm text-purple-400'>{parsedIDL.instructions.length}</div>
							</div>
							<div className='p-2 md:p-3 bg-gray-800 border-2 border-gray-700 min-w-0'>
								<div className='font-mono text-[10px] md:text-xs text-gray-400 mb-1'>Address:</div>
								<div className='font-mono text-[10px] md:text-xs text-yellow-400 truncate'>{parsedIDL.metadata?.address || 'N/A'}</div>
							</div>
						</div>

						{/* Program ID Input */}
						<div className='space-y-2'>
							<label className='font-mono text-sm text-gray-300 flex items-center gap-2'>
								Program ID:
								{!helper && <span className='text-red-400 text-xs'>* Required to execute</span>}
								{helper && <CheckCircle className='h-4 w-4 text-green-400' />}
							</label>
							<PixelInput value={programIdInput} onChange={(e) => handleProgramIdChange(e.target.value)} placeholder='Enter program ID (e.g., TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA)' className='font-mono text-sm' />
							<p className='font-mono text-xs text-gray-500'>Enter the on-chain program address to interact with</p>
						</div>
					</div>
				</PixelCard>
			)}

			{/* Read Account Data */}
			{parsedIDL && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-cyan-400/20 pb-4'>
							<h2 className='font-pixel text-lg text-cyan-400 mb-2'>🔍 READ ACCOUNT DATA</h2>
							<p className='font-mono text-sm text-gray-400'>Query account data from the program</p>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
							<div className='md:col-span-3 space-y-2'>
								<label className='font-mono text-sm text-gray-300 block'>Account Address:</label>
								<PixelInput value={accountAddress} onChange={(e) => setAccountAddress(e.target.value)} placeholder='Enter account public key to read' className='font-mono text-sm' />
							</div>
							<div className='space-y-2'>
								<label className='font-mono text-sm text-gray-300 block'>&nbsp;</label>
								<PixelButton onClick={handleReadAccount} disabled={!accountAddress.trim() || isReading} className='w-full'>
									{isReading ? (
										<>
											<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
											[READING...]
										</>
									) : (
										<>
											<Search className='h-4 w-4' />
											[READ]
										</>
									)}
								</PixelButton>
							</div>
						</div>

						{/* Account Data Display */}
						{accountData && (
							<div className='space-y-4 p-4 bg-gray-800 border-2 border-cyan-600/30'>
								<div className='border-b-2 border-cyan-400/20 pb-3'>
									<h4 className='font-pixel text-sm text-cyan-400 mb-3'>ACCOUNT INFORMATION</h4>
									<div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
										<div>
											<div className='font-mono text-xs text-gray-400'>Address:</div>
											<div className='flex items-center gap-2'>
												<div className='font-mono text-xs text-white break-all'>{accountData.address}</div>
												<button onClick={() => copyToClipboard(accountData.address)} className='p-1 hover:bg-gray-700 rounded transition-colors'>
													<Copy className='h-3 w-3 text-gray-400' />
												</button>
											</div>
										</div>
										<div>
											<div className='font-mono text-xs text-gray-400'>Owner:</div>
											<div className='flex items-center gap-2'>
												<div className='font-mono text-xs text-white break-all'>{accountData.owner}</div>
												<button onClick={() => copyToClipboard(accountData.owner)} className='p-1 hover:bg-gray-700 rounded transition-colors'>
													<Copy className='h-3 w-3 text-gray-400' />
												</button>
											</div>
										</div>
										<div>
											<div className='font-mono text-xs text-gray-400'>Lamports:</div>
											<div className='font-mono text-xs text-green-400'>{accountData.lamports.toLocaleString()}</div>
										</div>
										<div>
											<div className='font-mono text-xs text-gray-400'>Data Length:</div>
											<div className='font-mono text-xs text-blue-400'>{accountData.dataLength} bytes</div>
										</div>
										<div>
											<div className='font-mono text-xs text-gray-400'>Executable:</div>
											<div className='font-mono text-xs text-purple-400'>{accountData.executable ? 'Yes' : 'No'}</div>
										</div>
										<div>
											<div className='font-mono text-xs text-gray-400'>Rent Epoch:</div>
											<div className='font-mono text-xs text-yellow-400'>{accountData.rentEpoch}</div>
										</div>
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex items-center justify-between'>
										<h4 className='font-pixel text-sm text-cyan-400'>RAW DATA (HEX)</h4>
										<button onClick={() => copyToClipboard(accountData.rawData)} className='px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 font-mono text-xs text-white transition-colors'>
											Copy Hex
										</button>
									</div>
									<div className='p-3 bg-gray-900 border border-gray-700 max-h-40 overflow-auto'>
										<div className='font-mono text-xs text-gray-300 break-all'>{accountData.rawData}</div>
									</div>
								</div>

								<div className='space-y-2'>
									<div className='flex items-center justify-between'>
										<h4 className='font-pixel text-sm text-cyan-400'>RAW DATA (BASE64)</h4>
										<button onClick={() => copyToClipboard(accountData.base64)} className='px-3 py-1 bg-gray-700 hover:bg-gray-600 border border-gray-600 font-mono text-xs text-white transition-colors'>
											Copy Base64
										</button>
									</div>
									<div className='p-3 bg-gray-900 border border-gray-700 max-h-40 overflow-auto'>
										<div className='font-mono text-xs text-gray-300 break-all'>{accountData.base64}</div>
									</div>
								</div>

								<div className='flex gap-2 pt-2'>
									<a href={`https://explorer.solana.com/address/${accountData.address}`} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 px-3 py-2 bg-blue-900/20 border border-blue-600/30 text-blue-400 hover:bg-blue-900/30 font-mono text-xs transition-colors'>
										<ExternalLink className='h-3 w-3' />
										View on Explorer
									</a>
								</div>
							</div>
						)}
					</div>
				</PixelCard>
			)}

			{/* Instructions List */}
			{parsedIDL && (
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-purple-400/20 pb-4'>
							<h3 className='font-pixel text-base md:text-lg text-purple-400 mb-2'>🎯 SELECT INSTRUCTION</h3>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
							{parsedIDL.instructions.map((instruction, index) => (
								<button key={index} onClick={() => handleSelectInstruction(instruction)} className={`p-3 md:p-4 border-2 transition-colors text-left ${selectedInstruction?.name === instruction.name ? 'border-green-400 bg-green-400/10' : 'border-gray-700 bg-gray-800 hover:border-gray-600'}`}>
									<div className='font-pixel text-xs md:text-sm text-white mb-2 word-break-word'>{String(instruction.name)}</div>
									{instruction.docs && instruction.docs.length > 0 && <div className='font-mono text-[10px] md:text-xs text-gray-400 line-clamp-2'>{String(instruction.docs[0])}</div>}
									<div className='flex items-center gap-3 md:gap-4 mt-2 md:mt-3 font-mono text-[10px] md:text-xs'>
										<span className='text-blue-400'>{instruction.accounts.length} accounts</span>
										<span className='text-purple-400'>{instruction.args.length} args</span>
									</div>
								</button>
							))}
						</div>
					</div>
				</PixelCard>
			)}

			{/* Instruction Form */}
			{selectedInstruction && (
				<PixelCard>
					<div className='space-y-6'>
						<div className='border-b-4 border-yellow-400/20 pb-4'>
							<h3 className='font-pixel text-base md:text-lg text-yellow-400 mb-2 word-break-word'>⚡ {String(selectedInstruction.name).toUpperCase()}</h3>
							{selectedInstruction.docs && selectedInstruction.docs.length > 0 && (
								<div className='flex items-start gap-2 mt-2 p-2 md:p-3 bg-blue-900/20 border-2 border-blue-600/30'>
									<Info className='h-3 w-3 md:h-4 md:w-4 text-blue-400 flex-shrink-0 mt-0.5' />
									<p className='font-mono text-xs md:text-sm text-blue-300 word-break-word'>{selectedInstruction.docs.map((d) => String(d)).join(' ')}</p>
								</div>
							)}
						</div>

						{/* Accounts Section */}
						<div className='space-y-3'>
							<button onClick={() => toggleSection('accounts')} className='flex items-center gap-2 w-full'>
								{expandedSections.has('accounts') ? <ChevronDown className='h-4 w-4 text-blue-400' /> : <ChevronRight className='h-4 w-4 text-blue-400' />}
								<h4 className='font-pixel text-sm text-blue-400'>ACCOUNTS ({selectedInstruction.accounts.length})</h4>
							</button>

							{expandedSections.has('accounts') && (
								<div className='space-y-4 ml-6'>
									{selectedInstruction.accounts.map((account, index) => (
										<div key={index} className='space-y-2'>
											<div className='flex items-center gap-2'>
												<label className='font-mono text-sm text-gray-300'>
													{String(account.name)}
													<span className='text-red-400'>*</span>
												</label>
												<div className='flex gap-2'>
													{account.isMut && <span className='px-2 py-0.5 bg-orange-900/20 border border-orange-600/30 text-orange-400 font-mono text-xs'>mut</span>}
													{account.isSigner && <span className='px-2 py-0.5 bg-blue-900/20 border border-blue-600/30 text-blue-400 font-mono text-xs'>signer</span>}
												</div>
											</div>
											{account.docs && account.docs.length > 0 && <p className='font-mono text-xs text-gray-400'>{account.docs.map((d) => String(d)).join(' ')}</p>}
											{renderInputField(String(account.name), 'publicKey', formValues[`account_${account.name}`], (val) => updateFormValue(`account_${account.name}`, val))}
										</div>
									))}
								</div>
							)}
						</div>

						{/* Arguments Section */}
						{selectedInstruction.args.length > 0 && (
							<div className='space-y-3'>
								<button onClick={() => toggleSection('args')} className='flex items-center gap-2 w-full'>
									{expandedSections.has('args') ? <ChevronDown className='h-4 w-4 text-purple-400' /> : <ChevronRight className='h-4 w-4 text-purple-400' />}
									<h4 className='font-pixel text-sm text-purple-400'>ARGUMENTS ({selectedInstruction.args.length})</h4>
								</button>

								{expandedSections.has('args') && (
									<div className='space-y-4 ml-6'>
										{selectedInstruction.args.map((arg, index) => {
											const typeDesc = getSafeTypeDescription(arg.type)
											const isOptional = helper?.isOptionalType(arg.type) || false
											return (
												<div key={index} className='space-y-2'>
													<div className='flex items-center gap-2'>
														<label className='font-mono text-sm text-gray-300'>
															{String(arg.name)}
															{!isOptional && <span className='text-red-400'>*</span>}
														</label>
														<span className='px-2 py-0.5 bg-gray-700 border border-gray-600 text-gray-300 font-mono text-xs'>{typeDesc}</span>
													</div>
													{arg.docs && arg.docs.length > 0 && <p className='font-mono text-xs text-gray-400'>{arg.docs.map((d) => String(d)).join(' ')}</p>}
													{renderInputField(String(arg.name), arg.type, formValues[`arg_${arg.name}`], (val) => updateFormValue(`arg_${arg.name}`, val))}
												</div>
											)
										})}
									</div>
								)}
							</div>
						)}

						{/* Execute Button */}
						<div className='pt-4 border-t-4 border-gray-700'>
							<PixelButton onClick={handleExecute} disabled={!publicKey || isExecuting || !helper} className='w-full'>
								{isExecuting ? (
									<>
										<div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
										[EXECUTING...]
									</>
								) : !publicKey ? (
									'[CONNECT WALLET FIRST]'
								) : !helper ? (
									'[PROGRAM ID REQUIRED]'
								) : (
									<>
										<Zap className='h-4 w-4' />
										[EXECUTE INSTRUCTION]
									</>
								)}
							</PixelButton>
						</div>

						{/* Transaction Result */}
						{txSignature && (
							<div className='p-4 bg-green-900/20 border-4 border-green-600/30'>
								<div className='flex items-start gap-3'>
									<CheckCircle className='h-5 w-5 text-green-400 flex-shrink-0 mt-0.5' />
									<div className='flex-1 space-y-2'>
										<div className='font-pixel text-sm text-green-400'>TRANSACTION CONFIRMED</div>
										<div className='font-mono text-xs text-gray-300 break-all'>{txSignature}</div>
										<a href={`https://explorer.solana.com/tx/${txSignature}`} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-mono text-xs'>
											View on Explorer
											<ExternalLink className='h-3 w-3' />
										</a>
									</div>
								</div>
							</div>
						)}
					</div>
				</PixelCard>
			)}

			{/* Toast */}
			{showToast && <PixelToast message={showToast.message} type={showToast.type} onClose={() => setShowToast(null)} />}
		</div>
	)
}
