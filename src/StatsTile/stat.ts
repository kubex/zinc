import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement} from "../zinc-element";

@customElement('zn-stat')
export class Stat extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({type: String}) caption = '';
  @property({type: String}) description = '';
  @property({type: String}) amount = '0';
  @property({type: String}) previous = '0';
  @property({type: String}) currency = '';
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

    return `${currency}${amount.toFixed(2)}`;
  }

  render()
  {
    let diffDisplay = null;
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

      diffDisplay = html`<p class="diff "><span class="${diffClass}">${diffIcon}${diff}%</span> on Previous Period
      </p>`;
    }

    return html`
      <div>
        <h3 class="caption">${this.caption}</h3>
        <p class="description">${this.description}</p>
        <p class="amount">${this.getCurrentAmount()}</p>
        ${diffDisplay}
      </div>
    `;
  }
}


