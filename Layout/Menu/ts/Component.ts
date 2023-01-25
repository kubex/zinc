import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
// @ts-ignore
import styles from '../scss/Styles.scss';
import {ZincElement} from "../../../ts/element";

@customElement('zn-menu')
export class ZincMenu extends ZincElement {
    static get styles() {
        return [unsafeCSS(styles)];
    }

    public slot = "menu";

    @property({attribute: 'actions', type: Array})
    private actions = [];

    public closer;

    _handleAction(e) {
        if (this.closer) {
            this.closer();
        }
    }

    render() {

        let header;
        if (this.actions.length > 0) {
            header = html`
              <ul>
                ${this.actions.map((item) => {
                  if (item.target && item.path) {
                    return html`
                      <li><a @click="${this._handleAction}" href="${item.path}"
                             data-target="${item.target}">${item.title}</a></li>`
                  } else if (item.path) {
                    return html`
                      <li><a @click="${this._handleAction}" href="${item.path}">${item.title}</a></li>`
                  }
                  return null;
                })}
              </ul>
            `
        }

        return html`
          <div>${header}</div>`
    }
}
