import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './tile.scss';
import ZnMenu from "../menu";
import { classMap } from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/tile
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnTile extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'caption', reflect: true }) caption: string;
  @property({ attribute: 'description', reflect: true }) description: string;
  @property({ attribute: 'sub-caption', reflect: true }) subCaption: string;
  @property({ attribute: 'sub-description', reflect: true }) subDescription: string;


  @property({ attribute: 'right', type: Boolean, reflect: true }) right: boolean;
  @property({ attribute: 'data-uri', reflect: true }) dataUri: string;
  @property({ attribute: 'data-target', reflect: true }) dataTarget: string;
  @property({ type: Boolean }) centered: boolean = false;

  private menu: any;

  constructor() {
    super();

    document.addEventListener('zn-tb-active', (e: any) => {
      if ((e.detail && e.detail.element) && this.hasAttribute('tab') &&
        (e.detail.element.id === this.getAttribute('tab'))) {
        this.classList.add('active');
      } else {
        this.classList.remove('active');
      }
    });
  }

  // add click event to handle the menu
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', () => {
      if (this.classList.contains('notification')) {
        this.classList.remove('notification');
      }
    });

  }

  _handleActions(e: any) {
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
    };

    const detachEsc = (e: any) => {
      if (e.key === 'Escape') {
        close();
      }
    };

    if (menu instanceof ZnMenu) {
      // @ts-ignore
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
    const top = this.querySelectorAll('[slot="top"]').length > 0 ? html`
      <slot name="top"></slot>` : null;

    this.menu = this.querySelectorAll('zn-menu');

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

    let caption = html``;
    if (this.dataUri && this.dataTarget) {
      caption = html`
        <div class="caption" data-uri="${this.dataUri}" data-target="${this.dataTarget}">${this.caption}</div>`;
    } else {
      caption = html`
        <div class="caption">${this.caption}</div>`;
    }

    const summary = html`
      ${caption}
      <div class="description">${this.description}</div>`;

    let subSummary = html``;
    if (this.subCaption || this.subDescription) {
      subSummary = html`
        <div class="sub-summary">
          <div class="caption">${this.subCaption}</div>
          <div class="description">${this.subDescription}</div>
        </div>`;
    }

    const status = this.querySelectorAll('[slot="status"]').length > 0 ? html`
      <slot name="status"></slot>` : null;

    if (!this.description && !this.caption && !primary && !extended && !actions && !status) {
      return html`
        <div class="wrap">
          <slot></slot>
        </div>`;
    }

    return html`
      <div class="${classMap({
        'tile__top': true,
        "tile__top--centered": this.centered
      })}">
        ${top}
      </div>
      <div class="${classMap({
        bottom: true,
        'bottom--with-sub-summary': this.subCaption || this.subDescription,
      })}">
        ${primary}
        <div class="${summaryClass}">
          ${summary}
        </div>
        ${subSummary}
        ${extended}
        ${actions}
        ${status}
      </div>
    `;
  }
}
