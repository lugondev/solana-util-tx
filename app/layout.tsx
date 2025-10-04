'use client'

import './globals.css'
import WalletProvider from '@/components/WalletProvider'
import Navigation from '@/components/Navigation'
import { NetworkSwitcher } from '@/components/NetworkSwitcher'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Press_Start_2P, VT323 } from 'next/font/google'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

// Pixel fonts
const pressStart2P = Press_Start_2P({
	weight: '400',
	subsets: ['latin'],
	variable: '--font-pixel',
	display: 'swap',
})

const vt323 = VT323({
	weight: '400',
	subsets: ['latin'],
	variable: '--font-mono',
	display: 'swap',
})

export default function RootLayout({children}: {children: React.ReactNode}) {
	return (
		<html lang='en' className={`${pressStart2P.variable} ${vt323.variable}`}>
			<body className='min-h-screen bg-gray-900 text-white font-mono'>
				<WalletProvider>
					<div className='flex h-screen'>
						{/* Sidebar Navigation */}
						<aside className='w-64 flex-shrink-0'>
							<Navigation />
						</aside>
						
						{/* Main Content */}
						<div className='flex-1 flex flex-col overflow-hidden'>
							{/* Top Bar */}
							<header className='h-16 bg-gray-800 border-b-4 border-green-400/20 flex items-center justify-between px-6'>
								<div className='flex items-center gap-4'>
									<NetworkSwitcher />
								</div>
								<div className='flex items-center gap-4'>
									<WalletMultiButton className='!bg-green-400 hover:!bg-green-400/80 !text-gray-900 !font-pixel !text-xs !py-2 !px-4' />
								</div>
							</header>
							
							{/* Main Content Area */}
							<main className='flex-1 overflow-auto bg-gray-900 p-6'>
								{children}
							</main>
						</div>
					</div>
					
					{/* Scanline Effect */}
					<div className='fixed inset-0 pointer-events-none z-50 opacity-10'>
						<div className='absolute inset-0' style={{
							backgroundImage: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, transparent 1px, transparent 2px, rgba(0, 0, 0, 0.1) 3px)'
						}} />
					</div>
				</WalletProvider>
			</body>
		</html>
	)
}
