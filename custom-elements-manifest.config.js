import {customElementJetBrainsPlugin} from 'custom-element-jet-brains-integration';

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.spec.ts'],
  plugins: [
    customElementJetBrainsPlugin({
      outdir: './dist',
      excludeCss: true,
      packageJson: false
    })
  ]
};
