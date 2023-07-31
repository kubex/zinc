const resolveConfig = require('tailwindcss/resolveConfig');
const tailwindConfig = require('./tailwind.config.js');
const _ = require('lodash');

const {theme} = resolveConfig(tailwindConfig);

const tokens = {};

const addToTokensObj = function (position, value)
{
  _.setWith(tokens, position, {value: value}, Object);
};


// loop over the theme data
_.forEach(theme, function (value, key)
{
  switch(key)
  {
    case 'fontFamily':
      // font family data is an array so we use join to
      // turn the font families into a single array
      _.forEach(theme['fontFamily'], function (value, key)
      {
        addToTokensObj(['fontFamily', key], theme['fontFamily'][key].join(','));
      });
      break;

    case 'fontSize':
      // Font size data contains both the font size (makes
      // sense!) but also a recommended line-length, so we
      // create two tokens for every font size, one for the
      // font-size value and one for the line-height.
      _.forEach(theme['fontSize'], function (value, key)
      {
        addToTokensObj(['fontSize', key], value[0]);
        addToTokensObj(['fontSize', `${key}--lineHeight`], value[1]['lineHeight']);
      });
      break;

    default:
      _.forEach(value, function (value, secondLevelKey)
      {
        if(!_.isObject(value))
        {
          // For non-objects (simple key/value pairs) we can
          // add them straight into our tokens object.
          addToTokensObj([key, secondLevelKey], value);
        }
        else
        {
          // Skip 'raw' CSS media queries.
          if(!_.isUndefined(value['raw']))
          {
            return;
          }

          // For objects (like color shades) we need to do a
          // final forOwn loop to make sure we add everything
          // in the right format.
          _.forEach(value, function (value, thirdLevelKey)
          {
            addToTokensObj([key, secondLevelKey, thirdLevelKey], value);
          });
        }
      });
      break;

  }
});

const limitedFilter = (token) =>
  ["colors", "spacing", "fontFamily", "fontSize", "screens"].includes(token.attributes.category);

module.exports = {
  tokens,
  platforms: {
    scss: {
      transformGroup: 'scss',
      buildPath:      'src/',
      files:          [
        {
          destination: 'scss/_variables.scss',
          format:      'scss/variables',
          filter:      limitedFilter
        }
      ]
    }
  }
};