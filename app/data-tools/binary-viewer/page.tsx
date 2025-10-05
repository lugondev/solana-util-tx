import { Metadata } from 'next'
import BinaryDataViewer from '@/components/data-tools/binary-data-viewer'

export const metadata: Metadata = {
  title: 'Binary Data Viewer | Solana Utility Tools',
  description: 'Visualize and inspect binary data with multiple format interpretations including hex, ASCII, and structured data.',
  keywords: ['binary data', 'hex viewer', 'data visualization', 'solana', 'inspector'],
}

export default function BinaryViewerPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📋 Binary Data Viewer
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Visualize and inspect binary data with multiple format interpretations including hex, ASCII, and structured data analysis.
          </p>
        </div>

        <BinaryDataViewer />

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            🚀 Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Multiple Formats</h3>
              <p className="text-gray-300 text-sm">
                View data in hex, ASCII, binary, and custom interpretations
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-white mb-2">Smart Detection</h3>
              <p className="text-gray-300 text-sm">
                Automatic detection of data structures and patterns
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🔎</div>
              <h3 className="text-lg font-semibold text-white mb-2">Search & Navigate</h3>
              <p className="text-gray-300 text-sm">
                Find specific patterns and navigate large datasets
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">💾</div>
              <h3 className="text-lg font-semibold text-white mb-2">Export Options</h3>
              <p className="text-gray-300 text-sm">
                Export analyzed data in various formats for further processing
              </p>
            </div>
          </div>
        </div>

        {/* Supported Formats */}
        <div className="mt-16 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            📋 Supported Input Formats
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">Text Formats</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Hex strings (with/without 0x prefix)</li>
                <li>• Base64 encoded data</li>
                <li>• Base58 encoded data</li>
                <li>• ASCII text input</li>
                <li>• Raw binary strings</li>
                <li>• URL encoded data</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">File Formats</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Binary files (.bin, .dat)</li>
                <li>• Executable files</li>
                <li>• Image files (header analysis)</li>
                <li>• Archive files</li>
                <li>• Custom binary formats</li>
                <li>• Memory dumps</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Analysis Types</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Byte frequency analysis</li>
                <li>• Pattern detection</li>
                <li>• String extraction</li>
                <li>• Entropy calculation</li>
                <li>• Structure identification</li>
                <li>• Checksum validation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            📖 How to Use
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quick Start</h3>
              <ol className="space-y-2 text-gray-300 text-sm">
                <li>1. Paste hex data or upload binary file</li>
                <li>2. Choose display format (hex, ASCII, etc.)</li>
                <li>3. Use search to find specific patterns</li>
                <li>4. Navigate with byte offset controls</li>
                <li>5. Export results for further analysis</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Pro Tips</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Use regex patterns for advanced searching</li>
                <li>• Switch between different encoding views</li>
                <li>• Analyze byte frequency for pattern detection</li>
                <li>• Export specific ranges for focused analysis</li>
                <li>• Use bookmarks for important offsets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}