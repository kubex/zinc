import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-panel')
export class ZincPanel extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    render() {
        return html`
          <div class="header">
            <span>Subscriptions</span>
            <div class="nav">
              <ul>
                <li class="active">Invoices</li>
                <li>Refunds</li>
                <li>Payments</li>
              </ul>
            </div>
            <slot name="actions">ACTIONS</slot>
          </div>
          <div class="body">
            <slot>BODY</slot>
          </div>
          <div class="footer">FOOTER</div>`
    }
}
