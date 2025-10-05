'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    
    const initialTheme = savedTheme || systemTheme
    setTheme(initialTheme)
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    document.documentElement.classList.toggle('light', initialTheme === 'light')
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    
    // Apply theme to document
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    document.documentElement.classList.toggle('light', newTheme === 'light')
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen transition-colors duration-200 ${
        theme === 'dark' 
          ? 'bg-gray-900 text-white' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Safe theme hook that returns default values if no provider
export function useSafeTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    return {
      theme: 'dark' as const,
      toggleTheme: () => {},
      isDark: true,
      isLight: false
    }
  }
  return context
}

// Theme-aware component utilities
export const themeClasses = {
  card: {
    dark: 'bg-gray-800 border-gray-700 text-white',
    light: 'bg-white border-gray-200 text-gray-900'
  },
  button: {
    primary: {
      dark: 'bg-blue-600 hover:bg-blue-700 text-white',
      light: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    secondary: {
      dark: 'bg-gray-700 hover:bg-gray-600 text-white border-gray-600',
      light: 'bg-gray-200 hover:bg-gray-300 text-gray-900 border-gray-300'
    }
  },
  input: {
    dark: 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500',
    light: 'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-500'
  },
  text: {
    primary: {
      dark: 'text-white',
      light: 'text-gray-900'
    },
    secondary: {
      dark: 'text-gray-300',
      light: 'text-gray-600'
    },
    muted: {
      dark: 'text-gray-400',
      light: 'text-gray-500'
    }
  }
}