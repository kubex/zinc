//
// This script bakes and copies themes, then generates a corresponding Lit stylesheet in dist/themes
//
import commandLineArgs from 'command-line-args';
import fs from 'fs';
import path from 'path';
import * as sass from 'sass';
import postCSS from 'postcss';
import autoprefixer from 'autoprefixer';
import minify from 'postcss-minify';

const postCss = postCSS([
  autoprefixer(),
  minify()
]);

const {outdir} = commandLineArgs({name: 'outdir', type: String});
const file = './scss/boot.scss';

let source = sass.compile(file, {
  style: 'compressed'
}).css;

const css = postCss.process(source).css;

const cssFile = path.join(outdir, 'zn.min.css');
fs.writeFileSync(cssFile, css, 'utf8');
