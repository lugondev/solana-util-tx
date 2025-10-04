import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://solana-util-tx.vercel.app'),
  title: {
    default: 'Solana Utility Tools - All-in-One Solana Transaction Platform',
    template: '%s | Solana Utility Tools'
  },
  description: 'Comprehensive Solana utility platform for token management, DeFi operations, transaction building, Jito bundles, and developer tools. Build, simulate, and execute Solana transactions with ease.',
  keywords: [
    'Solana',
    'blockchain',
    'cryptocurrency',
    'DeFi',
    'tokens',
    'NFT',
    'transaction',
    'Jito',
    'bundle',
    'developer tools',
    'wallet',
    'SPL tokens',
    'swap',
    'liquidity',
    'limit orders',
    'ALT',
    'Address Lookup Tables',
    'mint',
    'burn',
    'transfer',
    'simulation',
    'priority fees',
    'keypair generator'
  ],
  authors: [{ name: 'LugonDev', url: 'https://github.com/lugondev' }],
  creator: 'LugonDev',
  publisher: 'Solana Utility Tools',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://solana-util-tx.vercel.app',
    siteName: 'Solana Utility Tools',
    title: 'Solana Utility Tools - All-in-One Solana Transaction Platform',
    description: 'Comprehensive Solana utility platform for token management, DeFi operations, transaction building, Jito bundles, and developer tools.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Solana Utility Tools - All-in-One Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Solana Utility Tools - All-in-One Solana Platform',
    description: 'Comprehensive Solana utility platform for token management, DeFi operations, and developer tools.',
    images: ['/og-image.png'],
    creator: '@lugondev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code', // Thay thế bằng mã verification thực tế
  },
  category: 'technology',
  classification: 'Blockchain Tools',
  other: {
    'application-name': 'Solana Utility Tools',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'theme-color': '#10b981',
    'msapplication-TileColor': '#10b981',
  }
}