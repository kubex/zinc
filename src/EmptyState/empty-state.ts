import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { classMap } from "lit/directives/class-map.js";

@customElement('zn-empty-state')
export class EmptyState extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: String }) icon: string = '';
  @property({ type: String }) caption: string = '';
  @property({ type: String }) description: string = '';
  @property({ type: String }) type: 'error' | 'info' | 'primary' | '' = '';

  render()
  {
    const content = html`
      ${this.icon
        ? html`
          <zn-icon src="${this.icon}" size="48" color="${this.type ? this.type : 'primary'}"></zn-icon>`
        : ''}
      ${this.caption
        ? html`
          <div class="caption">${this.caption}</div>`
        : ''}
      ${this.description
        ? html`
          <div class="description">${this.description}</div>`
        : ''}
      <slot></slot>`;

    if(this.type)
    {
      return html`
        <div class="${classMap({
          'wrapper': true,
          [this.type]: true
        })}">
          ${content}
        </div>`;
    }

    return content;
  }
}


