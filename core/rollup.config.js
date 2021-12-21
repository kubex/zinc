import resolve from '@rollup/plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import postcss from 'rollup-plugin-postcss';
import AtImport from 'postcss-import';

export default {
  input:   'docs/resources/docs.js',
  output:  {
    dir:            'docs/resources',
    format:         'iife',
    entryFileNames: 'docs.compiled.js',
    sourcemap:      false
  },
  plugins: [
    resolve({browser: true, preferBuiltins: false}),
    commonjs(),
    postcss(
      {
        plugins:   [AtImport()],
        inject:    false,
        extract:   true,
        minimize:  true,
        sourceMap: false
      }),
    terser()
  ]
};
