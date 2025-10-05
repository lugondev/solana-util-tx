import { Metadata } from 'next'
import DataAnalyticsDashboard from '@/components/data-tools/data-analytics-dashboard'

export const metadata: Metadata = {
  title: 'Data Analytics Dashboard | Solana Utility Tools',
  description: 'Comprehensive analytics for Solana data patterns, trends, transaction analysis, and program usage statistics.',
  keywords: ['solana analytics', 'transaction analysis', 'program metrics', 'blockchain data', 'performance metrics'],
}

export default function DataAnalyticsPage() {
  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            📈 Data Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Comprehensive analytics for Solana data patterns and trends. 
            Analyze transactions, monitor program usage, and track performance metrics.
          </p>
        </div>

        <DataAnalyticsDashboard />

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            🚀 Analytics Capabilities
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold text-white mb-2">Transaction Analytics</h3>
              <p className="text-gray-300 text-sm">
                Analyze transaction patterns, volumes, and success rates
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="text-lg font-semibold text-white mb-2">Trend Analysis</h3>
              <p className="text-gray-300 text-sm">
                Track usage trends and identify patterns over time
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-semibold text-white mb-2">Performance Metrics</h3>
              <p className="text-gray-300 text-sm">
                Monitor performance indicators and system health
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-lg font-semibold text-white mb-2">Custom Reports</h3>
              <p className="text-gray-300 text-sm">
                Generate custom reports and export data for analysis
              </p>
            </div>
          </div>
        </div>

        {/* Data Sources */}
        <div className="mt-16 bg-gray-800 p-8 rounded-lg border border-gray-700">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            📡 Data Sources & Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-4">On-Chain Data</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Transaction volume and frequency</li>
                <li>• Program invocation statistics</li>
                <li>• Account creation and updates</li>
                <li>• Token transfer patterns</li>
                <li>• Fee distribution analysis</li>
                <li>• Block utilization metrics</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-4">Program Analytics</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Instruction usage patterns</li>
                <li>• Success/failure rates</li>
                <li>• Resource consumption</li>
                <li>• Cross-program interactions</li>
                <li>• Error pattern analysis</li>
                <li>• Performance benchmarks</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-4">Network Metrics</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Network throughput</li>
                <li>• Validator performance</li>
                <li>• Stake distribution</li>
                <li>• Cluster health indicators</li>
                <li>• Resource utilization</li>
                <li>• Geographic distribution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Analysis Types */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            🔍 Analysis Types
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Real-time Analytics</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Live transaction monitoring</li>
                <li>• Real-time performance dashboards</li>
                <li>• Instant alert notifications</li>
                <li>• Dynamic trend visualization</li>
                <li>• Streaming data analysis</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Historical Analysis</h3>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Long-term trend analysis</li>
                <li>• Comparative period studies</li>
                <li>• Growth pattern identification</li>
                <li>• Seasonal usage analysis</li>
                <li>• Predictive modeling</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}