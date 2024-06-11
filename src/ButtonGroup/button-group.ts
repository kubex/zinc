import { html, unsafeCSS } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import { ZincElement } from "@/zinc-element";

import styles from './index.scss?inline';

@customElement('zn-button-group')
export class ButtonGroup extends ZincElement
{
  @property({ type: String }) direction: 'horizontal' | 'vertical' = 'horizontal';
  @property() m;

  static styles = unsafeCSS(styles);

  @query('slot') defaultSlot: HTMLSlotElement;

  private handleSlotChange()
  {
    if(this.direction === 'vertical')
    {
      return;
    }

    let slottedElements = [...this.defaultSlot.assignedElements({ flatten: true })] as HTMLElement[];

    slottedElements = slottedElements.filter(el => el.tagName === 'ZN-BUTTON');
    slottedElements.forEach(el =>
    {
      const index = slottedElements.indexOf(el);
      const button = el.closest('zn-button') ?? el.querySelector('zn-button');

      if(button)
      {
        button.toggleAttribute('data-zn-button-group__button', true);
        button.toggleAttribute('data-zn-button-group__button--first', index === 0);
        button.toggleAttribute('data-zn-button-group__button--inner', index > 0 && index < slottedElements.length - 1);
        button.toggleAttribute('data-zn-button-group__button--last', index === slottedElements.length - 1);
      }
    });
  }

  render()
  {
    return html`
      <div part="base"
           class="button-group"
           role="group">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>`;
  }
}
