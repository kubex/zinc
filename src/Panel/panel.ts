import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc-element";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-panel')
export class Panel extends ZincElement
{
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'rows', type: Number, reflect: true}) rows;

  static styles = unsafeCSS(styles);

  private selectedPanel: Number = 0;

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    const tabs = this.querySelector('zn-tabs');
    if(tabs)
    {
      tabs.setAttribute('flush-x', '');
      const body = this.shadowRoot.querySelector('.body');
      if(body)
      {
        body.classList.toggle('ntp', true);
      }
    }
  }

  protected render(): unknown
  {
    const footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
    const actionItems = this.querySelectorAll('[slot="actions"]').length > 0;

    if(this.rows > 0)
    {
      this.style.setProperty('--row-count', this.rows);
    }

    let header;
    if(actionItems || this.caption)
    {
      header = html`
        <div class="header">
          <span>${this.caption}</span>
          <slot name="actions"></slot>
        </div>
      `;
    }

    let footer;
    if(footerItems)
    {
      footer = html`
        <div class="footer">
          <slot name="footer"></slot>
        </div>`;
    }

    return html`
      <div>${header}
        <div class="body">
          <slot></slot>
        </div>
           ${footer}
      </div>`;
  }
}


