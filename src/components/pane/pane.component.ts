import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './pane.scss';

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

  protected _header: HTMLElement;

  connectedCallback() {
    super.connectedCallback();
    this._header = this.querySelector("zn-header") as HTMLElement;
  }

  render() {
    if (this._header) {
      this.classList.add("with-header");
    }

    return html`
      ${this._header}
      <div class="pane__content">
        <slot></slot>
      </div>`;
  }
}
