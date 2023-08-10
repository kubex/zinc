import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Group';
import '../../src/FormElements/Input';
import '../../src/Button';
import {html} from "lit";

const meta: Meta = {
  component: 'zn-group',
  title: 'Elements/Group',
  tags: ['elements', 'input wrap', 'autodocs'],
}

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: (args) => html`
    <zn-group .columns=${args.columns}>
      <zn-input label="From (units)" name="Billing Frequency"></zn-input>
      <zn-input label="To (units)" name="Another Input"></zn-input>
      <zn-input label="Third" name="Third Input" span="2"></zn-input>
      <zn-button label="Third" name="Third Input" span="2" vertical-align="end"></zn-button>
    </zn-group>`,
  args: {
    columns: 1,
  },
}