import { Metadata } from 'next'
import { ProgramVersionManagerComponent } from '@/components/advanced-tools/program-version-manager'

export const metadata: Metadata = {
  title: 'Program Version Manager | Advanced Solana Tools',
  description: 'Manage Solana program versions, track upgrade history, create deployment plans với comprehensive version control và authority management.',
  keywords: ['solana', 'program versioning', 'upgrades', 'deployment', 'version control'],
}

export default function ProgramVersionManagerPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📝 Program Version Manager
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive program version management với upgrade tracking, deployment planning, 
            và authority management cho Solana programs.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <ProgramVersionManagerComponent />
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📊 Version Tracking
              </h3>
              <p className="text-gray-300 text-sm">
                Track program versions, deployment history, size changes, 
                và authority modifications over time.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔄 Upgrade Planning
              </h3>
              <p className="text-gray-300 text-sm">
                Create detailed deployment plans với cost estimation, 
                required signers, và validation checks.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                📈 Batch Analysis
              </h3>
              <p className="text-gray-300 text-sm">
                Analyze multiple programs simultaneously với statistics, 
                trends, và comparative insights.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🔍 Version Comparison
              </h3>
              <p className="text-gray-300 text-sm">
                Compare program versions với detailed diff analysis, 
                size changes, và breaking change detection.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                🛡️ Authority Management
              </h3>
              <p className="text-gray-300 text-sm">
                Track upgrade authorities, validate permissions, 
                và manage access control cho program updates.
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">
                💰 Cost Estimation
              </h3>
              <p className="text-gray-300 text-sm">
                Calculate deployment costs, estimate gas usage, 
                và optimize upgrade strategies.
              </p>
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
              <h4 className="font-semibold text-white mb-2">1. Single Program Analysis:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Select from common programs hoặc enter custom program ID</li>
                <li>View current version, size, upgrade status</li>
                <li>Access detailed version history và statistics</li>
                <li>Monitor program changes real-time</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">2. Batch Analysis:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Analyze up to 20 programs simultaneously</li>
                <li>Compare sizes, upgrade patterns, authorities</li>
                <li>Export comprehensive analysis reports</li>
                <li>Identify trends across program ecosystem</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">3. Version Comparison:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Load program với version history</li>
                <li>Select two versions để compare</li>
                <li>View detailed diff với size changes</li>
                <li>Identify breaking changes và impacts</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">4. Deployment Planning:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enter program ID, buffer account, authority</li>
                <li>Generate deployment plan với cost estimates</li>
                <li>Validate upgrade compatibility</li>
                <li>Review warnings và required signatures</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}