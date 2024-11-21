import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/FormElements/Radio';
import '../../src/FormElements/RadioGroup';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-radio-group',
  title: 'Input/RadioGroup',
  tags: ['input', 'radio-group'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-radio-group label="Select an option" name="a" value="2">
        <zn-radio name="radio" value="1">Option 1</zn-radio>
        <zn-radio name="radio" value="2">Option 2</zn-radio>
        <zn-radio name="radio" value="3">Option 3</zn-radio>
      </zn-radio-group>
    `;
  },
  args: {
    text: 'Upload a file here',
    types: 'png,jpg,jpeg,gif',
    size: 256
  },
};
