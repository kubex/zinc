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
        <zn-select clearable placeholder="Something" multiple>
          <div slot="prefix">$</div>
          <div slot="suffix">awesome</div>
          <zn-option value="option-1" disabled>Option 1</zn-option>
          <zn-option value="option-2">Option 2</zn-option>
          <zn-option value="option-3">Option 3</zn-option>
          <zn-option value="option-4">Option 4</zn-option>
          <zn-option value="option-5">Option 5</zn-option>
          <zn-option value="option-6">Option 6</zn-option>
          <zn-option value="option-7">Option 7</zn-option>
          <zn-option value="option-8">Option 8</zn-option>
          <zn-option value="option-9">Option 9</zn-option>
          <zn-option value="option-10">Option 10</zn-option>
          <zn-option value="option-11">Option 11</zn-option>
        </zn-select>
      </zn-form-group>`;
  },
};
