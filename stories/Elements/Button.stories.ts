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
  render: ({ content, color, size, verticalAlign, disabled, submit, grow, icon, iconPosition }) =>
  {
    return html`
      <zn-button color="${color}" size="${size}" vertical-align="${verticalAlign}" ${disabled ? 'disabled' : ''}
                 ${submit ? 'submit' : ''} ${grow ? 'grow' : ''} icon="${icon}" icon-position="${iconPosition}">
        ${content}
      </zn-button>`;
  },
  args: {
    content: 'This is a Button',
    color: 'primary',
    size: 'normal',
    verticalAlign: 'start',
    disabled: false,
    submit: false,
    grow: false,
    icon: '',
    iconPosition: 'left',
  },
  argTypes: {
    color: {
      description: 'The variant of the button',
      options: ['primary', 'secondary', 'error', 'info', 'success', 'warning'],
      control: { type: 'select' },
    },
    size: {
      description: 'The size of the button',
      options: ['x-small', 'small', 'normal', 'medium', 'large'],
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

export const All = () => (
  html`
    <zn-button color="primary">Primary</zn-button>
    <zn-button color="secondary">Secondary</zn-button>
    <zn-button color="error">Error</zn-button>
    <zn-button color="info">Info</zn-button>
    <zn-button color="success">Success</zn-button>
    <zn-button color="warning">Warning</zn-button>
  `
);

export const Sizes = () => (
  html`
    <zn-button size="x-small">Extra Small</zn-button>
    <zn-button size="small">Small</zn-button>
    <zn-button size="normal">Normal</zn-button>
    <zn-button size="medium">Medium</zn-button>
    <zn-button size="large">Large</zn-button>
  `
);

export const SizesWithIcons = () => (
  html`
    <zn-button size="x-small" icon="add">Extra Small</zn-button>
    <zn-button size="small" icon="add">Small</zn-button>
    <zn-button size="normal" icon="add">Normal</zn-button>
    <zn-button size="medium" icon="add">Medium</zn-button>
    <zn-button size="large" icon="add">Large</zn-button>
  `
);

export const SizesWithIconsOnly = () => (
  html`
    <zn-button size="x-small" icon="add"></zn-button>
    <zn-button size="small" icon="add"></zn-button>
    <zn-button size="normal" icon="add"></zn-button>
    <zn-button size="medium" icon="add"></zn-button>
    <zn-button size="large" icon="add"></zn-button>
  `
);

export const SizesWithIconsOnlyAndTextOnly = () => (
  html`
    <zn-button size="x-small" icon="add"></zn-button>
    <zn-button size="x-small">Extra Small</zn-button>
    <zn-button size="small" icon="add"></zn-button>
    <zn-button size="small">Small</zn-button>
    <zn-button size="normal" icon="add"></zn-button>
    <zn-button size="normal">Normal</zn-button>
    <zn-button size="medium" icon="add"></zn-button>
    <zn-button size="medium">Medium</zn-button>
    <zn-button size="large" icon="add"></zn-button>
    <zn-button size="large">Large</zn-button>
  `
);
