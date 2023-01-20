import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import propertyStyles from '../scss/Property.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-prop')
export class ZincProperty extends ZincElement {
    static styles = unsafeCSS(propertyStyles);

    @property({attribute: 'caption', type: String, reflect: true})
    private caption;

    @property({attribute: 'icon', type: String, reflect: true})
    private icon;

    @property({attribute: 'library', type: String, reflect: true})
    private library = "material-outlined";

    @property({attribute: 'inline', type: Boolean, reflect: true})
    private inline;

    @property({attribute: 'colspan', type: Number, reflect: true})
    private colspan;

    render() {

        let icon = null;
        if (this.icon) {
            icon = html`
              <zn-icon library="${this.library}" src="${this.icon}"></zn-icon>`;
        }

        let colspan = this.colspan ? this.colspan : 2;

        return html`
          <style>:host {
            --colspan: ${colspan};
          }</style>
          <dt>${icon}${this.caption}</dt>
          <dd>
            <slot></slot>
          </dd>`;
    }
}
