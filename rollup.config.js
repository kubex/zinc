import resolve from '@rollup/plugin-node-resolve';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

export default {
  input: 'ts/import.ts',
  output: {
    dir: 'dist',
    format: 'iife',
    entryFileNames: 'zn.js',
    sourcemap: false,
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    typescript(),
    commonjs(),
    postcss({
      extract: false,
      minimize: true,
      sourceMap: false,
    }),
    terser(),
    copy({
      targets: [
        //{src: 'node_modules/@kubex/zinc/dist/zn.js', dest: 'compiled/js'}
        {src: '../../zinc/dist/zn.js', dest: 'compiled/js'},
        {src: 'dist/zn.js', dest: '../rubix/static/compiled/js'}
      ]
    }),
  ],
};
