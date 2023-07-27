const autoprefixer = require('autoprefixer');
const removeComments = require('postcss-discard-comments');

module.exports = {
  parser:  'postcss-scss',
  plugins: [
    autoprefixer(),
    removeComments({removeAll: true})
  ]
};