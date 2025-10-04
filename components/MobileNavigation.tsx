'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import Navigation from './Navigation'

interface MobileNavigationProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileNavigation({ isOpen, onClose }: MobileNavigationProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Mobile Navigation Panel */}
      <div className={`
        fixed top-0 left-0 h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="relative h-full">
          <Navigation className="w-72" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-4 p-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  )
}