import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://solutil.dev'),
  title: {
    default: 'Solana Utility Tools - All-in-One Solana Transaction Platform',
    template: '%s | Solana Utility Tools'
  },
  description: 'Professional 40+ tool platform for Solana blockchain development, DeFi trading, transaction building, and developer utilities. Build, simulate, and execute Solana transactions with ease.',
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
    'keypair generator',
    'vanity address',
    'transaction parser',
    'Jupiter DEX',
    'MEV protection',
    'Borsh inspector',
    'program versioning',
    'multisig wallet',
    'bulk operations',
    'analytics dashboard'
  ],
  authors: [{ name: 'LugonDev', url: 'https://github.com/lugondev' }],
  creator: 'LugonDev',
  publisher: 'Solana Utility Tools',
  applicationName: 'Solana Utility Tools',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://solutil.dev',
    siteName: 'Solana Utility Tools',
    title: 'Solana Utility Tools - All-in-One Solana Transaction Platform',
    description: 'Professional 40+ tool platform for Solana blockchain development, DeFi trading, transaction building, and developer utilities.',
    // Primary OG image is generated at build time by app/opengraph-image.tsx (PNG)
    // — Twitter/Facebook/LinkedIn/Discord don't render SVG previews reliably.
  },
  twitter: {
    card: 'summary_large_image',
    site: '@lugondev',
    creator: '@lugondev',
    title: 'Solana Utility Tools - 40+ Professional Blockchain Tools',
    description: 'Professional platform for Solana development: transaction parsing, DEX trading, MEV protection, token management, and 40+ developer utilities.',
    // Twitter image is generated at build time by app/twitter-image.tsx (PNG)
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
  icons: {
    icon: [
      {
        url: '/favicon.svg',
        type: 'image/svg+xml',
      },
    ],
    shortcut: '/favicon.svg',
    apple: [
      {
        url: '/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/logo.svg',
        color: '#10b981',
      },
    ],
  },
  manifest: '/manifest.json',
  category: 'technology',
  classification: 'Blockchain Development Tools',
  other: {
    'application-name': 'Solana Utility Tools',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'SolanaUtils',
    'theme-color': '#10b981',
    'msapplication-TileColor': '#10b981',
    'msapplication-config': '/browserconfig.xml',
    'msapplication-TileImage': '/icon-512.svg',
    'msapplication-square70x70logo': '/icon-192.svg',
    'msapplication-square150x150logo': '/icon-192.svg',
    'msapplication-wide310x150logo': '/og-image.svg',
    'msapplication-square310x310logo': '/icon-512.svg',
  }
}