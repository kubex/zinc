import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Timer';

const meta: Meta = {
  component: 'zn-timer',
  title: 'Elements/Timer',
  tags: ['elements', 'timer'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ timestamp, type, upperLimit }) =>
  {
    return `<zn-timer timestamp="${timestamp}" type="${type}" upper-limit="${upperLimit}"></zn-timer>`;
  },
  args: {
    timestamp: '1711636361',
    type: 'success',
    upperLimit: 1000000000000,
  },
  argTypes: {
    timestamp: {
      control: {
        type: 'text',
      },
    },
    type: {
      options: ['error', 'success'],
      control: { type: 'select' },
    },
  }
};
