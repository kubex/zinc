import {html, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-alert')
export class ZincAlert extends ZincElement {
    static styles = unsafeCSS(styles);

    render() {
        return html`
          <div class="alert">
            <div class="icon">
              <zn-icon src="check" size="48" library="mio" style="--icon-size:32px;"></zn-icon>
            </div>
            <div class="title">Payment Success</div>
            <div class="content">
              <slot></slot>
            </div>
            <div class="buttons">
              <slot name="buttons"></slot>
            </div>
          </div>
        `;
    }
}
