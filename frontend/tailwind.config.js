/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#16A34A',
          dark: '#15803d',
        },
        secondary: {
          DEFAULT: '#1A4D45',
          light: '#266B61',
          dark: '#0E2F2A',
        },
        accent: {
          DEFAULT: '#F3B95F',
          light: '#F7CA87',
          dark: '#D99B3C',
        },
        success: '#4CAF50',
        warning: '#FFC107',
        error: '#DC3545',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' }
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.6s ease-out',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite'
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'hover': '0 10px 40px -3px rgba(0, 0, 0, 0.1), 0 10px 20px -2px rgba(0, 0, 0, 0.04)'
      }
    },
  },
  plugins: [],
} 