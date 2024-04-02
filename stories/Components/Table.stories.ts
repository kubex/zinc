import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Table';
import '../../src/Panel';

const meta: Meta = {
  component: 'zn-table',
  title: 'Components/Table',
  tags: ['components', 'table'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <zn-panel caption="Structured Table">
      <zn-table
        data="{&quot;header&quot;:[{&quot;name&quot;:&quot;Transaction&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Date / Time&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Transacted&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Requested&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Gateway&quot;,&quot;display&quot;:&quot;&quot;},{&quot;name&quot;:&quot;Gateway&quot;,&quot;display&quot;:&quot;&quot;}],&quot;items&quot;:[{&quot;caption&quot;:&quot;TRANSACTION_TYPE_CAPTURE&quot;,&quot;summary&quot;:&quot;PENDING&quot;,&quot;icon&quot;:&quot;&quot;,&quot;data&quot;:[&quot;2023-06-26 16:16:09&quot;,&quot;1.00 GBP&quot;,&quot;1.00 GBP&quot;,&quot;paysafe-connector&quot;,&quot;paysafe&quot;]},{&quot;caption&quot;:&quot;TRANSACTION_TYPE_AUTHORIZE&quot;,&quot;summary&quot;:&quot;COMPLETED&quot;,&quot;icon&quot;:&quot;&quot;,&quot;data&quot;:[&quot;2023-06-26 16:15:13&quot;,&quot;1.00 GBP&quot;,&quot;1.00 GBP&quot;,&quot;paysafe-connector&quot;,&quot;paysafe&quot;]}]}"></zn-table>
    </zn-panel>`,
  args: {},
};
