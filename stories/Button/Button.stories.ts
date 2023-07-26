import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Button';

const meta: Meta = {
  component: 'zn-button',
  title: 'Elements/Button',
  tags: ['elements', 'button'],
}

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    content: 'This is a Button',
    variant: 'primary',
    size: 'normal',
    verticalAlign: 'start',
  },
  argTypes: {
    variant: {
      description: 'The variant of the button',
      options: ['primary', 'secondary'],
      control: {type: 'select'},
    },
    size: {
      description: 'The size of the button',
      options: ['small', 'normal', 'large'],
      control: {type: 'select'},
    },
    verticalAlign: {
      description: 'The vertical alignment of the button',
      options: ['start', 'center', 'end'],
      control: {type: 'select'},
    }
  }
}