/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  // Tell Tailwind where to scan for class usage — enables tree-shaking
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  // ── Design System Tokens ─────────────────────────────────────
  theme: {
    extend: {
      // Brand colour palette — maps to CSS custom properties in index.css
      colors: {
        // Base neutrals
        surface:  'hsl(var(--color-surface) / <alpha-value>)',
        overlay:  'hsl(var(--color-overlay) / <alpha-value>)',
        border:   'hsl(var(--color-border)  / <alpha-value>)',
        muted:    'hsl(var(--color-muted)   / <alpha-value>)',

        // Text
        primary:  'hsl(var(--color-primary)  / <alpha-value>)',
        secondary:'hsl(var(--color-secondary)/ <alpha-value>)',

        // Pillar accent colours
        perf: {
          DEFAULT: 'hsl(var(--perf-hue) 85% 60%)',
          light:   'hsl(var(--perf-hue) 85% 75%)',
          dark:    'hsl(var(--perf-hue) 70% 40%)',
          glow:    'hsl(var(--perf-hue) 85% 60% / 0.25)',
        },
        study: {
          DEFAULT: 'hsl(var(--study-hue) 75% 55%)',
          light:   'hsl(var(--study-hue) 75% 70%)',
          dark:    'hsl(var(--study-hue) 60% 35%)',
          glow:    'hsl(var(--study-hue) 75% 55% / 0.25)',
        },
        tech: {
          DEFAULT: 'hsl(var(--tech-hue) 80% 60%)',
          light:   'hsl(var(--tech-hue) 80% 75%)',
          dark:    'hsl(var(--tech-hue) 65% 40%)',
          glow:    'hsl(var(--tech-hue) 80% 60% / 0.25)',
        },
      },

      // Typography
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['JetBrains Mono', 'Fira Code', 'monospace'],
      },

      // Blur / glassmorphism utilities
      backdropBlur: {
        xs: '2px',
      },

      // Animation keyframes
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
        'streak-pop': {
          '0%':   { transform: 'scale(1)' },
          '50%':  { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in':    'fade-in 0.35s ease-out both',
        'slide-in':   'slide-in 0.3s ease-out both',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'streak-pop': 'streak-pop 0.4s ease-in-out',
      },

      // Box shadows
      boxShadow: {
        'glow-perf':   '0 0 24px hsl(var(--perf-hue)   85% 60% / 0.35)',
        'glow-study':  '0 0 24px hsl(var(--study-hue)  75% 55% / 0.35)',
        'glow-tech':   '0 0 24px hsl(var(--tech-hue)    80% 60% / 0.35)',
        'card':        '0 4px 24px rgba(0,0,0,0.35)',
      },

      // Border radii
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },

  plugins: [],
}
