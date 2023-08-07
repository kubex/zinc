var gulp = require('gulp');
var postcss = require('gulp-postcss');
var sass = require('gulp-sass')(require('sass'));
var rename = require('gulp-rename');

var scssPath = './src/_scss/main.scss';

function buildStyles()
{
  return gulp.src(scssPath)
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('./dist'));
}

exports.default = buildStyles;
exports.watch = function ()
{
  buildStyles();
  gulp.watch('./src/_scss/**/*.scss', buildStyles);
};