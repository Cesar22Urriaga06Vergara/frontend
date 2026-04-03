import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './app.vue',
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './composables/**/*.{js,ts}',
    './error.vue',
  ],
  theme: {
    extend: {},
  },
} satisfies Config