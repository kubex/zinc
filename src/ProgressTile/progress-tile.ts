import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';


@customElement('zn-progress-tile')
export class ProgressTile extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({attribute: 'start', reflect: true, type: Number}) start: number;
  @property({attribute: 'max-time', reflect: true, type: Number}) maxTime: number;
  @property({attribute: 'status-icon'}) statusIcon: string;
  @property() caption: string;
  @property() avatar: string;

  private _now = new Date().getTime() / 1000;
  private _timer: NodeJS.Timeout;

  connectedCallback()
  {
    super.connectedCallback();
    if(!this.maxTime || this.maxTime < this._now)
    {
      this.maxTime = this._now + (60 * 30);
    }

    // request an update every second
    if(!this._timer)
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
    console.log(this._now, this.start, this.maxTime);
    const diff = this._now - this.start;
    const total = this.maxTime - this.start;
    return `${(diff / total) * 100}%`;
  }

  private getColor()
  {
    const diff = this._now - this.start;
    const total = this.maxTime - this.start;
    const percent = (diff / total) * 100;

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

  private _humanTime()
  {
    const diff = this._now - this.start;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    if(hours <= 0)
    {
      return [minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
    }

    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
  }

  render()
  {
    return html`
      <div class="tile" style="--color: ${this.getColor()}">
        <div class="tile__avatar">
          <zn-icon size="40" src="${this.avatar}"></zn-icon>
        </div>
        <div class="tile__wrapper">
          <div class="tile__content">
            <div class="tile__caption">${this.caption}</div>
            <div class="tile__spacer"></div>
            <div class="tile__time">${this._humanTime()}</div>
            ${this.statusIcon ? html`
              <zn-icon class="tile__status-icon" src="${this.statusIcon}"></zn-icon>` : ''}
          </div>
          <div class="tile__progress-container">
            <div class="tile__progress-bar"></div>
            <div class="tile__progress" style="width: ${this._getProgressBarValue()}"></div>
          </div>
        </div>
      </div>`;
  }
}


