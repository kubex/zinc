import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {Menu} from "../Menu";

import styles from './index.scss';

@customElement('zn-tile')
export class Tile extends LitElement {
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'description', type: String, reflect: true}) description;
  @property({attribute: 'right', type: Boolean, reflect: true}) right;
  @property({attribute: 'data-uri', type: String, reflect: true}) dataUri;
  @property({attribute: 'data-target', type: String, reflect: true}) dataTarget;

  private menu;

  static styles = unsafeCSS(styles);

  _handleActions(e) {
    const menu = this.menu[0];
    const showMenu = document.createElement('div');

    showMenu.classList.add('zn-menu--overlay');
    showMenu.style.top = e.pageY + 'px';
    showMenu.appendChild(menu);
    document.body.appendChild(showMenu);
    //Set the left position after the menu is added to the page
    showMenu.style.left = (e.pageX - menu.offsetWidth) + 'px';

    const backdrop = document.createElement('div');
    document.body.appendChild(backdrop);
    backdrop.classList.add('zn-menu_backdrop');


    const close = function () {
      showMenu.remove();
      backdrop.remove();
      document.removeEventListener('keyup', detachEsc);
    }

    const detachEsc = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    }

    if (menu instanceof Menu) {
      menu.closer = close;
    }

    showMenu.classList.add('zn-menu--ready');

    backdrop.onclick = close;
    document.addEventListener("keyup", detachEsc);
  }

  render() {

    const primary = this.querySelectorAll('[slot="primary"]').length > 0 ? html`
      <slot name="primary"></slot>` : null;
    const chip = this.querySelectorAll('[slot="chip"]').length > 0 ? html`
      <slot name="chip"></slot>` : null;

    this.menu = this.querySelectorAll('zn-menu')

    const actions = this.menu.length > 0 ? html`
      <div class="actions">
        <zn-icon @click="${this._handleActions}" library="material-outlined" src="more_vert"></zn-icon>
      </div>` : null;

    const properties = this.querySelectorAll('zn-prop');

    const extended = properties.length > 0 || chip != null ? html`
      <div class="extended">
        ${properties}
        ${chip}
      </div>` : null;

    const summaryClass = extended == null ? 'summary' : 'summary extend';

    const summary = html`
      <div class="caption" data-uri="${this.dataUri}" data-target="${this.dataTarget}">${this.caption}</div>
      <div class="description">${this.description}</div>`;

    const status = this.querySelectorAll('[slot="status"]').length > 0 ? html`
      <slot name="status"></slot>` : null;

    return html`
      <div>
        ${primary}
        <div class="${summaryClass}">
          ${summary}
        </div>
        ${extended}
        ${actions}
        ${status}
      </div>
    `
  }
}


