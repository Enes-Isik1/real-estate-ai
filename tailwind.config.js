/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}" // <-- Falls deine Komponenten im lib-Ordner liegen, füg das zur Sicherheit hinzu!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} 