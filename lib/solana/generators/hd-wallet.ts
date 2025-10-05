import { Keypair } from '@solana/web3.js'
import * as bip39 from 'bip39'
import { derivePath } from 'ed25519-hd-key'
import bs58 from 'bs58'

export interface HDWalletOptions {
  mnemonic: string
  passphrase?: string
  derivationPath: string
  accountStart: number
  accountCount: number
  includeChange: boolean
}

export interface DerivationAccount {
  index: number
  path: string
  publicKey: string
  privateKey: string
  keypair: Keypair
}

export interface HDWalletResult {
  mnemonic: string
  accounts: DerivationAccount[]
  derivationPath: string
}

export class HDWalletGenerator {
  /**
   * Derive multiple accounts from mnemonic
   */
  async deriveAccounts(options: HDWalletOptions): Promise<HDWalletResult> {
    const {
      mnemonic,
      passphrase = '',
      derivationPath,
      accountStart,
      accountCount,
      includeChange
    } = options

    // Validate mnemonic
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }

    // Generate seed from mnemonic
    const seed = await bip39.mnemonicToSeed(mnemonic, passphrase)
    
    const accounts: DerivationAccount[] = []

    // Generate accounts
    for (let i = accountStart; i < accountStart + accountCount; i++) {
      // External address (change = 0)
      const externalPath = `${derivationPath}${i}`
      const externalAccount = await this.deriveAccount(seed, externalPath, i)
      accounts.push(externalAccount)

      // Change address (change = 1) if requested
      if (includeChange) {
        const changePath = derivationPath.replace('/0/', '/1/') + i
        const changeAccount = await this.deriveAccount(seed, changePath, i, true)
        accounts.push(changeAccount)
      }
    }

    return {
      mnemonic,
      accounts,
      derivationPath
    }
  }

  /**
   * Derive single account from seed and path
   */
  private async deriveAccount(
    seed: Buffer, 
    path: string, 
    index: number, 
    isChange = false
  ): Promise<DerivationAccount> {
    // Derive key from path
    const { key } = derivePath(path, seed.toString('hex'))
    
    // Create keypair from derived key
    const keypair = Keypair.fromSeed(key)
    
    return {
      index: isChange ? index + 1000 : index, // Offset change addresses
      path,
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      keypair
    }
  }

  /**
   * Import accounts from mnemonic with custom paths
   */
  async importFromMnemonic(
    mnemonic: string,
    paths: string[],
    passphrase = ''
  ): Promise<DerivationAccount[]> {
    if (!validateMnemonic(mnemonic)) {
      throw new Error('Invalid mnemonic phrase')
    }

    const seed = await bip39.mnemonicToSeed(mnemonic, passphrase)
    const accounts: DerivationAccount[] = []

    for (let i = 0; i < paths.length; i++) {
      const account = await this.deriveAccount(seed, paths[i], i)
      accounts.push(account)
    }

    return accounts
  }

  /**
   * Generate standard Solana derivation paths
   */
  generateStandardPaths(accountCount: number, includeChange = false): string[] {
    const paths: string[] = []
    const basePath = "m/44'/501'/0'"

    for (let i = 0; i < accountCount; i++) {
      // External address
      paths.push(`${basePath}/0/${i}`)
      
      // Change address
      if (includeChange) {
        paths.push(`${basePath}/1/${i}`)
      }
    }

    return paths
  }

  /**
   * Validate derivation path format
   */
  validateDerivationPath(path: string): boolean {
    // Basic BIP44 path validation for Solana
    const solanaPathRegex = /^m\/44'\/501'\/\d+'?\/[01]\/?\d*$/
    return solanaPathRegex.test(path)
  }
}

/**
 * Generate new mnemonic phrase
 */
export async function generateMnemonic(
  wordCount: 12 | 15 | 18 | 21 | 24 = 12
): Promise<string> {
  const strengthMap = {
    12: 128,
    15: 160,
    18: 192,
    21: 224,
    24: 256
  }

  const strength = strengthMap[wordCount]
  return bip39.generateMnemonic(strength)
}

/**
 * Validate mnemonic phrase
 */
export function validateMnemonic(mnemonic: string): boolean {
  try {
    return bip39.validateMnemonic(mnemonic.trim())
  } catch {
    return false
  }
}

/**
 * Get mnemonic word count
 */
export function getMnemonicWordCount(mnemonic: string): number {
  return mnemonic.trim().split(/\s+/).length
}

/**
 * Check if mnemonic has valid checksum
 */
export function validateMnemonicChecksum(mnemonic: string): boolean {
  try {
    const words = mnemonic.trim().split(/\s+/)
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      return false
    }
    return bip39.validateMnemonic(mnemonic)
  } catch {
    return false
  }
}

/**
 * Convert mnemonic to entropy
 */
export function mnemonicToEntropy(mnemonic: string): string {
  if (!validateMnemonic(mnemonic)) {
    throw new Error('Invalid mnemonic')
  }
  return bip39.mnemonicToEntropy(mnemonic)
}

/**
 * Convert entropy to mnemonic
 */
export function entropyToMnemonic(entropy: string): string {
  return bip39.entropyToMnemonic(entropy)
}

/**
 * Get available BIP39 wordlists
 */
export function getAvailableWordlists(): string[] {
  return Object.keys(bip39.wordlists)
}

/**
 * Validate individual BIP39 word
 */
export function isValidBip39Word(word: string, language = 'english'): boolean {
  const wordlist = bip39.wordlists[language as keyof typeof bip39.wordlists]
  return wordlist ? wordlist.includes(word.toLowerCase()) : false
}

/**
 * Get BIP39 word suggestions
 */
export function getBip39WordSuggestions(partial: string, language = 'english'): string[] {
  const wordlist = bip39.wordlists[language as keyof typeof bip39.wordlists]
  if (!wordlist) return []
  
  return wordlist
    .filter((word: string) => word.toLowerCase().startsWith(partial.toLowerCase()))
    .slice(0, 10) // Limit suggestions
}

/**
 * Format derivation path for display
 */
export function formatDerivationPath(path: string): {
  purpose: string
  coinType: string
  account: string
  change: string
  addressIndex: string
} {
  const parts = path.split('/')
  return {
    purpose: parts[1] || '',
    coinType: parts[2] || '',
    account: parts[3] || '',
    change: parts[4] || '',
    addressIndex: parts[5] || ''
  }
}

/**
 * Common Solana derivation paths
 */
export const COMMON_DERIVATION_PATHS = {
  PHANTOM: "m/44'/501'/0'/0/",
  SOLFLARE: "m/44'/501'/0'/0/",
  LEDGER: "m/44'/501'/0'/",
  STANDARD: "m/44'/501'/0'/0/",
  CUSTOM_ACCOUNT_1: "m/44'/501'/1'/0/",
  CUSTOM_ACCOUNT_2: "m/44'/501'/2'/0/"
}

/**
 * Account type definitions
 */
export interface AccountType {
  name: string
  path: string
  description: string
  walletSupport: string[]
}

export const ACCOUNT_TYPES: AccountType[] = [
  {
    name: 'Standard Account',
    path: "m/44'/501'/0'/0/",
    description: 'Default Solana account for most wallets',
    walletSupport: ['Phantom', 'Solflare', 'Backpack', 'Glow']
  },
  {
    name: 'Ledger Account',
    path: "m/44'/501'/0'/",
    description: 'Ledger hardware wallet derivation',
    walletSupport: ['Ledger Live', 'Phantom (Ledger)', 'Solflare (Ledger)']
  },
  {
    name: 'Trading Account',
    path: "m/44'/501'/1'/0/",
    description: 'Separate account for trading activities',
    walletSupport: ['Custom implementations']
  },
  {
    name: 'Savings Account',
    path: "m/44'/501'/2'/0/",
    description: 'Long-term storage account',
    walletSupport: ['Custom implementations']
  }
]