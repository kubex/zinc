import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Alert';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-alert',
  title: 'Elements/Alert',
  tags: ['elements', 'alert'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ icon, caption, collapse, level }) =>
  {
    return html`
      <zn-alert icon="${icon}" caption="${caption}" collapse="${collapse}" level="${level}"></zn-alert>`;
  },
  args: {
    icon: 'check',
    caption: 'This is an alert message',
    collapse: false,
    level: 'primary',
  },
  argTypes: {
    icon: {
      description: 'The icon of the alert',
    },
    level: {
      description: 'The level of the alert',
      options: ['', 'primary', 'error', 'info', 'success', 'warning'],
      control: { type: 'select' },
    },
  }
};
