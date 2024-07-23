import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Icon';

const meta: Meta = {
  component: 'zn-icon',
  title: 'Elements/Icon',
  tags: ['elements', 'icon'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    src: 'check',
    alt: 'check icon',
    size: 64,
    round: false,
    color: 'primary'
  },
  argTypes: {
    color: {
      description: 'The color',
      options: ['primary', 'accent', 'info', 'warning', 'error', 'success'],
      control: {type: 'select'},
    },
    library: {
      description: 'The library',
      options: ['material', 'material-outlined', 'material-round', 'material-sharp', 'material-two-tone', 'material-symbols-outlined', 'gravatar', 'libravatar'],
      control: {type: 'select'},
    },
  }
};
