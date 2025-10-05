import { Metadata } from 'next'
import AnchorCpiHelper from '@/components/data-tools/anchor-cpi-helper'

export const metadata: Metadata = {
  title: 'Anchor CPI Helper | Solana Utility Tools',
  description: 'Generate Cross-Program Invocation code for Anchor programs with account validation and instruction building.',
  keywords: ['anchor', 'cpi', 'cross-program invocation', 'solana', 'code generator'],
}

export default function AnchorCpiPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🏗️ Anchor CPI Helper
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Generate Cross-Program Invocation code for Anchor programs with automatic account validation and instruction building.
          </p>
        </div>

        <AnchorCpiHelper />

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            🚀 Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🔧</div>
              <h3 className="text-lg font-semibold text-white mb-2">Code Generation</h3>
              <p className="text-gray-300 text-sm">
                Generate complete CPI code with proper account handling
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Account Validation</h3>
              <p className="text-gray-300 text-sm">
                Automatic account validation and constraint checking
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-white mb-2">TypeScript Support</h3>
              <p className="text-gray-300 text-sm">
                Full TypeScript support with proper type definitions
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🛡️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Error Handling</h3>
              <p className="text-gray-300 text-sm">
                Comprehensive error handling and validation patterns
              </p>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-16 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-6">
            📖 How to Use
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">1. Program Information</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Enter target program ID</li>
                <li>• Provide instruction name</li>
                <li>• Select instruction type</li>
                <li>• Add program description</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">2. Account Configuration</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Define required accounts</li>
                <li>• Set account constraints</li>
                <li>• Configure mutability</li>
                <li>• Add account validation</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">3. Data Structure</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Define instruction data</li>
                <li>• Set parameter types</li>
                <li>• Add validation rules</li>
                <li>• Configure serialization</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-4">4. Generate Code</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Generate CPI function</li>
                <li>• Create account structs</li>
                <li>• Add error handling</li>
                <li>• Export TypeScript types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}