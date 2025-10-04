'use client'

import React, { useState, useEffect } from 'react'
import { FeeSpeed, FeeRecommendation, FEE_PRESETS } from '@/lib/solana/transactions/types'
import { PixelCard } from './pixel-card'
import { PixelButton } from './pixel-button'

interface FeeSelectorProps {
  recommendations: FeeRecommendation[]
  selectedSpeed: FeeSpeed
  onSpeedChange: (speed: FeeSpeed) => void
  customFee?: number
  onCustomFeeChange?: (fee: number) => void
  disabled?: boolean
  showCustom?: boolean
}

export function FeeSelector({
  recommendations,
  selectedSpeed,
  onSpeedChange,
  customFee,
  onCustomFeeChange,
  disabled = false,
  showCustom = false,
}: FeeSelectorProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState<string>(customFee?.toString() || '')

  useEffect(() => {
    if (customFee !== undefined) {
      setCustomValue(customFee.toString())
    }
  }, [customFee])

  const handleCustomSubmit = () => {
    const value = parseInt(customValue)
    if (!isNaN(value) && value > 0) {
      onCustomFeeChange?.(value)
      setShowCustomInput(false)
    }
  }

  const formatMicroLamports = (microLamports: number): string => {
    if (microLamports < 1000) {
      return `${microLamports} µL`
    }
    if (microLamports < 1000000) {
      return `${(microLamports / 1000).toFixed(1)}k µL`
    }
    return `${(microLamports / 1000000).toFixed(2)}M µL`
  }

  const calculateCostInSOL = (microLamports: number, computeUnits: number = 200000): number => {
    const totalLamports = (microLamports * computeUnits) / 1000000
    return totalLamports / 1000000000 // Convert to SOL
  }

  return (
    <PixelCard>
      <div className="space-y-4">
        {/* Header */}
        <div 
          className="border-b-4 pb-3"
          style={{ borderColor: 'var(--pixel-border-primary)' }}
        >
          <h3 
            className="font-pixel text-sm flex items-center gap-2"
            style={{ color: 'var(--pixel-accent)' }}
          >
            <span className="animate-pixel-blink">▸</span>
            PRIORITY FEE
          </h3>
          <p 
            className="font-mono text-xs mt-1"
            style={{ color: 'var(--pixel-text-quaternary)' }}
          >
            Higher fees = faster confirmation
          </p>
        </div>

        {/* Fee Speed Options */}
        <div className="grid grid-cols-2 gap-3">
          {recommendations.map((rec) => {
            const isSelected = selectedSpeed === rec.speed
            const preset = FEE_PRESETS[rec.speed]

            return (
              <button
                key={rec.speed}
                onClick={() => onSpeedChange(rec.speed)}
                disabled={disabled}
                className={`
                  relative p-4 border-4 transition-none cursor-pointer
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                style={{
                  borderColor: isSelected ? 'var(--pixel-accent)' : 'var(--pixel-border-primary)',
                  backgroundColor: isSelected ? 'var(--pixel-bg-tertiary)' : 'var(--pixel-bg-primary)',
                  color: 'var(--pixel-text-primary)',
                  boxShadow: isSelected 
                    ? '4px 4px 0 var(--pixel-accent-dark), 8px 8px 0 var(--pixel-shadow)'
                    : '2px 2px 0 var(--pixel-shadow)'
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--pixel-accent)'
                    e.currentTarget.style.backgroundColor = 'var(--pixel-bg-secondary)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isSelected) {
                    e.currentTarget.style.borderColor = 'var(--pixel-border-primary)'
                    e.currentTarget.style.backgroundColor = 'var(--pixel-bg-primary)'
                  }
                }}
              >
                {/* Speed Icon */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-pixel text-xs uppercase">
                    {rec.speed}
                  </span>
                  {isSelected && (
                    <span className="text-primary animate-pixel-blink">●</span>
                  )}
                </div>

                {/* Fee Amount */}
                <div 
                  className="font-mono text-sm mb-1"
                  style={{ color: 'var(--pixel-accent)' }}
                >
                  {formatMicroLamports(rec.microLamports)}
                </div>

                {/* Cost in SOL */}
                <div 
                  className="font-mono text-xs mb-2"
                  style={{ color: 'var(--pixel-text-tertiary)' }}
                >
                  ~{calculateCostInSOL(rec.microLamports).toFixed(6)} SOL
                </div>

                {/* Estimated Time */}
                <div 
                  className="text-xs"
                  style={{ color: 'var(--pixel-text-quaternary)' }}
                >
                  {rec.estimatedTime}
                </div>

                {/* Selection Indicator */}
                {isSelected && (
                  <div 
                    className="absolute top-0 left-0 w-full h-1"
                    style={{ backgroundColor: 'var(--pixel-accent)' }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Custom Fee Option */}
        {showCustom && (
          <div 
            className="pt-3 border-t-4"
            style={{ borderColor: 'var(--pixel-border-primary)' }}
          >
            {!showCustomInput ? (
              <PixelButton
                variant="secondary"
                size="sm"
                onClick={() => setShowCustomInput(true)}
                disabled={disabled}
                className="w-full"
              >
                [CUSTOM FEE]
              </PixelButton>
            ) : (
              <div className="space-y-2">
                <label 
                  className="font-pixel text-xs"
                  style={{ color: 'var(--pixel-text-secondary)' }}
                >
                  CUSTOM FEE (µLAMPORTS):
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={customValue}
                    onChange={(e) => setCustomValue(e.target.value)}
                    placeholder="e.g. 5000"
                    disabled={disabled}
                    className="flex-1 px-3 py-2 border-4 font-mono text-sm focus:outline-none disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--pixel-input-bg)',
                      borderColor: 'var(--pixel-input-border)',
                      color: 'var(--pixel-text-primary)'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--pixel-input-focus)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'var(--pixel-input-border)'
                    }}
                  />
                  <PixelButton
                    variant="primary"
                    size="sm"
                    onClick={handleCustomSubmit}
                    disabled={disabled || !customValue}
                  >
                    SET
                  </PixelButton>
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setShowCustomInput(false)
                      setCustomValue('')
                    }}
                    disabled={disabled}
                  >
                    X
                  </PixelButton>
                </div>
                {customValue && !isNaN(parseInt(customValue)) && (
                  <div 
                    className="font-mono text-xs"
                    style={{ color: 'var(--pixel-text-quaternary)' }}
                  >
                    ≈ {calculateCostInSOL(parseInt(customValue)).toFixed(6)} SOL
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div 
          className="p-3 border-4"
          style={{
            backgroundColor: 'var(--pixel-bg-primary)',
            borderColor: 'var(--pixel-border-primary)'
          }}
        >
          <div className="flex items-start gap-2">
            <span style={{ color: 'var(--pixel-accent)' }} className="mt-0.5">ℹ</span>
            <div 
              className="font-mono text-xs leading-relaxed"
              style={{ color: 'var(--pixel-text-tertiary)' }}
            >
              Priority fees are paid to validators to prioritize your transaction.
              Actual cost depends on compute units used.
            </div>
          </div>
        </div>
      </div>
    </PixelCard>
  )
}
