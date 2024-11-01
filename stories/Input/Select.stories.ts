import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/FormElements/Select';
import '../../src/Popup';
import '../../src/Icon';
import '../../src/FormElements/Group';

const meta: Meta = {
  component: 'zn-select',
  title: 'Input/Select',
  tags: ['select', 'select'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-form-group caption="Something" description="Help me">
        <zn-select clearable placeholder="Something">
          <zn-option value="option-1" disabled>Option 1</zn-option>
          <zn-option value="option-2">Option 2</zn-option>
          <zn-option value="option-3">Option 3</zn-option>
        </zn-select>
      </zn-form-group>`;
  },
};
