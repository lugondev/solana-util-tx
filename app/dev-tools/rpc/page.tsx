'use client'

import { Metadata } from 'next'
import { PixelCard } from '@/components/ui/pixel-card'
import { RPCBenchmarkerComponent } from '@/components/dev-tools/rpc-benchmarker'

export default function RPCBenchmarkerPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-3xl text-green-400 mb-4">RPC Benchmarker</h1>
        <p className="text-gray-300 leading-relaxed">
          Test and compare performance of Solana RPC endpoints. Measure latency, throughput, and connection stability.
        </p>
      </div>

      {/* Main Tool */}
      <div className="mb-8">
        <RPCBenchmarkerComponent />
      </div>

      {/* Documentation */}
      <div className="grid md:grid-cols-2 gap-6">
        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">📊 Test Metrics</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Latency Tests</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">getHealth</code> - Endpoint health check</li>
                <li>• <code className="text-blue-400">getSlot</code> - Current slot retrieval</li>
                <li>• <code className="text-blue-400">getBlockHeight</code> - Block height query</li>
                <li>• <code className="text-blue-400">getVersion</code> - RPC version info</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Performance Metrics</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Ping time (ms)</li>
                <li>• Request/Response latency</li>
                <li>• Throughput (requests/second)</li>
                <li>• Success rate (%)</li>
                <li>• Error rate & types</li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">⚡ Testing Types</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Quick Test</h3>
              <p className="text-gray-300 mb-2">Fast connectivity check (5 requests)</p>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Basic latency measurement</li>
                <li>• Connection stability</li>
                <li>• Error detection</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Load Test</h3>
              <p className="text-gray-300 mb-2">Comprehensive performance analysis</p>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Concurrent request handling</li>
                <li>• Sustained throughput</li>
                <li>• Performance under load</li>
                <li>• Rate limiting detection</li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">🎯 Use Cases</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Development</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Choose fastest RPC for your app</li>
                <li>• Debug connection issues</li>
                <li>• Monitor endpoint stability</li>
                <li>• Compare free vs paid RPCs</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Production</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Health monitoring</li>
                <li>• Performance benchmarking</li>
                <li>• SLA compliance checking</li>
                <li>• Failover testing</li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">📋 Common Endpoints</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Public RPCs</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">api.mainnet-beta.solana.com</code></li>
                <li>• <code className="text-blue-400">api.devnet.solana.com</code></li>
                <li>• <code className="text-blue-400">api.testnet.solana.com</code></li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Premium Providers</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Helius</li>
                <li>• QuickNode</li>
                <li>• Alchemy</li>
                <li>• GetBlock</li>
                <li>• Triton</li>
              </ul>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Tips */}
      <PixelCard className="mt-6">
        <h2 className="font-pixel text-xl text-green-400 mb-4">💡 Optimization Tips</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Geographic Location</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Choose RPC closest to your users</li>
              <li>• Test from multiple locations</li>
              <li>• Consider CDN distribution</li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Request Optimization</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Use commitment levels appropriately</li>
              <li>• Batch requests when possible</li>
              <li>• Implement proper retry logic</li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Monitoring</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Set up alerts for high latency</li>
              <li>• Track error rates over time</li>
              <li>• Monitor rate limit usage</li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Fallback Strategy</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Configure multiple endpoints</li>
              <li>• Implement automatic failover</li>
              <li>• Load balance across providers</li>
            </ul>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}