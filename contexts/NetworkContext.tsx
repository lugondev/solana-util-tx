'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection } from '@solana/web3.js';
import { Network, DEFAULT_NETWORK, createConnection } from '@/lib/network';

interface NetworkContextType {
  network: Network;
  connection: Connection;
  customRpcUrl: string;
  setNetwork: (network: Network, customRpcUrl?: string) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetworkState] = useState<Network>(DEFAULT_NETWORK);
  const [customRpcUrl, setCustomRpcUrl] = useState<string>('');
  const [connection, setConnection] = useState<Connection>(() => createConnection(DEFAULT_NETWORK));

  // Load network from localStorage on client-side
  useEffect(() => {
    const savedNetwork = localStorage.getItem('solana-network') as Network;
    const savedCustomRpc = localStorage.getItem('solana-custom-rpc') || '';
    
    if (savedNetwork && (savedNetwork === 'devnet' || savedNetwork === 'testnet' || savedNetwork === 'mainnet-beta' || savedNetwork === 'custom')) {
      setNetworkState(savedNetwork);
      setCustomRpcUrl(savedCustomRpc);
      setConnection(createConnection(savedNetwork, savedCustomRpc));
    }
  }, []);

  const setNetwork = (newNetwork: Network, newCustomRpcUrl?: string) => {
    setNetworkState(newNetwork);
    const rpcUrl = newCustomRpcUrl || customRpcUrl;
    setCustomRpcUrl(rpcUrl);
    setConnection(createConnection(newNetwork, rpcUrl));
    localStorage.setItem('solana-network', newNetwork);
    if (newNetwork === 'custom' && rpcUrl) {
      localStorage.setItem('solana-custom-rpc', rpcUrl);
    }
  };

  return (
    <NetworkContext.Provider value={{ network, connection, customRpcUrl, setNetwork }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}