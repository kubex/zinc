// @ts-ignore
import React from 'react';
import type {Preview} from "@storybook/web-components";
import {DocsContainer} from '@storybook/addon-docs';
import {useDarkMode} from 'storybook-dark-mode';
import {themes} from '@storybook/theming';

import '../src/index.scss';


const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: "^on[A-Z].*"},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    darkMode: {
      darkClass: 'dark',
      lightClass: 'light',
      stylePreview: true,
    },
    docs: {
      container: (context: any) => {
        const isDark = useDarkMode();
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
