import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';

import styles from './chat-response-window.scss';

@customElement('zn-chat-response-window')
export class ChatResponseWindow extends LitElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div>
        <ul class="navigation">
          <li class="active">Reply</li>
          <li>Prompts</li>
        </ul>
        <div class="response">
          <div class="message-container">
            <slot></slot>
          </div>
          <div class="response-helper">
            Hit Enter ↵ to send
          </div>
        </div>
      </div>`;
  }
}
