import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Menu';

const meta: Meta = {
  component: 'zn-menu',
  title: 'Components/Menu',
  tags: ['components', 'menu'],
};

export default meta;
type Story = StoryObj;


export const Default: Story = {
  render: ({actions}) =>
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
        "path": "#"
      }
    ],
  }
};
