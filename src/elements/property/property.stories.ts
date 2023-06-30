import {html} from 'lit-html';

export default {
  title: 'Elements/Property',
};

export const Default = ({inline}) =>
  html`
    <zn-plist>
      <zn-prop caption="User ID" .inline=${inline}>#234 442 424</zn-prop>
      <zn-prop caption="ARR" .inline=${inline}>$149.95</zn-prop>
      <zn-prop caption="First Subscribed" .inline=${inline}>3 years ago</zn-prop>
      <zn-prop caption="Location" .inline=${inline}>London, UK</zn-prop>
      <zn-prop caption="Status" .inline=${inline}>Paid Customer</zn-prop>
    </zn-plist>
    <hr/>
    <zn-plist icon>
      <zn-prop icon="email" .inline=${inline}>gjbowers@companyname.com</zn-prop>
      <zn-prop icon="phone" .inline=${inline}>0791 727 3829</zn-prop>
      <zn-prop icon="home" .inline=${inline}>16-18 Barnes Wallis Road,<br/>Fareham, Hampshire,<br/>PO15 5TT</zn-prop>
    </zn-plist>
  `;

Default.args = {
  inline: false,
}