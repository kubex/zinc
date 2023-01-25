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

    _handleAction(e, item) {
        if (this.closer) {
            this.closer();
        }
    }

    render() {

        let header;
        if (this.actions.length > 0) {
            header = html`
              <ul>
                ${this.actions.map((item, index) => {
                  let target = item.target ? html`data-target="${item.target}"` : null;
                  let href = item.path ? html`href="${item.path}"` : null;
                  return html`
                    <li><a @click="${(e) => {
                      this._handleAction(e, item);
                    }}" ${href} ${target}>${item.title}</a></li>`
                })}
              </ul>
            `
        }

        return html`
          <div>${header}</div>`
    }
}
