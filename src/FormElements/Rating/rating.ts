import { html, unsafeCSS } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { classMap } from "lit/directives/class-map.js";
import { customElement, property, query, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { ZincElement } from "../../zinc-element";
import { clamp } from "lodash";

import styles from './index.scss';

@customElement('zn-rating')
export class Rating extends ZincElement
{
  static styles = unsafeCSS(styles);

  @query('.rating') rating: HTMLElement;

  @state() private hoverValue: number = 0;
  @state() private isHovering: boolean = false;

  @property() label = "";
  @property({ type: Number }) value: number = 0;
  @property({ type: Number }) max: number = 5;
  @property({ type: Number }) precision: number = 1;
  @property({ type: Boolean }) readonly: boolean = false;
  @property({ type: Boolean }) disabled: boolean = false;

  @property() getSymbol: (value: number) => string = () => '<zn-icon src="warning"></zn-icon>';


  private _roundToPrecision(value: number, precision: number): number
  {
    const factor = 1 / precision;
    return Math.ceil(value * factor) / factor;
  }

  private _getValueFromXCoordinate(coordinate: number): number
  {
    const { left, width } = this.rating.getBoundingClientRect();
    const value = this._roundToPrecision(((coordinate - left) / width) * this.max, this.precision);

    return clamp(value, 0, this.max);
  }

  private _getValueFromMousePosition(event: MouseEvent): number
  {
    return this._getValueFromXCoordinate(event.clientX);
  }

  private _getValueFromTouchPosition(event: TouchEvent): number
  {
    return this._getValueFromXCoordinate(event.touches[0].clientX);
  }

  private _setValue(value: number)
  {
    if(this.disabled || this.readonly)
    {
      return;
    }

    this.value = value === this.value ? 0 : value;
    this.isHovering = false;
  }


  private _handleClick(event: MouseEvent)
  {
    if(this.readonly || this.disabled)
    {
      return;
    }

    this._setValue(this._getValueFromMousePosition(event));
  }

  private _handleMouseEnter(event: MouseEvent)
  {
    this.isHovering = true;
    this.hoverValue = this._getValueFromMousePosition(event);
  }

  private _handleMouseMove(event: MouseEvent)
  {
    this.hoverValue = this._getValueFromMousePosition(event);
  }

  private _handleMouseLeave(event: MouseEvent)
  {
    this.isHovering = false;
  }

  private _handleTouchStart(event: TouchEvent)
  {
    this.isHovering = true;
    this.hoverValue = this._getValueFromTouchPosition(event);
  }

  private _handleTouchMove(event: TouchEvent)
  {
    this.hoverValue = this._getValueFromTouchPosition(event);
  }

  private _handleTouchEnd(event: TouchEvent)
  {
    this.isHovering = false;
    this._setValue(this._getValueFromTouchPosition(event));

    event.preventDefault();
  }

  render()
  {
    const counter = Array.from(Array(this.max).keys());
    let displayValue = 0;

    if(this.disabled || this.readonly)
    {
      displayValue = this.value;
    }
    else
    {
      displayValue = this.isHovering ? this.hoverValue : this.value;
    }

    return html`
      <div
        part="base"
        class="${classMap({
          rating: true,
          'rating--readonly': this.readonly,
          'rating--disabled': this.disabled,
        })}"
        role="slider"
        aria-label="${this.label}"
        aria-disabled="${this.disabled ? 'true' : 'false'}"
        aria-readonly="${this.readonly ? 'true' : 'false'}"
        aria-valuenow="${this.value}"
        aria-valuemin="0"
        aria-valuemax="${this.max}"
        @click="${this._handleClick}"
        @mouseenter="${this._handleMouseEnter}"
        @mousemove="${this._handleMouseMove}"
        @mouseleave="${this._handleMouseLeave}"
        @touchstart="${this._handleTouchStart}"
        @touchmove="${this._handleTouchMove}"
        @touceend="${this._handleTouchEnd}"
      >
        <span class="rating__symbols">
          ${counter.map(index =>
          {
            if(displayValue > index && displayValue < index + 1)
            {
              return html`
                <span
                  class=${classMap({
                    rating__symbol: true,
                    'rating__partial-symbol-container': true,
                    'rating__symbol--hover': this.isHovering && Math.ceil(displayValue) === index + 1
                  })}
                  role="presentation"
                >
                  <div
                    style=${styleMap({
                      clipPath: `inset(0 0 0 ${(displayValue - index) * 100}%)`
                    })}
                  >
                    ${unsafeHTML(this.getSymbol(index + 1))}
                  </div>
                  <div
                    class="rating__partial--filled"
                    style=${styleMap({
                      clipPath: `inset(0 ${100 - (displayValue - index) * 100}% 0 0)`
                    })}
                  >
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
                role="presentation"
              >
                ${unsafeHTML(this.getSymbol(index + 1))}
              </span>`;
          })}
        </span>
      </div>
    `;
  }
}
