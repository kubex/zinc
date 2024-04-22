import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/Toggle';

const meta: Meta = {
  component: 'zn-toggle',
  title: 'Input/Toggle',
  tags: ['input', 'toggle'],
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'toggle',
    name: '',
    value: '',
    size: 'small',
    disabled: false,
    checked: false,
    required: true,
    helpText: '',
    triggerSubmit: false
  },
  argTypes: {
    size: {
      options: ['small', 'medium', 'large'],
      control: {
        type: 'select',
      },
    },
  }
};
