import { PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { WalletAdapter } from '@solana/wallet-adapter-base';

/**
 * Wallet connection state interface
 */
export interface WalletState {
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  publicKey: PublicKey | null;
  wallet: WalletAdapter | null;
}

/**
 * Wallet information interface
 */
export interface WalletInfo {
  publicKey: string;
  balance: number;
  walletName: string;
  connected: boolean;
}

/**
 * Transaction data interface
 */
export interface TransactionData {
  id: string;
  signature?: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount?: number;
  recipient?: string;
  timestamp: Date;
  type: 'transfer' | 'custom';
}

/**
 * Transaction form data interface
 */
export interface TransactionFormData {
  recipient: string;
  amount: number;
  memo?: string;
}

/**
 * Transaction result interface
 */
export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Wallet adapter context interface
 */
export interface WalletContextType {
  wallet: WalletAdapter | null;
  publicKey: PublicKey | null;
  connected: boolean;
  connecting: boolean;
  disconnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string>;
  signTransaction?: (transaction: Transaction | VersionedTransaction) => Promise<Transaction | VersionedTransaction>;
  signAllTransactions?: (transactions: (Transaction | VersionedTransaction)[]) => Promise<(Transaction | VersionedTransaction)[]>;
}

/**
 * API response interface
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Network configuration interface
 */
export interface NetworkConfig {
  name: string;
  endpoint: string;
  chainId?: string;
}

/**
 * Application state interface
 */
export interface AppState {
  network: NetworkConfig;
  walletState: WalletState;
  transactions: TransactionData[];
  loading: boolean;
  error: string | null;
}