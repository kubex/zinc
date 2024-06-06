import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement} from "../zinc-element";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-panel')
export class Panel extends ZincElement
{
  @property({attribute: 'basis-px', type: Number, reflect: true}) basis;
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'rows', type: Number, reflect: true}) rows;
  @property({attribute: 'tabbed', type: Boolean, reflect: true}) tabbed;

  static styles = unsafeCSS(styles);

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    if(!this.tabbed)
    {
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
  }

  protected render(): unknown
  {
    if(this.basis > 0)
    {
      this.style.flexBasis = this.basis + 'px';
    }

    const footerItems = this.querySelectorAll('[slot="footer"]').length > 0;
    const actionItems = this.querySelectorAll('[slot="actions"]').length > 0;

    if(this.rows > 0)
    {
      this.style.setProperty('--row-count', this.rows);
    }

    let header;
    if(actionItems || this.caption || this.firstChild?.nodeName == 'ZN-TABS')
    {
      // zn-tabs uses the header as top-padding
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


