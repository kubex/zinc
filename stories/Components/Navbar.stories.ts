import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/NavBar';

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

