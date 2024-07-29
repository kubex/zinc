import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/ChartStats';
import '../../src/Columns';
import '../../src/Panel';
import '../../src/ApexChart';

const meta: Meta = {
  component: 'zn-chart-stat',
  title: 'Components/ChartStat',
  tags: ['components', 'chart_stat'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-cols>
        <zn-panel>
          <zn-chart-stat caption="Hover Me!" description="Last 30 Days" amount="100" type="percent"></zn-chart-stat>
        </zn-panel>
        <zn-panel>
          <zn-chart-stat caption="Hover Me!" description="Last 30 Days" amount="75" type="percent"
                         hide-chart></zn-chart-stat>
        </zn-panel>
        <zn-panel>
          <zn-chart-stat caption="Hover Me!" description="Last 30 Days" amount="60" type="percent"></zn-chart-stat>
        </zn-panel>
      </zn-cols>
    `;
  },
};
