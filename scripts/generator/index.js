import _ from 'lodash';
import {preprocess} from './preprocess.js';
import {generateFile, generateIndexFile} from './generator.js';
import theme from './tailwind.config.js';

let processedTheme = preprocess(theme);

const categories = {
  colors: ['colors']
}

Object.entries(categories).forEach(([category, properties]) => {
  const data = _.pick(processedTheme, properties);
  generateFile(category, data);
});

generateIndexFile(categories);
