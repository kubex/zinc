import {html, LitElement, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';

import styles from './chat-slot-footer.scss';

@customElement('zn-chat-slot-footer')
export class ChatSlotFooter extends LitElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div>
        <p>You can have 2 additional chats open concurrently. Please open more.</p>
      </div>`;
  }
}
