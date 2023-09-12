import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './chat-slot.scss';

@customElement('zn-chat-slot')
export class ChatSlot extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String})
  private heading = 'default header';

  @property({type: String})
  private content = 'default content';

  @property({type: String})
  private brand = '';

  @property({type: String})
  private lastMessage = '';

  render()
  {
    let brand = html``;
    if(this.brand)
    {
      brand = html`(@${this.brand})`;
    }

    let lastMessage = this.lastMessage ? this._getLastMessage() : null;

    return html`
      <div>
        ${lastMessage}
        <h2>${this.heading} ${brand}</h2>
        <p>${this.content}</p>
      </div>`;
  }

  private _getLastMessage()
  {
    const time = new Date(parseInt(this.lastMessage) * 1000);
    const diff = (new Date()).getTime() - time.getTime();

    let hours = Math.floor(diff / 1000 / 60 / 60);
    let minutes = Math.floor(diff / 1000 / 60) - (hours * 60);
    let seconds = Math.floor(diff / 1000) - (minutes * 60) - (hours * 60 * 60);

    let displayMinutes: number | string = minutes;
    let displaySeconds: number | string = seconds;
    let displayHours: number | string = hours;
    if(minutes < 10)
    {
      displayMinutes = `0${minutes}`;
    }

    if(seconds < 10)
    {
      displaySeconds = `0${seconds}`;
    }

    if(hours < 10)
    {
      displayHours = `0${hours}`;
    }

    let timeString = '';
    if(hours > 0)
    {
      timeString = `${displayHours}:${displayMinutes}:${displaySeconds}`;
    }
    else
    {
      timeString = `${displayMinutes}:${displaySeconds}`;
    }

    // increment every second
    setTimeout(() =>
    {
      this.requestUpdate();
    }, 1000);

    return html`
      <div class="last-message">
        <span class="time">${timeString}</span>
        <span class="last-message-indicator"></span>
      </div>`;
  }
}
