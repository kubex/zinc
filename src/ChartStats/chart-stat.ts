import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement} from "@/zinc-element";
import {classMap} from "lit/directives/class-map.js";

import '../ApexChart';

@customElement('zn-chart-stat')
export class ChartStat extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property() caption = '';
  @property() description = '';
  @property() amount = '0';
  @property() type = 'percent';
  @property({type: Boolean, attribute: 'hide-chart'}) hideChart = false;


  private getDisplayAmount()
  {
    if(this.type === 'percent')
    {
      return `${this.amount}%`;
    }

    if(this.type === 'time')
    {
      const seconds = parseInt(this.amount);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if(hours <= 0)
      {
        return [minutes % 60, seconds % 60].map(v => v.toString().padStart(2, '0')).join(':') + 's';
      }

      return [hours, minutes % 60, seconds % 60].map(v => v.toString().padStart(2, '0')).join(':') + 's';
    }
    return this.amount;
  }

  render()
  {
    return html`
      <div class="${classMap({'stat-tile': true})}">
        <div class="container">
          <div class="left">
            <div>
              <h3 class="caption">${this.caption}</h3>
              <p class="description">${this.description}</p>
            </div>
            <p class="amount">${this.getDisplayAmount()}</p>
            <p class="bottom"></p>
          </div>
            ${!this.hideChart ? html`
              <div class="right">
                <zn-apex-chart type="radialBar" amount="${this.amount}"></zn-apex-chart>
              </div>
            ` : ''}
        </div>
      </div>
    `;
  }
}


