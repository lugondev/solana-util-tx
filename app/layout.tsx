import './globals.css'
import ClientLayout from './client-layout'
import {Press_Start_2P, VT323} from 'next/font/google'
import {metadata} from './metadata'
import type {Viewport} from 'next'

// Export metadata
export {metadata}

// Export viewport configuration
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: [
		{media: '(prefers-color-scheme: light)', color: '#10b981'},
		{media: '(prefers-color-scheme: dark)', color: '#10b981'},
	],
}

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
			<head>
				{/* Google Analytics */}
				<script async src='https://www.googletagmanager.com/gtag/js?id=G-DM1VCDF79S'></script>
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-DM1VCDF79S');
						`,
					}}
				/>
				<link rel='manifest' href='/manifest.json' />
				<link rel='icon' type='image/svg+xml' href='/favicon.svg' />
				<link rel='apple-touch-icon' href='/apple-touch-icon.svg' />
				<link rel='mask-icon' href='/logo.svg' color='#10b981' />
				<meta name='application-name' content='Solana Utility Tools' />
				<meta name='apple-mobile-web-app-capable' content='yes' />
				<meta name='apple-mobile-web-app-status-bar-style' content='black-translucent' />
				<meta name='apple-mobile-web-app-title' content='SolanaUtils' />
				<meta name='format-detection' content='telephone=no' />
				<meta name='mobile-web-app-capable' content='yes' />
				<meta name='msapplication-TileColor' content='#10b981' />
				<meta name='msapplication-tap-highlight' content='no' />
			</head>
			<body className='min-h-screen bg-gray-900 text-white font-mono'>
				<ClientLayout>{children}</ClientLayout>
			</body>
		</html>
	)
}
