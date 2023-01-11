import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-header')
export class ZincHeader extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'transparent', type: Boolean, reflect: true})
    private transparent: boolean = false;

    @property({attribute: 'caption', type: String, reflect: true})
    private caption: String = "";

    @property({attribute: 'navigation', type: Array, reflect: true})
    private navigation = [];


    render() {

        return html`
          <h1>${this.caption}</h1>
          <slot></slot>
          <ul>
            ${this.navigation.map((item, index) =>
              html`
                <li><a href="${item.path}">${item.title}</a></li>`)}
          </ul>
        `
    }
}
