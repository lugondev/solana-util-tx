'use client'

import { useState } from 'react'
import { useSafeTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'

export function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useSafeTheme()
  const [showOptions, setShowOptions] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
        }`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? (
          <Sun size={20} className="transition-transform hover:rotate-12" />
        ) : (
          <Moon size={20} className="transition-transform hover:rotate-12" />
        )}
      </button>
    </div>
  )
}

export function ThemeSelector() {
  const { theme, isDark } = useSafeTheme()
  const [showOptions, setShowOptions] = useState(false)

  const setTheme = (newTheme: 'dark' | 'light' | 'system') => {
    if (newTheme === 'system') {
      localStorage.removeItem('theme')
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      document.documentElement.classList.toggle('dark', systemTheme === 'dark')
      document.documentElement.classList.toggle('light', systemTheme === 'light')
    } else {
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      document.documentElement.classList.toggle('light', newTheme === 'light')
    }
    setShowOptions(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowOptions(!showOptions)}
        className={`p-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400' 
            : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
        }`}
        title="Theme options"
      >
        {theme === 'dark' ? (
          <Moon size={20} />
        ) : (
          <Sun size={20} />
        )}
      </button>

      {showOptions && (
        <div className={`absolute right-0 mt-2 w-32 rounded-lg shadow-lg border z-50 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="py-1">
            <button
              onClick={() => setTheme('light')}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                isDark 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <Sun size={16} />
              Light
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                isDark 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <Moon size={16} />
              Dark
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 ${
                isDark 
                  ? 'hover:bg-gray-700 text-white' 
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
            >
              <Monitor size={16} />
              System
            </button>
          </div>
        </div>
      )}
    </div>
  )
}