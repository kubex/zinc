import { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import '../../src/Editor';

const meta: Meta = {
  component: 'zn-editor',
  title: 'Input/Editor',
  tags: ['input', 'editor'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ commands }) => html`
    <zn-editor canned-responses="${JSON.stringify(commands)}"></zn-editor>`,
  args: {
    commands: [
      {
        title: 'Welcome',
        content: 'Welcome to the editor',
        labels: ['greeting', 'action', 'welcome']
      },
      {
        title: 'Goodbye',
        content: 'Goodbye from the editor',
        labels: ['farewell', 'action']
      }
    ]
  },
};
