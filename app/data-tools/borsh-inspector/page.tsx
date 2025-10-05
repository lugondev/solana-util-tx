import { Metadata } from 'next'
import { BorshInspectorComponent } from '@/components/data-tools/borsh-inspector'

export const metadata: Metadata = {
  title: 'Borsh Inspector | Solana Utility Tools',
  description: 'Decode and encode Borsh (Binary Object Representation Serializer for Hashing) data with custom schemas. Support for all Borsh types including structs, enums, vectors, and primitives.',
  keywords: ['solana', 'borsh', 'decoder', 'encoder', 'serialization', 'binary', 'data'],
}

export default function BorshInspectorPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🔍 Borsh Inspector
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Decode and encode Borsh data with custom schemas. Full support for all Borsh data types 
            including structs, enums, vectors, and primitives for Solana programs.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <BorshInspectorComponent />
        </div>

        {/* Features */}
        <div className="max-w-4xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📥 Decode Borsh Data
              </h3>
              <p className="text-gray-300 text-sm">
                Decode binary Borsh data to human-readable JSON with custom schemas. 
                Support for hex, base64, and UTF-8 input formats.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📤 Encode to Borsh
              </h3>
              <p className="text-gray-300 text-sm">
                Encode JSON data to Borsh binary format. 
                Generate example data from schemas and export multiple formats.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🏗️ Schema Support
              </h3>
              <p className="text-gray-300 text-sm">
                Hỗ trợ đầy đủ Borsh types: structs, enums, arrays, vectors, 
                options, maps, sets and all primitive types.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📋 Common Templates
              </h3>
              <p className="text-gray-300 text-sm">
                Pre-built schemas for Token Accounts, User Profiles, 
                and common data structures in the Solana ecosystem.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔧 Developer Tools
              </h3>
              <p className="text-gray-300 text-sm">
                Copy/paste results, download JSON files, 
                generate example data, and validate schemas real-time.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                ⚡ Performance
              </h3>
              <p className="text-gray-300 text-sm">
                Optimized for large data processing with memory-efficient 
                readers/writers and streaming support.
              </p>
            </div>
          </div>
        </div>

        {/* Usage Guide */}
        <div className="max-w-4xl mx-auto mt-12 bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            📖 Usage Guide
          </h3>
          <div className="space-y-4 text-gray-300 text-sm">
            <div>
              <h4 className="font-semibold text-white mb-2">1. Decode Borsh Data:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Select hoặc create custom schema</li>
                <li>Choose data format (hex/base64/utf8)</li>
                <li>Paste raw binary data</li>
                <li>Click "Decode Data" to view JSON result</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Encode to Borsh:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Select schema template hoặc create custom</li>
                <li>Generate example data hoặc input custom JSON</li>
                <li>Click "Encode Data" to get binary output</li>
                <li>Copy hex/base64 results for use in programs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Schema Format:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>JSON format with name, type, and optional description</li>
                <li>Support for nested structs, enums with variants</li>
                <li>Primitives: u8/u16/u32/u64/u128, i8-i128, f32/f64, bool, string, pubkey</li>
                <li>Collections: arrays (fixed), vectors (dynamic), options, maps, sets</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}