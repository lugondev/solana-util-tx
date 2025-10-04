'use client';

import React, { useState } from 'react';
import { useNetwork } from '@/contexts/NetworkContext';
import { NETWORKS } from '@/lib/network';
import { PixelButton } from '@/components/ui/pixel-button';

export function NetworkSwitcher() {
  const { network, setNetwork } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkChange = (newNetwork: typeof network) => {
    setNetwork(newNetwork);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <PixelButton
        variant={network === 'mainnet-beta' ? 'danger' : 'secondary'}
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {network === 'mainnet-beta' ? '🔴' : '🟠'} {NETWORKS[network].label}
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
              
              {Object.entries(NETWORKS).map(([key, config]) => (
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
                      {key === 'mainnet-beta' ? '🔴' : '🟠'} {config.label}
                    </span>
                    {network === key && (
                      <span style={{ color: 'var(--pixel-bg-primary)' }}>✓</span>
                    )}
                  </div>
                  <div className="text-xs mt-1 opacity-75">
                    {key === 'mainnet-beta' ? 'Production network' : 'Development network'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}