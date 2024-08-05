import {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

import '../../src/Panel';
import '../../src/Button';
import '../../src/Tile';
import '../../src/Editor';

const meta: Meta = {
  component: 'zn-panel',
  title: 'Components/Panel',
  tags: ['components', 'panel'],
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({caption, navigation}) => html`
    <zn-panel caption="${caption}" navigation="${JSON.stringify(navigation)}">
      <zn-button slot="actions" content="This is an Action"></zn-button>
      This is the content of the panel
      <div slot="footer">Footer</div>
    </zn-panel>`,
  args: {
    caption: 'Mark Crayon - Caption',
    navigation: [
      {
        "title": "Home",
        "path": "#"
      },
      {
        "title": "Another One",
        "path": "#"
      }
    ]
  }
};

export const TabbedPanel: Story = {
  render: ({caption}) => html`
    <zn-panel caption="${caption}">
      <zn-button slot="actions" content="This is an Action"></zn-button>
      <div link="Home">
        <zn-tile caption="Caption" description="Description">
        </zn-tile>
        <zn-tile caption="Caption 2" description="Description 2">
        </zn-tile>
      </div>
      <div link="Another One">
        <zn-tile caption="Caption 3" description="Description 3">
        </zn-tile>
        <zn-tile caption="Caption 4" description="Description 4">
        </zn-tile>
      </div>
      <div slot="footer">Footer</div>
    </zn-panel>`,
  args: {
    caption: 'Mark Crayon - Caption',
  }
};

export const ChatPanel: Story = {
  render: ({navigation, borderBottom}) => html`
    <zn-panel navigation="${JSON.stringify(navigation)}" border-bottom="${borderBottom}">
      <zn-editor></zn-editor>
      <div slot="footer">Footer</div>
    </zn-panel>`,
  args: {
    borderBottom: false,
    navigation: [
      {
        "title": "Home",
        "path": "#"
      },
      {
        "title": "Another One",
        "path": "#"
      }
    ]
  }
};
