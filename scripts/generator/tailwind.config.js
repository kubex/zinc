import resolveConfig from 'tailwindcss/resolveConfig.js';

const defaults = {
  theme: {
    colors: {
      primary: '#ff0000',
    }
  }
};

const config = resolveConfig(defaults);
console.log(config.theme);

export default config.theme;
