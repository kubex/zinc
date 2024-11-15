import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "@/zinc-element";
import {classMap} from "lit/directives/class-map.js";

import styles from './index.scss?inline';

export type AlertLevel = '' | 'primary' | 'error' | 'info' | 'success' | 'warning';

@customElement('zn-alert')
export class Alert extends ZincElement
{

  static styles = unsafeCSS(styles);
  @property({type: String}) icon: string = '';
  @property({type: String}) caption: string = '';
  @property({type: Boolean}) collapse: boolean = false;
  @property({type: String}) level: AlertLevel = '';
  @property({type: String}) size: 'small' | 'medium' | 'large' = 'medium';

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
      <div class=${classMap({
        wrapper: true,
        "alert--small": this.size === 'small',
        "alert--medium": this.size === 'medium',
        "alert--large": this.size === 'large',
      })}>
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


