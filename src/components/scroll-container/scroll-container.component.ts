import {type CSSResultGroup, html, unsafeCSS, PropertyValues} from 'lit';
import ZincElement from '../../internal/zinc-element';
import {property, query} from "lit/decorators.js";

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

  @property({attribute: 'start-scrolled', type: Boolean, reflect: true}) startScrolled: boolean = false;

  @query('.scroll-container')
  private container: HTMLElement;

  @query('.scroll-footer')
  private footer: HTMLElement;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.startScrolled && this.container) {
      setTimeout(this.scrollEnd.bind(this), 10);
    }
  }

  scrollEnd() {
    this.container.scrollTop = this.container.scrollHeight;
  }

  private _footerResizeObserver?: ResizeObserver;

  connectedCallback() {
    super.connectedCallback();
    if (this.startScrolled) {
      const observer = new MutationObserver(() => {
        setTimeout(this.scrollEnd.bind(this), 100);
        if (this.footer) {
          // Initialize height immediately
          this.style.setProperty('--zn-scroll-footer-height', `${this.footer.clientHeight}px`);
          // Attach ResizeObserver to watch for size changes
          this._footerResizeObserver = new ResizeObserver(() => {
            this.style.setProperty('--zn-scroll-footer-height', `${this.footer?.clientHeight ?? 0}px`);
          });
          this._footerResizeObserver.observe(this.footer);
        }
      });
      observer.observe(this, {childList: true, subtree: true});
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._footerResizeObserver?.disconnect();
    this._footerResizeObserver = undefined;
  }

  render() {
    return html`
      <div class="container">
        <div class="scroll-header">
          <slot name="header"></slot>
        </div>
        <div class="scroll-container">
          <slot></slot>
        </div>
        <div class="scroll-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}
