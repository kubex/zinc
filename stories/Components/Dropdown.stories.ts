import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

import '../../src/Dropdown';
import '../../src/Button';
import '../../src/Icon';
import '../../src/Menu';
import '../../src/Popup';

import {Dropdown} from "../../src/Dropdown";

const meta: Meta<typeof Dropdown> = {
  component: 'zn-dropdown',
  title: 'Components/Dropdown',
  tags: ['components', 'dropdown']
};

export default meta;
type Story = StoryObj;

const exampleMenu = [
  {
    "title": "Home",
    "path": "#"
  },
  {
    "title": "Settings",
    "path": "#settings"
  }
];

export const Default: Story = {
  render: ({open}) => html`
    <zn-dropdown .open="${open}">
      <zn-button slot="trigger" icon="dropdown">Trigger</zn-button>
      <zn-menu actions=${JSON.stringify(exampleMenu)}></zn-menu>
    </zn-dropdown>
  `,
  args: {
    open: false
  },
  argTypes: {
    open: {
      description: 'The open state of the dropdown',
      control: {type: 'boolean'}
    }
  }
};
