import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './reveal.scss';
import {classMap} from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/reveal
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
 * @usage
 * ```html
 * <zn-reveal duration="3000"
 *            initial="******@hotmail.com"
 *            revealed="john.doe@hotmail.com" toggle>
 * </zn-reveal>
 * ```
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnReveal extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Number}) duration: number = 2000;

  @property() initial: string = '';

  @property() revealed: string = '';

  private _isRevealed: boolean = false;
  private _isToggled: boolean = false;

  protected handleToggleReveal() {
    if (this.duration) {
      this._isRevealed = true;
      this._isToggled = true;

      this.requestUpdate();

      setTimeout(() => {
        this._isRevealed = false;
        this._isToggled = false;
        this.requestUpdate();
      }, this.duration);
    } else {
      this._isRevealed = !this._isRevealed;
      this._isToggled = !this._isToggled;
      this.requestUpdate();
    }
  }

  protected handleMouseEnter() {
    // handle hover only while hovered
    this._isRevealed = true;
    this.requestUpdate();
  }

  protected handleMouseLeave() {
    if (this._isToggled) {
      return;
    }
    this._isRevealed = false;
    this.requestUpdate();
  }

  render() {
    return html`
      <div class=${classMap({
        'reveal': true,
        'reveal--revealed': this._isRevealed,
        'reveal--toggled': this._isToggled,
      })}
           @click="${this.handleToggleReveal}"
           @mouseenter="${this.handleMouseEnter}"
           @mouseleave="${this.handleMouseLeave}">
        ${this._isRevealed ? this.revealed : this.initial}
      </div>
    `;
  }
}
