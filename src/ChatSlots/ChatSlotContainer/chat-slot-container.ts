import {html, LitElement, render, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './chat-slot-container.scss';

@customElement('zn-chat-slot-container')
export class ChatSlotContainer extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String})
  private heading = 'default header';

  @property({type: String})
  private subHeading = 'default subheading';

  render()
  {
    const slots = 2;
    const activeSlots = 1;

    if (activeSlots < slots)
    {
      const text = html`
        <my-chat-slot-footer></my-chat-slot-footer>`;
      const element = this.querySelector('div[slot="active"]') as HTMLElement;
      if (element !== null)
      {
        render(text, element);
      }
    }

    return html`
      <div>
        <div class="header">
          <h3>${this.subHeading}</h3>
          <h2>${this.heading}</h2>
          <ul class="nav">
            <li class="active">Active</li>
            <li>Queue (14)</li>
          </ul>
        </div>
        <slot name="active"></slot>
        <slot name="queued"></slot>
      </div>`;
  }
}
