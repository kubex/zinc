import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './chat-message-window.scss';

@customElement('zn-chat-message-window')
export class ChatMessageWindow extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: Boolean, attribute: 'push-to-top' })
  private pushToTop = true;

  render()
  {
    return html`
      <div>
        <slot></slot>
      </div>`;
  }
}
