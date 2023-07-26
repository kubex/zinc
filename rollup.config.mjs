import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

// `yarn watch` -> `production` is false
// `yarn build` -> `production` is true
// eslint-disable-next-line no-undef
//const production = !process.env.ROLLUP_WATCH;
const production = true;

const commonPlugins = [
  resolve(), // tells Rollup how to find node_modules packages
  typescript({'sourceMap': !production}),
  production && terser({format: {comments: false}}) // minify, but only in production
];


export default {
  input:   'src/index.ts',
  output:  {
    file:      'dist/main.min.js',
    name:      'main.js',
    format:    'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: !production
  },
  plugins: [
    ...commonPlugins,
    postcss(
      {
        extract:   false,
        minimize:  production,
        sourceMap: !production,
      })
  ]
};
