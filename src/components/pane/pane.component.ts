import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './pane.scss';
import {property} from "lit/decorators.js";
import ZnSp from "../sp";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/pane
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
export default class ZnPane extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Boolean}) flush: boolean;

  protected _header: HTMLElement;

  connectedCallback() {
    super.connectedCallback();
    this._header = this.querySelector("zn-header") as HTMLElement;
return
    // if slotted zn-sp is present, add flush class to zn-sp
    const sp = this.querySelectorAll<ZnSp>("zn-sp") as NodeListOf<ZnSp>;
    sp.forEach((ele) => {
      ele.setAttribute("flush", "");
    });
  }

  render() {
    if (this._header) {
      this.classList.add("with-header");
      this._header.setAttribute('slot','top')
    }

    return html`
      ${this._header}
      <div class="pane__content">
        <div class="width-container">
          <slot></slot>
        </div>
      </div>`;
  }
}
