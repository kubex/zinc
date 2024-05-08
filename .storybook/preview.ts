// @ts-ignore
import React from 'react';
import type { Preview } from "@storybook/web-components";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
// @ts-ignore
import DocumentationTemplate from './DocumentationTemplate.mdx';

import '../scss/boot.scss';
import './storybook.scss';

export const decorators = [
  withThemeByDataAttribute({
    themes: {
      light: 'light',
      dark: 'dark',
    },
    defaultTheme: 'light',
    attributeName: 't',
  })
];

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      page: DocumentationTemplate,
    },
  },
};

export default preview;
