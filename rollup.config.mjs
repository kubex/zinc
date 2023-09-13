import postcss from 'rollup-plugin-postcss';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';

// postcss
import removeComments from 'postcss-discard-comments';
import autoprefixer from 'autoprefixer';

// `yarn watch` -> `production` is false
// `yarn build` -> `production` is true
// eslint-disable-next-line no-undef
//const production = !process.env.ROLLUP_WATCH;
const production = true;

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/zn.min.js',
    name: 'main.js',
    format: 'iife',
    sourcemap: !production
  },
  plugins: [
    resolve(), // tells Rollup how to find node_modules packages
    typescript(),
    commonjs(),
    // postcss for zn.min.css
    postcss({
      exclude: '**/src/**',
      extract: 'zn.min.css',
      minimize: production,
      sourceMap: !production,
      plugins: [
        autoprefixer(),
        removeComments({removeAll: true})
      ],
    }),
    // postcss for components
    postcss({
      include: ['**/src/**', '**/scss/shared/**'],
      inject: false,
      extract: false,
      minimize: production,
      sourceMap: !production,
      plugins: [
        autoprefixer(),
        removeComments({removeAll: true})
      ],
    }),
    production && terser({format: {comments: false}}) // minify, but only in production
  ]
};
