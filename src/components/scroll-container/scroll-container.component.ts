import {type CSSResultGroup, html, unsafeCSS, PropertyValues} from 'lit';
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {property, query} from "lit/decorators.js";
import {ResizeController} from '@lit-labs/observers/resize-controller.js';
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

  private readonly _footerResizeObserver = new ResizeController(this, {
    target: null,
    callback: () => {
      this.style.setProperty('--zn-scroll-footer-height', `${this.footer?.clientHeight ?? 0}px`);
    },
  });

  private readonly _domObserver = new MutationController(this, {
    target: null,
    config: {childList: true, subtree: true},
    callback: () => {
      setTimeout(() => this.scrollEnd(), 100);
      if (this.footer) {
        this.style.setProperty('--zn-scroll-footer-height', `${this.footer.clientHeight}px`);
        this._footerResizeObserver.observe(this.footer);
      }
    },
  });

  connectedCallback() {
    super.connectedCallback();
    if (this.startScrolled) {
      this._domObserver.observe(this);
    }
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
