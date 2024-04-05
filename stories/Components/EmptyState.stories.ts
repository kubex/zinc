import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Icon';
import '../../src/EmptyState';

const meta: Meta = {
  component: 'zn-empty-state',
  title: 'Components/EmptyState',
  tags: ['components', 'empty-state'],
};

export default meta;
type Story = StoryObj;


const Template = {
  render: ({ caption, description, icon, type }) =>
  {
    return html`
      <zn-empty-state caption="${caption}" description="${description}" icon="${icon}"
                      type="${type}"></zn-empty-state>`;
  },
  argTypes: {
    type: {
      options: ['', 'error'],
      control: { type: 'select' },
    },
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

export const Default: Story = {
  args: {
    caption: 'This is an Empty State',
    description: 'This is a description of the empty state',
    icon: 'check',
    type: ''
  },
};

Object.assign(Default, Template);

export const Warning: Story = {
  args: {
    caption: 'This is a Warning',
    description: 'This is a description of the warning',
    icon: 'close',
    type: 'error'
  }
};

Object.assign(Warning, Template);
