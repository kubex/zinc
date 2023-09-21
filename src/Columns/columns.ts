import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-cols')
export class Columns extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({type: String}) layout: string = "";

  render()
  {
    const elements = this.querySelectorAll(':scope > *');
    const count = elements.length;

    if(this.layout.length < 1)
    {
      switch(count)
      {
        case 1:
          this.layout = "4";
          break;
        case 2:
          this.layout = "2,2";
          break;
        case 3:
          this.layout = "1,1,2";
          break;
        case 4:
        default:
          this.layout = "1,1,1,1";
          break;
      }
    }

    const layout = this.layout.split(',');
    elements.forEach((element, index) =>
    {
      if(index >= layout.length)
      {
        element.setAttribute('col', '4');
        return;
      }
      element.setAttribute('col', `${layout[index]}`);
    });

    this.classList.add('grid');

    return html`
      <slot></slot>
    `;
  }
}
