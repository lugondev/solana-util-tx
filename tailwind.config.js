/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        pixel: ['var(--font-pixel)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        // Primary color scheme
        primary: 'var(--pixel-accent)',
        
        // Background colors
        'pixel-bg-primary': 'var(--pixel-bg-primary)',
        'pixel-bg-secondary': 'var(--pixel-bg-secondary)',
        'pixel-bg-tertiary': 'var(--pixel-bg-tertiary)',
        'pixel-bg-quaternary': 'var(--pixel-bg-quaternary)',
        
        // Accent colors
        'pixel-accent': 'var(--pixel-accent)',
        'pixel-accent-dim': 'var(--pixel-accent-dim)',
        'pixel-accent-bright': 'var(--pixel-accent-bright)',
        'pixel-accent-dark': 'var(--pixel-accent-dark)',
        
        // Status colors
        'pixel-success': 'var(--pixel-success)',
        'pixel-warning': 'var(--pixel-warning)',
        'pixel-error': 'var(--pixel-error)',
        'pixel-info': 'var(--pixel-info)',
        
        // Text colors
        'pixel-text-primary': 'var(--pixel-text-primary)',
        'pixel-text-secondary': 'var(--pixel-text-secondary)',
        'pixel-text-tertiary': 'var(--pixel-text-tertiary)',
        'pixel-text-quaternary': 'var(--pixel-text-quaternary)',
        'pixel-text-accent': 'var(--pixel-text-accent)',
        
        // Border colors
        'pixel-border-primary': 'var(--pixel-border-primary)',
        'pixel-border-secondary': 'var(--pixel-border-secondary)',
        'pixel-border-accent': 'var(--pixel-border-accent)',
        
        // Shadow
        'pixel-shadow': 'var(--pixel-shadow)',
        
        // Input colors
        'pixel-input-bg': 'var(--pixel-input-bg)',
        'pixel-input-border': 'var(--pixel-input-border)',
        'pixel-input-focus': 'var(--pixel-input-focus)',
      },
      spacing: {
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '8': '64px',
      },
      fontSize: {
        'xs': ['10px', '1.4'],
        'sm': ['12px', '1.4'],
        'base': ['14px', '1.4'],
        'lg': ['16px', '1.4'],
        'xl': ['20px', '1.4'],
        '2xl': ['24px', '1.2'],
        '3xl': ['32px', '1.2'],
        '4xl': ['40px', '1.2'],
      },
      animation: {
        'pixel-blink': 'pixel-blink 1s infinite',
        'pixel-pulse': 'pixel-pulse 2s infinite',
        'pixel-glow': 'pixel-glow 2s infinite',
        'pixel-spin': 'pixel-spin 1s linear infinite',
      },
    },
  },
  plugins: [],
};
