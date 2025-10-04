'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Connection } from '@solana/web3.js';
import { Network, DEFAULT_NETWORK, createConnection } from '@/lib/network';

interface NetworkContextType {
  network: Network;
  connection: Connection;
  setNetwork: (network: Network) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [network, setNetworkState] = useState<Network>(DEFAULT_NETWORK);
  const [connection, setConnection] = useState<Connection>(() => createConnection(DEFAULT_NETWORK));

  // Load network from localStorage on client-side
  useEffect(() => {
    const savedNetwork = localStorage.getItem('solana-network') as Network;
    if (savedNetwork && (savedNetwork === 'devnet' || savedNetwork === 'mainnet-beta')) {
      setNetworkState(savedNetwork);
      setConnection(createConnection(savedNetwork));
    }
  }, []);

  const setNetwork = (newNetwork: Network) => {
    setNetworkState(newNetwork);
    setConnection(createConnection(newNetwork));
    localStorage.setItem('solana-network', newNetwork);
  };

  return (
    <NetworkContext.Provider value={{ network, connection, setNetwork }}>
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