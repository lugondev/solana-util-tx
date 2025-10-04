/**
 * Address Lookup Table resolver for finding addresses in ALTs
 */

import { Connection, PublicKey, AddressLookupTableAccount } from '@solana/web3.js'

export interface ALTResolverOptions {
  connection: Connection
  lookupTables: PublicKey[]
}

export interface ResolvedAddress {
  address: PublicKey
  altAddress?: PublicKey
  index?: number
  found: boolean
}

export interface ALTResolver {
  resolve(addresses: PublicKey[]): Promise<ResolvedAddress[]>
  getLookupTableAccounts(): Promise<AddressLookupTableAccount[]>
  addLookupTable(altAddress: PublicKey): void
  removeLookupTable(altAddress: PublicKey): void
  clearLookupTables(): void
}

/**
 * Create an ALT resolver instance
 */
export function createALTResolver(options: ALTResolverOptions): ALTResolver {
  let lookupTables = [...options.lookupTables]
  let cachedLookupAccounts: Map<string, AddressLookupTableAccount> = new Map()

  /**
   * Get all lookup table accounts
   */
  async function getLookupTableAccounts(): Promise<AddressLookupTableAccount[]> {
    const accounts: AddressLookupTableAccount[] = []

    for (const altAddress of lookupTables) {
      const key = altAddress.toBase58()
      
      // Check cache first
      if (cachedLookupAccounts.has(key)) {
        const cached = cachedLookupAccounts.get(key)!
        accounts.push(cached)
        continue
      }

      try {
        const altAccount = await options.connection.getAddressLookupTable(altAddress)
        
        if (altAccount.value) {
          accounts.push(altAccount.value)
          // Cache the result
          cachedLookupAccounts.set(key, altAccount.value)
        }
      } catch (error) {
        console.warn(`Failed to fetch ALT ${altAddress.toBase58()}:`, error)
      }
    }

    return accounts
  }

  /**
   * Resolve addresses using available ALTs
   */
  async function resolve(addresses: PublicKey[]): Promise<ResolvedAddress[]> {
    const lookupAccounts = await getLookupTableAccounts()
    const resolved: ResolvedAddress[] = []

    for (const address of addresses) {
      let found = false
      let altAddress: PublicKey | undefined
      let index: number | undefined

      // Search through all ALTs
      for (const lookupAccount of lookupAccounts) {
        const addressIndex = lookupAccount.state.addresses.findIndex(addr => 
          addr.equals(address)
        )

        if (addressIndex >= 0) {
          found = true
          altAddress = lookupAccount.key
          index = addressIndex
          break
        }
      }

      resolved.push({
        address,
        altAddress,
        index,
        found,
      })
    }

    return resolved
  }

  /**
   * Add a lookup table to the resolver
   */
  function addLookupTable(altAddress: PublicKey): void {
    if (!lookupTables.some(addr => addr.equals(altAddress))) {
      lookupTables.push(altAddress)
      // Clear cache for this address to force refresh
      cachedLookupAccounts.delete(altAddress.toBase58())
    }
  }

  /**
   * Remove a lookup table from the resolver
   */
  function removeLookupTable(altAddress: PublicKey): void {
    lookupTables = lookupTables.filter(addr => !addr.equals(altAddress))
    cachedLookupAccounts.delete(altAddress.toBase58())
  }

  /**
   * Clear all lookup tables
   */
  function clearLookupTables(): void {
    lookupTables = []
    cachedLookupAccounts.clear()
  }

  return {
    resolve,
    getLookupTableAccounts,
    addLookupTable,
    removeLookupTable,
    clearLookupTables,
  }
}

/**
 * Utility function to check if addresses can benefit from ALT
 */
export async function analyzeALTBenefit(
  connection: Connection,
  addresses: PublicKey[],
  altAddresses: PublicKey[]
): Promise<{
  totalAddresses: number
  addressesInALT: number
  addressesNotInALT: number
  benefitPercentage: number
  recommendations: string[]
}> {
  const resolver = createALTResolver({ connection, lookupTables: altAddresses })
  const resolved = await resolver.resolve(addresses)

  const addressesInALT = resolved.filter(r => r.found).length
  const addressesNotInALT = resolved.filter(r => !r.found).length
  const benefitPercentage = addresses.length > 0 ? (addressesInALT / addresses.length) * 100 : 0

  const recommendations: string[] = []

  if (benefitPercentage < 50) {
    recommendations.push('Consider creating a new ALT with your frequently used addresses')
  }

  if (addressesNotInALT > 5) {
    recommendations.push('You have many addresses not in ALTs - they could benefit from being added')
  }

  if (benefitPercentage > 80) {
    recommendations.push('Great ALT coverage! Your transactions will be very efficient')
  }

  return {
    totalAddresses: addresses.length,
    addressesInALT,
    addressesNotInALT,
    benefitPercentage,
    recommendations,
  }
}

/**
 * Find optimal ALT configuration for a set of addresses
 */
export async function findOptimalALTConfiguration(
  connection: Connection,
  addresses: PublicKey[],
  existingALTs: PublicKey[] = []
): Promise<{
  useExistingALTs: PublicKey[]
  createNewALTWith: PublicKey[]
  estimatedSavings: number
}> {
  const resolver = createALTResolver({ connection, lookupTables: existingALTs })
  const resolved = await resolver.resolve(addresses)

  const addressesInExistingALTs = resolved.filter(r => r.found).map(r => r.address)
  const addressesNotInALTs = resolved.filter(r => !r.found).map(r => r.address)

  // Use existing ALTs that have matches
  const usedALTs = [...new Set(resolved.filter(r => r.found && r.altAddress).map(r => r.altAddress!))]

  // Estimate savings (simplified calculation)
  const bytesPerAddress = 32
  const bytesPerALTReference = 1
  const totalBytes = addresses.length * bytesPerAddress
  const altBytes = (addressesInExistingALTs.length * bytesPerALTReference) + 
                   (addressesNotInALTs.length * bytesPerAddress)
  const estimatedSavings = ((totalBytes - altBytes) / totalBytes) * 100

  return {
    useExistingALTs: usedALTs,
    createNewALTWith: addressesNotInALTs,
    estimatedSavings,
  }
}