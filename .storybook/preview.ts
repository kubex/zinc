import type {Preview} from "@storybook/web-components";
import {withThemeByClassName, withThemeByDataAttribute} from "@storybook/addon-styling";

const preview: Preview = {
  parameters: {
    actions: {argTypesRegex: "^on[A-Z].*"},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export const decorators = [
  withThemeByClassName({
    themes: {
      light: 'light',
      dark: 'dark'
    },
    defaultTheme: 'light',
  }),

];

export default preview;
