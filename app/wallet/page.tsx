'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { LAMPORTS_PER_SOL, Transaction } from '@solana/web3.js';
import { PixelCard } from '@/components/ui/pixel-card';
import { PixelButton } from '@/components/ui/pixel-button';
import { useNetwork } from '@/contexts/NetworkContext';
import { NETWORKS } from '@/lib/network';

interface WalletInfo {
  balance: number;
  connected: boolean;
  publicKey: string | null;
}

export default function WalletPage() {
  const { connected, publicKey, disconnect, signTransaction } = useWallet();
  const { connection, network } = useNetwork();
  const [walletInfo, setWalletInfo] = useState<WalletInfo>({
    balance: 0,
    connected: false,
    publicKey: null,
  });
  const [loading, setLoading] = useState(false);
  const [signatureResult, setSignatureResult] = useState<string | null>(null);

  const fetchWalletInfo = useCallback(async () => {
    if (!connection || !publicKey) return;

    try {
      setLoading(true);
      const balance = await connection.getBalance(publicKey);
      
      setWalletInfo({
        balance: balance / LAMPORTS_PER_SOL,
        connected: true,
        publicKey: publicKey.toString(),
      });
    } catch (error) {
      console.error('Error fetching wallet info:', error);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  // Update wallet info when connection changes
  useEffect(() => {
    if (connected && publicKey) {
      fetchWalletInfo();
    } else {
      setWalletInfo({
        balance: 0,
        connected: false,
        publicKey: null,
      });
    }
  }, [connected, publicKey, fetchWalletInfo]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setSignatureResult(null);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  const testSignature = async () => {
    if (!connection || !publicKey || !signTransaction) {
      return;
    }

    try {
      setLoading(true);
      
      // Create a simple test transaction
      const transaction = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Sign the transaction
      const signedTransaction = await signTransaction(transaction);
      const signature = signedTransaction.signature?.toString('base64');
      
      setSignatureResult(signature || 'No signature generated');
    } catch (error) {
      console.error('Error signing transaction:', error);
      setSignatureResult('Error: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--pixel-bg-primary)' }}>
        <div className="max-w-2xl mx-auto">
          <PixelCard>
            <div className="text-center py-8">
              <span className="text-6xl mb-4 block">👛</span>
              <h1 className="font-pixel text-xl mb-2" style={{ color: 'var(--pixel-accent)' }}>
                WALLET MANAGEMENT
              </h1>
              <p className="font-mono text-sm mb-6" style={{ color: 'var(--pixel-text-secondary)' }}>
                Connect your wallet to view balance and manage transactions.
              </p>
              <div className="space-y-4">
                <WalletMultiButton />
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
                WALLET DASHBOARD
              </h1>
              <p className="font-mono text-sm" style={{ color: 'var(--pixel-text-secondary)' }}>
                Monitor your Solana wallet and test transaction features
              </p>
            </div>
            <PixelButton
              variant="danger"
              onClick={handleDisconnect}
            >
              [DISCONNECT]
            </PixelButton>
          </div>
        </PixelCard>

        {/* Wallet Info */}
        <PixelCard header="WALLET INFORMATION">
          <div className="space-y-4">
            {/* Network Status */}
            <div>
              <p className="font-pixel text-xs mb-2 uppercase" style={{ color: 'var(--pixel-text-secondary)' }}>
                CURRENT NETWORK
              </p>
              <div className="p-3 border-2" style={{ 
                backgroundColor: 'var(--pixel-bg-primary)', 
                borderColor: network === 'mainnet-beta' ? 'var(--pixel-error)' : 'var(--pixel-accent)'
              }}>
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{network === 'mainnet-beta' ? '🔴' : '🟠'}</span>
                  <span className="font-pixel text-sm" style={{ 
                    color: network === 'mainnet-beta' ? 'var(--pixel-error)' : 'var(--pixel-accent)'
                  }}>
                    {NETWORKS[network].label}
                  </span>
                </div>
              </div>
            </div>

            {/* Public Key */}
            <div>
              <p className="font-pixel text-xs mb-2 uppercase" style={{ color: 'var(--pixel-text-secondary)' }}>
                PUBLIC KEY
              </p>
              <div className="p-3 border-2" style={{ 
                backgroundColor: 'var(--pixel-bg-primary)', 
                borderColor: 'var(--pixel-border-secondary)' 
              }}>
                <p className="font-mono text-xs break-all" style={{ color: 'var(--pixel-text-primary)' }}>
                  {walletInfo.publicKey}
                </p>
              </div>
            </div>

            {/* Balance */}
            <div>
              <p className="font-pixel text-xs mb-2 uppercase" style={{ color: 'var(--pixel-text-secondary)' }}>
                BALANCE
              </p>
              <div className="p-4 border-4" style={{ 
                backgroundColor: 'var(--pixel-bg-secondary)', 
                borderColor: 'var(--pixel-accent)' 
              }}>
                <div className="flex items-center justify-between">
                  <span className="font-pixel text-lg" style={{ color: 'var(--pixel-accent)' }}>
                    {loading ? 'LOADING...' : `${walletInfo.balance.toFixed(6)} SOL`}
                  </span>
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    onClick={fetchWalletInfo}
                    disabled={loading}
                  >
                    🔄
                  </PixelButton>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <PixelButton
                variant="primary"
                onClick={() => (window.location.href = '/transaction')}
              >
                [SEND SOL]
              </PixelButton>
              <PixelButton
                variant="secondary"
                onClick={testSignature}
                disabled={loading}
                isLoading={loading}
              >
                [TEST SIGN]
              </PixelButton>
            </div>
          </div>
        </PixelCard>

        {/* Signature Test Result */}
        {signatureResult && (
          <PixelCard header="SIGNATURE TEST RESULT">
            <div className="space-y-3">
              <div className="p-3 border-2" style={{ 
                backgroundColor: 'var(--pixel-bg-primary)', 
                borderColor: signatureResult.startsWith('Error') ? 'var(--pixel-error)' : 'var(--pixel-success)'
              }}>
                <p className="font-mono text-xs break-all" style={{ 
                  color: signatureResult.startsWith('Error') ? 'var(--pixel-error)' : 'var(--pixel-success)'
                }}>
                  {signatureResult}
                </p>
              </div>
              <PixelButton
                variant="secondary"
                size="sm"
                onClick={() => setSignatureResult(null)}
              >
                [CLEAR]
              </PixelButton>
            </div>
          </PixelCard>
        )}

        {/* Connection Status */}
        <PixelCard>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🟢</span>
              <div>
                <p className="font-pixel text-sm" style={{ color: 'var(--pixel-success)' }}>
                  WALLET CONNECTED
                </p>
                <p className="font-mono text-xs" style={{ color: 'var(--pixel-text-secondary)' }}>
                  Ready for transactions
                </p>
              </div>
            </div>
            <WalletMultiButton />
          </div>
        </PixelCard>
      </div>
    </div>
  );
}