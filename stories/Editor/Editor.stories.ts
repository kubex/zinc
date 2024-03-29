import { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import '../../src/Editor';

const meta: Meta = {
  component: 'zn-editor',
  title: 'Elements/Editor',
  tags: ['elements', 'editor'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ caption, description }) => html`
    <zn-editor></zn-editor>`,
  args: {},
};
