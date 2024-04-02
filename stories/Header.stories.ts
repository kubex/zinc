import { Meta, StoryObj } from "@storybook/web-components";

import '../src/Header';
import '../src/Icon';

const meta: Meta = {
  component: 'zn-header',
  title: 'Components/Header',
  tags: ['components', 'header', 'autodocs'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    caption: 'This is an Empty State',
    description: 'This is a description of the empty state',
    icon: 'check',
  },
  argTypes: {
    caption: {
      description: 'The caption',
    },
    description: {
      description: 'The description',
    },
    icon: {
      description: 'The icon',
      options: ['close', 'check'],
      control: { type: 'select' },
    }
  }
};
