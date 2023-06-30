import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";
import {ZincMenu} from "../menu/menu";

import styles from './tile.scss';

@customElement('zn-tile')
export class ZincTile extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'caption', type: String, reflect: true})
  private caption;

  @property({attribute: 'description', type: String, reflect: true})
  private description;

  @property({attribute: 'right', type: Boolean, reflect: true})
  private right;

  @property({attribute: 'data-uri', type: String, reflect: true})
  private dataUri;

  @property({attribute: 'data-target', type: String, reflect: true})
  private dataTarget;

  private menu;

  _handleActions(e) {
    let menu = this.menu[0];
    let showMenu = document.createElement('div');

    showMenu.classList.add('zn-menu--overlay');
    showMenu.style.top = e.pageY + 'px';
    showMenu.appendChild(menu);
    document.body.appendChild(showMenu);
    //Set the left position after the menu is added to the page
    showMenu.style.left = (e.pageX - menu.offsetWidth) + 'px';

    let backdrop = document.createElement('div');
    document.body.appendChild(backdrop);
    backdrop.classList.add('zn-menu_backdrop');


    let close = function () {
      showMenu.remove();
      backdrop.remove();
      document.removeEventListener('keyup', detachEsc);
    }

    let detachEsc = (e) => {
      if (e.key === 'Escape') {
        close();
      }
    }

    if (menu instanceof ZincMenu) {
      menu.closer = close;
    }

    showMenu.classList.add('zn-menu--ready');

    backdrop.onclick = close;
    document.addEventListener("keyup", detachEsc);
  }

  render() {

    let primary = this.querySelectorAll('[slot="primary"]').length > 0 ? html`
      <slot name="primary"></slot>` : null;
    let chip = this.querySelectorAll('[slot="chip"]').length > 0 ? html`
      <slot name="chip"></slot>` : null;

    this.menu = this.querySelectorAll('zn-menu')

    let actions = this.menu.length > 0 ? html`
      <div class="actions">
        <zn-icon @click="${this._handleActions}" library="material-outlined" src="more_vert"></zn-icon>
      </div>` : null;

    const properties = this.querySelectorAll('zn-prop');

    let extended = properties.length > 0 || chip != null ? html`
      <div class="extended">
        ${chip}
        ${properties}
      </div>` : null;

    let summaryClass = extended == null ? 'summary' : 'summary extend';

    let summary = html`
      <div class="caption" data-uri="${this.dataUri}" data-target="${this.dataTarget}">${this.caption}</div>
      <div class="description">${this.description}</div>`;

    return html`
      <div>
        ${primary}
        <div class="${summaryClass}">
          ${summary}
        </div>
        ${extended}
        ${actions}
      </div>
    `
  }
}
