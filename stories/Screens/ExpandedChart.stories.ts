import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Header';
import '../../src/Panel';
import '../../src/Charts/DataChart';
import '../../src/FormElements/Group';
import '../../src/FormElements/Input';
import '../../src/FormElements/DatePicker';

const meta: Meta = {
  title: 'Screens/ExpandedChart',
  tags: ['screens', 'exapnded-chart'],
};

export default meta;
type Story = StoryObj;

const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const dataset = [
  {
    label: 'Dataset 1',
    data: [
      20000,
      20400,
      19000,
      18700,
      18942,
      19243,
      19400,
    ]
  }
];

export const Default: Story = {
  render: () =>
  {
    return html`
      <zn-panel caption="Enhanced Chart">
        <form action="" style="margin-bottom: 10px;">
          <zn-form-group>
            <zn-datepicker span="2" id="start-date" name="start-date" range></zn-datepicker>
            <zn-input span="1">
              <select name="interval" id="interval" class="no-border">
                <option value="1">1 Min</option>
                <option value="5">5 Min</option>
                <option value="10" selected>10 Min</option>
                <option value="15">30 Min</option>
                <option value="60">1 Hour</option>
                <option value="1440">1 Day</option>
              </select>
            </zn-input>
          </zn-form-group>
        </form>
        <zn-data-chart .data=${dataset} .categories=${labels} type="area"></zn-data-chart>
      </zn-panel>`;
  },
};
