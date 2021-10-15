import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import AtImport from 'postcss-import';

const component = {
  input:   'ts/Component.ts',
  output:  {
    dir:            'dist',
    format:         'iife',
    entryFileNames: 'fusion-icon.js',
    sourcemap:      false,
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    typescript(),
    commonjs(),
    postcss(
      {
        plugins:   [AtImport()],
        inject:    false,
        extract:   false,
        minimize:  true,
        sourceMap: false,
      }),
    terser(),
  ],
};

export default [component];
