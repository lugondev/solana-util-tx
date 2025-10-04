import { Connection, PublicKey, Transaction, Keypair, SystemProgram } from '@solana/web3.js'
import { readFileSync } from 'fs'

/**
 * Solana program deployment types and interfaces
 */

export interface ProgramDeploymentConfig {
  programName: string
  programId?: PublicKey
  upgradeAuthority?: PublicKey
  maxDataLen?: number
  lamports?: number
}

export interface DeploymentResult {
  programId: PublicKey
  signature: string
  upgradeAuthority?: PublicKey
  cost: number
  deploymentSlot: number
}

export interface ProgramUpgradeParams {
  programId: PublicKey
  bufferAccount: PublicKey
  upgradeAuthority: PublicKey
  spillAccount?: PublicKey
}

export interface ProgramCloseParams {
  programId: PublicKey
  recipient: PublicKey
  authority: PublicKey
}

export interface IDLDeploymentParams {
  programId: PublicKey
  idl: any
  authority: PublicKey
}

export interface ProgramData {
  slot: number
  upgradeAuthority?: PublicKey
  lastDeployedSlot: number
  dataLen: number
}

export interface BufferAccount {
  authority?: PublicKey
  data: Buffer
}

export interface DeploymentStats {
  totalDeployments: number
  totalCost: number
  avgCost: number
  successRate: number
  lastDeployment?: Date
}

// Program deployment loader IDs
export const BPF_LOADER_PROGRAM_ID = new PublicKey('BPFLoader2111111111111111111111111111111111')
export const BPF_LOADER_UPGRADEABLE_PROGRAM_ID = new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')

// Common program sizes and costs
export const PROGRAM_SIZE_LIMITS = {
  small: 32 * 1024,      // 32KB
  medium: 128 * 1024,    // 128KB  
  large: 512 * 1024,     // 512KB
  xlarge: 1024 * 1024,   // 1MB
}

export const DEPLOYMENT_COSTS = {
  baseRent: 0.00203928,           // Base rent exemption
  perByte: 0.000000696,           // Cost per byte
  upgradeableProgramFee: 0.05,    // Additional fee for upgradeable programs
  bufferAccountFee: 0.002,        // Buffer account creation
}