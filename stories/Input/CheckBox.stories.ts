import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/CheckBox';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-checkbox',
  title: 'Input/Checkbox',
  tags: ['input', 'checkbox'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    title: 'This is the title',
    description: 'This is the Description',
    name: 'checkbox',
    id: 'checkbox',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'This is the title',
    name: 'checkbox',
    id: 'checkbox',
  },
};
