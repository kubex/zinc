import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { Menu } from "../Menu";

import styles from './index.scss?inline';
import { classMap } from "lit/directives/class-map.js";

@customElement('zn-tile')
export class Tile extends LitElement
{
  @property({ attribute: 'caption', type: String, reflect: true }) caption;
  @property({ attribute: 'description', type: String, reflect: true }) description;
  @property({ attribute: 'sub-caption', type: String, reflect: true }) subCaption;
  @property({ attribute: 'sub-description', type: String, reflect: true }) subDescription;


  @property({ attribute: 'right', type: Boolean, reflect: true }) right;
  @property({ attribute: 'data-uri', type: String, reflect: true }) dataUri;
  @property({ attribute: 'data-target', type: String, reflect: true }) dataTarget;
  @property({ type: String }) centered = 'false';

  private menu;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();

    document.addEventListener('zn-tb-active', (e: any) =>
    {
      if((e.detail && e.detail.element) && this.hasAttribute('tab') &&
        (e.detail.element.id === this.getAttribute('tab')))
      {
        this.classList.add('active');
      }
      else
      {
        this.classList.remove('active');
      }
    });
  }

  // add click event to handle the menu
  connectedCallback()
  {
    super.connectedCallback();
    this.addEventListener('click', () =>
    {
      if(this.classList.contains('notification'))
      {
        this.classList.remove('notification');
      }
    });

  }

  _handleActions(e)
  {
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


    const close = function ()
    {
      showMenu.remove();
      backdrop.remove();
      document.removeEventListener('keyup', detachEsc);
    };

    const detachEsc = (e) =>
    {
      if(e.key === 'Escape')
      {
        close();
      }
    };

    if(menu instanceof Menu)
    {
      menu.closer = close;
    }

    showMenu.classList.add('zn-menu--ready');

    backdrop.onclick = close;
    document.addEventListener("keyup", detachEsc);
  }

  render()
  {

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
    if(this.dataUri && this.dataTarget)
    {
      caption = html`
        <div class="caption" data-uri="${this.dataUri}" data-target="${this.dataTarget}">${this.caption}</div>`;
    }
    else
    {
      caption = html`
        <div class="caption">${this.caption}</div>`;
    }

    const summary = html`
      ${caption}
      <div class="description">${this.description}</div>`;

    let subSummary = html``;
    if(this.subCaption || this.subDescription)
    {
      subSummary = html`
        <div class="sub-summary">
          <div class="caption">${this.subCaption}</div>
          <div class="description">${this.subDescription}</div>
        </div>`;
    }

    const status = this.querySelectorAll('[slot="status"]').length > 0 ? html`
      <slot name="status"></slot>` : null;

    if(!this.description && !this.caption && !primary && !extended && !actions && !status)
    {
      return html`
        <div class="wrap">
          <slot></slot>
        </div>`;
    }

    return html`
      <div class="top">
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


