import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';

@customElement('zn-panel')
export class ZincPanel extends LitElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }


    @property({attribute: 'caption', type: String, reflect: true})
    private caption: String = "";


    @property({attribute: 'small', type: Boolean, reflect: true})
    private small: boolean = false;

    @property({attribute: 'navigation', type: Array})
    private navigation = [];


    render() {
        let footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
        let panel = html`
          <div class="header">
            <span>${this.caption}</span>
            <div class="nav">
              <ul>
                ${this.navigation.map((item, index) =>
                  html`
                    <li><a href="${item.path}">${item.title}</a></li>`)}
              </ul>
            </div>
            <slot name="actions"></slot>
          </div>
          <div class="body">
            <slot></slot>
          </div>`

        if (footerItems) {
            return html`${panel}
            <div class="footer">
              <slot name="footer"></slot>
            </div>`
        }
        return panel
    }
}
