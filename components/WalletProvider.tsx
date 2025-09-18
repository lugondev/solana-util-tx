'use client'

import React, {FC, ReactNode, useMemo} from 'react'
import {ConnectionProvider, WalletProvider as SolanaWalletProvider} from '@solana/wallet-adapter-react'
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base'
import {PhantomWalletAdapter, SolflareWalletAdapter, TorusWalletAdapter, LedgerWalletAdapter} from '@solana/wallet-adapter-wallets'
import {WalletModalProvider} from '@solana/wallet-adapter-react-ui'
import {clusterApiUrl} from '@solana/web3.js'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface WalletProviderProps {
	children: ReactNode
}

/**
 * WalletProvider component that wraps the application with Solana wallet functionality
 * Provides connection to Solana network and wallet adapters
 */
export const WalletProvider: FC<WalletProviderProps> = ({children}) => {
	// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
	const network = WalletAdapterNetwork.Mainnet

	// Use custom RPC endpoint from environment variable or fallback to default
	const endpoint = useMemo(() => {
		const customRpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL
		return customRpcUrl || clusterApiUrl(network)
	}, [network])

	// Configure wallet adapters
	const wallets = useMemo(
		() => [
			/**
			 * Wallets that implement either of these interfaces will be available in your app:
			 * - Solana Mobile Stack Mobile Wallet Adapter Protocol
			 * - Solana Wallet Standard
			 */
			new PhantomWalletAdapter(),
			new SolflareWalletAdapter({network}),
			new TorusWalletAdapter(),
			new LedgerWalletAdapter(),
		],
		[network],
	)

	return (
		<ConnectionProvider endpoint={endpoint}>
			<SolanaWalletProvider wallets={wallets} autoConnect>
				<WalletModalProvider>{children}</WalletModalProvider>
			</SolanaWalletProvider>
		</ConnectionProvider>
	)
}

export default WalletProvider
