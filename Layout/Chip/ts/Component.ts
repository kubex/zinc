import {html, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-chip')
export class ZincProperty extends ZincElement {
    static styles = unsafeCSS(styles);

    render() {
        return html`
          <div>
            <slot></slot>
          </div>`;
    }
}
