import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/NavBar';
import '../../src/Popup';
import '../../src/Button';
import '../../src/Icon';
import '../../src/Menu';

const meta: Meta = {
  component: 'zn-navbar',
  title: 'Components/NavBar',
  tags: ['components', 'navbar'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({baseless, navigation}) => html`
    <zn-navbar .navigation="${navigation}" ?baseless="${baseless}"></zn-navbar>`,
  args: {
    baseless: false,
    navigation: [
      {
        "title": "Overview",
        "path": "#",
        "default": true
      },
      {
        "title": "Details",
        "path": "#"
      },
      {
        "title": "History",
        "path": "#"
      },
      {
        "title": "Settings",
        "path": "#"
      }
    ],
  },
  argTypes: {}
};


export const Dropdown: Story = {
  render: ({dropdown}) => html`
    <zn-navbar .dropdown="${dropdown}">
      <li tab>Customer</li>
      <li tab="cancellation">Cancellation</li>
    </zn-navbar>`,
  args: {
    dropdown: [
      {
        "title": "Overview",
        "type": "dropdown",
        "path": "#overview",
      },
      {
        "title": "Details",
        "type": "dropdown",
        "path": "#details",
      },
      {
        "title": "History",
        "type": "dropdown",
        "path": "#history",
      },
      {
        "title": "Settings",
        "type": "dropdown",
        "path": "#settings",
      }
    ],
  },
  argTypes: {}
};
