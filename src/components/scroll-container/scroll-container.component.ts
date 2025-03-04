import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './scroll-container.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/scroll-container
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
export default class ZnScrollContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  constructor() {
    super();

    this.addEventListener('scroll-to-bottom', () => {
      setTimeout(() => {
        this.scrollTop = this.scrollHeight;
      }, 100);
    });
  }

  render() {
    return html`
      <slot></slot>
    `;
  }
}
