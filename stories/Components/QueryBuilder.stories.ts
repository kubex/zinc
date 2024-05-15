import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/QueryBuilder';
import '../../src/Button';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-query-builder',
  title: 'Components/QueryBuilder',
  tags: ['components', 'query-builder'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ filters }) => html`
    <zn-query-builder .filters="${filters}"></zn-query-builder>
  `,
  args: {
    filters: [
      {
        id: '1',
        name: 'name',
        operators: ['eq', 'neq']
      },
      {
        id: '2',
        name: 'age',
        operators: ['eq']
      },
      {
        id: '3',
        name: 'address',
        operators: ['eq']
      },
      {
        id: '4',
        name: 'country',
        operators: ['neq'],
        options: ['USA', 'UK', 'Canada']
      }
    ]
  },
};
