import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './sidebar.scss';
import {classMap} from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/sidebar
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
export default class ZnSidebar extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'caption', reflect: true}) caption: string;
  @property({attribute: 'open', type: Boolean, reflect: true}) open: boolean = false;
  @property({attribute: 'start-scrolled', type: Boolean, reflect: true}) startScrolled: boolean = false;
  @property({type: Boolean}) wide: boolean = false;

  constructor() {
    super();
    this.addEventListener('scroll-to-bottom', () => {
      setTimeout(this.scrollBottom.bind(this), 200);
    });
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.startScrolled) {
      this.observerDom();
      this.scrollBottom();
    }
  }

  observerDom() {
    // observe the DOM for changes
    const observer = new MutationObserver((_) => {
      setTimeout(this.scrollBottom.bind(this), 10);
    });

    observer.observe(this, {childList: true, subtree: true});
  }

  scrollBottom() {
    const container = this.shadowRoot?.getElementById('primary-content');
    if (container) {
      container.scrollTop = container.scrollHeight;
    } else {
      setTimeout(this.scrollBottom.bind(this), 10);
    }
  }

  render() {
    return html`
      <div class="container">
        <div class="relative">
          <div id="primary-content">
            <slot></slot>
          </div>
        </div>
        <div id="sidebar" class="${classMap({'sidebar': true, 'sidebar--wide': this.wide})}">
          ${this._expander()}
          <div id="content">
            <slot name="side"></slot>
          </div>
        </div>
      </div>`;
  }

  _expander() {
    const smpCap = this.caption ?? "Close";
    return html`
      <div id="expander" @click="${(e: MouseEvent) => this.handleClick(e)}">
        <zn-icon src="arrow_downward" library="material"></zn-icon>
        <span class="close"> Close ${this.caption}</span>
        <span class="close-sm">${smpCap}</span>
        <span class="open"> Show ${this.caption}</span>
      </div>`;
  }

  handleClick(e: any) {
    this.open = !this.open;
    e.stopPropagation();
  }
}
