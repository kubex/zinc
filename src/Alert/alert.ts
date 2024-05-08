import { html, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { ZincElement } from "../zinc-element";

export type AlertLevel = '' | 'primary' | 'error' | 'info' | 'success' | 'warning';

@customElement('zn-alert')
export class Alert extends ZincElement
{

  static styles = unsafeCSS(styles);
  @property({ type: String }) icon: string = '';
  @property({ type: String }) caption: string = '';
  @property({ type: Boolean }) collapse: boolean = false;
  @property({ type: String }) level: AlertLevel = '';

  render()
  {
    let icon;

    if(this.icon)
    {
      if(this.collapse)
      {
        icon = this.icon ? html`
          <zn-icon src="${this.icon}" id="xy2" @click="${this.hideAlert}"
                   style="cursor: pointer"></zn-icon>` : "";
      }
      else
      {
        icon = this.icon ? html`
          <zn-icon src="${this.icon}" id="xy2"></zn-icon>` : '';
      }
    }

    const caption = this.caption ? html`<h6>${this.caption}</h6>` : '';

    return html`
      <div class="wrapper">
        ${icon}
        <div class="content">
          ${caption}
          <slot></slot>
        </div>
        <div class="actions">
          <slot name="actions"></slot>
        </div>
      </div>`;
  }

  public hideAlert()
  {
    this.style.display = "none";
  }
}


