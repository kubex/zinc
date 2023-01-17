import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
// @ts-ignore
import propertyStyles from '../scss/Property.scss';

@customElement('zn-plist')
export class ZincPropertyList extends LitElement {
    static styles = unsafeCSS(styles);

    @property({attribute: 'icon', type: Boolean, reflect: true})
    private icon;

    render() {

        return html`
          <slot></slot>`;
    }
}


@customElement('zn-prop')
export class ZincProperty extends LitElement {
    static styles = unsafeCSS(propertyStyles);

    @property({attribute: 'caption', type: String, reflect: true})
    private caption;

    @property({attribute: 'icon', type: String, reflect: true})
    private icon;

    @property({attribute: 'library', type: String, reflect: true})
    private library = "material-outlined";

    render() {

        let icon = null;
        if (this.icon) {
            icon = html`
              <zn-icon library="${this.library}" src="${this.icon}"></zn-icon>`;
        }

        return html`
          <dt>${icon}${this.caption}</dt>
          <dd>
            <slot></slot>
          </dd>`;
    }
}
