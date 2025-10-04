'use client'

import './globals.css'
import WalletProvider from '@/components/WalletProvider'
import Navigation from '@/components/Navigation'
import { NetworkSwitcher } from '@/components/NetworkSwitcher'
import { PixelWalletButton } from '@/components/ui/pixel-wallet-button'
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
						{/* Sidebar Navigation - Hidden on mobile */}
						<aside className='w-72 flex-shrink-0 hidden lg:block'>
							<Navigation />
						</aside>
						
						{/* Main Content */}
						<div className='flex-1 flex flex-col overflow-hidden'>
							{/* Top Bar */}
							<header className='h-20 bg-gray-800 border-b-4 border-green-400/20 flex items-center justify-between px-4 lg:px-8'>
								<div className='flex items-center gap-4 lg:gap-6'>
									{/* Mobile menu button - visible only on mobile */}
									<button className='lg:hidden p-2 text-green-400 hover:text-green-300'>
										<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
											<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
										</svg>
									</button>
									<NetworkSwitcher />
								</div>
								<div className='flex items-center gap-2 lg:gap-4'>
									<PixelWalletButton variant="success" />
								</div>
							</header>
							
							{/* Main Content Area */}
							<main className='flex-1 overflow-auto bg-gray-900 p-4 lg:p-8'>
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
