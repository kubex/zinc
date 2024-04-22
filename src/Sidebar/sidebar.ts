import {ZincElement} from "../zinc";
import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-sidebar')
export class Sidebar extends ZincElement
{
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'open', type: Boolean, reflect: true}) open: boolean = false;
  @property({attribute: 'start-scrolled', type: Boolean, reflect: true}) startScrolled: boolean = false;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this.addEventListener('scroll-to-bottom', () =>
    {
      setTimeout(this.scrollBottom.bind(this), 200);
    });
  }

  connectedCallback()
  {
    super.connectedCallback();
    if(this.startScrolled)
    {
      this.observerDom();
      this.scrollBottom();
    }
  }

  observerDom()
  {
    // observe the DOM for changes
    const observer = new MutationObserver((mutations) =>
    {
      setTimeout(this.scrollBottom.bind(this), 10);
    });

    observer.observe(this, {childList: true, subtree: true});
  }

  scrollBottom()
  {
    const container = this.shadowRoot.getElementById('primary-content');
    if(container)
    {
      container.scrollTop = container.scrollHeight;
    }
    else
    {
      setTimeout(this.scrollBottom.bind(this), 10);
    }
  }

  render()
  {
    return html`
      <div class="container">
        <div class="relative">
          <div id="primary-content">
            <slot></slot>
          </div>
        </div>
        <div id="sidebar">
          ${this._expander()}
          <div id="content">
            <slot name="side"></slot>
          </div>
        </div>
      </div>`;
  }

  _expander()
  {
    const smpCap = this.caption ?? "Close";
    return html`
      <div id="expander" @click="${(e: MouseEvent) => this.handleClick(e)}">
        <zn-icon src="arrow_downward" library="material"></zn-icon>
        <span class="close"> Close ${this.caption}</span>
        <span class="close-sm">${smpCap}</span>
        <span class="open"> Show ${this.caption}</span>
      </div>`;
  }

  handleClick(e)
  {
    this.open = !this.open;
    e.stopPropagation();
  }
}


