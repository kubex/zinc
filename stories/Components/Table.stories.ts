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
        data="{&quot;header&quot;:[&quot;Full Name&quot;,&quot;User ID&quot;,&quot;Email&quot;,&quot;Type&quot;,&quot;Partner&quot;,&quot;State&quot;,&quot;Date Joined&quot;],&quot;items&quot;:[{&quot;actions&quot;:[{&quot;icon&quot;:&quot;person&quot;,&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Edit Roles&quot;},{&quot;target&quot;:&quot;modal&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Change Account Type&quot;},{&quot;confirm&quot;:{&quot;type&quot;:&quot;warning&quot;,&quot;trigger&quot;:&quot;suspend0&quot;,&quot;caption&quot;:&quot;Suspend Access&quot;,&quot;content&quot;:&quot;Are you sure you want to suspend access for James Eagle?&quot;,&quot;action&quot;:&quot;uri&quot;},&quot;title&quot;:&quot;Suspend Access&quot;,&quot;style&quot;:&quot;warning&quot;}],&quot;caption&quot;:&quot;James Eagle&quot;,&quot;data&quot;:[&quot;08c308bd-8833-486c-8501-602b1d59c205&quot;,&quot;james.eagle@chargehive.com&quot;,&quot;Owner&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-06-07 14:07:57&quot;]},{&quot;actions&quot;:[{&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Edit Roles&quot;}],&quot;caption&quot;:&quot;Kyle Essex&quot;,&quot;data&quot;:[&quot;587ff45b-eb11-4377-a213-6e5cbadb2486&quot;,&quot;kyle.essex@chargehive.com&quot;,&quot;Owner&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-05-23 10:55:14&quot;]},{&quot;actions&quot;:[{&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Edit Roles&quot;},{&quot;target&quot;:&quot;modal&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Change Account Type&quot;},{&quot;confirm&quot;:{&quot;type&quot;:&quot;warning&quot;,&quot;trigger&quot;:&quot;suspend2&quot;,&quot;caption&quot;:&quot;Suspend Access&quot;,&quot;content&quot;:&quot;Are you sure you want to suspend access for Brooke Bryan?&quot;,&quot;action&quot;:&quot;uri&quot;},&quot;title&quot;:&quot;Suspend Access&quot;,&quot;style&quot;:&quot;warning&quot;}],&quot;caption&quot;:&quot;Brooke Bryan&quot;,&quot;data&quot;:[&quot;bcb06253-26d7-4f90-98fc-84609e9c653a&quot;,&quot;brooke.bryan@chargehive.com&quot;,&quot;Owner&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-05-23 10:55:14&quot;]},{&quot;actions&quot;:[{&quot;target&quot;:&quot;slide&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Edit Roles&quot;},{&quot;target&quot;:&quot;modal&quot;,&quot;path&quot;:&quot;uri&quot;,&quot;title&quot;:&quot;Change Account Type&quot;},{&quot;confirm&quot;:{&quot;type&quot;:&quot;warning&quot;,&quot;trigger&quot;:&quot;suspend3&quot;,&quot;caption&quot;:&quot;Suspend Access&quot;,&quot;content&quot;:&quot;Are you sure you want to suspend access for Oke Ugwu?&quot;,&quot;action&quot;:&quot;uri&quot;},&quot;title&quot;:&quot;Suspend Access&quot;,&quot;style&quot;:&quot;warning&quot;}],&quot;caption&quot;:&quot;Oke Ugwu&quot;,&quot;data&quot;:[&quot;ed2cf789-091b-49f3-84f4-598ef18625b9&quot;,&quot;oke.ugwu@chargehive.com&quot;,&quot;Member&quot;,&quot;&quot;,&quot;<span class='zn-success'>Active</span>&quot;,&quot;2024-06-10 11:33:47&quot;]}]}"></zn-table>
    </zn-panel>`,
  args: {},
};

export const LargeData: Story = {
  render: () => html`
    <zn-panel caption="Structured Table">
      <zn-table>
        {"header":["Full Name","User ID","Email","Type","Partner","State","Date
        Joined"],"items":[{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend0","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Chris
        Phillips?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Chris
        Phillips","data":["4f0cb9d7-deef-45f5-b2ab-b9f2f318688c","chris@justdevelop.it","Owner","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend1","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Brooke
        Bryan?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Brooke
        Bryan","data":["1c98989d-3d28-4bd2-8b7b-67b5e8fde97f","brooke.bryan@chargehive.com","Owner","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend2","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Mark
        Neale?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove2","caption":"Remove
        Member","content":"Are you sure you want to remove Mark
        Neale?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Mark
        Neale","data":["baf32bb2-0c72-4c7a-87ff-98e65d30662f","mark.neale@chargehive.com","Member","","Invited","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend3","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Gabriel
        Bernardez?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Gabriel
        Bernardez","data":["984dfdf1-4632-47da-874b-8f2ac4e68c16","gabriel.bernardez@totalsecurity.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend4","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Nick
        Baker?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Nick
        Baker","data":["ff9c93c5-5749-4321-b20c-56a2a08866d6","nick.baker@justdevelop.it","Owner","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend5","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Kyle
        Essex?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Kyle
        Essex","data":["af396f1e-a224-44dd-b086-d618f6178cf0","kyle.essex@chargehive.com","Owner","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend6","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Aaron
        Edwards?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Aaron
        Edwards","data":["b2f287b1-5e36-49b5-a7e5-6208da816f64","aaron.edwards@totalsecurity.com","Owner","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend7","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Nigel
        Panteny?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Nigel
        Panteny","data":["59198db7-e477-48da-bd35-f14039b2d8c7","nigel.panteny@totalsecurity.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend8","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for
        ?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"
        ","data":["166dc2b0-5ab8-45e7-b221-c782b0d3f6cf","jschuckman@avanceinv.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend9","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for
        ?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"
        ","data":["e969cd30-bd6a-42a8-9132-3a518520c9b2","cmcgee@avanceinv.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend10","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Luis
        Zaldivar?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove10","caption":"Remove
        Member","content":"Are you sure you want to remove Luis
        Zaldivar?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Luis
        Zaldivar","data":["d4d24f42-ebed-4ae9-9495-b0f7412032db","luis.zaldivar1@gmail.com","Member","","Invited","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend11","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Nick
        Bold?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Nick
        Bold","data":["6a49d22b-d106-44c7-a6c4-adc22ea5c492","nick.bold@totalsecurity.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend12","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Mike
        Cleeve?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Mike
        Cleeve","data":["fe3c452f-bbe4-4606-8b6f-1a4a8b17bfb1","mike.cleeve@totalsecurity.com","Owner","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend13","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Billy
        Thomas?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Billy
        Thomas","data":["1baa674c-14d5-4ea8-939e-bc24d46cda75","billy@totalsecurity.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend14","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Natashia
        Gunner?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Natashia
        Gunner","data":["52ebcf40-97a7-4c78-9ce8-9e52d19d1c51","natashia.gunner@totalsecurity.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend15","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Liam
        Fry?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Liam
        Fry","data":["26a42843-f494-44e1-a91f-e8648b72f54e","liam.fry@totalsecurity.com","Member","","Active","2024-06-05
        22:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend16","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Roo
        Beckwith?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Roo
        Beckwith","data":["3df86c73-0afa-4e7b-aecb-2d1e4ade0e29","roo.beckwith@totalsecurity.com","Member","","Active","2024-08-06
        17:06:14"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend17","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Paul Peters
        ?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Paul Peters
        ","data":["4b6bad62-d53e-49c2-8010-e4be3ab7b478","pranav.p@aressindia.net","Member","ARESS","Active","2024-08-13
        13:51:20"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend18","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Gregory
        Reid?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Gregory
        Reid","data":["6a2572c3-28c3-4f41-8a83-c8775c32be84","sumit.s@aressindia.net","Member","ARESS","Active","2024-08-13
        13:51:26"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend19","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Oakley
        Reed?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Oakley
        Reed","data":["4a402613-f31d-4e7b-b4b6-a6607b033ae6","om.r@aressindia.net","Member","ARESS","Active","2024-08-13
        13:51:31"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend20","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sidney
        Isaacs?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Sidney
        Isaacs","data":["7f52b5d3-d2e2-489d-9701-bbfc0b90505a","saif.i@aressindia.net","Member","ARESS","Active","2024-08-13
        13:51:35"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend21","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Tom
        Kay?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Tom
        Kay","data":["871dd2bd-13a6-41d2-a3b6-48cc505729cf","tom.kay@chargehive.com","Owner","","Active","2024-08-13
        16:06:18"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend22","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Komal
        S?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove22","caption":"Remove
        Member","content":"Are you sure you want to remove Komal
        S?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Komal
        S","data":["c88c12e6-2b34-4ff4-8064-0b86f1845101","komal.s@aressindia.net","Member","ARESS","Invited","2024-08-15
        10:10:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend23","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Abhi
        D?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove23","caption":"Remove
        Member","content":"Are you sure you want to remove Abhi
        D?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Abhi
        D","data":["be705835-544d-4a0f-9e05-ff50b0efc02f","abhi.d@aressindia.net","Member","ARESS","Invited","2024-08-15
        10:10:40"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend24","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Zohair
        A?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Zohair
        A","data":["0def8bb4-0562-48a1-8058-7c820c82a090","zohair.a@aressindia.net","Member","ARESS","Active","2024-08-15
        10:10:47"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend25","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Fatima
        A?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Fatima
        A","data":["6e7f6565-6efe-4699-a5bb-f9665bf5336b","fatima.a@aressindia.net","Member","ARESS","Active","2024-08-15
        10:10:52"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend26","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Michael
        Sievenpiper?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Michael
        Sievenpiper","data":["15813be2-483f-4853-9aa4-4ef16ac5e8ac","michael.sievenpiper@totalsecurity.com","Member","","Active","2024-08-22
        15:40:53"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend27","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Harry
        Overton?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Harry
        Overton","data":["1ad243a6-8fe0-424f-95a4-00347fcafd1f","harry.overton@totalsecurity.com","Member","","Active","2024-09-09
        16:41:41"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend28","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for James
        Eagle?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"James
        Eagle","data":["801fce65-dc97-4c00-9b5d-a1db9ea1f9d4","james.eagle@chargehive.com","Member","","Active","2024-09-17
        08:32:15"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"}],"caption":"Brooke
        Bryan","data":["813138bf-cff6-4c90-8558-595ee44ffe9c","brooke.bryan@totalsecurity.com","Owner","","Active","2024-09-17
        08:50:12"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend30","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Tom
        Jarvis?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Tom
        Jarvis","data":["29bed820-5b89-43b3-9ca3-442f35e03a97","thomas.jarvis@totalsecurity.com","Member","","Active","2024-09-17
        08:50:20"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend31","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Tyler
        Rose?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Tyler
        Rose","data":["7b0cea6b-f690-4207-a58b-42382f2515d9","tanishq.r@aressindia.net","Member","ARESS","Active","2024-09-18
        08:29:25"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend32","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Ryan
        Roberts?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Ryan
        Roberts","data":["cb8d7f2b-03bd-4953-9ebf-b221fceaedc7","rushi.r@aressindia.net","Member","","Active","2024-09-18
        08:29:31"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend33","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Oke
        Ugwu?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Oke
        Ugwu","data":["87887bfe-564a-4823-88e3-2df2a1418166","oke.ugwu@chargehive.com","Member","","Active","2024-09-20
        21:41:22"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend34","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Dan
        Short?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Dan
        Short","data":["ca9413ae-3d6e-48c3-8150-f516ebadcb07","dan.short@totalsecurity.com","Member","","Active","2024-09-23
        09:57:02"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend35","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Beth
        Seaborne?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Beth
        Seaborne","data":["c5ff9b43-9898-49b7-b2db-7ea78966ff22","beth.seaborne@totalsecurity.com","Member","","Active","2024-10-03
        09:41:06"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend36","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Shane
        Crossan?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Shane
        Crossan","data":["1a25f7d3-912d-4f39-9737-30f1277b9389","shane.crossan@totalsecurity.com","Owner","","Active","2024-10-17
        09:31:09"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend37","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Emily
        Cane?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove37","caption":"Remove
        Member","content":"Are you sure you want to remove Emily
        Cane?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Emily
        Cane","data":["41c10e6b-e8d4-4922-a5cf-f640232f8df4","emily.cane@totalsecurity.com","Member","","Invited","2024-12-03
        15:17:50"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend38","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Hari
        Ravichandran?","action":"uri"},"title":"Suspend
        Access","style":"warning"}],"caption":"Hari
        Ravichandran","data":["3f0acdd1-4466-4315-99fd-09663e309516","harikravich@gmail.com","Owner","","Active","2024-12-11
        13:55:56"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend39","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Shruti
        Ramchandran?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove39","caption":"Remove
        Member","content":"Are you sure you want to remove Shruti
        Ramchandran?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Shruti
        Ramchandran","data":["62e5d7b2-8aba-4dfb-a4ea-64e6f808b81f","shruti.r@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:28:52"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend40","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Rashid
        Sayyed?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove40","caption":"Remove
        Member","content":"Are you sure you want to remove Rashid
        Sayyed?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Rashid
        Sayyed","data":["44887d53-a9c0-454b-91b2-fef7f82929f8","rashid.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:29:47"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend41","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for yogesh
        punamchand?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove41","caption":"Remove
        Member","content":"Are you sure you want to remove yogesh
        punamchand?","action":"uri"},"title":"Remove","style":"error"}],"caption":"yogesh
        punamchand","data":["6b948f99-54d4-4d2b-88e1-34e69ffb8e46","yogesh.pu@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:29:54"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend42","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for krish
        kulkarni?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove42","caption":"Remove
        Member","content":"Are you sure you want to remove krish
        kulkarni?","action":"uri"},"title":"Remove","style":"error"}],"caption":"krish
        kulkarni","data":["e9374fc2-cfee-457f-af93-8ca26c0ff21d","krish.k@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:06"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend43","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for prajakta
        kharat?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove43","caption":"Remove
        Member","content":"Are you sure you want to remove prajakta
        kharat?","action":"uri"},"title":"Remove","style":"error"}],"caption":"prajakta
        kharat","data":["923d4f7b-f768-475c-8206-919ba3c2d399","prajakta.k@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:10"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend44","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sham
        Dhage?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove44","caption":"Remove
        Member","content":"Are you sure you want to remove Sham
        Dhage?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sham
        Dhage","data":["5964ac9e-f9f7-46c8-97f1-d6d1927bcf50","sham.d@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:14"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend45","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Rahul
        Rane?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove45","caption":"Remove
        Member","content":"Are you sure you want to remove Rahul
        Rane?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Rahul
        Rane","data":["28fbcfa0-5c04-4de4-a886-01cabdb08c36","rahul.r@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:17"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend46","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Gaytri
        Rajendra?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove46","caption":"Remove
        Member","content":"Are you sure you want to remove Gaytri
        Rajendra?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Gaytri
        Rajendra","data":["fefc7014-7cc6-4637-a915-7d51a23b4e2a","gaytri.r@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:21"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend47","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Ishwari
        Ganesh?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove47","caption":"Remove
        Member","content":"Are you sure you want to remove Ishwari
        Ganesh?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Ishwari
        Ganesh","data":["84bcaa2a-e6d1-45d7-8145-4c2a85d370c1","ishwari.g@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:24"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend48","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Fahad
        Kazi?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove48","caption":"Remove
        Member","content":"Are you sure you want to remove Fahad
        Kazi?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Fahad
        Kazi","data":["9996f246-c4e8-46f7-9ba4-3e7067fcadba","fahad.k@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:28"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend49","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Yash
        Pillai?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove49","caption":"Remove
        Member","content":"Are you sure you want to remove Yash
        Pillai?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Yash
        Pillai","data":["1d7ea4bd-af9d-4b81-a1a7-e07f936c33c6","yash.p@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:31"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend50","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Atharva
        Mohan?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove50","caption":"Remove
        Member","content":"Are you sure you want to remove Atharva
        Mohan?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Atharva
        Mohan","data":["77698166-4c3e-482a-8250-e5414159d22f","atharva.m@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend51","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Karan
        Shreedhar?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove51","caption":"Remove
        Member","content":"Are you sure you want to remove Karan
        Shreedhar?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Karan
        Shreedhar","data":["aaa250dc-45fa-4145-9063-62f9a08cc669","karan.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:37"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend52","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Advait
        Mukund?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove52","caption":"Remove
        Member","content":"Are you sure you want to remove Advait
        Mukund?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Advait
        Mukund","data":["ce608ae4-2ebc-4e50-8520-13812554c65e","advait.m@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:41"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend53","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Spandan
        Vikas?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove53","caption":"Remove
        Member","content":"Are you sure you want to remove Spandan
        Vikas?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Spandan
        Vikas","data":["4f8d3454-eac6-4f88-ad9a-61f83bfb5ee5","spandan.v@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:45"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend54","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Shubham
        Pramod?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove54","caption":"Remove
        Member","content":"Are you sure you want to remove Shubham
        Pramod?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Shubham
        Pramod","data":["fceefac6-70ed-4d8b-b432-f3bbb0360656","shubham.p@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:48"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend55","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Dipak
        Kumar?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove55","caption":"Remove
        Member","content":"Are you sure you want to remove Dipak
        Kumar?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Dipak
        Kumar","data":["17899692-0975-424c-9221-2471e1e5eab7","dipak.k@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:51"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend56","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Adarsh
        Sandip?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove56","caption":"Remove
        Member","content":"Are you sure you want to remove Adarsh
        Sandip?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Adarsh
        Sandip","data":["1bc73eb2-301f-4718-b813-eb76da78d3c6","adarsh.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:54"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend57","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Yash
        Ramesh?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove57","caption":"Remove
        Member","content":"Are you sure you want to remove Yash
        Ramesh?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Yash
        Ramesh","data":["20a689d9-5ddd-4f62-a44d-893d1ef1573a","yash.r@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:30:58"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend58","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Atharv
        Yogen?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove58","caption":"Remove
        Member","content":"Are you sure you want to remove Atharv
        Yogen?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Atharv
        Yogen","data":["5a31bc68-2e7b-47d1-a114-8728dbe9694b","atharv.y@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:31:01"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend59","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Hamza
        Zakir?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove59","caption":"Remove
        Member","content":"Are you sure you want to remove Hamza
        Zakir?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Hamza
        Zakir","data":["158d5dba-c3be-4a87-959c-b6ee62c6f6d3","hamza.z@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:31:06"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend60","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sana
        Faroq?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove60","caption":"Remove
        Member","content":"Are you sure you want to remove Sana
        Faroq?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sana
        Faroq","data":["751fbd9e-3a5b-444a-b31f-4d2193b6e73a","sana.f@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:31:10"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend61","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Nitin
        Hari?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove61","caption":"Remove
        Member","content":"Are you sure you want to remove Nitin
        Hari?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Nitin
        Hari","data":["ecd11934-dea6-4d50-aea6-55f3c281ba90","nitin.h@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:31:14"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend62","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Aditya
        Manoj?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove62","caption":"Remove
        Member","content":"Are you sure you want to remove Aditya
        Manoj?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Aditya
        Manoj","data":["7c377686-aa46-49af-9110-bdb69de5b7e5","aditya.m@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:31:17"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend63","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Shreyash
        Prem?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove63","caption":"Remove
        Member","content":"Are you sure you want to remove Shreyash
        Prem?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Shreyash
        Prem","data":["81c87c1d-47cd-4e85-8d9d-987fe25dc249","shreyash.p@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:33:59"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend64","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Vishal
        Bapu?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove64","caption":"Remove
        Member","content":"Are you sure you want to remove Vishal
        Bapu?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Vishal
        Bapu","data":["cbaecd24-0243-4d7a-8c3c-865f72e81897","vishal.b@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:06"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend65","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sanil
        Surya?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove65","caption":"Remove
        Member","content":"Are you sure you want to remove Sanil
        Surya?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sanil
        Surya","data":["2709cdd1-005d-4675-bc22-9341689d25b0","sanil.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:10"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend66","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Chaitali
        Krish?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove66","caption":"Remove
        Member","content":"Are you sure you want to remove Chaitali
        Krish?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Chaitali
        Krish","data":["16731562-be94-4edf-8612-fbb938af11a1","chaitali.krish@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:13"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend67","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sarang
        Sandip?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove67","caption":"Remove
        Member","content":"Are you sure you want to remove Sarang
        Sandip?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sarang
        Sandip","data":["4e4c4df5-c418-4456-af2e-af788cfa2ded","sarang.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:17"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend68","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Pratik
        Shubhash?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove68","caption":"Remove
        Member","content":"Are you sure you want to remove Pratik
        Shubhash?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Pratik
        Shubhash","data":["671aa5f1-2d9a-4d6e-9238-2125a359b6bd","pratik.sh@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:20"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend69","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Mangesh
        Madhu?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove69","caption":"Remove
        Member","content":"Are you sure you want to remove Mangesh
        Madhu?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Mangesh
        Madhu","data":["e5495bff-8355-419b-bc00-1c83c6c9d6c5","mangesh.m@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:23"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend70","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Ketan
        Kumar?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove70","caption":"Remove
        Member","content":"Are you sure you want to remove Ketan
        Kumar?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Ketan
        Kumar","data":["c4493831-c2ea-446f-ab75-902b77b31cbf","ketan.k@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:26"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend71","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sumant
        Suresh?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove71","caption":"Remove
        Member","content":"Are you sure you want to remove Sumant
        Suresh?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sumant
        Suresh","data":["3baa6986-dda0-4496-8efd-2b72c9e7a641","sumant.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:29"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend72","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Shivam
        Rajesh?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove72","caption":"Remove
        Member","content":"Are you sure you want to remove Shivam
        Rajesh?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Shivam
        Rajesh","data":["659117e2-2fa2-4e6e-9013-e87c7b5b1e00","shivam.r@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:34"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend73","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Akshay
        Sunil?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove73","caption":"Remove
        Member","content":"Are you sure you want to remove Akshay
        Sunil?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Akshay
        Sunil","data":["697d48d8-c77b-4803-b244-d6b727192ced","akshay.su@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:43"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend74","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Siddh
        Machindra?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove74","caption":"Remove
        Member","content":"Are you sure you want to remove Siddh
        Machindra?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Siddh
        Machindra","data":["b5806c45-83ac-48cc-b3f5-0a8e50af5647","siddh.m@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:46"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend75","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Anurag
        Pramod?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove75","caption":"Remove
        Member","content":"Are you sure you want to remove Anurag
        Pramod?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Anurag
        Pramod","data":["9200f2d1-5baf-438d-af95-03b7aed93318","anurag.pr@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:49"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend76","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Vaibhav
        Sanjay?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove76","caption":"Remove
        Member","content":"Are you sure you want to remove Vaibhav
        Sanjay?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Vaibhav
        Sanjay","data":["e8a9c286-3ae6-41ab-ba2d-4e0d44b95e7f","vaibhav.sa@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:52"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend77","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Abhishek
        Uttam?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove77","caption":"Remove
        Member","content":"Are you sure you want to remove Abhishek
        Uttam?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Abhishek
        Uttam","data":["f2e22fe3-a33f-49ad-bee3-574d7550d7f5","abhishek.uttam@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:56"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend78","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Siddhant
        Avi?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove78","caption":"Remove
        Member","content":"Are you sure you want to remove Siddhant
        Avi?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Siddhant
        Avi","data":["500bc37c-1552-4a53-8390-03b2a1648d79","siddhant.avi@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:34:59"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend79","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Jayesh
        Satish?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove79","caption":"Remove
        Member","content":"Are you sure you want to remove Jayesh
        Satish?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Jayesh
        Satish","data":["732f0d39-7ad9-4dfe-8282-27a9fbf968c0","jayesh.sa@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:35:03"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend80","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Mitul
        Jay?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove80","caption":"Remove
        Member","content":"Are you sure you want to remove Mitul
        Jay?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Mitul
        Jay","data":["131104c4-1613-4efa-9c94-a315dd264919","mitul.j@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:35:54"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend81","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Prakash
        Laxman?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove81","caption":"Remove
        Member","content":"Are you sure you want to remove Prakash
        Laxman?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Prakash
        Laxman","data":["dcdbd30d-42b9-49b8-8fae-df6c742591e2","prakash.l@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:35:57"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend82","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Prashant
        Navneet?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove82","caption":"Remove
        Member","content":"Are you sure you want to remove Prashant
        Navneet?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Prashant
        Navneet","data":["86932857-3ca2-4778-8a39-7e400c189668","prashant.n@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:01"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend83","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Fardeen
        Ibrahim?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove83","caption":"Remove
        Member","content":"Are you sure you want to remove Fardeen
        Ibrahim?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Fardeen
        Ibrahim","data":["b3b0116d-014f-4b3d-9aa4-a2bf4df80ef3","fardeen.i@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:04"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend84","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Premraj
        Pradip?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove84","caption":"Remove
        Member","content":"Are you sure you want to remove Premraj
        Pradip?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Premraj
        Pradip","data":["7c324dca-d8cd-4b40-acd7-0d8e43db3ac6","premraj.p@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:07"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend85","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Aadesh
        Devadas?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove85","caption":"Remove
        Member","content":"Are you sure you want to remove Aadesh
        Devadas?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Aadesh
        Devadas","data":["70d57041-c660-405f-9560-bb17b7579c3d","aadesh.d@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:10"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend86","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sahil
        Sandeep?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove86","caption":"Remove
        Member","content":"Are you sure you want to remove Sahil
        Sandeep?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sahil
        Sandeep","data":["7cd31e01-7301-4678-ad6b-c890628e6a87","sahil.sa@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:15"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend87","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Sohan
        Narendra?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove87","caption":"Remove
        Member","content":"Are you sure you want to remove Sohan
        Narendra?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Sohan
        Narendra","data":["349e0277-190f-47df-a8d6-6843070e4995","sohan.n@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:18"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend88","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Eram
        Nadim?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove88","caption":"Remove
        Member","content":"Are you sure you want to remove Eram
        Nadim?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Eram
        Nadim","data":["301f423a-f959-4915-bc25-976e5539d53a","eram.n@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:22"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend89","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Vishal
        Vishnu?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove89","caption":"Remove
        Member","content":"Are you sure you want to remove Vishal
        Vishnu?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Vishal
        Vishnu","data":["a158a124-1c77-4301-a8ff-cf85561db4e0","vishal.v@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:27"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend90","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Utkarsha
        Shekhar?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove90","caption":"Remove
        Member","content":"Are you sure you want to remove Utkarsha
        Shekhar?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Utkarsha
        Shekhar","data":["e0435cd0-5c69-43c4-a4e2-5a4399dcb17e","utkarsha.s@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:30"]},{"actions":[{"target":"slide","path":"uri","title":"Edit
        Roles"},{"target":"modal","path":"uri","title":"Change
        Account Type"},{"confirm":{"type":"warning","trigger":"suspend91","caption":"Suspend Access","content":"Are you
        sure you want to suspend access for Pandiya
        Dhan?","action":"uri"},"title":"Suspend
        Access","style":"warning"},{"confirm":{"type":"error","trigger":"remove91","caption":"Remove
        Member","content":"Are you sure you want to remove Pandiya
        Dhan?","action":"uri"},"title":"Remove","style":"error"}],"caption":"Pandiya
        Dhan","data":["e5627136-f7d7-40a5-9961-f429b0424f85","pandiya.d@aressindia.net","Member","ARESS","Invited","2024-12-17
        10:36:33"]}]}
      </zn-table>
    </zn-panel>`,
  args: {},
};
