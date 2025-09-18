'use client'

import './globals.css'
import {ConnectionProvider, WalletProvider} from '@solana/wallet-adapter-react'
import {WalletAdapterNetwork} from '@solana/wallet-adapter-base'
import {PhantomWalletAdapter, SolflareWalletAdapter} from '@solana/wallet-adapter-wallets'
import {WalletModalProvider, WalletMultiButton} from '@solana/wallet-adapter-react-ui'
import {clusterApiUrl} from '@solana/web3.js'
import {useMemo} from 'react'
import Link from 'next/link'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

export default function RootLayout({children}: {children: React.ReactNode}) {
	// The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
	const network = WalletAdapterNetwork.Mainnet

	// Use custom RPC endpoint from environment variable or fallback to default
	const endpoint = useMemo(() => {
		return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
	}, [network])

	const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

	return (
		<html lang='en'>
			<body className='min-h-screen bg-gray-50'>
				<ConnectionProvider endpoint={endpoint}>
					<WalletProvider wallets={wallets} autoConnect>
						<WalletModalProvider>
							<nav className='bg-white shadow-sm border-b'>
								<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
									<div className='flex justify-between h-16'>
										<div className='flex items-center space-x-8'>
											<Link href='/' className='text-xl font-bold text-gray-900'>
												Solana Utils
											</Link>
											<div className='flex space-x-6'>
												<Link href='/' className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
													Home
												</Link>
												<Link href='/wallet' className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
													Wallet
												</Link>
												<Link href='/transaction' className='text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium'>
													Transaction
												</Link>
											</div>
										</div>
										<div className='flex items-center'>
											<WalletMultiButton className='!bg-gray-900 hover:!bg-gray-700' />
										</div>
									</div>
								</div>
							</nav>
							<main className='container mx-auto px-4 py-8'>{children}</main>
						</WalletModalProvider>
					</WalletProvider>
				</ConnectionProvider>
			</body>
		</html>
	)
}
