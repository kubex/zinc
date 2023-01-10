const defaultTheme = require('tailwindcss/defaultTheme')
const colors = require('tailwindcss/colors')

module.exports = {
  content:     [
    "./scss/*.scss",
    "./ts/*.ts",
    "./demo/*.html",
    "./Components/**/demo/*.html}",
    "./Components/**/ts/*.{ts,js,html}",
    "./Components/**/scss/*.{scss,css}"
  ],
  darkMode:    'class',
  theme:       {
    colors:   {
      border:    colors.slate,
      primary:   colors.violet,
      secondary: colors.orange,
      tertiary:  colors.green,
      txt:       colors.slate,

      'white':   '#FFFFFF',
      'error':   '#FD003E',
      'info':    '#7DD3FC',
      'warning': '#FBBF24',
      'success': '#10B981',
      'fuchsia': '#D32CE3',
    },
    spacing:  {
      0:    '0px',
      'px': '1px',
      'xs': '5px',
      'sm': '10px',
      'md': '15px',
      'lg': '20px',
      'xl': '25px',

      'bar':     '50px',
      'sidenav': '240px',
      'spanel':  '250px',
      'panel':   '360px',
    },
    screens:  {
      'sm': '360px',
      'md': '768px',
      'lg': '1100px',
      'hd': '1440px',
      '4k': '2560px',
    },
    fontSize: {
      sm: ['14px', '20px'],
    },
    extend:   {
      zIndex:     {
        'header':  300,
        'sidenav': 250,
      },
      boxShadow:  {
        'nav': '5px 0 40px #000000'
      },
      maxWidth:   {
        'bar':     '50px',
        'sidenav': '240px',
        'spanel':  '250px',
        'panel':   '360px',
        '50p':     '50%',
        '70p':     '70%',
      },
      minWidth:   {
        'bar':     '50px',
        'sidenav': '240px',
        'spanel':  '250px',
        'panel':   '360px',
      },
      fontFamily: {
        sans: ['Nunito', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  corePlugins: {
    preflight: true,
  },
  plugins:     [
    require('@tailwindcss/forms'),
  ],
}
