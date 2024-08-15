import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/FormElements/ColorSelect';
import '../../src/Popup';
import {ColorSelect} from "../../src/FormElements/ColorSelect";

const meta: Meta<typeof ColorSelect> = {
  component: 'zn-color-select',
  title: 'Input/ColorSelect',
  tags: ['input', 'color-select'],
};

export default meta;
type Story = StoryObj<typeof ColorSelect>;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-color-select options="blue red orange yellow indigo violet green pink grey"></zn-color-select>`;
  }
};
