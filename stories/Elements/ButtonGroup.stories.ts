import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/ButtonGroup';
import '../../src/Button';
import '../../src/Icon';

import * as  ButtonStories from "./Button.stories";

const meta: Meta = {
  component: 'zn-button-group',
  title: 'Elements/ButtonGroup',
  tags: ['elements', 'button-group'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ direction, buttons }) =>
  {
    return html`
      <zn-button-group direction="${direction}">
        ${buttons.map((button) => html`
          <zn-button color="${button.color}" .size="${button.size}" .vertical-align="${button.verticalAlign}"
                     .disabled="${button.disabled}" .submit="${button.submit}" .grow="${button.grow}"
                     .icon="${button.icon}" .icon-position="${button.iconPosition}">${button.content}
          </zn-button>`)}
      </zn-button-group>`;
  },
  args: {
    direction: 'horizontal',
    buttons: [
      { ...ButtonStories.Default.args, content: "Button 1" },
      { ...ButtonStories.Default.args, content: "Button 2" },
      { ...ButtonStories.Default.args, content: "Button 3" },
    ]
  },
  argTypes: {
    direction: {
      options: ['horizontal', 'vertical'],
      control: { type: 'select' },
    }
  }
};
