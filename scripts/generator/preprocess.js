import _ from 'lodash';

const keysToOmit = [
  'background',
  'fill',
  'container',
  'cursor',
  'inset',
  'listStyle',
  'objectPosition',
  'transform'
];

const subKeysToOmit = ['stroke', 'colors.current', 'colors.transparent'];

export function preprocess(theme) {
  theme = _.omitBy(theme, (k, v) => keysToOmit.some(str => v.includes(str)));
  theme = _.omit(theme, subKeysToOmit);
  return theme;
}
