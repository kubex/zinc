import { Meta, StoryObj } from "@storybook/web-components";
import { html } from "lit";

import '../../src/Tile';
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

export const Default: Story = {
  render: ({ caption, description }) => html`
    <zn-tile caption="${caption}" description="${description}"></zn-tile>`,
  args: {
    caption: 'Mark Crayon',
    description: 'Manager',
  },
};


export const PrimaryAndStatus: Story = {
  render: ({ caption, description }) => html`
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
  render: ({ caption, description }) => html`
    <zn-tile caption="${caption}" description="${description}">
      <zn-chip slot="status" success>paid</zn-chip>
    </zn-tile>`,
  args: {
    caption: 'May 17th 2023 — $12.99',
    description: 'Manager',
  },
};

export const Primary: Story = {
  render: ({ caption, description }) => html`
    <zn-tile caption="${caption}" description="${description}">
      <zn-icon slot="primary" round size="60" src="https://i.pravatar.cc/60?img=20"></zn-icon>
    </zn-tile>`,
  args: {
    caption: 'Mark Crayon',
    description: 'Manager',
  },
};

export const ActionAndIndicator: Story = {
  render: ({ caption, description }) => html`
    <zn-tile caption="${caption}" description="${description}" padded>
      <zn-icon slot="primary" round size="60" src="https://i.pravatar.cc/60?img=20"></zn-icon>
      <zn-button slot="status" type="primary">Accept</zn-button>
      <div slot="top">
        <zn-timer timestamp="2543432325" type="error"></zn-timer>
      </div>
    </zn-tile>`,
  args: {
    caption: 'Mark Crayon',
    description: 'Manager',
  },
};
