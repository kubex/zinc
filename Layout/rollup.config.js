import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import autoprefixer from "autoprefixer";
import AtImport from 'postcss-import';
import tailwindCss from 'tailwindcss';

const layout = {
  input:   'ts/import.ts',
  output:  {
    dir:            'dist',
    format:         'iife',
    entryFileNames: 'zn-layout.js',
    sourcemap:      false,
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    typescript(),
    commonjs(),
    postcss({
              inject:    false,
              extract:   false,
              minimize:  true,
              sourceMap: false,
              plugins:   [
                AtImport(),
                tailwindCss('./tailwind.config.js'),
                autoprefixer(),
              ],
              parser:    'postcss-scss',
            }),
    terser(),
  ],
};

export default [layout];
