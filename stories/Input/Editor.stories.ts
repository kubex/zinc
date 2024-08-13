import {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

import '../../src/Editor';

const meta: Meta = {
  component: 'zn-editor',
  title: 'Input/Editor',
  tags: ['input', 'editor'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <form>
      <zn-editor attachment-url="#" interaction-type="ticket">Editor</zn-editor>
      <input type="text" name="attachments" id="attachments" style="display: none">
    </form>`,
  args: {},
};
