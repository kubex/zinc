import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/FormElements/LinkedSelect';
import '../../src/FormElements/Select';
import '../../src/Popup';

const meta: Meta = {
  component: 'zn-linked-select',
  title: 'Input/LinkedSelect',
  tags: ['Input', 'linked-select']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({options}) => html`
    <zn-select id="first" style="margin-bottom: 5px;">
      <zn-option value="1">Option 1</zn-option>
      <zn-option value="2">Option 2</zn-option>
    </zn-select>
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
