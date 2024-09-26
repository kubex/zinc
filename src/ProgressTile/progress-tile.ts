import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {classMap} from "lit/directives/class-map.js";


@customElement('zn-progress-tile')
export class ProgressTile extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: Number, attribute: 'start-time'}) startTime: number;
  @property({type: Number, attribute: 'wait-time', reflect: true}) waitTime: number;
  @property({type: Number, attribute: 'max-time'}) maxTime: number;
  @property({type: Number, attribute: 'end-time'}) endTime: number;

  @property({type: Number, attribute: 'max-wait-time'}) maxWaitTime: number = 60 * 5;
  @property({type: Boolean, attribute: 'waiting-agent-response'}) waitingAgentResponse: boolean;

  @property() status: string;
  @property() avatar: string;
  @property() caption: string;

  private _timerInterval: NodeJS.Timeout;

  connectedCallback()
  {
    super.connectedCallback();
    if(this.status !== 'Ended')
    {
      this._timerInterval = setInterval(() => this.requestUpdate(), 1000);
    }
  }

  disconnectedCallback()
  {
    super.disconnectedCallback();
    clearInterval(this._timerInterval);
  }

  private getHumanReadableTime(time: number): string
  {
    time = Math.round(time);
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    if(hours)
    {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  protected render(): unknown
  {
    const now = new Date().getTime() / 1000;
    const duration = now - this.startTime;
    const maxDuration = now - this.maxTime;

    if(this.waitingAgentResponse)
    {
      this.waitTime += 1;
    }

    let firstBarWidth = (duration / maxDuration) * 100;
    firstBarWidth = firstBarWidth > 100 ? 100 : firstBarWidth;

    let secondBarWidth = (this.waitTime / this.maxWaitTime) * 100;
    secondBarWidth = secondBarWidth > 100 ? 100 : secondBarWidth;

    const start = this.getHumanReadableTime(duration);
    const wait = this.getHumanReadableTime(this.waitTime);

    const status = this.waitingAgentResponse ? 'Waiting for Agent' : this.status;
    const hasHours = start.match(/:/g).length === 2 || wait.match(/:/g).length === 2;

    return html`
      <div class="${classMap({
        'progress-tile': true,
        'progress-tile--with-hours': hasHours,
        'progress-tile--ended': this.status === 'Ended',
        'progress-tile--waiting-agent': this.waitingAgentResponse,
        'progress-tile--interacting': this.status === 'Interacting',
        'progress-tile--warn': this.waitTime > 60 && this.waitTime < (this.maxWaitTime / 2),
        'progress-tile--danger': this.waitTime >= this.maxWaitTime
      })}">
        <zn-icon size="45" src="${this.avatar}"></zn-icon>
        <div class="progress-tile__content">

          <div class="progress-tile__header">
            <div class="header__caption">
              <p>${this.caption}</p>
            </div>
            <div class="header__wait-time">
              <p>${status}</p>
              <p>${this.endTime || wait === '00:00' ? '' : wait}</p>
            </div>
          </div>

          <div class="progress-tile__progress-bars">
            <div class="progress-tile__progress-bars__first"
                 style="width: ${firstBarWidth}%;"></div>
            <div class="progress-tile__progress-bars__second"
                 style="width: ${secondBarWidth}%;"></div>
          </div>

        </div>

        <div class="progress-tile__total-time">
          ${this.endTime ? this.getHumanReadableTime(this.endTime - this.startTime) : start}
        </div>
      </div>
    `;
  }
}


