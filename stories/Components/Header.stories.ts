import {html} from "lit";
import {Meta, StoryObj} from "@storybook/web-components";

import '../../src/Header';
import '../../src/Button';
import '../../src/Icon';

const meta: Meta = {
  component: 'zn-header',
  title: 'Components/Header',
  tags: ['components', 'header'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({caption, navigation, breadcrumb, fullWidth, transparent, previousPath}) => html`
    <zn-header caption="${caption}" .navigation="${navigation}" .breadcrumb="${breadcrumb}" ?fullWidth="${fullWidth}"
               ?previousPath="${previousPath}"
               ?transparent="${transparent}">
      <zn-button>Button</zn-button>
    </zn-header>`,
  args: {
    caption: 'This is the caption',
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
    breadcrumb: [{
      "title": "Home",
      "path": "#"
    }],
    fullWidth: false,
    transparent: false,
    previousPath: '',
  },
  argTypes: {}
};

export const Simple: Story = {
  args: {
    caption: 'This is the caption',
    navigation: [],
    breadcrumb: [],
    fullWidth: false,
    transparent: false,
    previousPath: "/fwe",
  },
  argTypes: {}
};
