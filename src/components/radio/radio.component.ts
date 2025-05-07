import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, state} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';

import styles from './radio.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/radio
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
export default class ZnRadio extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() checked = false;
  @state() protected hasFocus = false;

  /** The radio's value. When selected, the radio group will receive this value. */
  @property() value: string;

  /** Disables the radio. */
  @property({type: Boolean, reflect: true}) disabled = false;

  @property() label: string;
  @property() size: string;

  constructor() {
    super();
    this.addEventListener('blur', this.handleBlur);
    this.addEventListener('click', this.handleClick);
    this.addEventListener('focus', this.handleFocus);
  }

  connectedCallback() {
    super.connectedCallback();
    this.setInitialAttributes();
  }

  private handleBlur = () => {
    this.hasFocus = false;
    this.emit('zn-blur');
  };

  private handleClick = () => {
    if (!this.disabled) {
      this.checked = true;
    }
  };

  private handleFocus = () => {
    this.hasFocus = true;
    this.emit('zn-focus');
  };

  private setInitialAttributes() {
    this.setAttribute('role', 'radio');
    this.setAttribute('tabindex', '-1');
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  @watch('checked')
  handleCheckedChange() {
    this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    this.setAttribute('tabindex', this.checked ? '0' : '-1');
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  render() {
    return html`
      <span
        part="base"
        class=${classMap({
          radio: true,
          'radio--checked': this.checked,
          'radio--disabled': this.disabled,
          'radio--focused': this.hasFocus
        })}
      >
        <span part="${`control${this.checked ? ' control--checked' : ''}`}" class="radio__control">
          ${this.checked
            ? html`
              <zn-icon part="checked-icon" size="17" class="radio__checked-icon" src="radio_button_checked"></-icon> `
            : ''}
        </span>

        <div class="radio__label-wrapper">
          <slot name="label" part="label" class="radio__label">${this.label}</slot>
          <slot></slot>
        </div>
      </span>
    `;
  }
}
