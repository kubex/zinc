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

    @property({attribute: 'right', type: Boolean, reflect: true})
    private right;


    render() {

        let primary = this.querySelectorAll('[slot="primary"]').length > 0 ? html`
          <slot name="primary"></slot>` : null;
        let chip = this.querySelectorAll('[slot="chip"]').length > 0 ? html`
          <slot name="chip"></slot>` : null;

        const properties = this.querySelectorAll('zn-prop');
        return html`
          <div>
            ${primary}
            <div class="summary">
              <div class="caption">${this.caption}</div>
              <div class="description">${this.description}</div>
            </div>
            <div class="extended">
              ${chip}
              ${properties}
            </div>
          </div>
        `
    }
}
