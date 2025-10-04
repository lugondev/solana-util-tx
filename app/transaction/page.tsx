'use client';

import React, { useState } from 'react';
import { Send, AlertCircle, CheckCircle, Loader, ExternalLink } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PixelWalletButton } from '@/components/ui/pixel-wallet-button';
import { 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL, 
  PublicKey,
  TransactionInstruction
} from '@solana/web3.js';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import { PixelInput } from '@/components/ui/pixel-input';
import { useNetwork } from '@/contexts/NetworkContext';
import { NETWORKS, getExplorerUrl } from '@/lib/network';

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
  const { connection, network } = useNetwork();

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
    const url = getExplorerUrl(signature, network);
    window.open(url, '_blank');
  };  /**
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
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--pixel-bg-primary)' }}>
        <div className="max-w-2xl mx-auto">
          <PixelCard>
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">💼</span>
              <h1 className="font-pixel text-xl mb-2" style={{ color: 'var(--pixel-accent)' }}>
                WALLET NOT CONNECTED
              </h1>
              <p className="font-mono text-sm mb-6" style={{ color: 'var(--pixel-text-secondary)' }}>
                Please connect your wallet to send transactions.
              </p>
              <div className="space-y-4">
                <PixelWalletButton variant="success" />
                <PixelButton
                  variant="secondary"
                  onClick={() => (window.location.href = '/')}
                >
                  [GO TO HOME]
                </PixelButton>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--pixel-bg-primary)' }}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <PixelCard>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-pixel text-xl mb-2" style={{ color: 'var(--pixel-accent)' }}>
                SEND TRANSACTION
              </h1>
              <p className="font-mono text-sm mb-2" style={{ color: 'var(--pixel-text-secondary)' }}>
                Create and broadcast Solana transactions securely
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-sm">{network === 'mainnet-beta' ? '🔴' : '🟠'}</span>
                <span className="font-pixel text-xs" style={{ 
                  color: network === 'mainnet-beta' ? 'var(--pixel-error)' : 'var(--pixel-accent)'
                }}>
                  {NETWORKS[network].label}
                </span>
              </div>
            </div>
            <PixelButton
              variant="danger"
              onClick={handleDisconnect}
            >
              [DISCONNECT]
            </PixelButton>
          </div>
        </PixelCard>

        {/* Transaction Form */}
        <PixelCard header="SOL TRANSFER">
          <div className="space-y-4">
            {/* Recipient Address */}
            <PixelInput
              label="RECIPIENT ADDRESS *"
              type="text"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="Enter Solana wallet address"
              error={errors.recipient}
              disabled={loading}
            />

            {/* Amount */}
            <PixelInput
              label="AMOUNT (SOL) *"
              type="number"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              step="0.000001"
              min="0"
              error={errors.amount}
              disabled={loading}
            />

            {/* Memo */}
            <div>
              <label className="font-pixel text-xs mb-2 uppercase block" style={{ color: 'var(--pixel-text-secondary)' }}>
                MEMO (OPTIONAL)
              </label>
              <textarea
                value={formData.memo}
                onChange={(e) => handleInputChange('memo', e.target.value)}
                placeholder="Add a note to your transaction"
                rows={3}
                className="w-full px-3 py-3 border-4 font-mono text-sm focus:outline-none"
                style={{
                  backgroundColor: 'var(--pixel-input-bg)',
                  borderColor: 'var(--pixel-input-border)',
                  color: 'var(--pixel-text-primary)'
                }}
                disabled={loading}
              />
            </div>

            {/* Send Button */}
            <PixelButton
              variant="primary"
              onClick={handleSendTransaction}
              disabled={loading}
              isLoading={loading}
              className="w-full"
            >
              [SEND TRANSACTION]
            </PixelButton>
          </div>
        </PixelCard>

        {/* Transaction Result */}
        {result && (
          <PixelCard>
            <div className="flex items-center space-x-3 mb-4">
              {result.success ? (
                <span className="text-2xl">✅</span>
              ) : (
                <span className="text-2xl">❌</span>
              )}
              <h3 className="font-pixel text-sm" style={{
                color: result.success ? 'var(--pixel-success)' : 'var(--pixel-error)'
              }}>
                {result.success ? 'TRANSACTION SUCCESSFUL' : 'TRANSACTION FAILED'}
              </h3>
            </div>

            {result.success ? (
              <div className="space-y-3">
                <div>
                  <p className="font-pixel text-xs mb-1 uppercase" style={{ color: 'var(--pixel-text-secondary)' }}>
                    TRANSACTION SIGNATURE
                  </p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-sm break-all flex-1" style={{ color: 'var(--pixel-text-primary)' }}>
                      {result.signature}
                    </p>
                    <PixelButton
                      variant="secondary"
                      size="sm"
                      onClick={() => openInExplorer(result.signature)}
                    >
                      🔗
                    </PixelButton>
                  </div>
                </div>
                <div className="p-3 border-4" style={{
                  backgroundColor: 'var(--pixel-bg-primary)',
                  borderColor: 'var(--pixel-success)'
                }}>
                  <p className="font-mono text-sm" style={{ color: 'var(--pixel-success)' }}>
                    Your transaction has been successfully submitted to the network.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 border-4" style={{
                backgroundColor: 'var(--pixel-bg-primary)',
                borderColor: 'var(--pixel-error)'
              }}>
                <p className="font-mono text-sm" style={{ color: 'var(--pixel-error)' }}>
                  {result.error}
                </p>
              </div>
            )}
          </PixelCard>
        )}
      </div>
    </div>
  );
}
