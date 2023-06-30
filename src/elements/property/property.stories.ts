import {html} from 'lit-html';

export default {
  title: 'Elements/Property',
};

export const Default = () =>
  html`
    <zn-plist>
      <zn-prop caption="User ID">#234 442 424</zn-prop>
      <zn-prop caption="ARR">$149.95</zn-prop>
      <zn-prop caption="First Subscribed">3 years ago</zn-prop>
      <zn-prop caption="Location">London, UK</zn-prop>
      <zn-prop caption="Status">Paid Customer</zn-prop>
    </zn-plist>
    <hr/>
    <zn-plist icon>
      <zn-prop icon="email">gjbowers@companyname.com</zn-prop>
      <zn-prop icon="phone">0791 727 3829</zn-prop>
      <zn-prop icon="home">16-18 Barnes Wallis Road,<br/>Fareham, Hampshire,<br/>PO15 5TT</zn-prop>
    </zn-plist>
  `;