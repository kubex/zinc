import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-tile')
export class ZincTile extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'caption', type: String, reflect: true})
    private caption;
    @property({attribute: 'description', type: String, reflect: true})
    private description;

    render() {
        return html`
          <div>
            <div>
              <div class="caption">${this.caption}</div>
              <div class="description">${this.description}</div>
            </div>
            <div>
              <slot></slot>
            </div>
          </div>
        `
    }
}
