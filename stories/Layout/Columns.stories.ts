import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Columns';

const meta: Meta = {
  title: 'Layout/Columns',
  tags: ['Layout', 'cols']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({layout}) =>
  {
    const itemTemplates = [];
    for(let i = 0; i < 6; i++)
    {
      itemTemplates.push(html`
        <div style="height: 100px; min-width: 100px; background-color: orange"></div>`);
    }

    return html`
      <zn-cols layout="${layout}" class="zn-gap">
        ${itemTemplates}
      </zn-cols>`;
  },
  args: {
    layout: '1,1,1,1',
  }
};
