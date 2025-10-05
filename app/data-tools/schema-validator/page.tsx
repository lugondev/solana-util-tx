import { Metadata } from 'next'
import SchemaValidator from '@/components/data-tools/schema-validator'

export const metadata: Metadata = {
  title: 'Schema Validator | Solana Utility Tools',
  description: 'Validate data structures against schemas with comprehensive error reporting and multiple schema format support.',
  keywords: ['schema validation', 'json schema', 'data validation', 'solana', 'borsh schema'],
}

export default function SchemaValidatorPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ✅ Schema Validator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Validate data structures against schemas with comprehensive error reporting, 
            multiple schema format support, and custom validation rules.
          </p>
        </div>

        <SchemaValidator />

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            🚀 Key Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-lg font-semibold text-white mb-2">Multi-Format Support</h3>
              <p className="text-gray-300 text-sm">
                Support for JSON Schema, Borsh Schema, and custom validation rules
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold text-white mb-2">Detailed Errors</h3>
              <p className="text-gray-300 text-sm">
                Comprehensive error reporting with exact location and suggestions
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Batch Validation</h3>
              <p className="text-gray-300 text-sm">
                Validate multiple data objects against schemas simultaneously
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">🛠️</div>
              <h3 className="text-lg font-semibold text-white mb-2">Custom Rules</h3>
              <p className="text-gray-300 text-sm">
                Create and apply custom validation rules for specific use cases
              </p>
            </div>
          </div>
        </div>

        {/* Schema Types */}
        <div className="mt-16 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            📋 Supported Schema Types
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">JSON Schema</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Draft 7 and Draft 2019-09 support</li>
                <li>• Type validation (string, number, object, array)</li>
                <li>• Format validation (email, date, uri, etc.)</li>
                <li>• Custom keywords and validators</li>
                <li>• Conditional schemas (if/then/else)</li>
                <li>• Reference resolution ($ref)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">Borsh Schema</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Struct and enum validation</li>
                <li>• Primitive type checking</li>
                <li>• Array and vector validation</li>
                <li>• Option and nullable types</li>
                <li>• Custom serialization rules</li>
                <li>• Anchor IDL compatibility</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Custom Schemas</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Program-specific validation rules</li>
                <li>• Account data structure validation</li>
                <li>• Instruction parameter checking</li>
                <li>• Cross-field validation</li>
                <li>• Business logic constraints</li>
                <li>• Multi-step validation workflows</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            📖 Usage Examples
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Validation Workflows</h3>
              <ol className="space-y-2 text-gray-300 text-sm">
                <li>1. Choose schema type (JSON Schema, Borsh, Custom)</li>
                <li>2. Input or upload your schema definition</li>
                <li>3. Provide data to validate (JSON, binary, etc.)</li>
                <li>4. Run validation and review detailed results</li>
                <li>5. Export validation report for documentation</li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Best Practices</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Start with built-in schema templates</li>
                <li>• Test validation with sample data first</li>
                <li>• Use batch validation for large datasets</li>
                <li>• Implement progressive validation strategies</li>
                <li>• Document custom validation rules clearly</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}