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
    const links = this.querySelectorAll('a[data-target]');
    links.forEach((link) =>
    {
      link.addEventListener('click', (e) => this._handleClick(e));
      link.classList.add('cursor-pointer');
    });
  }

  _handleClick(e: Event)
  {
    const target = e.target as HTMLElement;
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
      <div class="tn">
        <slot name="nav"></slot>
      </div>
      <div class="tc ${this._open ? 'tco' : ''}">
        <div class="m">
          <zn-icon src="arrow_back" library="material" alt="" size="24" style="--icon-size: 24px;"
                   @click="${this._handleBackButton}"></zn-icon>
          <div class="mt"><h3>${this._sectionTitle}</h3></div>
        </div>
        <div id="tab-content">
          <slot></slot>
        </div>
      </div>
    `;
  }
}


