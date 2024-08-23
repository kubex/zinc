import type {Meta, StoryObj} from "@storybook/web-components";
import {html} from "lit";

import type {InteractionTile} from "../../src/InteractionTile";
import '../../src/InteractionTile';
import '../../src/Icon';
import '../../src/Button';

const meta: Meta<typeof InteractionTile> = {
  component: 'zn-interaction-tile',
  title: 'Components/InteractionTile',
  tags: ['components', 'interaction-tile']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({
    interactionType,
    interactionStatus,
    caption,
    lastMessage,
    lastMessageTime,
    startTime,
    department,
    queue,
    brand,
    brandIcon
  }) => html`
    <zn-interaction-tile
      class="active"
      type=${interactionType}
      status=${interactionStatus}
      caption=${caption}
      last-message=${lastMessage}
      last-message-time=${lastMessageTime}
      start-time=${startTime}
      department=${department}
      queue=${queue}
      brand=${brand}
      brand-icon=${brandIcon}
    >
    </zn-interaction-tile>`,
  args: {
    interactionType: 'ticket',
    interactionStatus: 'active',
    caption: 'ky****************.com',
    lastMessage: 'Hello, I have a question about my order.',
    lastMessageTime: 1724343435,
    startTime: 1724337987,
    department: 'Sales',
    queue: 'Support',
    brand: 'Total Security',
    brandIcon: 'https://images.squarespace-cdn.com/content/v1/645b7529b4c3be7277a056ec/1f1344b4-8586-41fe-aa5d-858e3a1f6c90/favicon.ico'
  },
  argTypes: {
    interactionType: {
      control: {type: 'select'},
      options: ['chat', 'ticket', 'voice', 'unknown']
    },
    interactionStatus: {
      control: {type: 'select'},
      options: ['active', 'inactive', 'waiting-response']
    }
  }
};

export const Waiting: Story = {
  render: ({
    interactionType,
    caption,
    department,
    queue
  }) => html`
    <zn-interaction-tile
      class="active"
      type=${interactionType}
      status="queued"
      caption=${caption}
      department=${department}
      queue=${queue}
      accept-uri="#"
    >
    </zn-interaction-tile>`,
  args: {
    interactionType: 'ticket',
    caption: 'ky****************.com',
    department: 'Sales',
    queue: 'Support'
  },
  argTypes: {
    interactionType: {
      control: {type: 'select'},
      options: ['chat', 'ticket', 'voice', 'unknown']
    },
  }
};

export const Reserved: Story = {
  render: ({
    type,
    caption,
    department,
    queue
  }) => html`
    <zn-interaction-tile
      class="active"
      type=${type}
      status="queued"
      caption=${caption}
      department=${department}
      queue=${queue}
      accept-uri="#"
      reserved-until=${Date.now() + (2 * 60 * 1000)}
    >
    </zn-interaction-tile>`,
  args: {
    type: 'ticket',
    caption: 'ky****************.com',
    department: 'Sales',
    queue: 'Support'
  },
  argTypes: {
    interactionType: {
      control: {type: 'select'},
      options: ['chat', 'ticket', 'voice', 'unknown']
    },
  }
};
