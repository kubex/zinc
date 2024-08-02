import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/StatsTile';
import '../../src/Columns';
import '../../src/Panel';
import '../../src/ApexChart';

const meta: Meta = {
  component: 'zn-stat',
  title: 'Components/Stat',
  tags: ['components', 'stat'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({caption, currency, showChart, showDelta, description, amount, previous}) =>
  {
    return html`
      <zn-stat caption="${caption}" currency="${currency}" description="${description}" amount="${amount}"
               type="percent" .showChart="${showChart}" .showDelta="${showDelta}"
               previous="${previous}"></zn-stat>
    `;
  },
  args: {
    caption: 'Ready Made Panel',
    description: 'Last 30 Days',
    amount: 100,
    previous: 50,
    currency: '$',
    showChart: false,
    showDelta: false,
  }
};
