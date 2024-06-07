import { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import '../../src/Avatar';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-avatar',
  title: 'Elements/Avatar',
  tags: ['elements', 'avatar'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ icon }) => (
    html`
      <zn-avatar avatar="${icon}"></zn-avatar> <br>
      <zn-avatar avatar="XY"></zn-avatar> `
  ),
  args: {
    icon: 'person'
  }
};
