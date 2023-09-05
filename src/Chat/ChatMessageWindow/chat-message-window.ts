import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';

import styles from './chat-message-window.scss';

@customElement('zn-chat-message-window')
export class ChatMessageWindow extends LitElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div>
        <slot></slot>
      </div>`;
  }
}
