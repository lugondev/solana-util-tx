'use client'

import React, {FC, ReactNode, useMemo} from 'react'
import {ConnectionProvider, WalletProvider as SolanaWalletProvider} from '@solana/wallet-adapter-react'
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base'
import {PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter, LedgerWalletAdapter} from '@solana/wallet-adapter-wallets'
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui'
import {clusterApiUrl} from '@solana/web3.js'
import {NetworkProvider, useNetwork} from '@/contexts/NetworkContext'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletProviderProps {
	children: ReactNode
}

/**
 * Inner WalletProvider that uses NetworkContext
 */
const WalletProviderInner: FC<WalletProviderProps> = ({children}) => {
	const { network, connection } = useNetwork()

	// Configure wallet adapters based on current network
	const wallets = useMemo(
		() => [
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({network: network === 'mainnet-beta' ? WalletAdapterNetwork.Mainnet : WalletAdapterNetwork.Devnet}),
			new TorusWalletAdapter(),
			new LedgerWalletAdapter(),
		],
		[network],
	)

	return (
		<ConnectionProvider endpoint={connection.rpcEndpoint}>
			<SolanaWalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>{children}</WalletModalProvider>
			</SolanaWalletProvider>
		</ConnectionProvider>
	)
}

/**
 * WalletProvider component that wraps the application with Solana wallet functionality
 * Provides connection to Solana network and wallet adapters with network switching
 */
export const WalletProvider: FC<WalletProviderProps> = ({children}) => {
	return (
		<NetworkProvider>
			<WalletProviderInner>
				{children}
			</WalletProviderInner>
		</NetworkProvider>
	)
}

export default WalletProvider
