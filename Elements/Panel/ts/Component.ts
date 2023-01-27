import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-panel')
export class ZincPanel extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    @property({attribute: 'caption', type: String, reflect: true})
    private caption;


    @property({attribute: 'small', type: Boolean, reflect: true})
    private small;

    @property({attribute: 'stat', type: Boolean, reflect: true})
    private stat;

    @property({attribute: 'rows', type: Number, reflect: true})
    private rows;

    @property({attribute: 'navigation', type: Array})
    private navigation = [];


    render() {
        let footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
        let actionItems = this.querySelectorAll('[slot="actions"]').length > 0;

        if (this.rows > 0) {
            this.style.setProperty('--row-count', this.rows);
        }

        let header;
        if (actionItems || this.caption || this.navigation.length > 0) {
            header = html`
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
              </div>`
        }

        let footer;
        if (footerItems) {
            footer = html`
              <div class="footer">
                <slot name="footer"></slot>
              </div>`
        }

        return html`
          <div>${header}
            <div class="body">
              <slot></slot>
            </div>
               ${footer}
          </div>`
    }
}
