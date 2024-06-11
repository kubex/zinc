import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/LinkedSelect';

const meta: Meta = {
  component: 'zn-linked-select',
  title: 'Input/LinkedSelect',
  tags: ['Input', 'linked-select']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ options }) => html`
    <select id="first">
      <option value="1">Option 1</option>
      <option value="2">Option 2</option>
      <option value="3">Option 3</option>
    </select>
    <zn-linked-select .options=${options} linked-select="first"></zn-linked-select> `,
  args: {
    options: {
      '1': {
        '1': 'a',
        '2': 'b',
        '3': 'c'
      },
      '2': {
        '1': 'd',
        '2': 'e',
        '3': 'f'
      },
    }
  },
  argTypes: {}
};
