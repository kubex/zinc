import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {classMap} from "lit/directives/class-map.js";

import styles from './index.scss?inline';
import {ZincElement} from "@/zinc-element";

import '@/Charts/ApexChart';

@customElement('zn-stat')
export class Stat extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property() caption = '';
  @property() description = '';
  @property() amount = '0';
  @property() type = 'number';
  @property() previous = '0';
  @property() currency = '';
  @property({type: Boolean, attribute: 'show-chart'}) showChart = false;
  @property({type: Boolean, attribute: 'show-delta'}) showDelta = false;

  calcPercentageDifference()
  {
    const previous = parseFloat(this.previous);
    const amount = parseFloat(this.amount);

    let diff = ((amount - previous) / previous) * 100;
    diff = Math.round(diff * 10) / 10;

    return diff;
  }

  getCurrentAmount()
  {
    if(this.currency == "")
    {
      return this.amount;
    }
    // convert string to money
    const amount = parseFloat(this.amount);
    const currency = this.currency;

    const formattedAmount = amount.toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `${currency}${formattedAmount}`;
  }

  private getDisplayAmount()
  {
    if(this.currency !== '')
    {
      return this.getCurrentAmount();
    }
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

  diffText()
  {
    if(this.showDelta)
    {
      const diff = this.calcPercentageDifference();
      let diffClass = 'neutral';
      let diffIcon = '~';
      if(diff > 0)
      {
        diffClass = 'positive';
        diffIcon = '+';
      }

      if(diff < 0)
      {
        diffClass = 'negative';
        diffIcon = '-';
      }

      return html`<p class="diff"><span class="${diffClass}">${diffIcon}${diff}%</span> on Previous Period</p>`;
    }

    return null;
  }

  render()
  {
    return html`
      <div class="${classMap({'stat-tile': true, 'stat-tile--chart': this.showChart})}">
        <div class="container">
          <div class="left">
            <div>
              <h3 class="caption">${this.caption}</h3>
              <p class="description">${this.description}</p>
            </div>
            <p class="amount">${this.getDisplayAmount()}</p>
            <p class="bottom">${this.diffText()}</p>
          </div>
          ${this.showChart ? html`
            <div class="right">
              <zn-apex-chart type="radialBar" amount="${this.amount}"></zn-apex-chart>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}


