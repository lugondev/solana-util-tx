'use client'

export default function Footer() {
  return (
    <footer className='mt-auto bg-gray-800 border-t-4 border-green-400/20 px-4 lg:px-8 py-4'>
      <div className='text-center text-sm text-gray-400 font-mono'>
        <p className='pixel-text'>
          Built with ❤️ by{' '}
          <a 
            href='https://github.com/lugondev' 
            target='_blank' 
            rel='noopener noreferrer'
            className='text-green-400 hover:text-green-300 transition-colors underline'
          >
            LugonDev
          </a>
          {' '}• Solana Utility Tools
        </p>
      </div>
    </footer>
  )
}