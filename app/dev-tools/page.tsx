'use client'

import Link from 'next/link'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { 
  Key, 
  Code, 
  Rocket, 
  Settings, 
  Search,
  Eye,
  Hash,
  Wallet,
  FileText,
  Database,
  Zap,
  Brain,
  Wrench,
  Activity,
  Terminal
} from 'lucide-react'

export default function DevToolsPage() {
  const tools = [
    // Transaction & Parsing Tools
    {
      title: 'Transaction Parser',
      description: 'Decode raw transactions into human-readable format',
      href: '/dev-tools/transaction-parser',
      icon: Eye,
      status: 'active',
      category: 'Transaction Tools',
      features: ['Parse Legacy & Versioned TX', 'Instruction decoding', 'ALT support', 'Priority fees']
    },
    {
      title: 'Vanity Address Generator',
      description: 'Generate custom addresses with specific prefixes',
      href: '/dev-tools/vanity-generator',
      icon: Hash,
      status: 'active',
      category: 'Address Tools',
      features: ['Custom prefixes', 'Case sensitivity', 'Bulk generation', 'Performance metrics']
    },
    
    // Keypair & Wallet Tools
    {
      title: 'Keypair Generator',
      description: 'Generate single or bulk Solana keypairs',
      href: '/dev-tools/keypair',
      icon: Key,
      status: 'active',
      category: 'Keypair Tools',
      features: ['Single keypair', 'Basic generation', 'Export options']
    },
    {
      title: 'Bulk Keypair Generator',
      description: 'Generate multiple keypairs at once',
      href: '/dev-tools/bulk-keypair',
      icon: Wallet,
      status: 'active',
      category: 'Keypair Tools',
      features: ['Batch generation', 'CSV export', 'Progress tracking', 'Custom quantities']
    },
    {
      title: 'HD Wallet Derivation',
      description: 'BIP39/44 hierarchical deterministic wallet support',
      href: '/dev-tools/hd-wallet',
      icon: Database,
      status: 'active',
      category: 'Keypair Tools',
      features: ['BIP39 mnemonic', 'BIP44 derivation', 'Multiple accounts', 'Seed phrases']
    },
    {
      title: 'Keypair Converter',
      description: 'Convert between different keypair formats',
      href: '/dev-tools/keypair-converter',
      icon: Code,
      status: 'active',
      category: 'Keypair Tools',
      features: ['Base58 ↔ Hex', 'Array formats', 'JSON export', 'Batch conversion']
    },
    
    // Program Development Tools  
    {
      title: 'Program Deployment',
      description: 'Deploy and upgrade Solana programs',
      href: '/dev-tools/deploy',
      icon: Rocket,
      status: 'active',
      category: 'Program Tools',
      features: ['BPF deployment', 'Upgrade support', 'Cost estimation']
    },
    {
      title: 'IDL Generator',
      description: 'Auto-generate IDL from Solana programs',
      href: '/dev-tools/idl',
      icon: FileText,
      status: 'active',
      category: 'Program Tools',
      features: ['Anchor programs', 'Type extraction', 'Auto-discovery', 'Multi-format export']
    },
    {
      title: 'Program Form Generator',
      description: 'Generate forms from IDL for program interaction',
      href: '/dev-tools/program-form',
      icon: Brain,
      status: 'coming-soon',
      category: 'Program Tools',
      features: ['Dynamic forms', 'Type validation', 'Instruction builder', 'Parameter parsing']
    },
    {
      title: 'PDA Brute Force',
      description: 'Find PDAs with specific properties',
      href: '/dev-tools/pda',
      icon: Hash,
      status: 'active',
      category: 'Program Tools',
      features: ['Pattern matching', 'Custom seeds', 'Multi-threaded', 'Performance tracking']
    },
    {
      title: 'Program Inspector',
      description: 'Analyze program bytecode, security, and performance',
      href: '/dev-tools/inspector',
      icon: Search,
      status: 'active',
      category: 'Program Tools',
      features: ['Security analysis', 'Bytecode disassembly', 'Performance metrics', 'Instruction extraction']
    },
    
    // Data & Analysis Tools
    {
      title: 'RPC Benchmarker',
      description: 'Test and compare RPC endpoint performance',
      href: '/dev-tools/rpc',
      icon: Activity,
      status: 'active',
      category: 'Data Tools',
      features: ['Latency testing', 'Throughput analysis', 'Multi-endpoint comparison', 'Performance metrics']
    },
    {
      title: 'Borsh Inspector',
      description: 'Decode/encode Borsh data with schemas',
      href: '/dev-tools/borsh-inspector',
      icon: Code,
      status: 'coming-soon',
      category: 'Data Tools',
      features: ['Schema editor', 'Data visualization', 'Type validation', 'Export options']
    },
    {
      title: 'Binary Data Viewer',
      description: 'Hex editor for account data',
      href: '/dev-tools/binary-viewer',
      icon: Zap,
      status: 'coming-soon',
      category: 'Data Tools',
      features: ['Hex editor', 'Data parsing', 'Search & replace', 'Export formats']
    },
    
    // Utilities
    {
      title: 'Solana CLI Helper',
      description: 'Generate and learn Solana CLI commands',
      href: '/dev-tools/cli',
      icon: Terminal,
      status: 'active',
      category: 'Utilities',
      features: ['Command generation', 'Parameter assistance', 'Examples & guides', 'Export scripts']
    },
    {
      title: 'General Utils',
      description: 'Miscellaneous development utilities',
      href: '/dev-tools/utils',
      icon: Settings,
      status: 'active',
      category: 'Utilities',
      features: ['Base58 tools', 'Hash functions', 'Encoding utils']
    }
  ]

  const categories = Array.from(new Set(tools.map(tool => tool.category)))
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400'
      case 'beta': return 'text-yellow-400'
      case 'coming-soon': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-600/20 border border-green-600/30 font-pixel text-xs text-green-400">READY</span>
      case 'beta':
        return <span className="px-2 py-1 bg-yellow-600/20 border border-yellow-600/30 font-pixel text-xs text-yellow-400">BETA</span>
      case 'coming-soon':
        return <span className="px-2 py-1 bg-gray-600/20 border border-gray-600/30 font-pixel text-xs text-gray-400">SOON</span>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-pixel text-3xl text-green-400 mb-4 flex items-center justify-center gap-3">
          <Wrench className="h-8 w-8 animate-pulse" />
          DEVELOPER TOOLS
          <Wrench className="h-8 w-8 animate-pulse" />
        </h1>
        <p className="font-mono text-lg text-gray-400 mb-6">
          Comprehensive Solana development utilities and tools
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-gray-800 border-4 border-green-400/20 p-4">
            <div className="font-pixel text-2xl text-green-400">
              {tools.filter(t => t.status === 'active').length}
            </div>
            <div className="font-mono text-xs text-gray-400">Ready</div>
          </div>
          <div className="bg-gray-800 border-4 border-yellow-400/20 p-4">
            <div className="font-pixel text-2xl text-yellow-400">
              {tools.filter(t => t.status === 'beta').length}
            </div>
            <div className="font-mono text-xs text-gray-400">Beta</div>
          </div>
          <div className="bg-gray-800 border-4 border-blue-400/20 p-4">
            <div className="font-pixel text-2xl text-blue-400">
              {tools.filter(t => t.status === 'coming-soon').length}
            </div>
            <div className="font-mono text-xs text-gray-400">Coming Soon</div>
          </div>
          <div className="bg-gray-800 border-4 border-purple-400/20 p-4">
            <div className="font-pixel text-2xl text-purple-400">{categories.length}</div>
            <div className="font-mono text-xs text-gray-400">Categories</div>
          </div>
        </div>
      </div>

      {/* Tools by Category */}
      <div className="space-y-12">
        {categories.map(category => (
          <div key={category}>
            <h2 className="font-pixel text-xl text-blue-400 mb-6 flex items-center gap-3">
              <span className="animate-pulse">▸</span>
              {category.toUpperCase()}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.filter(tool => tool.category === category).map((tool) => (
                <PixelCard key={tool.title} className="h-full">
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-800 border-2 border-gray-700">
                          <tool.icon className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-pixel text-sm text-white mb-1">
                            {tool.title}
                          </h3>
                          {getStatusBadge(tool.status)}
                        </div>
                      </div>
                    </div>

                    <p className="font-mono text-sm text-gray-400 mb-4 flex-1">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="mb-4">
                      <div className="font-mono text-xs text-gray-500 mb-2">Features:</div>
                      <div className="space-y-1">
                        {tool.features.map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            <span className="font-mono text-xs text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    {tool.status === 'active' || tool.status === 'beta' ? (
                      <Link href={tool.href}>
                        <PixelButton
                          variant={tool.status === 'active' ? 'primary' : 'secondary'}
                          className="w-full !text-xs"
                        >
                          {tool.status === 'beta' ? '[OPEN BETA]' : '[OPEN TOOL]'}
                        </PixelButton>
                      </Link>
                    ) : (
                      <PixelButton
                        variant="secondary"
                        disabled
                        className="w-full !text-xs opacity-50 cursor-not-allowed"
                      >
                        [COMING SOON]
                      </PixelButton>
                    )}
                  </div>
                </PixelCard>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <div className="mt-16">
        <PixelCard>
          <div className="space-y-6">
            <div className="border-b-4 border-purple-400/20 pb-4">
              <h2 className="font-pixel text-xl text-purple-400 mb-2">
                🗺️ DEVELOPMENT ROADMAP
              </h2>
              <p className="font-mono text-sm text-gray-400">
                Upcoming tools and features in the development pipeline
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                  <h3 className="font-pixel text-sm text-green-400">PHASE 1 - COMPLETED</h3>
                </div>
                <div className="space-y-2 pl-6">
                  <div className="font-mono text-xs text-gray-300">✓ Transaction Parser</div>
                  <div className="font-mono text-xs text-gray-300">✓ Basic Keypair Generator</div>
                  <div className="font-mono text-xs text-gray-300">✓ Program Deployment</div>
                  <div className="font-mono text-xs text-gray-300">✓ Development Utils</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  <h3 className="font-pixel text-sm text-yellow-400">PHASE 2 - IN PROGRESS</h3>
                </div>
                <div className="space-y-2 pl-6">
                  <div className="font-mono text-xs text-gray-300">→ Vanity Address Generator</div>
                  <div className="font-mono text-xs text-gray-300">→ Bulk Keypair Tools</div>
                  <div className="font-mono text-xs text-gray-300">→ HD Wallet Support</div>
                  <div className="font-mono text-xs text-gray-300">→ Keypair Converter</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                  <h3 className="font-pixel text-sm text-blue-400">PHASE 3 - PLANNED</h3>
                </div>
                <div className="space-y-2 pl-6">
                  <div className="font-mono text-xs text-gray-300">□ IDL Generator</div>
                  <div className="font-mono text-xs text-gray-300">□ Program Form Builder</div>
                  <div className="font-mono text-xs text-gray-300">□ PDA Brute Forcer</div>
                  <div className="font-mono text-xs text-gray-300">□ Borsh Inspector</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-4 border-gray-700">
              <div className="p-4 bg-purple-900/20 border-2 border-purple-600/30">
                <div className="flex items-start gap-3">
                  <Brain className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-pixel text-sm text-purple-400">CONTRIBUTION WELCOME:</div>
                    <div className="font-mono text-xs text-gray-300">
                      These tools are designed to be comprehensive and developer-friendly. 
                      If you have suggestions for new tools or improvements to existing ones, 
                      feedback is always welcome to make this the ultimate Solana dev toolkit.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}