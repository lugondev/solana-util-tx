'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelInput } from '@/components/ui/pixel-input'
import { JITO_BLOCK_ENGINES, JitoRegion, getAvailableRegions } from '@/lib/solana/jito/config'
import { useNetwork } from '@/contexts/NetworkContext'
import { Globe, Wifi, WifiOff, MapPin, Clock } from 'lucide-react'

interface JitoRegionSelectorProps {
  selectedRegion: JitoRegion | string
  onRegionChange: (region: JitoRegion | string) => void
  customEndpoint?: string
  onCustomEndpointChange?: (endpoint: string) => void
  showCustomEndpoint?: boolean
}

export function JitoRegionSelector({
  selectedRegion,
  onRegionChange,
  customEndpoint = '',
  onCustomEndpointChange,
  showCustomEndpoint = true
}: JitoRegionSelectorProps) {
  const { network } = useNetwork()
  const [useCustom, setUseCustom] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<{
    [key: string]: 'checking' | 'online' | 'offline'
  }>({})

  const availableRegions = getAvailableRegions(
    (network === 'mainnet-beta' || network === 'testnet') ? network : 'mainnet-beta'
  )

  const handleRegionSelect = (region: JitoRegion) => {
    setUseCustom(false)
    onRegionChange(region)
  }

  const handleCustomToggle = () => {
    setUseCustom(!useCustom)
    if (!useCustom) {
      onRegionChange(customEndpoint)
    } else {
      onRegionChange('ny') // default back to NY
    }
  }

  const handleCustomEndpointChange = (endpoint: string) => {
    if (onCustomEndpointChange) {
      onCustomEndpointChange(endpoint)
    }
    if (useCustom) {
      onRegionChange(endpoint)
    }
  }

  const checkRegionLatency = async (endpoint: string) => {
    const regionKey = Object.keys(availableRegions).find(
      key => (availableRegions as any)[key].endpoint === endpoint
    ) || endpoint

    setConnectionStatus(prev => ({ ...prev, [regionKey]: 'checking' }))
    
    try {
      const start = Date.now()
      const response = await fetch(endpoint + '/api/v1/bundles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
        signal: AbortSignal.timeout(5000)
      })
      const latency = Date.now() - start
      
      setConnectionStatus(prev => ({ 
        ...prev, 
        [regionKey]: response.ok ? 'online' : 'offline' 
      }))
      
      return latency
    } catch {
      setConnectionStatus(prev => ({ ...prev, [regionKey]: 'offline' }))
      return null
    }
  }

  const getStatusIcon = (region: JitoRegion | string) => {
    const status = connectionStatus[region]
    switch (status) {
      case 'checking':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
      case 'online':
        return <Wifi className="h-3 w-3 text-green-400" />
      case 'offline':
        return <WifiOff className="h-3 w-3 text-red-400" />
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  return (
    <PixelCard>
      <div className="space-y-4">
        <div className="border-b-4 border-green-400/20 pb-3">
          <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            BLOCK ENGINE REGION
          </h3>
          <p className="font-mono text-xs text-gray-400 mt-1">
            Choose the closest region for optimal performance
          </p>
        </div>

        <div className="space-y-3">
          {/* Predefined Regions */}
          <div className="grid grid-cols-1 gap-3">
            {Object.entries(availableRegions).map(([key, region]) => {
              const isSelected = !useCustom && selectedRegion === key
              
              return (
                <button
                  key={key}
                  onClick={() => handleRegionSelect(key as JitoRegion)}
                  className={`p-3 border-4 transition-all text-left ${
                    isSelected 
                      ? 'border-green-400 bg-green-400/10' 
                      : 'border-gray-700 hover:border-green-400/50'
                  }`}
                  onMouseEnter={() => checkRegionLatency(region.endpoint)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{region.flag}</span>
                      <span className="font-pixel text-xs text-white">
                        {region.name}
                      </span>
                    </div>
                    {getStatusIcon(key)}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-3 w-3 text-gray-400" />
                    <span className="font-mono text-xs text-gray-400">
                      {region.region}
                    </span>
                  </div>
                  
                  <div className="font-mono text-xs text-gray-500 break-all">
                    {region.endpoint}
                  </div>
                  
                  {connectionStatus[key] === 'online' && (
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className="h-3 w-3 text-green-400" />
                      <span className="font-mono text-xs text-green-400">
                        Connected
                      </span>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Custom Endpoint Option */}
          {showCustomEndpoint && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 font-pixel text-xs text-gray-400">
                  <input
                    type="checkbox"
                    checked={useCustom}
                    onChange={handleCustomToggle}
                    className="w-4 h-4"
                  />
                  USE CUSTOM ENDPOINT
                </label>
              </div>

              {useCustom && (
                <div className="space-y-3">
                  <PixelInput
                    label="CUSTOM BLOCK ENGINE ENDPOINT"
                    value={customEndpoint}
                    onChange={(e) => handleCustomEndpointChange(e.target.value)}
                    placeholder="https://your-custom-block-engine.com"
                  />
                  
                  <div className="p-3 bg-yellow-600/10 border-4 border-yellow-600/20">
                    <div className="font-mono text-xs text-yellow-400">
                      ⚠️ <strong>Custom Endpoint:</strong> Make sure the endpoint is a valid Jito block engine. 
                      Incorrect endpoints may cause bundle submission failures.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Current Selection Info */}
          <div className="p-3 bg-gray-800 border-4 border-gray-700">
            <div className="font-mono text-xs text-gray-400 mb-1">
              SELECTED ENDPOINT:
            </div>
            <div className="font-mono text-xs text-green-400 break-all">
              {useCustom 
                ? customEndpoint || 'No custom endpoint set' 
                : (availableRegions as any)[selectedRegion]?.endpoint || selectedRegion
              }
            </div>
          </div>

          {/* Network Info */}
          <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
            <div className="font-mono text-xs text-blue-400 mb-2">
              💡 <strong>Region Selection Tips:</strong>
            </div>
            <div className="space-y-1 font-mono text-xs text-blue-300">
              <div>• Choose the region closest to your location</div>
              <div>• Lower latency = better bundle landing rates</div>
              <div>• Green icon = region is online and responsive</div>
              <div>• Custom endpoints allow private block engines</div>
            </div>
          </div>
        </div>
      </div>
    </PixelCard>
  )
}