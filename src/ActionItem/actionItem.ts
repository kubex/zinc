import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-action-item')
export class ActionItem extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String, reflect: true}) content: string = '';

  render()
  {
    return html`
      <div class="content">
        <div class="actions">
          <slot name="actions"></slot>
        </div>
        <p>${this.content}</p>
      </div>`;
  }
}


