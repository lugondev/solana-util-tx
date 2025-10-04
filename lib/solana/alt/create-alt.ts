import {
  Connection,
  PublicKey,
  AddressLookupTableProgram,
  Transaction,
  TransactionInstruction,
  Keypair,
  SystemProgram,
} from '@solana/web3.js'

/**
 * Create Address Lookup Table (ALT) utility functions
 */

export interface CreateALTParams {
  connection: Connection
  payer: PublicKey
  authority?: PublicKey
  recentSlot?: number
}

export interface CreateALTResult {
  lookupTableAddress: PublicKey
  instruction: TransactionInstruction
  slot: number
}

/**
 * Create a new Address Lookup Table
 */
export async function createAddressLookupTable({
  connection,
  payer,
  authority,
  recentSlot,
}: CreateALTParams): Promise<CreateALTResult> {
  // Get recent slot if not provided
  const slot = recentSlot || (await connection.getSlot())

  // Authority defaults to payer
  const altAuthority = authority || payer

  // Create the instruction
  const [lookupTableInst, lookupTableAddress] =
    AddressLookupTableProgram.createLookupTable({
      authority: altAuthority,
      payer,
      recentSlot: slot,
    })

  return {
    lookupTableAddress,
    instruction: lookupTableInst,
    slot,
  }
}

/**
 * Extend an existing Address Lookup Table with new addresses
 */
export interface ExtendALTParams {
  connection: Connection
  lookupTableAddress: PublicKey
  authority: PublicKey
  payer: PublicKey
  addresses: PublicKey[]
}

export function extendAddressLookupTable({
  lookupTableAddress,
  authority,
  payer,
  addresses,
}: ExtendALTParams): TransactionInstruction {
  return AddressLookupTableProgram.extendLookupTable({
    lookupTable: lookupTableAddress,
    authority,
    payer,
    addresses,
  })
}

/**
 * Deactivate an Address Lookup Table
 */
export interface DeactivateALTParams {
  lookupTableAddress: PublicKey
  authority: PublicKey
}

export function deactivateAddressLookupTable({
  lookupTableAddress,
  authority,
}: DeactivateALTParams): TransactionInstruction {
  return AddressLookupTableProgram.deactivateLookupTable({
    lookupTable: lookupTableAddress,
    authority,
  })
}

/**
 * Close an Address Lookup Table (only after deactivation)
 */
export interface CloseALTParams {
  lookupTableAddress: PublicKey
  authority: PublicKey
  recipient: PublicKey
}

export function closeAddressLookupTable({
  lookupTableAddress,
  authority,
  recipient,
}: CloseALTParams): TransactionInstruction {
  return AddressLookupTableProgram.closeLookupTable({
    lookupTable: lookupTableAddress,
    authority,
    recipient,
  })
}

/**
 * Freeze an Address Lookup Table (permanently immutable)
 */
export interface FreezeALTParams {
  lookupTableAddress: PublicKey
  authority: PublicKey
}

export function freezeAddressLookupTable({
  lookupTableAddress,
  authority,
}: FreezeALTParams): TransactionInstruction {
  return AddressLookupTableProgram.freezeLookupTable({
    lookupTable: lookupTableAddress,
    authority,
  })
}

/**
 * Get Address Lookup Table account info
 */
export async function getAddressLookupTable(
  connection: Connection,
  lookupTableAddress: PublicKey
) {
  try {
    const lookupTableAccount = await connection.getAddressLookupTable(
      lookupTableAddress
    )
    return lookupTableAccount
  } catch (error) {
    console.error('Error fetching ALT:', error)
    return null
  }
}

/**
 * Helper function to build a complete create ALT transaction
 */
export async function buildCreateALTTransaction({
  connection,
  payer,
  authority,
  initialAddresses = [],
}: CreateALTParams & { initialAddresses?: PublicKey[] }): Promise<{
  transaction: Transaction
  lookupTableAddress: PublicKey
  slot: number
}> {
  const { instruction: createInstruction, lookupTableAddress, slot } = 
    await createAddressLookupTable({
      connection,
      payer,
      authority,
    })

  const transaction = new Transaction()
  transaction.add(createInstruction)

  // Add initial addresses if provided
  if (initialAddresses.length > 0) {
    const extendInstruction = extendAddressLookupTable({
      connection,
      lookupTableAddress,
      authority: authority || payer,
      payer,
      addresses: initialAddresses,
    })
    transaction.add(extendInstruction)
  }

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payer

  return {
    transaction,
    lookupTableAddress,
    slot,
  }
}

/**
 * Helper function to build extend ALT transaction
 */
export async function buildExtendALTTransaction({
  connection,
  lookupTableAddress,
  authority,
  payer,
  addresses,
}: ExtendALTParams): Promise<Transaction> {
  const instruction = extendAddressLookupTable({
    connection,
    lookupTableAddress,
    authority,
    payer,
    addresses,
  })

  const transaction = new Transaction()
  transaction.add(instruction)

  // Get recent blockhash
  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.feePayer = payer

  return transaction
}