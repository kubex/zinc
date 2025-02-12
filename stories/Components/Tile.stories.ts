import {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

import '../../src/Tile';

import '../../src/ListTile';


import '../../src/Chip';
import '../../src/Icon';
import '../../src/Button';
import '../../src/Timer';

const meta: Meta = {
  component: 'zn-tile',
  title: 'Components/Tile',
  tags: ['components', 'tile'],
};

export default meta;
type Story = StoryObj;

export const ListTile: Story = {
  render: () => html`
    <zn-list-tile caption="Caption here"
                  description="This is the amazing description sfkjdsjkds fkjds fjkds fds njsdfsdjnk kj jks f dsfdsf sfsd skjf sdjkf dsjkf dsjkf dsjkfds jkds jkfds fjkds fjkds jkfds "
                  href="https://google.com">
      <zn-list-tile-property slot="properties" caption="Business Relations">
        Front-end Developer sdkf dskjf dskjf dsjkf dskjfdskjf dskjf dsf dsfdsf dsfdsds 
      </zn-list-tile-property>
      <zn-list-tile-property slot="properties" caption="Business Relations">
        Front-end Developer sdkf dskjf dskjf dsjkf dskjfdskjf dskjf dsf dsfdsf dsfdsds
      </zn-list-tile-property>
      <zn-list-tile-property slot="properties" caption="Business Relations">
        Front-end Developer sdkf dskjf dskjf dsjkf dskjfdskjf dskjf dsf dsfdsf dsfdsds
      </zn-list-tile-property>
      <zn-list-tile-property slot="properties" caption="Designer">
        Due - June 24th 2023
      </zn-list-tile-property>
      <zn-chip slot="actions" success>Online</zn-chip>
    </zn-list-tile>`,
};

export const Default: Story = {
  render: ({caption, description}) => html`
    <zn-tile caption="${caption}" description="${description}"></zn-tile>`,
  args: {
    caption: 'Mark Crayon',
    description: 'Manager',
  },
};

export const PrimaryAndStatus: Story = {
  render: ({caption, description}) => html`
    <zn-tile caption="${caption}" description="${description}">
      <zn-icon slot="primary" round size="60" src="https://i.pravatar.cc/60?img=20"></zn-icon>
      <div slot="status">
        <zn-chip>EN</zn-chip>
        <zn-chip>DE</zn-chip>
      </div>
    </zn-tile>`,
  args: {
    caption: 'Mark Crayon',
    description: 'Manager',
  },
};

export const Status: Story = {
  render: () => html`
    <zn-tile caption="INV-51039543"
             description="Sent - May 24th 2023"
             sub-caption="$1,500.00"
             sub-description="Due - May 31st 2023">
      
      <zn-chip slot="status" success>paid</zn-chip>
    </zn-tile>`,
};

export const Primary: Story = {
  render: ({caption, description}) => html`
    <zn-tile caption="${caption}" description="${description}">
      <zn-icon slot="primary" round size="60" src="https://i.pravatar.cc/60?img=20"></zn-icon>
    </zn-tile>`,
  args: {
    caption: 'Mark Crayon',
    description: 'Manager',
  },
};
