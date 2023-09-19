import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-stats-tile')
export class StatsTile extends ZincElement
{
  static styles = unsafeCSS(styles);

  @property({type: String}) caption;
  @property({type: String}) description;
  @property({type: String}) amount;
  @property({type: String}) previous;
  @property({type: String}) currency;

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
    // convert string to money
    const amount = parseFloat(this.amount);
    const currency = this.currency || '£';

    return `${currency}${amount.toFixed(2)}`;
  }

  render()
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

    const diffDisplay = html`<p class="diff "><span class="${diffClass}">${diffIcon}${diff}%</span> on Previous Period
    </p>`;

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


