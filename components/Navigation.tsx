'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface NavigationItem {
  label: string
  href?: string
  children?: NavigationItem[]
  icon?: string
  comingSoon?: boolean
}

const navigationItems: NavigationItem[] = [
  { 
    label: 'DASHBOARD', 
    href: '/', 
    icon: '🏠' 
  },
  { 
    label: 'WALLET', 
    href: '/wallet', 
    icon: '💰' 
  },
  {
    label: 'TRANSACTIONS',
    icon: '⚡',
    children: [
      { label: 'Send', href: '/transaction/send' },
      { label: 'Simulate', href: '/transaction/simulate' },
      { label: 'Enhanced Simulate', href: '/transaction/enhanced-simulate', icon: '🔬' },
      { label: 'History', href: '/transaction/history' },
    ]
  },
  {
    label: 'TOKENS',
    icon: '🪙',
    children: [
      { label: 'Transfer', href: '/tokens/transfer', icon: '🔄' },
      { label: 'Mint', href: '/tokens/mint', icon: '🏭' },
      { label: 'Burn', href: '/tokens/burn', icon: '🔥' },
      { label: 'Bulk Operations', href: '/tokens/bulk', icon: '📦' },
      { label: 'Analytics', href: '/tokens/analytics', icon: '📊' },
    ]
  },
  {
    label: 'ALT',
    icon: '📋',
    children: [
      { label: 'Create ALT', href: '/alt/create' },
      { label: 'Manage ALT', href: '/alt/manage' },
      { label: 'ALT Explorer', href: '/alt/explorer' },
    ]
  },
  {
    label: 'JITO/MEV',
    icon: '🚀',
    children: [
      { label: 'Bundles', href: '/jito/bundle' },
      { label: 'Tips', href: '/jito/tips' },
    ]
  },
  {
    label: 'ACCOUNTS',
    icon: '📊',
    children: [
      { label: 'Explorer', href: '/accounts/explorer' },
      { label: 'PDA Calculator', href: '/accounts/pda' },
    ]
  },
  {
    label: 'DEFI',
    icon: '🔄',
    children: [
      { label: 'Swap (Jupiter)', href: '/defi/swap' },
      { label: 'Liquidity', href: '/defi/liquidity' },
      { label: 'Limit Orders', href: '/defi/limit-orders' },
    ]
  },
  {
    label: 'DEV TOOLS',
    icon: '🛠️',
    children: [
      { label: 'Keypair', href: '/dev-tools/keypair' },
      { label: 'Programs', href: '/dev-tools/programs' },
      { label: 'Utilities', href: '/dev-tools/utils' },
    ]
  },
]

interface NavigationMenuProps {
  item: NavigationItem
  level?: number
}

function NavigationMenu({ item, level = 0 }: NavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  const hasChildren = item.children && item.children.length > 0
  const isActive = item.href ? pathname === item.href : false
  const hasActiveChild = item.children?.some(child => pathname === child.href)
  
  const paddingClass = level === 0 ? 'pl-6' : 'pl-10'
  
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between ${paddingClass} pr-6 py-4 font-pixel text-xs transition-colors ${
            hasActiveChild 
              ? 'text-green-400 bg-green-400/10' 
              : 'text-gray-400 hover:text-green-400'
          }`}
        >
          <div className="flex items-center gap-3">
            {item.icon && <span className="text-sm">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
          {isOpen ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </button>
        
        {isOpen && (
          <div className="border-l-4 border-green-400/20 ml-6">
            {item.children?.map((child, index) => (
              <NavigationMenu key={index} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }
  
  const linkContent = (
    <div className="flex items-center gap-3">
      {item.icon && <span className="text-sm">{item.icon}</span>}
      <span>{item.label}</span>
      {item.comingSoon && (
        <span className="text-xs px-2 py-0.5 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
          SOON
        </span>
      )}
    </div>
  )
  
  if (item.comingSoon) {
    return (
      <div
        className={`${paddingClass} pr-6 py-4 font-pixel text-xs cursor-not-allowed opacity-50`}
      >
        {linkContent}
      </div>
    )
  }
  
  return (
    <Link
      href={item.href || '#'}
      className={`block ${paddingClass} pr-6 py-4 font-pixel text-xs transition-colors ${
        isActive 
          ? 'text-green-400 bg-green-400/10 border-r-4 border-green-400' 
          : 'text-gray-400 hover:text-green-400'
      }`}
    >
      {linkContent}
    </Link>
  )
}

interface NavigationProps {
  isMobileMenuOpen?: boolean
  onMobileMenuToggle?: () => void
  className?: string
}

export default function Navigation({ isMobileMenuOpen = false, onMobileMenuToggle, className = '' }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  
  return (
    <nav className={`h-screen bg-gray-900 border-r-4 border-green-400/20 flex flex-col transition-all duration-300 ${
      isCollapsed ? 'w-20' : 'w-72'
    } ${className}`}>
      {/* Header */}
      <div className={`${isCollapsed ? 'p-3' : 'p-6'} border-b-4 border-green-400/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-green-400 border-4 border-green-400 animate-pulse" />
            {!isCollapsed && (
              <div>
                <h1 className="font-pixel text-base text-green-400">SOLANA</h1>
                <p className="font-pixel text-xs text-gray-400">UTIL-TX</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="font-pixel text-xs text-gray-400 hover:text-green-400 p-2"
            >
              ◀
            </button>
          )}
        </div>
        {isCollapsed && (
          <div className="flex justify-center mt-3">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="font-pixel text-xs text-gray-400 hover:text-green-400 p-2"
              title="Mở rộng menu"
            >
              ▶
            </button>
          </div>
        )}
      </div>
      
      {/* Navigation Items */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <div className="py-4">
            {navigationItems.map((item, index) => (
              <NavigationMenu key={index} item={item} />
            ))}
          </div>
        )}
        
        {isCollapsed && (
          <div className="py-4 space-y-2">
            {navigationItems.map((item, index) => (
              <div key={index} className="px-2 flex justify-center">
                <div 
                  className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-green-400 transition-colors cursor-pointer rounded"
                  title={item.label}
                >
                  {item.icon}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 border-t-4 border-green-400/20">
        {!isCollapsed && (
          <div className="font-mono text-xs text-gray-500">
            <div>v1.0.0</div>
            <div>Phase 2</div>
          </div>
        )}
      </div>
    </nav>
  )
}