import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';


@customElement('zn-progress-tile')
export class ProgressTile extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: Number}) start: number;
  @property({type: Number}) end: number;
  @property({attribute: 'hold-time', reflect: true, type: Number}) holdTime: number;
  @property({attribute: 'status-icon'}) statusIcon: string;
  @property() caption: string;
  @property() avatar: string;
  @property() status: string;

  private _now = new Date().getTime() / 1000;
  private _timer: NodeJS.Timeout;


  isEnded()
  {
    return this.status === 'ended' || this.status === 'dropped';
  }

  connectedCallback()
  {
    super.connectedCallback();
    // request an update every second
    if(!this._timer && !this.isEnded())
    {
      this._timer = setInterval(() =>
      {
        this._now = new Date().getTime() / 1000;
        this.requestUpdate();
      }, 1000);
    }
  }

  private _getProgressBarValue()
  {
    // hold time as a percentage of the total time
    const holdTime = this.holdTime;
    const total = new Date().getTime() / 1000 - this.start;
    const percent = (holdTime / total) * 100;

    if(percent > 100)
    {
      return 100;
    }

    return percent;
  }

  private getColor()
  {
    const percent = this._getProgressBarValue();

    if(this.isEnded())
    {
      return 'var(--zn-border-color)';
    }

    if(percent < 33)
    {
      return 'var(--zn-color-success)';
    }

    if(percent < 66)
    {
      return 'var(--zn-color-warning)';
    }

    return 'var(--zn-color-error)';
  }

  private _humanTime(diff: number)
  {
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    if(hours <= 0)
    {
      return [minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
    }

    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
  }

  private _humanEndTime()
  {
    // convert unix timestamp to human readable time
    const date = new Date(this.end * 1000);
    return date.toLocaleTimeString();
  }

  render()
  {
    return html`
      <div class="tile" style="--color: ${this.getColor()}">
        <div class="tile__avatar">
          <zn-icon size="40" src="${this.avatar}"></zn-icon>
        </div>
        <div class="tile__wrapper">
          <div class="tile__wrapper__left">
            <div class="tile__content">
              <div class="tile__caption">${this.caption}</div>
              <div class="tile__spacer"></div>
              <div class="tile__time">${this.getTime()}</div>
              ${this.statusIcon ? html`
                <zn-icon class="tile__status-icon" src="${this.statusIcon}"></zn-icon>` : ''}
            </div>
            <div class="tile__progress-container">
              <div class="tile__progress-bar"></div>
              <div class="tile__progress" style="width: ${this._getProgressBarValue() + '%'}"></div>
            </div>
            <div class="tile__status">
              ${this.isEnded() ? '' : this.status}
            </div>
          </div>
          <div class="tile__wrapper__right">
            ${this.isEnded() ? this._humanTime(this.end) : this._humanTime(this._now - this.start)}
          </div>
        </div>
      </div>`;
  }

  private getTime()
  {
    if(this.status === 'ended')
    {
      return 'Ended at ' + this._humanEndTime();
    }

    if(this.status == 'dropped')
    {
      return 'Dropped';
    }

    return html`${this._humanTime(this.holdTime)}`;
  }
}


