import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Page';
import {html} from "lit";

const meta: Meta = {
  component: 'zn-page',
  title: 'Components/Page',
  tags: ['components', 'page'],
}

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <zn-page caption="Customer Details">
      <div slot="side">
        <p>Sidebar</p>
      </div>
      <p>Hello World from the content</p>
    </zn-page>
  `,
  args: {},
}
