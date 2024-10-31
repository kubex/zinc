import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Table';
import '../../src/Panel';
import '../../src/NewMenu';
import '../../src/ConfirmModal';
import '../../src/Button';
import '../../src/Icon';
import '../../src/Dropdown';
import '../../src/Popup';


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

export const CapCol: Story = {
  render: () => html`
    <zn-panel caption="Structured Table">
      <zn-table
        fixed-first
        data="{&quot;header&quot;:[&quot;Full Name&quot;,&quot;User ID&quot;,&quot;Email&quot;,&quot;Type&quot;,&quot;Partner&quot;,&quot;State&quot;,&quot;Date Joined&quot;],&quot;items&quot;:[{&quot;actions&quot;:[{&quot;icon&quot;:&quot;person&quot;,&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;/kx/iam/member/08c308bd-8833-486c-8501-602b1d59c205/roles&quot;,&quot;title&quot;:&quot;Edit Roles&quot;},{&quot;target&quot;:&quot;modal&quot;,&quot;path&quot;:&quot;/kx/iam/member/08c308bd-8833-486c-8501-602b1d59c205/type&quot;,&quot;title&quot;:&quot;Change Account Type&quot;},{&quot;confirm&quot;:{&quot;type&quot;:&quot;warning&quot;,&quot;trigger&quot;:&quot;suspend0&quot;,&quot;caption&quot;:&quot;Suspend Access&quot;,&quot;content&quot;:&quot;Are you sure you want to suspend access for James Eagle?&quot;,&quot;action&quot;:&quot;/kx/iam/member/08c308bd-8833-486c-8501-602b1d59c205/suspend&quot;},&quot;title&quot;:&quot;Suspend Access&quot;,&quot;style&quot;:&quot;warning&quot;}],&quot;caption&quot;:&quot;James Eagle&quot;,&quot;data&quot;:[&quot;08c308bd-8833-486c-8501-602b1d59c205&quot;,&quot;james.eagle@chargehive.com&quot;,&quot;Owner&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-06-07 14:07:57&quot;]},{&quot;actions&quot;:[{&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;/kx/iam/member/587ff45b-eb11-4377-a213-6e5cbadb2486/roles&quot;,&quot;title&quot;:&quot;Edit Roles&quot;}],&quot;caption&quot;:&quot;Kyle Essex&quot;,&quot;data&quot;:[&quot;587ff45b-eb11-4377-a213-6e5cbadb2486&quot;,&quot;kyle.essex@chargehive.com&quot;,&quot;Owner&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-05-23 10:55:14&quot;]},{&quot;actions&quot;:[{&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;/kx/iam/member/bcb06253-26d7-4f90-98fc-84609e9c653a/roles&quot;,&quot;title&quot;:&quot;Edit Roles&quot;},{&quot;target&quot;:&quot;modal&quot;,&quot;path&quot;:&quot;/kx/iam/member/bcb06253-26d7-4f90-98fc-84609e9c653a/type&quot;,&quot;title&quot;:&quot;Change Account Type&quot;},{&quot;confirm&quot;:{&quot;type&quot;:&quot;warning&quot;,&quot;trigger&quot;:&quot;suspend2&quot;,&quot;caption&quot;:&quot;Suspend Access&quot;,&quot;content&quot;:&quot;Are you sure you want to suspend access for Brooke Bryan?&quot;,&quot;action&quot;:&quot;/kx/iam/member/bcb06253-26d7-4f90-98fc-84609e9c653a/suspend&quot;},&quot;title&quot;:&quot;Suspend Access&quot;,&quot;style&quot;:&quot;warning&quot;}],&quot;caption&quot;:&quot;Brooke Bryan&quot;,&quot;data&quot;:[&quot;bcb06253-26d7-4f90-98fc-84609e9c653a&quot;,&quot;brooke.bryan@chargehive.com&quot;,&quot;Owner&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-05-23 10:55:14&quot;]},{&quot;actions&quot;:[{&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;/kx/iam/member/ed2cf789-091b-49f3-84f4-598ef18625b9/roles&quot;,&quot;title&quot;:&quot;Edit Roles&quot;},{&quot;target&quot;:&quot;modal&quot;,&quot;path&quot;:&quot;/kx/iam/member/ed2cf789-091b-49f3-84f4-598ef18625b9/type&quot;,&quot;title&quot;:&quot;Change Account Type&quot;},{&quot;confirm&quot;:{&quot;type&quot;:&quot;warning&quot;,&quot;trigger&quot;:&quot;suspend3&quot;,&quot;caption&quot;:&quot;Suspend Access&quot;,&quot;content&quot;:&quot;Are you sure you want to suspend access for Oke Ugwu?&quot;,&quot;action&quot;:&quot;/kx/iam/member/ed2cf789-091b-49f3-84f4-598ef18625b9/suspend&quot;},&quot;title&quot;:&quot;Suspend Access&quot;,&quot;style&quot;:&quot;warning&quot;}],&quot;caption&quot;:&quot;Oke Ugwu&quot;,&quot;data&quot;:[&quot;ed2cf789-091b-49f3-84f4-598ef18625b9&quot;,&quot;oke.ugwu@chargehive.com&quot;,&quot;Member&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-06-10 11:33:47&quot;]}]}"></zn-table>
    </zn-panel>`,
  args: {},
};
