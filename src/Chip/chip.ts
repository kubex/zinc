import {html} from "lit";
import {customElement, property} from 'lit/decorators.js';

import {ZincSlotElement} from "@/zinc-slot-element";

@customElement('zn-chip')
export class Chip extends ZincSlotElement
{
  @property({type: String}) icon: string = '';

  render()
  {
    return html`
      ${this.icon ? html`
        <zn-icon library="material-outlined" src="${this.icon}" size="18"></zn-icon>` : ''}
      ${this.renderSlot('')}
      ${this.renderSlot('action')}
    `;
  }
}


