import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Panel';
import '../../src/Tile';
import '../../src/Chip';

const meta: Meta = {
  title: 'Screens/PanelTile',
  tags: ['screens', 'panel-tile']
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: ({ caption, navigation }) =>
  {
    return html`
      <zn-panel caption="${caption}" .navigation=${navigation}>
        <zn-tile caption="Antivirus Webshield Pro - 12 Months" description="Renews - May 24th 2023">
          <zn-chip slot="status" success>active</zn-chip>
        </zn-tile>
        <zn-tile caption="Antivirus Webshield Pro - 12 Months" description="Renews - May 24th 2023">
          <zn-chip slot="status" success>active</zn-chip>
        </zn-tile>
      </zn-panel>`;
  },
  args: {
    caption: 'Ready Made Panel',
    navigation: [
      {
        title: 'Overview',
        path: '#',
        default: true,
      },
      {
        title: 'Successful',
        path: '#',
      },
      {
        title: 'Declined',
        path: '#',
      },
      {
        title: 'Captures',
        path: '#',
      },
    ],
  },
};
