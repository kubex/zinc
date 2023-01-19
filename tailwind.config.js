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
      darkBorder: colors.slate["700"],
      darkTxt:    {
        900: 'rgba(255,255,255, 1)',
        800: 'rgba(255,255,255, 0.87)',
        600: 'rgba(255,255,255, 0.60)',
        400: 'rgba(255,255,255, 0.40)',
      },

      border: colors.slate["300"],
      txt:    {
        900: 'rgba(0, 0, 0, 1)',
        800: 'rgba(0, 0, 0, 0.87)',
        600: 'rgba(0, 0, 0, 0.60)',
        400: 'rgba(0, 0, 0, 0.40)',
      },

      dark:        colors.slate,
      transparent: 'transparent',
      primary:     colors.violet,
      secondary:   colors.orange,
      tertiary:    colors.green,

      'white': '#FFFFFF',
      'black': '#000000',

      'error':   '#FD003E',
      'info':    '#7DD3FC',
      'warning': '#FBBF24',
      'success': '#10B981',

      'fuchsia': '#D32CE3',
    },
    spacing:  {
      0:     '0px',
      'px':  '1px',
      'xxs': '3px',
      'xs':  '5px',
      'sm':  '10px',
      'md':  '15px',
      'lg':  '20px',
      'xl':  '25px',

      'bar':     '50px',
      'tile':    '80px',
      'sidenav': '240px',
      'spanel':  '250px',
      'mpanel':  '320px',
      'panel':   '360px',
    },
    screens:  {
      'sm':  '360px',
      'smp': '480px',
      'md':  '768px',
      'lg':  '1100px',
      'hd':  '1440px',
      '4k':  '2560px',
    },
    fontSize: {
      xs: ['11px', '13px'],
      sm: ['12px', '15px'],
      md: ['13px', '17px'],
      lg: ['15px', '21px'],

      navitem: ['14px', '36px'],
      title:   ['24px', {lineHeight: '40px', fontWeight: '500'}],
    },
    extend:   {
      zIndex:      {
        'header':  300,
        'sidenav': 250,
      },
      boxShadow:   {
        'nav': '5px 0 40px #000000'
      },
      maxWidth:    {
        'bar':     '50px',
        'sidenav': '240px',
        'spanel':  '250px',
        'mpanel':  '320px',
        'panel':   '360px',
        '50p':     '50%',
        '70p':     '70%',
      },
      minWidth:    {
        'bar':     '50px',
        'sidenav': '240px',
        'spanel':  '250px',
        'mpanel':  '320px',
        'panel':   '360px',
      },
      minHeight:   {
        'bar': '50px',
      },
      borderWidth: {
        DEFAULT: '1px',
        '0':     '0',
        'px':    '1px',
        'xs':    '2px',
        'sm':    '3px',
        'md':    '4px',
      },
      fontFamily:  {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
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
