import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-chat-message')
export class ChatMessage extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: String })
  private sender = '';

  @property({ type: String })
  private time = '';

  @property({ type: String })
  private type = '';

  render()
  {
    return html`
      <div class="wrapper ${this.sender ? 'message-' + this.sender : ''}">
        <div class="message">
          <slot></slot>
        </div>
        <div class="time">
          ${this.sender} ${this.time ? this._getSentTime() : null}
        </div>
      </div>`;
  }

  private _getSentTime()
  {
    const time = new Date(parseInt(this.time) * 1000);

    // if not today, show date and time without seconds
    if(time.getDate() !== (new Date()).getDate())
    {
      return `@ ${time.toLocaleDateString()} ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    else
    {
      return `@ ${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }

  }
}
