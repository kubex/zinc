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


    render() {

        let header;
        if (this.actions.length > 0) {
            header = html`
              <ul>
                ${this.actions.map((item, index) =>
                  html`
                    <li><a href="${item.path}">${item.title}</a></li>`)}
              </ul>
            `
        }

        return html`
          <div>${header}</div>`
    }
}
