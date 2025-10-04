'use client'

import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { 
  Shield, 
  Rocket, 
  Flame, 
  BarChart3, 
  Users,
  Zap,
  CheckCircle,
  ArrowRight,
  Star,
  Code,
  DollarSign
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      id: 'multisig',
      title: 'Multi-Signature Wallets',
      description: 'Create and manage secure multi-signature wallets for enhanced security',
      icon: Shield,
      href: '/wallet/multisig',
      status: 'completed',
      highlights: [
        'Create custom threshold wallets',
        'Proposal-based transaction system',
        'Real-time signature tracking',
        'Secure multi-party authentication'
      ],
      technologies: ['Solana Web3.js', 'Multi-sig Protocol', 'TypeScript']
    },
    {
      id: 'deployment',
      title: 'Program Deployment',
      description: 'Deploy, upgrade, and manage Solana programs with comprehensive tools',
      icon: Rocket,
      href: '/dev-tools/deploy',
      status: 'completed',
      highlights: [
        'Upgradeable program deployment',
        'Cost estimation and validation',
        'Bytecode analysis and verification',
        'Deployment history tracking'
      ],
      technologies: ['BPF Loader', 'Program Management', 'File Upload']
    },
    {
      id: 'token-burn',
      title: 'Token Burning',
      description: 'Permanently destroy tokens to reduce supply with advanced controls',
      icon: Flame,
      href: '/tokens/burn',
      status: 'completed',
      highlights: [
        'Percentage-based burning (25%, 50%, 75%, 100%)',
        'Custom mint address support',
        'Balance validation and warnings',
        'Transaction confirmation system'
      ],
      technologies: ['SPL Token', 'Transaction Builder', 'Validation']
    },
    {
      id: 'analytics',
      title: 'Token Analytics',
      description: 'Comprehensive token analysis with on-chain data and market insights',
      icon: BarChart3,
      href: '/tokens/analytics',
      status: 'completed',
      highlights: [
        'Real-time token statistics',
        'Holder distribution analysis',
        'Risk assessment algorithms',
        'Jupiter price integration'
      ],
      technologies: ['On-chain Data', 'Jupiter API', 'Statistical Analysis']
    },
    {
      id: 'defi',
      title: 'Advanced DeFi',
      description: 'Integrated DeFi protocols including Jupiter, Orca, and Raydium',
      icon: Zap,
      href: '/defi/swap',
      status: 'completed',
      highlights: [
        'Jupiter token swaps',
        'Orca Whirlpool integration',
        'Raydium liquidity pools',
        'Jito MEV protection'
      ],
      technologies: ['Jupiter SDK', 'Orca SDK', 'Raydium SDK', 'Jito']
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'in-progress':
        return <div className="h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="h-5 w-5 bg-gray-600 rounded-full" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400'
      case 'in-progress':
        return 'text-yellow-400'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-12 text-center">
        <h1 className="font-pixel text-3xl text-green-400 mb-4 flex items-center justify-center gap-3">
          <Star className="h-8 w-8 animate-pulse" />
          SOLANA UTIL-TX FEATURES
          <Star className="h-8 w-8 animate-pulse" />
        </h1>
        <p className="font-mono text-lg text-gray-400 mb-6">
          Comprehensive Solana blockchain tools and utilities
        </p>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="bg-gray-800 border-4 border-green-400/20 p-4">
            <div className="font-pixel text-2xl text-green-400">5/5</div>
            <div className="font-mono text-xs text-gray-400">Features Complete</div>
          </div>
          <div className="bg-gray-800 border-4 border-blue-400/20 p-4">
            <div className="font-pixel text-2xl text-blue-400">15+</div>
            <div className="font-mono text-xs text-gray-400">Components</div>
          </div>
          <div className="bg-gray-800 border-4 border-purple-400/20 p-4">
            <div className="font-pixel text-2xl text-purple-400">10+</div>
            <div className="font-mono text-xs text-gray-400">Integrations</div>
          </div>
          <div className="bg-gray-800 border-4 border-yellow-400/20 p-4">
            <div className="font-pixel text-2xl text-yellow-400">100%</div>
            <div className="font-mono text-xs text-gray-400">TypeScript</div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="space-y-8">
        {features.map((feature, index) => (
          <PixelCard key={feature.id}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Feature Info */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-800 border-4 border-gray-700">
                    <feature.icon className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-pixel text-xl text-white">
                        {feature.title}
                      </h2>
                      {getStatusIcon(feature.status)}
                    </div>
                    <p className="font-mono text-sm text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="space-y-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ✨ KEY FEATURES
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {feature.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="font-mono text-sm text-gray-300">
                          {highlight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="space-y-3">
                  <h3 className="font-pixel text-sm text-blue-400">
                    🛠️ TECHNOLOGIES
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {feature.technologies.map((tech, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1 bg-blue-600/20 border-2 border-blue-600/30 font-mono text-xs text-blue-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 border-4 border-gray-700">
                  <div className="text-center mb-4">
                    <div className={`font-pixel text-lg ${getStatusColor(feature.status)}`}>
                      {feature.status.toUpperCase().replace('-', ' ')}
                    </div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Ready to use
                    </div>
                  </div>

                  <Link href={feature.href}>
                    <PixelButton className="w-full">
                      <ArrowRight className="h-4 w-4" />
                      [TRY {feature.title.toUpperCase()}]
                    </PixelButton>
                  </Link>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2">
                  <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-green-400">
                        Implementation:
                      </span>
                      <span className="font-mono text-xs text-white">
                        100%
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-blue-900/20 border-2 border-blue-600/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-blue-400">
                        Testing:
                      </span>
                      <span className="font-mono text-xs text-white">
                        ✓ Verified
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-purple-900/20 border-2 border-purple-600/30">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-purple-400">
                        Integration:
                      </span>
                      <span className="font-mono text-xs text-white">
                        ✓ Complete
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        ))}
      </div>

      {/* Technical Overview */}
      <div className="mt-12">
        <PixelCard>
          <div className="space-y-6">
            <div className="border-b-4 border-green-400/20 pb-4">
              <h2 className="font-pixel text-xl text-green-400 mb-2">
                🏗️ TECHNICAL ARCHITECTURE
              </h2>
              <p className="font-mono text-sm text-gray-400">
                Built with modern web technologies and Solana ecosystem tools
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Frontend */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-400" />
                  <h3 className="font-pixel text-sm text-blue-400">FRONTEND</h3>
                </div>
                <div className="space-y-2">
                  {[
                    'Next.js 15 (App Router)',
                    'React 19 (Server Components)',
                    'TypeScript (Strict Mode)', 
                    'Tailwind CSS',
                    'Custom Pixel UI Components'
                  ].map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="font-mono text-xs text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blockchain */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-400" />
                  <h3 className="font-pixel text-sm text-purple-400">BLOCKCHAIN</h3>
                </div>
                <div className="space-y-2">
                  {[
                    'Solana Web3.js',
                    'SPL Token Program',
                    'Wallet Adapter',
                    'Transaction Builders',
                    'RPC Optimization'
                  ].map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="font-mono text-xs text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Integrations */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">INTEGRATIONS</h3>
                </div>
                <div className="space-y-2">
                  {[
                    'Jupiter Protocol',
                    'Orca Whirlpools',
                    'Raydium Pools',
                    'Jito MEV Protection',
                    'Token Analytics APIs'
                  ].map((tech, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="font-mono text-xs text-gray-300">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Call to Action */}
      <div className="mt-12 text-center">
        <PixelCard>
          <div className="py-8">
            <h2 className="font-pixel text-2xl text-green-400 mb-4">
              🚀 READY TO EXPLORE?
            </h2>
            <p className="font-mono text-sm text-gray-400 mb-6 max-w-2xl mx-auto">
              Dive into the comprehensive Solana toolkit. All features are fully implemented 
              and ready for production use.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/wallet/multisig">
                <PixelButton variant="primary">
                  <Shield className="h-4 w-4" />
                  [TRY MULTISIG]
                </PixelButton>
              </Link>
              <Link href="/dev-tools/deploy">
                <PixelButton variant="secondary">
                  <Rocket className="h-4 w-4" />
                  [DEPLOY PROGRAMS]
                </PixelButton>
              </Link>
              <Link href="/tokens/analytics">
                <PixelButton variant="secondary">
                  <BarChart3 className="h-4 w-4" />
                  [ANALYZE TOKENS]
                </PixelButton>
              </Link>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}