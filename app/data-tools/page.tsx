import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Data Processing & Analysis Tools | Solana Utility Tools',
  description: 'Comprehensive suite của data processing và analysis tools cho Solana. Decode Borsh data, parse event logs, inspect binary data, validate schemas.',
  keywords: ['solana', 'data processing', 'borsh', 'event logs', 'binary data', 'schemas'],
}

export default function DataToolsPage() {
  const tools = [
    {
      title: '🔍 Borsh Inspector',
      description: 'Decode và encode Borsh (Binary Object Representation Serializer for Hashing) data với custom schemas',
      href: '/data-tools/borsh-inspector',
      features: [
        'Decode/encode Borsh binary data',
        'Custom schema support',
        'Multiple format inputs (hex, base64)',
        'Common schema templates',
        'Real-time validation'
      ],
      status: 'Ready'
    },
    {
      title: '📊 Event Log Parser',
      description: 'Parse và analyze event logs từ Solana transactions với comprehensive filtering',
      href: '/data-tools/event-parser',
      features: [
        'Single/multiple transaction parsing',
        'Custom event detection',
        'Program usage statistics',
        'Advanced filtering options',
        'Export capabilities'
      ],
      status: 'Ready'
    },
    {
      title: '🏗️ Anchor CPI Helper',
      description: 'Generate Cross-Program Invocation code cho Anchor programs',
      href: '/data-tools/anchor-cpi',
      features: [
        'CPI code generation',
        'Account validation',
        'Instruction building',
        'Error handling',
        'TypeScript support'
      ],
      status: 'Coming Soon'
    },
    {
      title: '📋 Binary Data Viewer',
      description: 'Visualize và inspect binary data với multiple format interpretations',
      href: '/data-tools/binary-viewer',
      features: [
        'Multiple format display',
        'Hex/ASCII viewer',
        'Data structure detection',
        'Search & navigation',
        'Export utilities'
      ],
      status: 'Coming Soon'
    },
    {
      title: '✅ Schema Validator',
      description: 'Validate data structures against schemas với comprehensive error reporting',
      href: '/data-tools/schema-validator',
      features: [
        'Schema validation',
        'Error reporting',
        'Multiple schema formats',
        'Custom validators',
        'Batch validation'
      ],
      status: 'Coming Soon'
    },
    {
      title: '📈 Data Analytics Dashboard',
      description: 'Comprehensive analytics cho Solana data patterns và trends',
      href: '/data-tools/analytics',
      features: [
        'Transaction analytics',
        'Program usage trends',
        'Performance metrics',
        'Custom dashboards',
        'Export reports'
      ],
      status: 'Coming Soon'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 Data Processing & Analysis Tools
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive suite của tools để process, analyze, và visualize Solana data. 
            Từ Borsh decoding đến event log analysis và binary data inspection.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-2xl font-bold text-green-400">2</div>
            <div className="text-sm text-gray-400">Ready Tools</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-2xl font-bold text-blue-400">4</div>
            <div className="text-sm text-gray-400">Coming Soon</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-2xl font-bold text-purple-400">15+</div>
            <div className="text-sm text-gray-400">Data Formats</div>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="text-2xl font-bold text-yellow-400">25+</div>
            <div className="text-sm text-gray-400">Program Types</div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div key={tool.title} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">
                    {tool.title}
                  </h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    tool.status === 'Ready' 
                      ? 'bg-green-900/30 text-green-400 border border-green-500/30'
                      : 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {tool.status}
                  </span>
                </div>
                
                <p className="text-gray-300 text-sm mb-4">
                  {tool.description}
                </p>

                <ul className="space-y-1 mb-6">
                  {tool.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-400">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {tool.status === 'Ready' ? (
                  <Link 
                    href={tool.href}
                    className="block w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded transition-colors font-medium"
                  >
                    Launch Tool
                  </Link>
                ) : (
                  <div className="w-full px-4 py-2 bg-gray-700 text-gray-400 text-center rounded cursor-not-allowed">
                    Coming Soon
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Key Features */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            🚀 Key Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="text-lg font-semibold text-white mb-2">Data Decoding</h3>
              <p className="text-gray-300 text-sm">
                Decode Borsh, binary data, và custom formats với schema validation
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Event Analysis</h3>
              <p className="text-gray-300 text-sm">
                Parse transaction logs, extract events, và analyze program interactions
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Filtering</h3>
              <p className="text-gray-300 text-sm">
                Filter by programs, event types, time ranges với granular control
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="text-lg font-semibold text-white mb-2">Export & Integration</h3>
              <p className="text-gray-300 text-sm">
                Export results to JSON, CSV, và integrate với external tools
              </p>
            </div>
          </div>
        </div>

        {/* Supported Data Formats */}
        <div className="mt-16 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            📋 Supported Data Formats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Binary Formats</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Borsh (Binary Object Representation)</li>
                <li>• Raw binary data</li>
                <li>• Hex-encoded data</li>
                <li>• Base64-encoded data</li>
                <li>• MessagePack</li>
                <li>• Protocol Buffers</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">Event Formats</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Transaction logs</li>
                <li>• Program logs</li>
                <li>• Instruction data</li>
                <li>• Event emission logs</li>
                <li>• Error logs</li>
                <li>• Custom event formats</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Schema Formats</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• JSON Schema</li>
                <li>• Borsh Schema</li>
                <li>• Anchor IDL</li>
                <li>• Custom type definitions</li>
                <li>• Protocol schema</li>
                <li>• Validation rules</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            🚀 Getting Started
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Ready Tools</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-600">
                  <span className="text-gray-300">Borsh Inspector</span>
                  <Link href="/data-tools/borsh-inspector" className="text-blue-400 hover:text-blue-300">
                    Launch →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded border border-gray-600">
                  <span className="text-gray-300">Event Log Parser</span>
                  <Link href="/data-tools/event-parser" className="text-blue-400 hover:text-blue-300">
                    Launch →
                  </Link>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Tips</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Start với Borsh Inspector để decode binary data</li>
                <li>• Use Event Log Parser cho transaction analysis</li>
                <li>• Test với sample data trước khi process large datasets</li>
                <li>• Export results for further analysis</li>
                <li>• Combine tools cho comprehensive data processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}