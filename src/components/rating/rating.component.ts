import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController, validValidityState} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {property, query, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import ZincElement from '../../internal/zinc-element';

import type {ZincFormControl} from '../../internal/zinc-element';

import formControlStyles from '../../form-control.scss';
import styles from './rating.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/rating
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 * @slot help-text - Text that describes how to use the rating. Alternatively, you can use the `help-text` attribute.
 *
 * @csspart form-control - The form control that wraps the symbols and help text.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart base - The component's base wrapper.
 * @csspart preview - The value shown next to the symbols when `preview` is enabled.
 *
 * @cssproperty --example - An example CSS custom property.
 * @cssproperty --preview-color - The color of the preview value.
 * @cssproperty --preview-size - The font size of the preview value.
 */
export default class ZnRating extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = [unsafeCSS(formControlStyles), unsafeCSS(styles)];

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-blur', 'zn-input']
  });

  private readonly hasSlotController = new HasSlotController(this, 'help-text');

  @query('.rating') rating: HTMLElement;

  @query('.rating__symbols') symbols: HTMLElement;

  @state() private hoverValue: number = 0;

  @state() private isHovering: boolean = false;

  @property() label: string;

  /** The rating's help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText: string = '';

  @property() name: string;

  @property({type: Number}) value: number = 0;

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue() defaultValue: number = 0;

  @property({type: Number}) max: number = 5;

  @property({type: Number}) precision: number = 1;

  @property({type: Boolean}) readonly: boolean = false;

  @property({type: Boolean}) disabled: boolean = false;

  /** Displays the value alongside the symbols, updating live as the pointer moves across them. */
  @property({type: Boolean}) preview: boolean = false;

  @property({}) size: 'small' | 'medium' | 'large' = 'medium';

  @property() getSymbol: (value: number) => string = () => '<zn-icon src="star" library="material"></zn-icon>';

  /** Gets the validity state object */
  get validity() {
    return validValidityState;
  }

  /** Gets the validation message */
  get validationMessage() {
    return "";
  }

  /** Checks the validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity(): boolean {
    return true;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return true;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity() {
    this.formControlController.updateValidity();
  }

  private _roundToPrecision(value: number, precision: number): number {
    const factor = 1 / precision;
    return Math.ceil(value * factor) / factor;
  }

  private _getValueFromXCoordinate(coordinate: number): number {
    const {left, width} = this.symbols.getBoundingClientRect();
    // Symbols are spaced with a gap rather than padding, so the symbols only cover part of the
    // container and a plain width-to-value ratio would skew fractions within each symbol.
    const gap = parseFloat(getComputedStyle(this.symbols).columnGap) || 0;
    const symbolWidth = (width - gap * (this.max - 1)) / this.max;
    const stride = symbolWidth + gap;
    const position = Math.min(Math.max(coordinate - left, 0), width);
    const index = Math.min(Math.floor(position / stride), this.max - 1);
    // Landing in a gap reads as the preceding symbol being complete.
    const fraction = Math.min((position - index * stride) / symbolWidth, 1);
    const value = this._roundToPrecision(index + fraction, this.precision);

    return Math.min(Math.max(value, 0), this.max);
  }

  private _formatValue(value: number): string {
    const decimals = String(this.precision).split('.')[1]?.length ?? 0;
    return value.toFixed(decimals);
  }

  private _getValueFromMousePosition(event: MouseEvent): number {
    return this._getValueFromXCoordinate(event.clientX);
  }

  private _getValueFromTouchPosition(event: TouchEvent): number {
    return this._getValueFromXCoordinate(event.touches[0].clientX);
  }

  private _setValue(value: number) {
    if (this.disabled || this.readonly) {
      return;
    }

    this.value = value === this.value ? 0 : value;
    this.isHovering = false;
  }


  private _handleClick(event: MouseEvent) {
    if (this.readonly || this.disabled) {
      return;
    }

    this._setValue(this._getValueFromMousePosition(event));
  }

  private _handleMouseEnter(event: MouseEvent) {
    this.isHovering = true;
    this.hoverValue = this._getValueFromMousePosition(event);
  }

  private _handleMouseMove(event: MouseEvent) {
    this.hoverValue = this._getValueFromMousePosition(event);
  }

  private _handleMouseLeave() {
    this.isHovering = false;
  }

  private _handleTouchStart(event: TouchEvent) {
    this.isHovering = true;
    this.hoverValue = this._getValueFromTouchPosition(event);
  }

  private _handleTouchMove(event: TouchEvent) {
    this.hoverValue = this._getValueFromTouchPosition(event);
  }

  private _handleTouchEnd(event: TouchEvent) {
    this.isHovering = false;
    // `touches` is empty once the finger lifts, so the final position lives in `changedTouches`.
    this._setValue(this._getValueFromXCoordinate(event.changedTouches[0].clientX));

    event.preventDefault();
  }

  render() {
    const counter = Array.from(Array(this.max).keys());
    const hasHelpText = this.helpText ? true : this.hasSlotController.test('help-text');
    let displayValue = 0;

    if (this.disabled || this.readonly) {
      displayValue = this.value;
    } else {
      displayValue = this.isHovering ? this.hoverValue : this.value;
    }

    return html`
      <div
        part="form-control"
        class="${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--has-help-text': hasHelpText
        })}">
        <div
          part="base"
          class="${classMap({
            rating: true,
            'rating--readonly': this.readonly,
            'rating--disabled': this.disabled,
            'rating--small': this.size === 'small',
            'rating--medium': this.size === 'medium',
            'rating--large': this.size === 'large'
          })}"
          role="slider"
          aria-label="${this.label}"
          aria-describedby="help-text"
          aria-disabled="${this.disabled ? 'true' : 'false'}"
          aria-readonly="${this.readonly ? 'true' : 'false'}"
          aria-valuenow="${this.value}"
          aria-valuemin="0"
          aria-valuemax="${this.max}"
        >
          <span
            class="rating__symbols"
            @click="${this._handleClick}"
            @mouseenter="${this._handleMouseEnter}"
            @mousemove="${this._handleMouseMove}"
            @mouseleave="${this._handleMouseLeave}"
            @touchstart="${this._handleTouchStart}"
            @touchmove="${this._handleTouchMove}"
            @touchend="${this._handleTouchEnd}"
          >
            ${counter.map(index => {
              if (displayValue > index && displayValue < index + 1) {
                return html`
                  <span
                    class=${classMap({
                      rating__symbol: true,
                      'rating__partial-symbol-container': true,
                      'rating__symbol--hover': this.isHovering && Math.ceil(displayValue) === index + 1
                    })}
                    role="presentation">
                    <div
                      style=${styleMap({
                        clipPath: `inset(0 0 0 ${(displayValue - index) * 100}%)`
                      })}>
                      ${unsafeHTML(this.getSymbol(index + 1))}
                    </div>
                    <div
                      class="rating__partial--filled"
                      style=${styleMap({
                        clipPath: `inset(0 ${100 - (displayValue - index) * 100}% 0 0)`
                      })}>
                      ${unsafeHTML(this.getSymbol(index + 1))}
                    </div>
                  </span>
                `;
              }
              return html`
                <span
                  class=${classMap({
                    rating__symbol: true,
                    'rating__symbol--hover': this.isHovering && Math.ceil(displayValue) === index + 1,
                    'rating__symbol--active': displayValue >= index + 1
                  })}
                  role="presentation">
                  ${unsafeHTML(this.getSymbol(index + 1))}
                </span>`;
            })}
          </span>
          ${this.preview
            ? html`
              <span
                part="preview"
                class=${classMap({
                  rating__preview: true,
                  'rating__preview--hover': this.isHovering
                })}
                aria-hidden="true">
                ${this._formatValue(displayValue)}
              </span>`
            : ''}
        </div>

        <div
          part="form-control-help-text"
          id="help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `;
  }
}
