import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/DataTable';
import '../../src/Panel';
import '../../src/Icon';
import '../../src/Button';

import data from './ticket-data.json';

const meta: Meta = {
  component: 'zn-data-table',
  title: 'Components/DataTable',
  tags: ['components', 'data-table'],
  parameters: {
    mockData: [{
      url: 'https://example.local/todos',
      method: 'GET',
      status: 200,
      response: {
        page: 1,
        per_page: 10,
        total: 100,
        total_pages: 10,
        data: data
      }
    }]
  }
};

const headers = {
  id: 'ID',
  displayName: 'Title',
  status: 'Status',
  dateCreated: 'Created At',
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <zn-panel caption="Data Table">
      <zn-data-table data-uri="https://example.local/todos"
                     headers="${JSON.stringify(headers)}"
                     wide-column="displayName"
                     sort-column="id"
                     key="id">
        <zn-data-table-filters slot="filters"></zn-data-table-filters>
      </zn-data-table>
    </zn-panel>`,
  args: {},
};
