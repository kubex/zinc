import { html } from "lit";
import { Meta, StoryObj } from "@storybook/web-components";

import '../../src/Panel';
import '../../src/Tile';
import '../../src/Chip';
import '../../src/Icon';

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

export const PaymentMethods: Story = {
  render: () =>
  {
    return html`
      <zn-panel caption="Payment Methods"
                navigation='[{"title": "Overview", "path": "#", "default":true},{"title": "Successful", "path": "#"},{"title": "Declined", "path": "#"},{"title": "Captures", "path": "#"}]'>
        <zn-tile caption="Visa •••• 2341 (Primary Method)" description="Expires - 31st May 2023">
          <zn-icon slot="primary" src="credit_card" size="48" library="mio" style="--icon-size:32px;"></zn-icon>
          <zn-chip slot="status" success>active</zn-chip>
        </zn-tile>
        <zn-tile caption="Mastercard •••• 2341" description="Expires - 31st May 2023">
          <zn-chip slot="status" success>active</zn-chip>
        </zn-tile>
        <zn-tile caption="Visa •••• 2341" description="Expired - 31st January 2023">
          <zn-chip slot="status" error>expired</zn-chip>
        </zn-tile>
        <span slot="footer">View  All &rarr;</span>
      </zn-panel>`;
  }
};
