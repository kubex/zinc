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
    colors:     {
      darkBorder: colors.slate["700"],
      darkTxt:    {
        900: 'rgba(255,255,255, 1)',
        800: 'rgba(255,255,255, 0.87)',
        600: 'rgba(255,255,255, 0.60)',
        400: 'rgba(255,255,255, 0.40)',
      },

      'border':    '#E7E7E7',
      'primary':   {
        50:  '#F9F7FF',
        100: '#E2D9FF',
        300: '#A771FE',
        400: '#853bff',
        500: '#4A17B2',
        600: '#541EA8',
        700: '#441096',
        800: '#3B0E82',
        900: '#230B54',
      },
      'secondary': {
        100: '#FAE4CF',
        500: '#FA7903',
        900: '#914602',
      },
      'tertiary':  {
        100: '#CCEDEC',
        500: '#29C1BC',
        900: '#157A77',
      },

      txt: {
        900: 'rgba(0, 0, 0, 1)',
        800: 'rgba(0, 0, 0, 0.87)',
        600: 'rgba(0, 0, 0, 0.60)',
        400: 'rgba(0, 0, 0, 0.40)',
      },

      dark:        colors.slate,
      transparent: 'transparent',

      'white': '#FFFFFF',
      'black': '#000000',

      'error':   '#FD003E',
      'info':    '#7DD3FC',
      'warning': '#FF6600',
      'success': '#10B981',
    },
    spacing:    {
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
    screens:    {
      'sm':  '360px',
      'smp': '480px',
      'md':  '768px',
      'lg':  '1100px',
      'hd':  '1440px',
      '4k':  '2560px',
    },
    containers: {
      'sm':  '360px',
      'smp': '480px',
      'md':  '768px',
      'lg':  '1100px',
      'hd':  '1440px',
      '4k':  '2560px',
    },
    fontSize:   {
      xs: ['11px', {lineHeight: '13px'}],
      sm: ['12px', {lineHeight: '15px'}],
      md: ['13px', {lineHeight: '17px'}],
      lg: ['15px', {lineHeight: '21px'}],

      caption: ['13px', {lineHeight: '25px', fontWeight: '500'}],
      navitem: ['14px', {lineHeight: '36px'}],
      title:   ['24px', {lineHeight: '40px', fontWeight: '500'}],
    },
    extend:     {
      lineHeight:  {
        'md': '17px',
      },
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
    require('@tailwindcss/container-queries'),
  ],
}
