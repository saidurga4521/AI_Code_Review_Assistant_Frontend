/** @type {import('tailwindcss').Config} */
export default {
  // It scans all files under the src folder and this classes applcable to those files
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode:'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          900: '#312e81',
        },
        surface: {
          dark: '#0f172a',    // Slate 900
          card: '#1e293b',    // Slate 800
          border: '#334155',  // Slate 700
        }
      }
    },
  },
  plugins: [],
}

