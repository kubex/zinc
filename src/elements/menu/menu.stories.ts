import {html} from 'lit-html';

export default {
  title: 'Elements/Menu',
};

export const Default = () =>
  html`
    <zn-panel stat single>Panel Content</zn-panel>
    <zn-panel>Panel Content</zn-panel>
    <zn-panel caption="Subscriptions">Panel Content</zn-panel>
    <zn-panel rows=5 caption="Billing"
              navigation='[{"title": "Transactions", "path": "/", "default":true},
            {"title": "Payments", "path": "/communication"},
            {"title": "Refunds", "path": "/communication"}]'>Panel
      Content
    </zn-panel>
    <zn-panel caption="Payment Methods" rows="2">
      <zn-icon slot="actions" src="settings" size="24" library="material"></zn-icon>
      <zn-icon slot="actions" src="add" size="24" library="material"></zn-icon>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
      Panel Content<br/>
    </zn-panel>

    <zn-panel caption="Payment Methods">
      <zn-icon slot="actions" src="settings" size="24" library="material"></zn-icon>
      Panel Content
      <span slot="footer">Footer Content</span>
    </zn-panel>
  `;