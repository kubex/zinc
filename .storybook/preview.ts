// @ts-ignore
import React from 'react';
import type {Preview} from "@storybook/web-components";
import {DocsContainer} from '@storybook/addon-docs';
import {DecoratorHelpers, withThemeByDataAttribute} from "@storybook/addon-styling";
import {themes} from '@storybook/theming';
import DocumentationTemplate from './DocumentationTemplate.mdx';

import '../scss/boot.scss';

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
    actions: {argTypesRegex: "^on[A-Z].*"},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      page: DocumentationTemplate,
      container: (context) =>
      {
        console.log('context', context);
        if(!context.theme)
        {
          return React.createElement(DocsContainer, {...context});
        }
        const isDark = DecoratorHelpers.pluckThemeFromContext(context) === 'dark';
        const props = {
          ...context,
          theme: isDark ? themes.dark : themes.light,
        };

        return React.createElement(DocsContainer, props);
      },
    },
  },
};

export default preview;
