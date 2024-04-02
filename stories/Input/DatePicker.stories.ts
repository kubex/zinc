import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/DatePicker';

const meta: Meta = {
  component: 'zn-datepicker',
  title: 'Input/Datepicker',
  tags: ['input', 'datepicker'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    id: '',
    name: ''
  },
};
