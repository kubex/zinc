import {html} from 'lit-html';

export default {
  title: 'Elements/Tile',
};

export const Default = () =>
  html`
    <zn-panel>
      <zn-tile caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)">
        <span slot="chip" class="chip">Active</span>
      </zn-tile>
      <zn-tile caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)">
        <span slot="primary" class="chip">Active</span>
      </zn-tile>

      <zn-tile child caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)"></zn-tile>
      <zn-tile caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)"></zn-tile>
      <zn-tile right caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)"></zn-tile>

      <zn-tile caption="Antivirus Pro" description="Renews 2024-01-06 (1 Year)">
        <div slot="primary">
          Hello<br/>World
        </div>
        <zn-prop stack caption="eflkh wleh">welkhfwelkhfew</zn-prop>
        <zn-prop stack caption="eflkh wleh">welkhfwelkhfew</zn-prop>
      </zn-tile>
    </zn-panel>
  `;