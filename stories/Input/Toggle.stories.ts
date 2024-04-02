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
    name: 'toggle',
    required: false,
    checked: false,
    value: 'something-awesome',
  },
};
