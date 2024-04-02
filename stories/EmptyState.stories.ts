import { Meta, StoryObj } from "@storybook/web-components";

import '../src/Icon';
import '../src/EmptyState';

const meta: Meta = {
  component: 'zn-empty-state',
  title: 'Components/EmptyState',
  tags: ['components', 'empty-state'],
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
