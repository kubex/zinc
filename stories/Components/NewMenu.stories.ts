import {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit/static-html.js";

import "../../src/NewMenu";
import "../../src/Popup";
import "../../src/Icon";

const meta: Meta = {
  component: 'zn-new-menu',
  title: 'Components/NewMenu',
  tags: ['components', 'new-menu'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => html`
    <zn-new-menu style="max-width: 200px">
      <zn-menu-item value="undo">Undo</zn-menu-item>
      <zn-menu-item value="redo">Redo</zn-menu-item>
      <zn-menu-item value="cut">Cut</zn-menu-item>
      <zn-menu-item value="copy">Copy</zn-menu-item>
      <zn-menu-item value="paste">Paste</zn-menu-item>
      <zn-menu-item>
        Find
        <zn-new-menu slot="submenu">
          <zn-menu-item value="find">Find…</zn-menu-item>
          <zn-menu-item value="find-previous">Find Next</zn-menu-item>
          <zn-menu-item value="find-next">Find Previous</zn-menu-item>
        </zn-new-menu>
      </zn-menu-item>
      <zn-menu-item>
        Transformations
        <zn-new-menu slot="submenu">
          <zn-menu-item value="uppercase">Make uppercase</zn-menu-item>
          <zn-menu-item value="lowercase">Make lowercase</zn-menu-item>
          <zn-menu-item value="capitalize">Capitalize</zn-menu-item>
        </zn-new-menu>
      </zn-menu-item>
    </zn-new-menu>`,
};
