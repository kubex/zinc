import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/FormElements/Input';

const meta: Meta = {
  component: 'zn-input',
  title: 'Elements/Input',
  tags: ['elements', 'input wrap', 'autodocs'],
}

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    name: 'billing-frequency',
    label: 'Billing Frequency',
    placeholder: 'This is the filled response',
    error: '',
  },
}