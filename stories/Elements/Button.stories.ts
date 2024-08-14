import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Button';
import '../../src/Icon';
import {Button} from "../../src/Button";

const meta: Meta<typeof Button> = {
  component: 'zn-button',
  title: 'Elements/Button',
  tags: ['elements', 'button'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({content, color, size, verticalAlign, disabled, outline, icon, iconPosition}) =>
  {
    return html`
      <zn-button color="${color}" size="${size}" vertical-align="${verticalAlign}" .disabled="${disabled}"
                 .outline="${outline}" icon="${icon}" icon-position="${iconPosition}">
        ${content}
      </zn-button>`;
  },
  args: {
    content: 'This is a Button',
    color: 'default',
    size: 'medium',
    verticalAlign: 'start',
    disabled: false,
    outline: false,
    icon: '',
    iconPosition: 'left',
  },
  argTypes: {
    color: {
      description: 'The variant of the button',
      options: ['default', 'secondary', 'error', 'info', 'success', 'warning'],
      control: {type: 'select'},
    },
    size: {
      description: 'The size of the button',
      options: ['small', 'medium', 'large'],
      control: {type: 'select'},
    },
    verticalAlign: {
      description: 'The vertical alignment of the button',
      options: ['start', 'center', 'end'],
      control: {type: 'select'},
    },
    iconPosition: {
      description: 'The position of the icon',
      options: ['left', 'right'],
      control: {type: 'select'},
    }
  }
};

export const All = () => (
  html`
    <div style="display: flex; flex-direction: column; gap: 10px">
      <div>
        <zn-button>Default</zn-button>
        <zn-button color="text">Text</zn-button>
        <zn-button color="secondary">Secondary</zn-button>
        <zn-button color="error">Error</zn-button>
        <zn-button color="info">Info</zn-button>
        <zn-button color="success">Success</zn-button>
        <zn-button color="warning">Warning</zn-button>
      </div>
      <div>
        <zn-button outline>Default</zn-button>
        <zn-button outline color="text">Text</zn-button>
        <zn-button outline color="secondary">Secondary</zn-button>
        <zn-button outline color="error">Error</zn-button>
        <zn-button outline color="info">Info</zn-button>
        <zn-button outline color="success">Success</zn-button>
        <zn-button outline color="warning">Warning</zn-button>
      </div>
      <div>
        <zn-button icon="add">Default</zn-button>
        <zn-button icon="add" color="text">Text</zn-button>
        <zn-button icon="add" color="secondary">Secondary</zn-button>
        <zn-button icon="add" color="error">Error</zn-button>
        <zn-button icon="add" color="info">Info</zn-button>
        <zn-button icon="add" color="success">Success</zn-button>
        <zn-button icon="add" color="warning">Warning</zn-button>
      </div>
      <div>
        <zn-button icon="add" outline>Default</zn-button>
        <zn-button icon="add" outline color="text">Text</zn-button>
        <zn-button icon="add" outline color="secondary">Secondary</zn-button>
        <zn-button icon="add" outline color="error">Error</zn-button>
        <zn-button icon="add" outline color="info">Info</zn-button>
        <zn-button icon="add" outline color="success">Success</zn-button>
        <zn-button icon="add" outline color="warning">Warning</zn-button>
      </div>
      <div>
        <zn-button size="x-small">xsmall</zn-button>
        <zn-button size="small">Small</zn-button>
        <zn-button>Default</zn-button>
        <zn-button size="large">Large</zn-button>
      </div>
      <div>
        <zn-button size="x-small" icon="add">xsmall</zn-button>
        <zn-button size="small" icon="add">Small</zn-button>
        <zn-button icon="add">Default</zn-button>
        <zn-button size="large" icon="add">Large</zn-button>
      </div>
      <div>
        <zn-button size="x-small" icon="add"></zn-button>
        <zn-button size="small" icon="add"></zn-button>
        <zn-button icon="add"></zn-button>
        <zn-button size="large" icon="add"></zn-button>
      </div>
      <div>
        <zn-button outline size="x-small" icon="add"></zn-button>
        <zn-button outline size="small" icon="add"></zn-button>
        <zn-button outline icon="add"></zn-button>
        <zn-button outline size="large" icon="add"></zn-button>
      </div>
    </div>
  `
);

export const Sizes = () => (
  html`
    <zn-button size="small">Small</zn-button>
    <zn-button>Default</zn-button>
    <zn-button size="large">Large</zn-button>
  `
);

export const SizesWithIcons = () => (
  html`
    <zn-button size="small" icon="add">Small</zn-button>
    <zn-button icon="add">Default</zn-button>
    <zn-button size="large" icon="add">Large</zn-button>
  `
);

export const SizesWithIconsOnly = () => (
  html`
    <zn-button size="small" icon="add"></zn-button>
    <zn-button icon="add"></zn-button>
    <zn-button size="large" icon="add"></zn-button>
  `
);

export const SizesWithIconsOnlyAndTextOnly = () => (
  html`
    <zn-button size="small" icon="add"></zn-button>
    <zn-button size="small">Small</zn-button>
    <zn-button icon="add"></zn-button>
    <zn-button>Default</zn-button>
    <zn-button size="large" icon="add"></zn-button>
    <zn-button size="large">Large</zn-button>
  `
);
