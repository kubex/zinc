const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  content:  [
    "./scss/*.scss",
    "./ts/*.ts",
    "./demo/*.html",
    "./components/**/demo/*.html}",
    "./components/**/ts/*.{ts,js,html}",
    "./components/**/scss/*.{scss,css}"
  ],
  darkMode: 'class',
  theme:    {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins:  [
    require('@tailwindcss/forms'),
  ],
}
