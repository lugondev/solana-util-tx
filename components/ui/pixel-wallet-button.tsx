'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { PixelButton } from '@/components/ui/pixel-button'
import { Wallet, Power } from 'lucide-react'

interface PixelWalletButtonProps {
  className?: string
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  disconnectText?: string
  connectText?: string
}

/**
 * Custom pixel-styled wallet button that replaces WalletMultiButton
 * with consistent pixel art design
 */
export function PixelWalletButton({
  className = '',
  variant = 'primary',
  disconnectText = '[DISCONNECT WALLET]',
  connectText = '[CONNECT WALLET]'
}: PixelWalletButtonProps) {
  const { connected, disconnect, publicKey, wallet } = useWallet()
  const { setVisible } = useWalletModal()

  const handleClick = () => {
    if (connected) {
      disconnect()
    } else {
      setVisible(true)
    }
  }

  const getButtonText = () => {
    if (connected && publicKey) {
      return disconnectText
    }
    return connectText
  }

  const getButtonIcon = () => {
    if (connected) {
      return <Power className="h-4 w-4" />
    }
    return <Wallet className="h-4 w-4" />
  }

  return (
    <PixelButton
      onClick={handleClick}
      variant={variant}
      className={`w-full ${className}`}
    >
      {getButtonIcon()}
      {getButtonText()}
    </PixelButton>
  )
}