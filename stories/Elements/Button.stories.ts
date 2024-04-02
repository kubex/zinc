import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Button';
import '../../src/Icon';


const meta: Meta = {
  component: 'zn-button',
  title: 'Elements/Button',
  tags: ['elements', 'button'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ content, variant, size, verticalAlign, disabled, submit, grow, icon, iconPosition }) =>
  {
    return html`
      <zn-button variant="${variant}" size="${size}" verticalAlign="${verticalAlign}" disabled="${disabled}"
                 submit="${submit}" grow="${grow}" icon="${icon}" iconPosition="${iconPosition}">${content}
      </zn-button>`;
  },
  args: {
    content: 'This is a Button',
    variant: 'primary',
    size: 'normal',
    verticalAlign: 'start',
    disabled: false,
    submit: false,
    grow: false,
    icon: '',
    iconPosition: 'left',
  },
  argTypes: {
    variant: {
      description: 'The variant of the button',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
      control: { type: 'select' },
    },
    size: {
      description: 'The size of the button',
      options: ['small', 'normal', 'medium', 'large'],
      control: { type: 'select' },
    },
    verticalAlign: {
      description: 'The vertical alignment of the button',
      options: ['start', 'center', 'end'],
      control: { type: 'select' },
    },
    iconPosition: {
      description: 'The position of the icon',
      options: ['left', 'right'],
      control: { type: 'select' },
    }
  }
};
