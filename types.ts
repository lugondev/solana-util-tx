/**
 * Type definitions for the Solana Utility Transaction App
 */

// Wallet related types
export interface WalletInfo {
  publicKey: string;
  balance: number;
  isConnected: boolean;
}

// Transaction related types
export interface TransactionFormData {
  recipient: string;
  amount: number;
  memo?: string;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

// Common utility types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}