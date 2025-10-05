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
            Decode và encode Borsh data với custom schemas. Hỗ trợ đầy đủ các kiểu dữ liệu Borsh 
            bao gồm structs, enums, vectors, và primitives cho Solana programs.
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
                Decode binary Borsh data thành human-readable JSON với custom schemas. 
                Hỗ trợ hex, base64, và UTF-8 input formats.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📤 Encode to Borsh
              </h3>
              <p className="text-gray-300 text-sm">
                Encode JSON data thành Borsh binary format. 
                Generate example data từ schemas và export multiple formats.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🏗️ Schema Support
              </h3>
              <p className="text-gray-300 text-sm">
                Hỗ trợ đầy đủ Borsh types: structs, enums, arrays, vectors, 
                options, maps, sets và tất cả primitive types.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📋 Common Templates
              </h3>
              <p className="text-gray-300 text-sm">
                Pre-built schemas cho Token Accounts, User Profiles, 
                và các data structures phổ biến trong Solana ecosystem.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔧 Developer Tools
              </h3>
              <p className="text-gray-300 text-sm">
                Copy/paste results, download JSON files, 
                generate example data, và validate schemas real-time.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                ⚡ Performance
              </h3>
              <p className="text-gray-300 text-sm">
                Optimized cho large data processing với memory-efficient 
                readers/writers và streaming support.
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
                <li>Click "Decode Data" để view JSON result</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Encode to Borsh:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Select schema template hoặc create custom</li>
                <li>Generate example data hoặc input custom JSON</li>
                <li>Click "Encode Data" để get binary output</li>
                <li>Copy hex/base64 results for use in programs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Schema Format:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>JSON format với name, type, và optional description</li>
                <li>Support cho nested structs, enums với variants</li>
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