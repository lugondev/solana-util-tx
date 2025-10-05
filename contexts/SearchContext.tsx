'use client'

import { createContext, useContext, useCallback } from 'react'

export interface SearchableItem {
  id: string
  title: string
  description: string
  href: string
  category: string
  keywords: string[]
  icon?: string
}

interface SearchContextType {
  searchItems: SearchableItem[]
  registerItem: (item: SearchableItem) => void
  unregisterItem: (id: string) => void
  search: (query: string) => SearchableItem[]
}

const SearchContext = createContext<SearchContextType | null>(null)

export function useSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const searchItems: SearchableItem[] = [
    // Developer Tools
    {
      id: 'transaction-parser',
      title: 'Transaction Parser',
      description: 'Decode raw transactions thành human-readable format',
      href: '/dev-tools/transaction-parser',
      category: 'Dev Tools',
      keywords: ['transaction', 'parse', 'decode', 'raw', 'tx'],
      icon: '🔍'
    },
    {
      id: 'vanity-generator',
      title: 'Vanity Address Generator',
      description: 'Generate custom Solana addresses với specific prefixes',
      href: '/dev-tools/vanity-generator',
      category: 'Dev Tools',
      keywords: ['vanity', 'address', 'custom', 'prefix', 'generate'],
      icon: '✨'
    },
    {
      id: 'bulk-keypair',
      title: 'Bulk Keypair Generator',
      description: 'Tạo hàng loạt wallets với multiple export formats',
      href: '/dev-tools/bulk-keypair',
      category: 'Dev Tools',
      keywords: ['bulk', 'keypair', 'wallet', 'generate', 'mass'],
      icon: '📦'
    },
    {
      id: 'idl-generator',
      title: 'IDL Generator',
      description: 'Auto-generate IDL từ deployed programs',
      href: '/dev-tools/idl-generator',
      category: 'Dev Tools',
      keywords: ['idl', 'interface', 'program', 'anchor', 'generate'],
      icon: '📋'
    },
    {
      id: 'pda-brute-force',
      title: 'PDA Brute Forcer',
      description: 'Find Program Derived Addresses với constraints',
      href: '/dev-tools/pda-brute-force',
      category: 'Dev Tools',
      keywords: ['pda', 'program', 'derived', 'address', 'brute', 'force'],
      icon: '🎯'
    },

    // Data Tools
    {
      id: 'borsh-inspector',
      title: 'Borsh Inspector',
      description: 'Decode/encode Borsh data với custom schemas',
      href: '/data-tools/borsh-inspector',
      category: 'Data Tools',
      keywords: ['borsh', 'decode', 'encode', 'binary', 'schema'],
      icon: '🔍'
    },
    {
      id: 'event-parser',
      title: 'Event Log Parser',
      description: 'Parse và analyze transaction logs and events',
      href: '/data-tools/event-parser',
      category: 'Data Tools',
      keywords: ['event', 'log', 'parse', 'transaction', 'analyze'],
      icon: '📊'
    },

    // Advanced Tools
    {
      id: 'program-versioning',
      title: 'Program Version Manager',
      description: 'Manage program versions và upgrade history',
      href: '/advanced-tools/program-versioning',
      category: 'Advanced Tools',
      keywords: ['program', 'version', 'upgrade', 'manage', 'history'],
      icon: '📝'
    },

    // DeFi Tools
    {
      id: 'jupiter-swap',
      title: 'Jupiter Swap',
      description: 'Token swapping với best rates',
      href: '/defi/swap',
      category: 'DeFi',
      keywords: ['swap', 'token', 'trade', 'jupiter', 'exchange'],
      icon: '🔄'
    },

    // Token Management
    {
      id: 'token-mint',
      title: 'Token Mint',
      description: 'Create new SPL tokens',
      href: '/tokens/mint',
      category: 'Tokens',
      keywords: ['token', 'mint', 'create', 'spl', 'new'],
      icon: '🏭'
    },
    {
      id: 'token-transfer',
      title: 'Token Transfer',
      description: 'Send tokens với advanced features',
      href: '/tokens/transfer',
      category: 'Tokens',
      keywords: ['token', 'transfer', 'send', 'move', 'spl'],
      icon: '💸'
    },
    {
      id: 'token-burn',
      title: 'Token Burn',
      description: 'Burn tokens safely',
      href: '/tokens/burn',
      category: 'Tokens',
      keywords: ['token', 'burn', 'destroy', 'remove', 'spl'],
      icon: '🔥'
    },

    // Transaction Tools
    {
      id: 'transaction-send',
      title: 'Send Transaction',
      description: 'Execute transactions với monitoring',
      href: '/transaction/send',
      category: 'Transactions',
      keywords: ['transaction', 'send', 'execute', 'submit'],
      icon: '📤'
    },
    {
      id: 'transaction-simulate',
      title: 'Transaction Simulator',
      description: 'Test transactions before sending',
      href: '/transaction/simulate',
      category: 'Transactions',
      keywords: ['transaction', 'simulate', 'test', 'dry', 'run'],
      icon: '🧪'
    },
    {
      id: 'enhanced-simulate',
      title: 'Enhanced Simulator',
      description: 'Advanced simulation với detailed analysis',
      href: '/transaction/enhanced-simulate',
      category: 'Transactions',
      keywords: ['enhanced', 'simulate', 'advanced', 'analysis'],
      icon: '🔬'
    },

    // Account Management
    {
      id: 'account-explorer',
      title: 'Account Explorer',
      description: 'Explore account details và history',
      href: '/accounts/explorer',
      category: 'Accounts',
      keywords: ['account', 'explore', 'details', 'info', 'history'],
      icon: '🔍'
    },
    {
      id: 'pda-calculator',
      title: 'PDA Calculator',
      description: 'Calculate Program Derived Addresses',
      href: '/accounts/pda',
      category: 'Accounts',
      keywords: ['pda', 'calculate', 'program', 'derived', 'address'],
      icon: '🧮'
    },

    // ALT Tools
    {
      id: 'alt-create',
      title: 'Create ALT',
      description: 'Create Address Lookup Tables',
      href: '/alt/create',
      category: 'ALT',
      keywords: ['alt', 'address', 'lookup', 'table', 'create'],
      icon: '📋'
    },
    {
      id: 'alt-manage',
      title: 'Manage ALT',
      description: 'Track and manage ALTs',
      href: '/alt/manage',
      category: 'ALT',
      keywords: ['alt', 'manage', 'track', 'address', 'lookup'],
      icon: '🔧'
    },
    {
      id: 'alt-explorer',
      title: 'ALT Explorer',
      description: 'Explore ALT contents and benefits',
      href: '/alt/explorer',
      category: 'ALT',
      keywords: ['alt', 'explore', 'contents', 'benefits', 'address'],
      icon: '🔍'
    },

    // Jito Tools
    {
      id: 'jito-bundle',
      title: 'Jito Bundle',
      description: 'MEV protected transaction bundles',
      href: '/jito/bundle',
      category: 'Jito',
      keywords: ['jito', 'bundle', 'mev', 'protection', 'transaction'],
      icon: '🚀'
    },

    // Wallet Tools
    {
      id: 'wallet-overview',
      title: 'Wallet Overview',
      description: 'Portfolio tracking và management',
      href: '/wallet',
      category: 'Wallet',
      keywords: ['wallet', 'portfolio', 'balance', 'overview', 'manage'],
      icon: '💰'
    },
    {
      id: 'multisig-wallet',
      title: 'Multisig Wallet',
      description: 'Multi-signature wallet management',
      href: '/wallet/multisig',
      category: 'Wallet',
      keywords: ['multisig', 'multi', 'signature', 'wallet', 'secure'],
      icon: '🔐'
    }
  ]

  const registerItem = useCallback((item: SearchableItem) => {
    // In a real implementation, you might want to manage state here
    console.log('Registering search item:', item.title)
  }, [])

  const unregisterItem = useCallback((id: string) => {
    // In a real implementation, you might want to manage state here
    console.log('Unregistering search item:', id)
  }, [])

  const search = useCallback((query: string): SearchableItem[] => {
    if (!query.trim()) return []

    const normalizedQuery = query.toLowerCase().trim()
    
    return searchItems
      .filter(item => {
        // Search in title
        if (item.title.toLowerCase().includes(normalizedQuery)) return true
        
        // Search in description
        if (item.description.toLowerCase().includes(normalizedQuery)) return true
        
        // Search in category
        if (item.category.toLowerCase().includes(normalizedQuery)) return true
        
        // Search in keywords
        if (item.keywords.some(keyword => keyword.toLowerCase().includes(normalizedQuery))) return true
        
        return false
      })
      .sort((a, b) => {
        // Prioritize exact title matches
        const aTitle = a.title.toLowerCase()
        const bTitle = b.title.toLowerCase()
        
        if (aTitle.includes(normalizedQuery) && !bTitle.includes(normalizedQuery)) return -1
        if (!aTitle.includes(normalizedQuery) && bTitle.includes(normalizedQuery)) return 1
        
        // Then prioritize by category relevance
        const aCategoryMatch = a.category.toLowerCase().includes(normalizedQuery)
        const bCategoryMatch = b.category.toLowerCase().includes(normalizedQuery)
        
        if (aCategoryMatch && !bCategoryMatch) return -1
        if (!aCategoryMatch && bCategoryMatch) return 1
        
        // Finally sort alphabetically
        return a.title.localeCompare(b.title)
      })
      .slice(0, 10) // Limit to top 10 results
  }, [searchItems])

  const value: SearchContextType = {
    searchItems,
    registerItem,
    unregisterItem,
    search
  }

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  )
}