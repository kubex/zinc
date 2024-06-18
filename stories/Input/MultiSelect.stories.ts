import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/MultiSelect';

const meta: Meta = {
  component: 'zn-multi-select',
  title: 'Input/Multiselect',
  tags: ['input', 'multiselect'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ visible, selectedItems, data }) =>
  {
    return html`
      <div style="height: 300px; transform: translateZ(0);">
        <zn-multi-select .visible=${visible} .selectedItems=${selectedItems} .data=${data}></zn-multi-select>
      </div>`;
  },
  args: {
    visible: false,
    selectedItems: ['us', 'uk'],
    data: {
      'us': 'United States',
      'uk': 'United Kingdom',
      'ca': 'Canada',
    }
  },
};
