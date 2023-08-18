import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from 'rollup-plugin-typescript2';
import commonjs from '@rollup/plugin-commonjs';

// `yarn watch` -> `production` is false
// `yarn build` -> `production` is true
// eslint-disable-next-line no-undef
//const production = !process.env.ROLLUP_WATCH;
const production = true;

const commonPlugins = [
  resolve(), // tells Rollup how to find node_modules packages
  typescript({'sourceMap': !production}),
  commonjs(),
  production && terser({format: {comments: false}}) // minify, but only in production
];

const output = {
  file:      'dist/zn.min.js',
  name:      'main.js',
  format:    'iife',
  sourcemap: !production
};

const main = {
  input:   'src/index.ts',
  output:  output,
  plugins: [
    ...commonPlugins,
    postcss({
      extract:   false,
      minimize:  production,
      sourceMap: !production
    })
  ]
};

export default main;