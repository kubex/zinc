import { property, query, state } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { watch } from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import { classMap } from "lit/directives/class-map.js";
import ZnSelect from "../select";

import styles from './option.scss?inline';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/option
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
export default class ZnOption extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @query('.option__label') defaultSlot: HTMLSlotElement;

  @state() current = false; // the user has keyed into the option, but hasn't selected it yet (shows a highlight)
  @state() selected = false; // the option is selected and has aria-selected="true"
  @state() hasHover = false; // we need this because Safari doesn't honor :hover styles while dragging

  /**
   * The option's value. When selected, the containing form control will receive this value. The value must be unique
   * from other options in the same group. Values may not contain spaces, as spaces are used as delimiters when listing
   * multiple values.
   */
  @property({ reflect: true }) value = '';

  /** Draws the option in a disabled state, preventing selection. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'option');
    this.setAttribute('aria-selected', 'false');
  }

  private handleDefaultSlotChange() {
    // When the label changes, tell the controller to update
    customElements.whenDefined('zn-select').then(() => {
      const controller = this.closest('zn-select') as ZnSelect | null;
      if (controller) {
        controller.handleDefaultSlotChange();
      }
    });
  }

  private handleMouseEnter() {
    this.hasHover = true;
  }

  private handleMouseLeave() {
    this.hasHover = false;
  }

  @watch('disabled')
  handleDisabledChange() {
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  @watch('selected')
  handleSelectedChange() {
    this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
  }

  @watch('value')
  handleValueChange() {
    // Ensure the value is a string. This ensures the next line doesn't error and allows framework users to pass numbers
    // instead of requiring them to cast the value to a string.
    if (typeof this.value !== 'string') {
      this.value = String(this.value);
    }

    if (this.value.includes(' ')) {
      console.error(`Option values cannot include a space. All spaces have been replaced with underscores.`, this);
      this.value = this.value.replace(/ /g, '_');
    }
  }

  /** Returns a plain text label based on the option's content. */
  getTextLabel() {
    const nodes = this.childNodes;
    let label = '';

    [...nodes].forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!(node as HTMLElement).hasAttribute('slot')) {
          label += (node as HTMLElement).textContent;
        }
      }

      if (node.nodeType === Node.TEXT_NODE) {
        label += node.textContent;
      }
    });

    return label.trim();
  }

  render() {
    return html`
      <div
        part="base"
        class=${classMap({
          option: true,
          'option--current': this.current,
          'option--disabled': this.disabled,
          'option--selected': this.selected,
          'option--hover': this.hasHover
        })}
        @mouseenter=${this.handleMouseEnter}
        @mouseleave=${this.handleMouseLeave}
      >
        <zn-icon part="checked-icon" class="option__check" src="check"></zn-icon>
        <slot part="prefix" name="prefix" class="option__prefix"></slot>
        <slot part="label" class="option__label" @slotchange=${this.handleDefaultSlotChange}></slot>
        <slot part="suffix" name="suffix" class="option__suffix"></slot>
      </div>
    `;
  }
}
