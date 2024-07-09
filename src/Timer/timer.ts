import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss?inline';

@customElement('zn-timer')
export class Timer extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ type: Number })
  private timestamp = '';

  @property({ type: String })
  private type = '';

  @property({ type: Number })
  private upperLimit = 0;

  private _getLastMessage()
  {
    const time = new Date(parseInt(this.timestamp) * 1000);
    const diff = (new Date()).getTime() - time.getTime();
    const times = this._getTimes(diff);


    setTimeout(() =>
    {
      this.requestUpdate();
    }, 1000);

    return html`
      <div class="last-message upper-limit-reached">
        <span class="time">${times}</span>
        <span class="last-message-indicator" part="indicator"></span>
      </div>`;
  }

  render()
  {
    return html`
      ${this._getLastMessage()}
    `;
  }

  private _getTimes(diff: number): string
  {
    const months = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
    const weeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const seconds = Math.floor(diff / 1000) % 60;

    if(months > 0)
    {
      return `${months} Month` + (months > 1 ? 's' : '');
    }

    if(weeks > 0)
    {
      return `${weeks} Week` + (weeks > 1 ? 's' : '');
    }

    if(days > 0)
    {
      return `${days} Day` + (days > 1 ? 's' : '');
    }

    if(hours > 0)
    {
      if(minutes > 0)
      {
        return `${hours}hr ${minutes}m`;
      }

      return `${hours} Hour` + (hours > 1 ? 's' : '');
    }

    if(minutes > 0)
    {
      if(seconds > 0)
      {
        return `${minutes}m ${seconds}s`;
      }

      return `${minutes} Minute` + (minutes > 1 ? 's' : '');
    }

    return `${seconds} Second` + (seconds > 1 ? 's' : '');
  }
}


