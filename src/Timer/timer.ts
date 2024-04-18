import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

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


    const months = Math.floor(diff / 1000 / 60 / 60 / 24 / 30);
    const weeks = Math.floor(diff / 1000 / 60 / 60 / 24 / 7);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    const hours = Math.floor(diff / 1000 / 60 / 60) % 24;
    const minutes = Math.floor(diff / 1000 / 60) % 60;
    const seconds = Math.floor(diff / 1000) % 60;


    // limit timer to always HH:MM or MM:SS or DD:HH
    let displayMonths = months < 10 && months >= 0 ? `0${months}` : months;
    let displayWeeks = weeks < 10 && weeks >= 0 ? `0${weeks}` : weeks;
    let displayDays = days < 10 && days >= 0 ? `0${days}` : days;
    let displayMinutes = minutes < 10 && minutes >= 0 ? `0${minutes}` : minutes;
    let displaySeconds = seconds < 10 && seconds >= 0 ? `0${seconds}` : seconds;
    let displayHours = hours < 10 && hours >= 0 ? `0${hours}` : hours;

    displayMonths = months > 0 ? `${displayMonths}M` : 0;
    displayWeeks = weeks > 0 ? `${displayWeeks}w` : 0;
    displayDays = days > 0 ? `${displayDays}d` : 0;
    displayHours = hours > 0 ? `${displayHours}` : 0;
    displayMinutes = minutes > 0 ? `${displayMinutes}` : 0;
    displaySeconds = seconds > 0 ? `${displaySeconds}` : 0;

    const array = [displayMonths, displayWeeks, displayDays, displayHours, displayMinutes, displaySeconds];

    let count = 0;
    let prev = false;
    const times = [];
    array.forEach((item, _) =>
    {
      if(((item === 0 || item === '00') && !prev) || count === 2)
      {
        return;
      }

      times.push(item);
      prev = true;
      count++;
    });


    // increment every second
    setTimeout(() =>
    {
      this.requestUpdate();
    }, 1000);


    return html`
      <div class="last-message upper-limit-reached">
        <span class="time">${times.join(':')}</span>
        <span class="last-message-indicator"></span>
      </div>`;
  }

  render()
  {
    return html`
      ${this._getLastMessage()}
    `;
  }
}


