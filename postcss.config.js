const autoprefixer = require("autoprefixer");
const removeComments = require("postcss-discard-comments");
const tailwindcss = require("tailwindcss");

module.exports = {
  plugins: [
    tailwindcss(),
    autoprefixer(),
    removeComments({removeAll: true}),
  ],
}