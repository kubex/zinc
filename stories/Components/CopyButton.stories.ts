import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Icon';
import '../../src/Popup';
import '../../src/Tooltip';
import '../../src/CopyButton';

const meta: Meta = {
  component: 'zn-copy-button',
  title: 'Components/CopyButton',
  tags: ['components', 'copy-button'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-copy-button></zn-copy-button>
    `;
  },
};
