import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/DragUpload';

const meta: Meta = {
  component: 'zn-drag-upload',
  title: 'Input/DragUpload',
  tags: ['input', 'drag-upload'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    text: 'Upload a file here',
    types: 'png,jpg,jpeg,gif',
    size: 256
  },
};
