const autoprefixer = require('autoprefixer');
const removeComments = require('postcss-discard-comments');

module.exports = {
  plugins: [
    autoprefixer(),
    removeComments({removeAll: true})
  ]
};