import {html} from 'lit-html';

export default {
  title: 'Elements/Toggle',
};

export const Default = () =>
  html`
    <form method="POST" style="padding: 30px;">
      <zn-toggle name="tog-form" value="checked"></zn-toggle>
      <input type="submit" value="Go">
    </form>
  `;