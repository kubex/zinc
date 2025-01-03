import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/QueryBuilder';
import '../../src/FormElements/Select';
import '../../src/Popup';
import '../../src/Icon';
import '../../src/FormElements/Group';
import '../../src/Button';

const meta: Meta = {
  component: 'zn-query-builder',
  title: 'Components/QueryBuilder',
  tags: ['components', 'query-builder'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({filters, alwaysShow}) => html`
    <zn-query-builder .filters="${filters}" show-values=${alwaysShow}></zn-query-builder>
  `,
  args: {
    alwaysShow: "2 1 4",
    filters: [
      {
        id: '1',
        name: 'DOB',
        type: 'date',
        operators: ['before', 'after', 'gt', 'lt']
      },
      {
        id: '2',
        name: 'age',
        operators: ['eq', 'neq']
      },
      {
        id: '3',
        name: 'address',
        operators: ['eq', 'neq']
      },
      {
        id: '4',
        name: 'country',
        operators: ['eq', 'neq'],
        options: ['USA', 'UK', 'Canada']
      }
    ]
  },
};
