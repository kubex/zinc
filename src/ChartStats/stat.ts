import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement} from "@/zinc-element";
import {classMap} from "lit/directives/class-map.js";

@customElement('zn-chart-stat')
export class ChartStat extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property() caption = '';
  @property() description = '';
  @property() amount = '0';
  @property() type = 'percent';
  @property() chart = 'true';


  private getDisplayAmount()
  {
    if(this.type === 'percent')
    {
      return `${this.amount}%`;
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
          <div class="right">
            ${this.chart !== 'false' ? html`
              <zn-apex-chart type="radialBar" amount="${this.amount}"></zn-apex-chart>` : ''}
          </div>
        </div>
      </div>
    `;
  }
}


