'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { NETWORKS } from '@/lib/network';
import { PixelButton } from '@/components/ui/pixel-button';

export function NetworkSwitcher() {
  const { network, customRpcUrl, setNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customRpcInput, setCustomRpcInput] = useState(customRpcUrl);

  const handleNetworkChange = (newNetwork: typeof network) => {
    if (newNetwork === 'custom') {
      setShowCustomInput(true);
    } else {
      setNetwork(newNetwork);
      setIsOpen(false);
      setShowCustomInput(false);
    }
  };

  const handleCustomRpcSubmit = () => {
    if (customRpcInput.trim()) {
      setNetwork('custom', customRpcInput.trim());
      setIsOpen(false);
      setShowCustomInput(false);
    }
  };

  const getNetworkEmoji = () => {
    switch (network) {
      case 'mainnet-beta': return '🔴';
      case 'testnet': return '🟡';
      case 'devnet': return '🟠';
      case 'custom': return '🔵';
      default: return '🟠';
    }
  };

  return (
    <div className="relative">
      <PixelButton
        variant={network === 'mainnet-beta' ? 'danger' : 'secondary'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getNetworkEmoji()} {NETWORKS[network].label}
      </PixelButton>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div 
            className="absolute top-full right-0 mt-2 z-20 border-4 min-w-48"
            style={{
              backgroundColor: 'var(--pixel-bg-secondary)',
              borderColor: 'var(--pixel-border-primary)'
            }}
          >
            <div className="p-2 space-y-1">
              <div className="px-3 py-2">
                <p className="font-pixel text-xs uppercase" style={{ color: 'var(--pixel-text-secondary)' }}>
                  SELECT NETWORK
                </p>
              </div>
              
              {showCustomInput ? (
                <div className="px-3 py-2 space-y-2">
                  <div>
                    <label 
                      htmlFor="custom-rpc" 
                      className="block font-mono text-xs mb-1"
                      style={{ color: 'var(--pixel-text-primary)' }}
                    >
                      Custom RPC URL
                    </label>
                    <input
                      id="custom-rpc"
                      type="text"
                      value={customRpcInput}
                      onChange={(e) => setCustomRpcInput(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-2 py-1 font-mono text-sm border-2"
                      style={{
                        backgroundColor: 'var(--pixel-bg-primary)',
                        borderColor: 'var(--pixel-border-secondary)',
                        color: 'var(--pixel-text-primary)'
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleCustomRpcSubmit();
                        } else if (e.key === 'Escape') {
                          setShowCustomInput(false);
                        }
                      }}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomRpcSubmit}
                      className="flex-1 px-2 py-1 font-mono text-sm border-2"
                      style={{
                        backgroundColor: 'var(--pixel-accent)',
                        borderColor: 'var(--pixel-accent)',
                        color: 'var(--pixel-bg-primary)'
                      }}
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => setShowCustomInput(false)}
                      className="flex-1 px-2 py-1 font-mono text-sm border-2"
                      style={{
                        backgroundColor: 'var(--pixel-bg-primary)',
                        borderColor: 'var(--pixel-border-secondary)',
                        color: 'var(--pixel-text-primary)'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {Object.entries(NETWORKS).map(([key, config]) => {
                    const getEmoji = () => {
                      switch (key) {
                        case 'mainnet-beta': return '🔴';
                        case 'testnet': return '🟡';
                        case 'devnet': return '🟠';
                        case 'custom': return '🔵';
                        default: return '🟠';
                      }
                    };
                    
                    const getDescription = () => {
                      switch (key) {
                        case 'mainnet-beta': return 'Production network';
                        case 'testnet': return 'Testing network';
                        case 'devnet': return 'Development network';
                        case 'custom': return customRpcUrl || 'Your custom RPC endpoint';
                        default: return 'Development network';
                      }
                    };

                    return (
                      <button
                        key={key}
                        onClick={() => handleNetworkChange(key as typeof network)}
                        className="w-full px-3 py-2 text-left font-mono text-sm border-2 transition-colors"
                        style={{
                          backgroundColor: network === key ? 'var(--pixel-accent)' : 'var(--pixel-bg-primary)',
                          borderColor: network === key ? 'var(--pixel-accent)' : 'var(--pixel-border-secondary)',
                          color: network === key ? 'var(--pixel-bg-primary)' : 'var(--pixel-text-primary)'
                        }}
                        onMouseEnter={(e) => {
                          if (network !== key) {
                            e.currentTarget.style.borderColor = 'var(--pixel-accent)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (network !== key) {
                            e.currentTarget.style.borderColor = 'var(--pixel-border-secondary)';
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {getEmoji()} {config.label}
                          </span>
                          {network === key && (
                            <span style={{ color: 'var(--pixel-bg-primary)' }}>✓</span>
                          )}
                        </div>
                        <div className="text-xs mt-1 opacity-75 truncate">
                          {getDescription()}
                        </div>
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}