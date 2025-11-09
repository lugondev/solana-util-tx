'use client'

import {useState, useRef, useCallback} from 'react'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {ProgramService} from '@/lib/solana/programs/program-service'
import {Upload, Download, FileText, CheckCircle, AlertTriangle, X, Copy, FileJson} from 'lucide-react'

interface IDLManagerProps {
	programId: string
	programService: ProgramService | null
}

interface UploadedIDL {
	name: string
	version: string
	programId: string
	instructions: number
	accounts: number
	types: number
	errors: number
	raw: any
}

export function IDLManager({programId, programService}: IDLManagerProps) {
	const [uploadedIdl, setUploadedIdl] = useState<UploadedIDL | null>(null)
	const [uploadError, setUploadError] = useState<string | null>(null)
	const [validationErrors, setValidationErrors] = useState<string[]>([])
	const [isValidating, setIsValidating] = useState(false)
	const [copied, setCopied] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	/**
	 * Validate IDL structure
	 */
	const validateIDL = useCallback((idl: any): string[] => {
		const errors: string[] = []

		if (!idl) {
			errors.push('IDL is empty or null')
			return errors
		}

		// Check required fields
		if (!idl.name || typeof idl.name !== 'string') {
			errors.push('Missing or invalid "name" field')
		}

		if (!idl.version || typeof idl.version !== 'string') {
			errors.push('Missing or invalid "version" field')
		}

		if (!Array.isArray(idl.instructions)) {
			errors.push('Missing or invalid "instructions" array')
		} else {
			// Validate each instruction
			idl.instructions.forEach((instruction: any, idx: number) => {
				if (!instruction.name) {
					errors.push(`Instruction ${idx}: missing "name" field`)
				}
				if (!Array.isArray(instruction.accounts)) {
					errors.push(`Instruction "${instruction.name}": missing or invalid "accounts" array`)
				}
				if (!Array.isArray(instruction.args)) {
					errors.push(`Instruction "${instruction.name}": missing or invalid "args" array`)
				}
			})
		}

		// Check optional fields structure
		if (idl.accounts && !Array.isArray(idl.accounts)) {
			errors.push('Invalid "accounts" field (must be array)')
		}

		if (idl.types && !Array.isArray(idl.types)) {
			errors.push('Invalid "types" field (must be array)')
		}

		if (idl.errors && !Array.isArray(idl.errors)) {
			errors.push('Invalid "errors" field (must be array)')
		}

		if (idl.events && !Array.isArray(idl.events)) {
			errors.push('Invalid "events" field (must be array)')
		}

		return errors
	}, [])

	/**
	 * Handle file upload
	 */
	const handleFileUpload = useCallback(
		async (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (!file) return

			setUploadError(null)
			setValidationErrors([])
			setIsValidating(true)

			try {
				// Check file type
				if (!file.name.endsWith('.json')) {
					throw new Error('Please upload a JSON file')
				}

				// Check file size (max 10MB)
				if (file.size > 10 * 1024 * 1024) {
					throw new Error('File size exceeds 10MB limit')
				}

				// Read file content
				const content = await file.text()
				let idl: any

				try {
					idl = JSON.parse(content)
				} catch (parseError) {
					throw new Error('Invalid JSON format')
				}

				// Validate IDL structure
				const errors = validateIDL(idl)
				if (errors.length > 0) {
					setValidationErrors(errors)
					throw new Error(`IDL validation failed with ${errors.length} error(s)`)
				}

				// Extract metadata
				const uploadedData: UploadedIDL = {
					name: idl.name,
					version: idl.version,
					programId: idl.metadata?.address || 'unknown',
					instructions: idl.instructions?.length || 0,
					accounts: idl.accounts?.length || 0,
					types: idl.types?.length || 0,
					errors: idl.errors?.length || 0,
					raw: idl,
				}

				setUploadedIdl(uploadedData)
			} catch (error) {
				console.error('File upload error:', error)
				setUploadError(error instanceof Error ? error.message : 'Failed to upload IDL')
			} finally {
				setIsValidating(false)
				// Reset file input
				if (fileInputRef.current) {
					fileInputRef.current.value = ''
				}
			}
		},
		[validateIDL],
	)

	/**
	 * Download IDL as JSON file
	 */
	const handleDownloadIDL = useCallback(() => {
		if (!uploadedIdl) return

		try {
			const jsonString = JSON.stringify(uploadedIdl.raw, null, 2)
			const blob = new Blob([jsonString], {type: 'application/json'})
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `${uploadedIdl.name}-${uploadedIdl.version}.json`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Download error:', error)
			setUploadError('Failed to download IDL')
		}
	}, [uploadedIdl])

	/**
	 * Copy IDL to clipboard
	 */
	const handleCopyIDL = useCallback(async () => {
		if (!uploadedIdl) return

		try {
			const jsonString = JSON.stringify(uploadedIdl.raw, null, 2)
			await navigator.clipboard.writeText(jsonString)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch (error) {
			console.error('Copy error:', error)
			setUploadError('Failed to copy IDL')
		}
	}, [uploadedIdl])

	/**
	 * Generate TypeScript types from IDL
	 */
	const handleGenerateTypes = useCallback(() => {
		if (!uploadedIdl) return

		try {
			let tsCode = `// Generated TypeScript types for ${uploadedIdl.name} v${uploadedIdl.version}\n\n`

			// Generate instruction types
			if (uploadedIdl.raw.instructions && uploadedIdl.raw.instructions.length > 0) {
				tsCode += '// Instructions\n'
				uploadedIdl.raw.instructions.forEach((instruction: any) => {
					const argsType = instruction.args.map((arg: any) => `  ${arg.name}: ${convertIDLTypeToTS(arg.type)}`).join('\n')

					tsCode += `export interface ${capitalize(instruction.name)}Args {\n${argsType || '  // No arguments'}\n}\n\n`
				})
			}

			// Generate account types
			if (uploadedIdl.raw.accounts && uploadedIdl.raw.accounts.length > 0) {
				tsCode += '\n// Accounts\n'
				uploadedIdl.raw.accounts.forEach((account: any) => {
					if (account.type?.fields) {
						const fields = account.type.fields.map((field: any) => `  ${field.name}: ${convertIDLTypeToTS(field.type)}`).join('\n')

						tsCode += `export interface ${capitalize(account.name)} {\n${fields}\n}\n\n`
					}
				})
			}

			// Generate custom types
			if (uploadedIdl.raw.types && uploadedIdl.raw.types.length > 0) {
				tsCode += '\n// Custom Types\n'
				uploadedIdl.raw.types.forEach((type: any) => {
					if (type.type?.fields) {
						const fields = type.type.fields.map((field: any) => `  ${field.name}: ${convertIDLTypeToTS(field.type)}`).join('\n')

						tsCode += `export interface ${capitalize(type.name)} {\n${fields}\n}\n\n`
					} else if (type.type?.variants) {
						const variants = type.type.variants.map((variant: any) => `  | { ${variant.name}: ${variant.fields ? '{ ' + variant.fields.map((f: any) => `${f.name}: ${convertIDLTypeToTS(f.type)}`).join(', ') + ' }' : 'void'} }`).join('\n')

						tsCode += `export type ${capitalize(type.name)} =\n${variants}\n\n`
					}
				})
			}

			// Generate error codes
			if (uploadedIdl.raw.errors && uploadedIdl.raw.errors.length > 0) {
				tsCode += '\n// Error Codes\n'
				tsCode += 'export enum ErrorCode {\n'
				uploadedIdl.raw.errors.forEach((error: any, idx: number) => {
					tsCode += `  ${error.name} = ${error.code}${idx < uploadedIdl.raw.errors.length - 1 ? ',' : ''} // ${error.msg || ''}\n`
				})
				tsCode += '}\n'
			}

			// Download as .ts file
			const blob = new Blob([tsCode], {type: 'text/typescript'})
			const url = URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `${uploadedIdl.name}-types.ts`
			document.body.appendChild(link)
			link.click()
			document.body.removeChild(link)
			URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Generate types error:', error)
			setUploadError('Failed to generate TypeScript types')
		}
	}, [uploadedIdl])

	/**
	 * Convert IDL type to TypeScript type
	 */
	const convertIDLTypeToTS = (idlType: any): string => {
		if (typeof idlType === 'string') {
			const typeMap: Record<string, string> = {
				bool: 'boolean',
				u8: 'number',
				i8: 'number',
				u16: 'number',
				i16: 'number',
				u32: 'number',
				i32: 'number',
				u64: 'bigint',
				i64: 'bigint',
				u128: 'bigint',
				i128: 'bigint',
				f32: 'number',
				f64: 'number',
				string: 'string',
				publicKey: 'string',
				bytes: 'Uint8Array',
			}
			return typeMap[idlType] || 'any'
		}

		if (idlType.vec) {
			return `Array<${convertIDLTypeToTS(idlType.vec)}>`
		}

		if (idlType.option) {
			return `${convertIDLTypeToTS(idlType.option)} | null`
		}

		if (idlType.defined) {
			return idlType.defined
		}

		if (idlType.array) {
			return `Array<${convertIDLTypeToTS(idlType.array[0])}>`
		}

		return 'any'
	}

	/**
	 * Capitalize first letter
	 */
	const capitalize = (str: string): string => {
		return str.charAt(0).toUpperCase() + str.slice(1)
	}

	/**
	 * Clear uploaded IDL
	 */
	const handleClearIDL = useCallback(() => {
		setUploadedIdl(null)
		setUploadError(null)
		setValidationErrors([])
		if (fileInputRef.current) {
			fileInputRef.current.value = ''
		}
	}, [])

	/**
	 * Trigger file input
	 */
	const handleUploadClick = useCallback(() => {
		fileInputRef.current?.click()
	}, [])

	return (
		<PixelCard>
			<div className='space-y-4'>
				<div className='border-b-4 border-green-400/20 pb-3'>
					<h3 className='font-pixel text-sm text-green-400'>📄 IDL MANAGER</h3>
				</div>

				{/* Upload Section */}
				{!uploadedIdl ? (
					<div className='space-y-4'>
						<div className='p-4 bg-blue-900/20 border-2 border-blue-600/30'>
							<div className='flex items-start gap-2'>
								<FileJson className='h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0' />
								<div className='font-mono text-xs text-blue-400'>Upload IDL JSON files to analyze program interfaces, validate structure, and generate documentation</div>
							</div>
						</div>

						<input ref={fileInputRef} type='file' accept='.json,application/json' onChange={handleFileUpload} className='hidden' />

						<PixelButton onClick={handleUploadClick} disabled={isValidating} className='w-full'>
							<Upload className='h-4 w-4' />
							{isValidating ? '[VALIDATING...]' : '[UPLOAD IDL FILE]'}
						</PixelButton>

						{/* Validation Errors */}
						{validationErrors.length > 0 && (
							<div className='p-3 bg-red-900/20 border-2 border-red-600/30'>
								<div className='font-pixel text-xs text-red-400 mb-2'>VALIDATION ERRORS:</div>
								<ul className='font-mono text-xs text-red-300 space-y-1'>
									{validationErrors.map((error, idx) => (
										<li key={idx}>• {error}</li>
									))}
								</ul>
							</div>
						)}

						{/* Upload Error */}
						{uploadError && (
							<div className='p-3 bg-red-900/20 border-2 border-red-600/30'>
								<div className='flex items-start gap-2'>
									<AlertTriangle className='h-4 w-4 text-red-400 mt-0.5' />
									<div className='font-mono text-xs text-red-400'>{uploadError}</div>
								</div>
							</div>
						)}

						{/* Usage Instructions */}
						<div className='p-4 bg-gray-800 border-2 border-gray-700'>
							<div className='font-pixel text-xs text-gray-400 mb-2'>SUPPORTED FORMATS:</div>
							<ul className='font-mono text-xs text-gray-400 space-y-1'>
								<li>• Anchor IDL JSON files</li>
								<li>• Standard Solana program IDL</li>
								<li>• Max file size: 10MB</li>
								<li>• Required fields: name, version, instructions</li>
							</ul>
						</div>
					</div>
				) : (
					/* IDL Info Display */
					<div className='space-y-4'>
						{/* Success Banner */}
						<div className='p-3 bg-green-900/20 border-2 border-green-600/30'>
							<div className='flex items-center gap-2'>
								<CheckCircle className='h-4 w-4 text-green-400' />
								<div className='font-pixel text-xs text-green-400'>IDL LOADED SUCCESSFULLY</div>
							</div>
						</div>

						{/* IDL Metadata */}
						<div className='grid grid-cols-2 gap-3'>
							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-green-400 mb-1'>NAME:</div>
								<div className='font-mono text-xs text-gray-300 break-all'>{uploadedIdl.name}</div>
							</div>

							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-blue-400 mb-1'>VERSION:</div>
								<div className='font-mono text-xs text-gray-300'>{uploadedIdl.version}</div>
							</div>

							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-purple-400 mb-1'>INSTRUCTIONS:</div>
								<div className='font-mono text-xs text-gray-300'>{uploadedIdl.instructions}</div>
							</div>

							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-yellow-400 mb-1'>ACCOUNTS:</div>
								<div className='font-mono text-xs text-gray-300'>{uploadedIdl.accounts}</div>
							</div>

							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-pink-400 mb-1'>TYPES:</div>
								<div className='font-mono text-xs text-gray-300'>{uploadedIdl.types}</div>
							</div>

							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-red-400 mb-1'>ERRORS:</div>
								<div className='font-mono text-xs text-gray-300'>{uploadedIdl.errors}</div>
							</div>
						</div>

						{/* Instructions List */}
						{uploadedIdl.raw.instructions && uploadedIdl.raw.instructions.length > 0 && (
							<div className='p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-purple-400 mb-3'>AVAILABLE INSTRUCTIONS:</div>
								<div className='space-y-2 max-h-48 overflow-y-auto'>
									{uploadedIdl.raw.instructions.map((instruction: any, idx: number) => (
										<div key={idx} className='p-2 bg-gray-900 border border-gray-600 hover:border-purple-400 transition-colors'>
											<div className='font-mono text-xs text-purple-300 mb-1'>{instruction.name}</div>
											{instruction.docs && instruction.docs.length > 0 && <div className='font-mono text-xs text-gray-400'>{instruction.docs[0]}</div>}
											<div className='flex gap-3 mt-1'>
												<span className='font-mono text-xs text-gray-500'>Accounts: {instruction.accounts?.length || 0}</span>
												<span className='font-mono text-xs text-gray-500'>Args: {instruction.args?.length || 0}</span>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Program ID */}
						{uploadedIdl.programId !== 'unknown' && (
							<div className='p-3 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-green-400 mb-1'>PROGRAM ID:</div>
								<div className='font-mono text-xs text-gray-300 break-all'>{uploadedIdl.programId}</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className='grid grid-cols-2 gap-3'>
							<PixelButton onClick={handleCopyIDL} variant='secondary' className='w-full'>
								{copied ? (
									<>
										<CheckCircle className='h-4 w-4' />
										[COPIED]
									</>
								) : (
									<>
										<Copy className='h-4 w-4' />
										[COPY JSON]
									</>
								)}
							</PixelButton>

							<PixelButton onClick={handleDownloadIDL} variant='secondary' className='w-full'>
								<Download className='h-4 w-4' />
								[DOWNLOAD JSON]
							</PixelButton>
						</div>

						<PixelButton onClick={handleGenerateTypes} variant='primary' className='w-full'>
							<FileText className='h-4 w-4' />
							[GENERATE TS TYPES]
						</PixelButton>

						<PixelButton onClick={handleClearIDL} variant='danger' className='w-full'>
							<X className='h-4 w-4' />
							[CLEAR IDL]
						</PixelButton>
					</div>
				)}
			</div>
		</PixelCard>
	)
}
