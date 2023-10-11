import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-tabbed-panel')
export class TabbedPanel extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({type: Boolean})
  protected _open = false;
  @property({type: String})
  protected _sectionTitle = "";

  // get all links with nav-uri from the slot
  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    const links = this.querySelectorAll('[nav-uri]');
    links.forEach((link) =>
    {
      link.addEventListener('click', (e) => this._handleClick(e));
    });

    console.log(links);
  }

  _handleClick(e: Event)
  {
    console.log(e.target);
    const target = e.target as HTMLElement;
    const uri = target.getAttribute('nav-uri');
    const title = target.innerText;

    this._sectionTitle = title;
    this._open = true;
  }

  _handleBackButton(e)
  {
    this._open = false;
  }

  render()
  {
    return html`
      <div class="tabbed-panel__nav">
        <slot></slot>
      </div>
      <div class="tabbed-panel__content ${this._open ? 'tabbed-panel__content--open' : ''}">
        <div class="mobile-actions">
          <zn-icon src="arrow_back" library="material" alt="" size="24" style="--icon-size: 24px;"
                   @click="${this._handleBackButton}"></zn-icon>
          <div class="mobile-actions__title">${this._sectionTitle}</div>
        </div>
        <div id="tab-content">
        </div>
      </div>
    `;
  }
}


