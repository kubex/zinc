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
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --grow - Use flex-grow to fill available space.
 * @cssproperty --start - Justify content at the start of the flex space.
 */
export default class ZnButtonGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({}) direction: 'horizontal' | 'vertical' = 'horizontal';
  @property({type: Boolean}) grow = false;
  @property({type: Boolean}) wrap = false;
  @property({type: Boolean}) start = false;
  @property({type: Boolean}) gap = false;

  @query('slot') defaultSlot: HTMLSlotElement;

  private handleSlotChange() {
    if (this.direction === 'vertical') {
      return;
    }

    const allSlotted = [...this.defaultSlot.assignedElements({flatten: true})] as HTMLElement[];

    // Collect buttons from direct zn-button elements and from zn-dropdown wrappers
    const groupItems: {button: HTMLElement; wrapper?: HTMLElement}[] = [];
    for (const el of allSlotted) {
      if (el.tagName === 'ZN-BUTTON') {
        groupItems.push({button: el});
      } else if (el.tagName === 'ZN-DROPDOWN') {
        const innerButton = el.querySelector('zn-button');
        if (innerButton) {
          groupItems.push({button: innerButton, wrapper: el});
        }
      }
    }

    groupItems.forEach(({button, wrapper}, index) => {
      button.toggleAttribute('data-zn-button-group__button--grow', this.grow);

      if (!this.gap) {
        button.toggleAttribute('data-zn-button-group__button', true);
        button.toggleAttribute('data-zn-button-group__button--first', index === 0);
        button.toggleAttribute('data-zn-button-group__button--inner', index > 0 && index < groupItems.length - 1);
        button.toggleAttribute('data-zn-button-group__button--last', index === groupItems.length - 1);
      }

      // Mark the dropdown wrapper so it can be styled to not break the group layout
      if (wrapper) {
        wrapper.toggleAttribute('data-zn-button-group__dropdown', true);
      }
    });
  }

  render() {
    return html`
      <div part="base"
           class="${classMap({
             'button-group': true,
             'button-group--grow': this.grow,
             'button-group--start': this.start,
             'button-group--gap': this.gap,
           })}"
           role="group">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>`;
  }
}
