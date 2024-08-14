import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Popup';
import '../../src/Button';
import '../../src/Tooltip';

const meta: Meta = {
  component: 'zn-tooltip',
  title: 'Components/Tooltip',
  tags: ['components', 'tooltip'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-tooltip content="Hover Me!">
        <zn-button>Awesome!</zn-button>
      </zn-tooltip>
    `;
  },
};
