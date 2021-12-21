module.exports = function (eleventyConfig)
{
  eleventyConfig.addLayoutAlias('default', 'layouts/default.njk');
  eleventyConfig.addPassthroughCopy('docs/resources');

  return {
    markdownTemplateEngine: 'njk',
    htmlTemplateEngine:     'njk',
    dir:                    {
      input:               'docs',
      includes:            '_includes',
      output:              'docs/_site',
      passthroughFileCopy: true
    }
  };
};
