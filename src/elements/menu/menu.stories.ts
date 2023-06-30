import {html} from 'lit-html';

export default {
  title: 'Elements/Menu',
};

export const Default = () =>
  html`
    <zn-tile>
      <zn-menu actions='[{"title": "Update", "path": "/chargehive/invoices", "target":"slide-content"},
            {"title": "Suspend", "path": "/communication"}]'></zn-menu>
    </zn-tile>
    <hr>
  `;