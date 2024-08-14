import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/FormElements/ColorSelect';
import '../../src/Popup';

const meta: Meta = {
  component: 'zn-color-select',
  title: 'Input/ColorSelect',
  tags: ['input', 'color-select'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-color-select></zn-color-select>`;
  }
};
