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
  safelist: [
    {pattern: /^bg-/},
    {pattern: /^text-/},
    {pattern: /^font-/},
    {pattern: /^flex-/},
    {pattern: /^shrink-/},
    {pattern: /^grow-/},
    {pattern: /^grid/},
    {pattern: /^col-/},
    {pattern: /^row-/},
    {pattern: /^gap-/},
    {pattern: /^m.-/},
    {pattern: /^p.-/},
    {pattern: /^space-/},
    {pattern: /^w-/},
    {pattern: /^h-/},
    {pattern: /^min-/},
    {pattern: /^max-/},
  ],
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
