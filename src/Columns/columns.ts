import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {parseInt} from "lodash";

@customElement('zn-cols')
export class Columns extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String}) layout: string = '';

  render()
  {
    const layout: number[] = this.layout.split(' ').map((a) => parseInt(a)).filter((item) => !!item);
    if(layout.length === 0)
    {
      layout.push(1, 1, 1, 1);
    }
    const layoutSum = layout.reduce((a, b) => a + b, 0) + 1;

    this.querySelectorAll(':scope > *')
      .forEach((element: HTMLElement, index) =>
      {
        const col = index % layout.length;
        const fr = layout[col] / layoutSum;
        element.style.flexBasis = Math.floor(fr * 100) + '%';
      });

    return html`
      <slot></slot>
    `;
  }
}
