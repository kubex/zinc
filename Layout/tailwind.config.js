const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    "./scss/*.scss",
    "./ts/*.ts",
    "./demo/*.html",
    "./Components/**/demo/*.html}",
    "./Components/**/ts/*.{ts,js,html}",
    "./Components/**/scss/*.{scss,css}"
  ],
  darkMode: 'class',
  safelist: [
    {pattern: /^col-span-/},
    {pattern: /^border-/},
    //    {pattern: /^bg-/},
    //    {pattern: /^text-/},
    //    {pattern: /^font-/},
    {pattern: /^flex-/},
    //    {pattern: /^shrink-/},
    //    {pattern: /^grow-/},
    //    {pattern: /^grid/},
    //    {pattern: /^col-/},
    //    {pattern: /^row-/},
    //    {pattern: /^gap-/},
    {pattern: /^m.-/},
    {pattern: /^p.-/},
    //{pattern: /^space-/},
    {pattern: /^w-/},
    {pattern: /^h-/},
    //    {pattern: /^min-/},
    //    {pattern: /^max-/},
  ],
  theme: {
    colors: {
      gray: colors.slate,
      'chargie': '#FD4A00',
      'white': '#FFFFFF',
      'bgb': '#F9FAFC',
      'bga': '#F3F6FD',
      'bgd': '#F7F7F7',
      'border': '#D3E1F0',
      'navtext': '#AFC8F5',
      'navicon': '#5D82C2',
      'pagenav': '#DEEAF8',
      'paletext': '#97ADC6',
      'midtext': '#415E83',
      'darktext': '#08091D',
      'navbar': '#122E7C',
      'navbar-active': '#0D2667',
      'hl-green': '#29C1BC',
      'hl-blue': '#2C92E3',
      'error': '#FD003E',
    },
    extend: {
      screens: {
        'md': '640px',
        'lg': '1024px'
      },
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
