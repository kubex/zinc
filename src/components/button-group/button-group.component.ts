import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './button-group.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/button-group
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnButtonGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({}) direction: 'horizontal' | 'vertical' = 'horizontal';
  @property({type: Boolean}) grow = false;
  @property({type: Boolean}) wrap = false;
  @property({type: Boolean}) start = false;

  @query('slot') defaultSlot: HTMLSlotElement;

  private handleSlotChange() {
    if (this.direction === 'vertical') {
      return;
    }

    let slottedElements = [...this.defaultSlot.assignedElements({flatten: true})] as HTMLElement[];

    slottedElements = slottedElements.filter(el => el.tagName === 'ZN-BUTTON');
    slottedElements.forEach(el => {
      const index = slottedElements.indexOf(el);
      const button = el.closest('zn-button') ?? el.querySelector('zn-button');

      if (button) {
        button.toggleAttribute('data-zn-button-group__button', true);
        button.toggleAttribute('data-zn-button-group__button--first', index === 0);
        button.toggleAttribute('data-zn-button-group__button--grow', this.grow);
        button.toggleAttribute('data-zn-button-group__button--inner', index > 0 && index < slottedElements.length - 1);
        button.toggleAttribute('data-zn-button-group__button--last', index === slottedElements.length - 1);
      }
    });
  }

  render() {
    return html`
      <div part="base"
           class="${classMap({
             'button-group': true,
             'button-group--grow': this.grow,
             'button-group--wrap': this.wrap,
             'button-group--start': this.start,
           })}"
           role="group">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>`;
  }
}
