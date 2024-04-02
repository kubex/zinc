import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/FormElements/Group';
import '../../src/FormElements/Input';

const meta: Meta = {
  component: 'zn-form-group',
  title: 'Input/Group',
  tags: ['input', 'form-group'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({caption, description}) =>
  {
    return html`
      <zn-form-group caption="${caption}" description="${description}">
        <zn-input prefix="https://">
          <input name="url" placeholder="This is the filled form response"/>
          <input type="submit" value="Add a URL"/>
        </zn-input>
      </zn-form-group>`;
  },
  args: {
    caption: 'Add a URL',
    description: 'This is the filled form response',
  }
};
