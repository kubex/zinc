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

    @property({attribute: 'max-width', type: Number, reflect: true})
    private maxWidth;

    render() {

        let header = html`
          <h1>${this.caption}</h1>
          <slot></slot>
          <ul class="header-nav">
            ${this.navigation.map((item, index) =>
              html`
                <li><a href="${item.path}">${item.title}</a></li>`)}
          </ul>
        `
        if (this.maxWidth != undefined) {
            header = html`
              <div class="width-container">${header}</div>`

            if (this.maxWidth > 0) {
                return html`
                  <style>:host {
                    --max-width: ${this.maxWidth}px; </style>${header}`
            }
        }

        return header
    }
}
