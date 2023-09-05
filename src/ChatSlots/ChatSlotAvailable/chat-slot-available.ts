import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';

import styles from './chat-slot-available.scss';

@customElement('zn-chat-slot-available')
export class ChatSlotAvailable extends LitElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div>
        <div class="available">
          Available Chat Slot
        </div>
      </div>`;
  }
}
