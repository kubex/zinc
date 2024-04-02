import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-empty-state')
export class EmptyState extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String}) icon: string = '';
  @property({type: String}) caption: string = '';
  @property({type: String}) description: string = '';
  @property({type: String}) type: 'error' | '' = '';

  render()
  {
    return html`
      ${this.icon
        ? html`
          <zn-icon src="${this.icon}" size="48"></zn-icon>`
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
  }
}


