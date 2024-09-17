import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';

@customElement('zn-cols')
export class Columns extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String, reflect: true, attribute: "layout"}) layout: string = '';
  @property({attribute: 'mc', type: Number, reflect: true}) maxColumns: number = 0;


  render()
  {
    const layout: number[] = this.layout.split(/[\s,]+/).map((a) => parseInt(a)).filter((item) => !!item);
    if(layout.length === 0)
    {
      layout.push(1, 1, 1, 1);
    }
    this.layout = layout.join('');
    this.maxColumns = Math.min(5, layout.reduce((a, b) => a + b, 0));

    const prefix = 'zn-col-';
    this.querySelectorAll(':scope > *').forEach((element: HTMLElement, index) =>
    {
      const classes = element.className.split(' ').filter((c) => !c.startsWith(prefix));
      element.className = classes.join(' ');

      const col = index % layout.length;
      element.classList.add(prefix + layout[col]);
    });

    return html`
      <slot></slot>
    `;
  }
}
