import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
// @ts-ignore
import propertyStyles from '../scss/Property.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-plist')
export class ZincPropertyList extends ZincElement {
    static styles = unsafeCSS(styles);

    @property({attribute: 'icon', type: Boolean, reflect: true})
    private icon;

    render() {

        return html`
          <slot></slot>`;
    }
}
