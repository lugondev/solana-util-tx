import { Metadata } from 'next'
import { EventLogParserComponent } from '@/components/data-tools/event-log-parser'

export const metadata: Metadata = {
  title: 'Event Log Parser | Solana Utility Tools',
  description: 'Parse and analyze event logs from Solana transactions. Extract program invocations, custom events, compute usage, and transaction details with comprehensive filtering.',
  keywords: ['solana', 'event logs', 'transaction parser', 'program logs', 'solana analytics'],
}

export default function EventLogParserPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📊 Event Log Parser
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Parse and analyze event logs from Solana transactions. Extract program invocations, 
            custom events, compute usage with advanced filtering and statistics.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <EventLogParserComponent />
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔍 Transaction Analysis
              </h3>
              <p className="text-gray-300 text-sm">
                Parse single/multiple transactions to extract events, 
                program invocations, and detailed execution flow.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📝 Custom Event Detection
              </h3>
              <p className="text-gray-300 text-sm">
                Tự động detect Jupiter swaps, Orca trades, Raydium AMM, 
                token transfers with specialized parsing logic.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                ⚡ Performance Metrics
              </h3>
              <p className="text-gray-300 text-sm">
                Track compute unit usage, program execution costs, 
                and performance bottlenecks across transactions.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🎯 Advanced Filtering
              </h3>
              <p className="text-gray-300 text-sm">
                Filter by programs, event types, include/exclude system programs, 
                token programs with granular control.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📊 Real-time Statistics
              </h3>
              <p className="text-gray-300 text-sm">
                View program usage statistics, event type distribution, 
                success/failure rates with visual breakdowns.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                💾 Export & Analysis
              </h3>
              <p className="text-gray-300 text-sm">
                Export parsed events to JSON, copy individual event data, 
                and integrate with external analysis tools.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Programs */}
        <div className="max-w-6xl mx-auto mt-12 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            🚀 Supported Programs & Events
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-400 mb-2">Core Programs</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• System Program</li>
                <li>• Token Program (Legacy & 2022)</li>
                <li>• Associated Token Program</li>
                <li>• Memo Program</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-400 mb-2">DeFi Protocols</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Jupiter Aggregator (V4, V6)</li>
                <li>• Orca Whirlpools</li>
                <li>• Raydium AMM V4</li>
                <li>• Serum DEX (V1, V2, V3)</li>
                <li>• Mercurial & Sabre Swaps</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-400 mb-2">NFT & Metaplex</h4>
              <ul className="space-y-1 text-gray-300">
                <li>• Token Metadata</li>
                <li>• Auction House (V1, V2)</li>
                <li>• Candy Machine</li>
                <li>• Metaplex Programs</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Event Types */}
        <div className="max-w-6xl mx-auto mt-12 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            📋 Event Types Detected
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-400 rounded"></div>
                <span className="text-gray-300">Program Invocations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded"></div>
                <span className="text-gray-300">Program Logs</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-400 rounded"></div>
                <span className="text-gray-300">Program Data</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded"></div>
                <span className="text-gray-300">Compute Budget</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-300">Success Events</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-300">Error Events</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-cyan-400 rounded"></div>
                <span className="text-gray-300">Instructions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-orange-400 rounded"></div>
                <span className="text-gray-300">Inner Instructions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-400 rounded"></div>
                <span className="text-gray-300">Raw Instructions</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Jupiter Swaps</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-teal-400 rounded"></div>
                <span className="text-gray-300">Orca Trades</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-indigo-400 rounded"></div>
                <span className="text-gray-300">Raydium AMM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="max-w-6xl mx-auto mt-12 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            📖 Usage Guide
          </h3>
          <div className="space-y-4 text-gray-300 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Single Transaction Mode:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Paste transaction signature</li>
                <li>Configure parse options (programs, event types)</li>
                <li>Click "Parse Transaction" to analyze</li>
                <li>View events, statistics, and detailed breakdowns</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Multiple Transactions Mode:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enter up to 50 transaction signatures (one per line)</li>
                <li>Batch processing with aggregated statistics</li>
                <li>Compare program usage across multiple transactions</li>
                <li>Export comprehensive analysis results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Raw Logs Mode:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Paste raw transaction logs directly</li>
                <li>Useful for offline analysis or custom log sources</li>
                <li>No blockchain connection required</li>
                <li>Parse events from any log format</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">4. Advanced Filtering:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Include/exclude system programs, token programs</li>
                <li>Filter by specific program IDs (comma-separated)</li>
                <li>Enable custom event detection for DeFi protocols</li>
                <li>Toggle unknown program processing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}