/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Deep Space – Mission Control Palette
        space: {
          950: '#070B1A', // Midnight Navy (Main background)
          900: '#0B1124',
          800: '#101A32', // Deep Blue (Secondary background)
          700: '#172545',
          600: '#1F335C',
          500: '#2A4478',
        },
        electric: {
          DEFAULT: '#00D9FF', // Electric Cyan (Primary accent)
          light: '#5CE5FF',
          dark: '#00A8C7',
          glow: 'rgba(0, 217, 255, 0.4)',
        },
        violet: {
          DEFAULT: '#8B5CF6', // Secondary accent
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED',
          900: '#3B1F7A',
        },
        highlight: {
          DEFAULT: '#FF9D42', // Highlight Orange
          light: '#FFB870',
          dark: '#E07D1E',
        },
        success: {
          DEFAULT: '#10B981', // Emerald Green
          light: '#34D399',
          dark: '#059669',
        },
        warning: {
          DEFAULT: '#F59E0B', // Amber
          light: '#FBBF24',
          dark: '#D97706',
        },
        danger: {
          DEFAULT: '#F87171', // Soft Red
          light: '#FCA5A5',
          dark: '#EF4444',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px rgba(0, 217, 255, 0.25), inset 0 0 15px rgba(0, 217, 255, 0.08)',
        'glow-violet': '0 0 25px rgba(139, 92, 246, 0.25)',
        'glow-orange': '0 0 25px rgba(255, 157, 66, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
