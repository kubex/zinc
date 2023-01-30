import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-heading')
export class ZincHeading extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'caption', type: String, reflect: true})
    private caption: String = "";


    render() {
        return html`
          <div>
            <h1>${this.caption}</h1>
            <div>
              <slot></slot>
            </div>
          </div>
        `;
    }
}
