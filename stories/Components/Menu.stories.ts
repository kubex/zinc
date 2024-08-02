import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Menu';
import '../../src/Popup';
import '../../src/Button';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-menu',
  title: 'Components/Menu',
  tags: ['components', 'menu'],
};

export default meta;
type Story = StoryObj;


export const Default: Story = {
  render: ({ actions }) =>
  {
    return html`
      <zn-menu actions="${JSON.stringify(actions)}"></zn-menu>`;
  },
  args: {
    actions: [
      {
        "title": "Home",
        "path": "#"
      },
      {
        "title": "Settings",
        "path": "/settings"
      }
    ],
  }
};

export const Popup: Story = {
  render: ({ actions }) => (html`
    <div style="height: 300px; display: flex; justify-content: center; align-items: center;">
      <zn-popup placement="right-end" shift="true">
        <zn-button slot="anchor" color="primary" icon="more_vert"></zn-button>
        <zn-menu actions="${JSON.stringify(actions)}"></zn-menu>
      </zn-popup>
    </div>`),
  args: {
    actions: [
      {
        "title": "Home",
        "path": "#"
      },
      {
        "title": "Settings",
        "path": "#settings"
      }
    ],
  }
};
