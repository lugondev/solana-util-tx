import { Connection, PublicKey, Transaction, AddressLookupTableProgram } from '@solana/web3.js'

/**
 * ALT management utilities for tracking and working with Address Lookup Tables
 */

export interface ALTInfo {
  address: PublicKey
  authority: PublicKey | null
  deactivationSlot: bigint | null
  lastExtendedSlot: number
  lastExtendedSlotStartIndex: number
  addresses: PublicKey[]
  isDeactivated: boolean
  isFrozen: boolean
  canBeClosed: boolean
}

/**
 * Get detailed information about an Address Lookup Table
 */
export async function getALTInfo(
  connection: Connection,
  altAddress: PublicKey
): Promise<ALTInfo | null> {
  try {
    const altAccount = await connection.getAddressLookupTable(altAddress)

    if (!altAccount.value) {
      return null
    }

    const { authority, deactivationSlot, lastExtendedSlot, lastExtendedSlotStartIndex } =
      altAccount.value.state

    const isDeactivated = deactivationSlot !== null
    const isFrozen = authority === null

    // ALT can be closed after deactivation + ~2 days (512 slots)
    let canBeClosed = false
    if (isDeactivated && deactivationSlot !== null) {
      const currentSlot = await connection.getSlot()
      canBeClosed = currentSlot > Number(deactivationSlot) + 512
    }

    return {
      address: altAddress,
      authority: authority || null,
      deactivationSlot,
      lastExtendedSlot,
      lastExtendedSlotStartIndex,
      addresses: altAccount.value.state.addresses,
      isDeactivated,
      isFrozen,
      canBeClosed,
    }
  } catch (error) {
    console.error('Error getting ALT info:', error)
    return null
  }
}

/**
 * Find Address Lookup Tables owned by a specific authority
 */
export async function findALTsByAuthority(
  connection: Connection,
  authority: PublicKey
): Promise<PublicKey[]> {
  try {
    // This is a simplified version - in practice, you might want to use getProgramAccounts
    // or maintain an index of ALTs

    // For now, we'll return empty array as this requires more complex indexing
    // In a real implementation, you'd scan for ALT accounts with the given authority

    console.warn('findALTsByAuthority requires program account scanning - not implemented')
    return []
  } catch (error) {
    console.error('Error finding ALTs by authority:', error)
    return []
  }
}

/**
 * Check if an address exists in an ALT
 */
export async function isAddressInALT(
  connection: Connection,
  altAddress: PublicKey,
  targetAddress: PublicKey
): Promise<{ exists: boolean; index?: number }> {
  try {
    const altInfo = await getALTInfo(connection, altAddress)

    if (!altInfo) {
      return { exists: false }
    }

    const index = altInfo.addresses.findIndex(addr => addr.equals(targetAddress))

    return {
      exists: index >= 0,
      index: index >= 0 ? index : undefined,
    }
  } catch (error) {
    console.error('Error checking address in ALT:', error)
    return { exists: false }
  }
}

/**
 * Get the most efficient ALT for a set of addresses
 */
export async function findBestALTForAddresses(
  connection: Connection,
  altAddresses: PublicKey[],
  targetAddresses: PublicKey[]
): Promise<{
  altAddress: PublicKey
  matchedAddresses: PublicKey[]
  matchedIndices: number[]
} | null> {
  try {
    let bestMatch = null
    let maxMatches = 0

    for (const altAddress of altAddresses) {
      const altInfo = await getALTInfo(connection, altAddress)

      if (!altInfo || altInfo.isDeactivated) continue

      const matchedAddresses: PublicKey[] = []
      const matchedIndices: number[] = []

      for (const targetAddr of targetAddresses) {
        const index = altInfo.addresses.findIndex(addr => addr.equals(targetAddr))
        if (index >= 0) {
          matchedAddresses.push(targetAddr)
          matchedIndices.push(index)
        }
      }

      if (matchedAddresses.length > maxMatches) {
        maxMatches = matchedAddresses.length
        bestMatch = {
          altAddress,
          matchedAddresses,
          matchedIndices,
        }
      }
    }

    return bestMatch
  } catch (error) {
    console.error('Error finding best ALT:', error)
    return null
  }
}

/**
 * Calculate savings from using ALT
 */
export function calculateALTSavings(
  addressCount: number,
  usingALT: boolean
): {
  standardTxSize: number
  altTxSize: number
  bytesSaved: number
  percentSaved: number
} {
  // Each address is 32 bytes
  // ALT reference is much smaller (index in table)
  const bytesPerAddress = 32
  const bytesPerALTReference = 1 // simplified - actual varies by index size

  const standardTxSize = addressCount * bytesPerAddress
  const altTxSize = usingALT ? addressCount * bytesPerALTReference : standardTxSize
  const bytesSaved = standardTxSize - altTxSize
  const percentSaved = standardTxSize > 0 ? (bytesSaved / standardTxSize) * 100 : 0

  return {
    standardTxSize,
    altTxSize,
    bytesSaved,
    percentSaved,
  }
}

/**
 * Validate ALT address format
 */
export function validateALTAddress(address: string): { valid: boolean; error?: string } {
  try {
    const pubkey = new PublicKey(address)

    // Basic validation - in reality you might want to check if it's actually an ALT account
    if (pubkey.equals(PublicKey.default)) {
      return { valid: false, error: 'Cannot be default public key' }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: 'Invalid public key format' }
  }
}

/**
 * Extend an Address Lookup Table
 * Add more addresses to an existing ALT
 */
export async function extendALT(
  connection: Connection,
  altAddress: PublicKey,
  authority: PublicKey,
  addressesToAdd: PublicKey[]
): Promise<{
  success: boolean
  signature?: string
  error?: string
}> {
  try {
    if (addressesToAdd.length === 0) {
      return { success: false, error: 'No addresses to add' }
    }

    if (addressesToAdd.length > 30) {
      return { success: false, error: 'Maximum 30 addresses per transaction' }
    }

    const extendInstruction = AddressLookupTableProgram.extendLookupTable({
      lookupTable: altAddress,
      authority,
      payer: authority,
      addresses: addressesToAdd,
    })

    const transaction = new Transaction().add(extendInstruction)
    transaction.feePayer = authority
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    // Note: This returns an unsigned transaction that needs to be signed by the wallet
    return {
      success: true,
      error: 'Transaction created - needs to be signed and sent by wallet'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to extend ALT'
    }
  }
}

/**
 * Deactivate an Address Lookup Table
 * After deactivation, ALT enters a cooldown period before it can be closed
 */
export async function deactivateALT(
  connection: Connection,
  altAddress: PublicKey,
  authority: PublicKey
): Promise<{
  success: boolean
  signature?: string
  error?: string
  deactivationSlot?: number
}> {
  try {
    const deactivateInstruction = AddressLookupTableProgram.deactivateLookupTable({
      lookupTable: altAddress,
      authority,
    })

    const transaction = new Transaction().add(deactivateInstruction)
    transaction.feePayer = authority
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash

    const slot = await connection.getSlot()

    return {
      success: true,
      deactivationSlot: slot,
      error: 'Transaction created - needs to be signed and sent by wallet'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to deactivate ALT'
    }
  }
}

/**
 * Freeze an Address Lookup Table
 * Makes the ALT immutable - no more addresses can be added
 */
export async function freezeALT(
  connection: Connection,
  altAddress: PublicKey,
  authority: PublicKey
): Promise<{
  success: boolean
  signature?: string
  error?: string
}> {
  try {
    const freezeInstruction = AddressLookupTableProgram.freezeLookupTable({
      lookupTable: altAddress,
      authority,
    })

    const transaction = new Transaction().add(freezeInstruction)
    transaction.feePayer = authority
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    return {
      success: true,
      error: 'Transaction created - needs to be signed and sent by wallet'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to freeze ALT'
    }
  }
}

/**
 * Close an Address Lookup Table
 * Can only close after deactivation cooldown period
 */
export async function closeALT(
  connection: Connection,
  altAddress: PublicKey,
  authority: PublicKey,
  recipient: PublicKey
): Promise<{
  success: boolean
  signature?: string
  error?: string
  reclaimedLamports?: number
}> {
  try {
    // Check if ALT is deactivated
    const altAccount = await connection.getAccountInfo(altAddress)
    if (!altAccount) {
      return { success: false, error: 'ALT account not found' }
    }

    const closeInstruction = AddressLookupTableProgram.closeLookupTable({
      lookupTable: altAddress,
      authority,
      recipient,
    })

    const transaction = new Transaction().add(closeInstruction)
    transaction.feePayer = authority
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash

    return {
      success: true,
      reclaimedLamports: altAccount.lamports,
      error: 'Transaction created - needs to be signed and sent by wallet'
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to close ALT'
    }
  }
}

/**
 * Storage utilities for ALT management in local storage
 */
export const ALTStorage = {
  storageKey: 'solana-util-tx-alts',

  /**
   * Save ALT info to local storage
   */
  saveALT(altAddress: string, info: Partial<ALTInfo & { name?: string; description?: string }>) {
    try {
      const stored = this.getStoredALTs()
      stored[altAddress] = {
        ...stored[altAddress],
        ...info,
        address: altAddress,
        lastUpdated: Date.now(),
      }
      localStorage.setItem(this.storageKey, JSON.stringify(stored))
    } catch (error) {
      console.error('Error saving ALT to storage:', error)
    }
  },

  /**
   * Get stored ALTs
   */
  getStoredALTs(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : {}
    } catch {
      return {}
    }
  },

  /**
   * Remove ALT from storage
   */
  removeALT(altAddress: string) {
    try {
      const stored = this.getStoredALTs()
      delete stored[altAddress]
      localStorage.setItem(this.storageKey, JSON.stringify(stored))
    } catch (error) {
      console.error('Error removing ALT from storage:', error)
    }
  },

  /**
   * Get all stored ALT addresses
   */
  getALTAddresses(): string[] {
    const stored = this.getStoredALTs()
    return Object.keys(stored)
  },
}