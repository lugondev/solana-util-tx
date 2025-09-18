'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';

/**
 * Transaction page component for creating and sending real Solana transactions
 * Uses Solana wallet adapter for real transaction functionality
 */
export default function TransactionPage() {
  const [formData, setFormData] = useState({
    recipient: '',
    amount: 0,
    memo: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errors, setErrors] = useState<{[key: string]: string | undefined}>({});
  
  const { publicKey, connected, sendTransaction, disconnect } = useWallet();
  const { connection } = useConnection();

  /**
   * Validate form data before transaction creation
   */
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string | undefined} = {};

    // Validate recipient address
    if (!formData.recipient.trim()) {
      newErrors.recipient = 'Recipient address is required';
    } else {
      try {
        new PublicKey(formData.recipient);
      } catch {
        newErrors.recipient = 'Invalid Solana address format';
      }
    }

    // Validate amount
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Send real Solana transaction
   */
  const handleSendTransaction = async () => {
    if (!connected || !publicKey) {
      setResult({
        signature: '',
        success: false,
        error: 'Wallet not connected',
      });
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const recipientPubkey = new PublicKey(formData.recipient);
      const lamports = Math.round(formData.amount * LAMPORTS_PER_SOL);
      
      // Create transaction
      const transaction = new Transaction();
      
      // Add transfer instruction
      const transferInstruction = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPubkey,
        lamports,
      });
      
      transaction.add(transferInstruction);
      
      // Add memo instruction if provided
      if (formData.memo.trim()) {
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(formData.memo, 'utf8'),
        });
        transaction.add(memoInstruction);
      }
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      setResult({
        signature,
        success: true,
      });

      // Reset form on success
      setFormData({
        recipient: '',
        amount: 0,
        memo: '',
      });
    } catch (error) {
      console.error('Transaction error:', error);
      setResult({
        signature: '',
        success: false,
        error: error instanceof Error ? error.message : 'Transaction failed',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Open transaction in Solana Explorer
   */
  const openInExplorer = (signature: string) => {
    const url = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
    window.open(url, '_blank');
  };

  /**
   * Handle wallet disconnection
   */
  const handleDisconnect = async () => {
    try {
      await disconnect();
      setResult(null);
      setFormData({
        recipient: '',
        amount: 0,
        memo: '',
      });
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };

  if (!connected) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-gray-200 p-8 text-center">
          <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Wallet Not Connected</h1>
          <p className="text-gray-600 mb-6">Please connect your wallet to send transactions.</p>
          <div className="space-y-4">
            <WalletMultiButton />
            <button
              onClick={() => (window.location.href = '/')}
              className="bg-gray-600 text-white px-6 py-2 hover:bg-gray-700 ml-4"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Send Transaction</h1>
            <p className="text-gray-600">Create and broadcast Solana transactions securely</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-gray-600 text-white px-4 py-2 hover:bg-gray-700"
          >
            Disconnect
          </button>
        </div>
      </div>

      {/* Transaction Form */}
      <div className="bg-white border border-gray-200 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <Send className="h-6 w-6 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">SOL Transfer</h2>
        </div>

        <div className="space-y-4">
          {/* Recipient Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Address *
            </label>
            <input
              type="text"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="Enter Solana wallet address"
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                errors.recipient ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.recipient && (
              <p className="text-red-500 text-sm mt-1">{errors.recipient}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (SOL) *
            </label>
            <input
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              className={`w-full px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-gray-500 ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>

          {/* Memo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Memo (Optional)
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => handleInputChange('memo', e.target.value)}
              placeholder="Add a note to your transaction"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSendTransaction}
            disabled={loading}
            className="w-full bg-gray-600 text-white py-3 px-4 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send Transaction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transaction Result */}
      {result && (
        <div className="bg-white border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-gray-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-gray-600" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">
              {result.success ? 'Transaction Successful' : 'Transaction Failed'}
            </h3>
          </div>

          {result.success ? (
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Transaction Signature</p>
                <div className="flex items-center space-x-2">
                  <p className="font-mono text-sm text-gray-800 break-all flex-1">
                    {result.signature}
                  </p>
                  <button
                    onClick={() => openInExplorer(result.signature)}
                    className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Explorer</span>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-3">
                <p className="text-gray-700 text-sm">
                  Your transaction has been successfully submitted to the network.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 p-3">
              <p className="text-gray-700 text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
