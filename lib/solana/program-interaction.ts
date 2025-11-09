import { Connection, PublicKey, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js'
import BN from 'bn.js'

/**
 * IDL Type Definitions
 */
export interface IdlAccount {
	name: string
	isMut: boolean
	isSigner: boolean
	docs?: string[]
	pda?: IdlPda
}

export interface IdlPda {
	seeds: IdlSeed[]
}

export interface IdlSeed {
	kind: 'const' | 'arg' | 'account'
	value?: number[]
	path?: string
}

export interface IdlField {
	name: string
	type: IdlType
	docs?: string[]
}

export type IdlType =
	| 'bool'
	| 'u8' | 'i8'
	| 'u16' | 'i16'
	| 'u32' | 'i32'
	| 'u64' | 'i64'
	| 'u128' | 'i128'
	| 'bytes'
	| 'string'
	| 'publicKey'
	| { vec: IdlType }
	| { option: IdlType }
	| { defined: string }
	| { array: [IdlType, number] }

export interface IdlInstruction {
	name: string
	accounts: IdlAccount[]
	args: IdlField[]
	docs?: string[]
}

export interface IdlAccountDef {
	name: string
	type: {
		kind: 'struct' | 'enum'
		fields?: IdlField[]
		variants?: Array<{ name: string; fields?: IdlField[] }>
	}
	docs?: string[]
}

export interface IdlTypeDef {
	name: string
	type: {
		kind: 'struct' | 'enum'
		fields?: IdlField[]
		variants?: Array<{ name: string; fields?: IdlField[] }>
	}
	docs?: string[]
}

export interface IdlErrorCode {
	code: number
	name: string
	msg?: string
}

export interface Idl {
	version: string
	name: string
	instructions: IdlInstruction[]
	accounts?: IdlAccountDef[]
	types?: IdlTypeDef[]
	errors?: IdlErrorCode[]
	metadata?: {
		address?: string
		origin?: string
		binaryVersion?: string
		libVersion?: string
	}
}

/**
 * Program Interaction Helper
 */
export class ProgramInteractionHelper {
	constructor(
		private connection: Connection,
		private programId: PublicKey,
		private idl: Idl
	) { }

	/**
	 * Get instruction by name
	 */
	getInstruction(name: string): IdlInstruction | undefined {
		return this.idl.instructions.find(ix => ix.name === name)
	}

	/**
	 * Parse and validate account address
	 */
	parsePublicKey(value: string): PublicKey {
		try {
			return new PublicKey(value.trim())
		} catch (error) {
			throw new Error(`Invalid public key: ${value}`)
		}
	}

	/**
	 * Convert value to proper type based on IDL type
	 */
	convertToIdlType(value: any, type: IdlType): any {
		if (typeof type === 'string') {
			switch (type) {
				case 'bool':
					return Boolean(value)

				case 'u8':
				case 'u16':
				case 'u32':
					return Number(value)

				case 'u64':
				case 'u128':
				case 'i64':
				case 'i128':
					return new BN(value)

				case 'i8':
				case 'i16':
				case 'i32':
					return Number(value)

				case 'string':
					return String(value)

				case 'bytes':
					if (typeof value === 'string') {
						return Buffer.from(value, 'hex')
					}
					return value

				case 'publicKey':
					return this.parsePublicKey(value)

				default:
					return value
			}
		}

		if (typeof type === 'object') {
			if ('vec' in type) {
				if (Array.isArray(value)) {
					return value.map(v => this.convertToIdlType(v, type.vec))
				}
				if (typeof value === 'string') {
					const items = value.split(',').map(v => v.trim()).filter(v => v)
					return items.map(v => this.convertToIdlType(v, type.vec))
				}
				return []
			}

			if ('option' in type) {
				if (value === null || value === undefined || value === '') {
					return null
				}
				return this.convertToIdlType(value, type.option)
			}

			if ('array' in type) {
				const [itemType, length] = type.array
				if (Array.isArray(value)) {
					const arr = value.slice(0, length)
					return arr.map(v => this.convertToIdlType(v, itemType))
				}
				if (typeof value === 'string') {
					const items = value.split(',').map(v => v.trim()).filter(v => v).slice(0, length)
					return items.map(v => this.convertToIdlType(v, itemType))
				}
				return []
			}

			if ('defined' in type) {
				// Handle custom defined types
				// This would need more complex logic to handle struct serialization
				return value
			}
		}

		return value
	}

	/**
	 * Validate form inputs against instruction definition
	 */
	validateInputs(
		instruction: IdlInstruction,
		accounts: Record<string, string>,
		args: Record<string, any>
	): { valid: boolean; errors: string[] } {
		const errors: string[] = []

		// Validate accounts
		for (const account of instruction.accounts) {
			const value = accounts[account.name]
			if (!value || value.trim() === '') {
				errors.push(`Missing required account: ${account.name}`)
				continue
			}

			try {
				this.parsePublicKey(value)
			} catch (error) {
				errors.push(`Invalid public key for account ${account.name}: ${value}`)
			}
		}

		// Validate args
		for (const arg of instruction.args) {
			const value = args[arg.name]
			if (value === undefined || value === null || value === '') {
				// Check if it's an optional type
				if (typeof arg.type === 'object' && 'option' in arg.type) {
					continue
				}
				errors.push(`Missing required argument: ${arg.name}`)
			}
		}

		return {
			valid: errors.length === 0,
			errors
		}
	}

	/**
	 * Build instruction data buffer (simplified version)
	 * Note: In production, use Anchor's BorshInstructionCoder
	 */
	private buildInstructionData(
		instruction: IdlInstruction,
		args: Record<string, any>
	): Buffer {
		// This is a simplified version
		// In production, you should use Anchor's instruction encoding

		// For demonstration, we'll create a basic buffer
		// Real implementation would use Borsh serialization based on IDL
		const data: any[] = []

		for (const arg of instruction.args) {
			const value = args[arg.name]
			const converted = this.convertToIdlType(value, arg.type)
			data.push(converted)
		}

		// This is placeholder - actual implementation needs proper Borsh encoding
		return Buffer.from([])
	}

	/**
	 * Create transaction instruction from form data
	 */
	async createInstruction(
		instructionName: string,
		accounts: Record<string, string>,
		args: Record<string, any>
	): Promise<TransactionInstruction> {
		const instruction = this.getInstruction(instructionName)
		if (!instruction) {
			throw new Error(`Instruction not found: ${instructionName}`)
		}

		// Validate inputs
		const validation = this.validateInputs(instruction, accounts, args)
		if (!validation.valid) {
			throw new Error(`Validation failed:\n${validation.errors.join('\n')}`)
		}

		// Build accounts array
		const accountMetas = instruction.accounts.map(account => ({
			pubkey: this.parsePublicKey(accounts[account.name]),
			isSigner: account.isSigner,
			isWritable: account.isMut
		}))

		// Build instruction data
		const data = this.buildInstructionData(instruction, args)

		return new TransactionInstruction({
			keys: accountMetas,
			programId: this.programId,
			data
		})
	}

	/**
	 * Get type description for UI display
	 */
	getTypeDescription(type: IdlType): string {
		if (typeof type === 'string') {
			return type
		}

		if (typeof type === 'object') {
			if ('vec' in type) {
				return `Vec<${this.getTypeDescription(type.vec)}>`
			}
			if ('option' in type) {
				return `Option<${this.getTypeDescription(type.option)}>`
			}
			if ('array' in type) {
				return `[${this.getTypeDescription(type.array[0])}; ${type.array[1]}]`
			}
			if ('defined' in type) {
				return type.defined
			}
		}

		return 'unknown'
	}

	/**
	 * Check if type is optional
	 */
	isOptionalType(type: IdlType): boolean {
		return typeof type === 'object' && 'option' in type
	}

	/**
	 * Get error message from error code
	 */
	getErrorMessage(code: number): string | undefined {
		const error = this.idl.errors?.find(e => e.code === code)
		return error?.msg || error?.name
	}
}

/**
 * IDL Validator
 */
export class IdlValidator {
	/**
	 * Validate IDL structure
	 */
	static validate(idl: any): { valid: boolean; errors: string[]; warnings: string[] } {
		const errors: string[] = []
		const warnings: string[] = []

		if (!idl) {
			errors.push('IDL is null or undefined')
			return { valid: false, errors, warnings }
		}

		// Version and name are recommended but not strictly required
		if (!idl.version) {
			warnings.push('Missing version field (recommended)')
			// Set default version if missing
			idl.version = '0.0.0'
		}

		if (!idl.name) {
			warnings.push('Missing name field (recommended)')
			// Set default name if missing
			idl.name = 'unknown_program'
		}

		// Instructions array is required
		if (!idl.instructions || !Array.isArray(idl.instructions)) {
			errors.push('Missing or invalid instructions array (required)')
		} else {
			if (idl.instructions.length === 0) {
				warnings.push('Instructions array is empty')
			}

			// Validate each instruction
			idl.instructions.forEach((ix: any, index: number) => {
				if (!ix.name) {
					errors.push(`Instruction at index ${index} missing name`)
				}
				if (!ix.accounts || !Array.isArray(ix.accounts)) {
					errors.push(`Instruction "${ix.name || index}" missing or invalid accounts array`)
				}
				if (!ix.args || !Array.isArray(ix.args)) {
					errors.push(`Instruction "${ix.name || index}" missing or invalid args array`)
				}
			})
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings
		}
	}

	/**
	 * Check if IDL has metadata with program address
	 */
	static hasProgramAddress(idl: Idl): boolean {
		return !!idl.metadata?.address
	}

	/**
	 * Extract program address from IDL
	 */
	static getProgramAddress(idl: Idl): string | null {
		return idl.metadata?.address || null
	}
}
