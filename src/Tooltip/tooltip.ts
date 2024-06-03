import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss?inline';
import { classMap } from "lit/directives/class-map.js";

@customElement('zn-tooltip')
export class Tooltip extends LitElement
{
  static styles = unsafeCSS(styles);

  private hoverTimeout: number;

  private open: boolean = false;

  @property() content = '';

  constructor()
  {
    super();
    this.addEventListener('mouseover', this.handleMouseOver);
  }

  disconnectedCallback()
  {
    super.disconnectedCallback();
  }

  // add click event to handle the menu
  connectedCallback()
  {
    super.connectedCallback();
    this.addEventListener('click', () =>
    {
      if(this.classList.contains('notification'))
      {
        this.classList.remove('notification');
      }
    });
  }

  private handleMouseOver(e)
  {
    clearTimeout(this.hoverTimeout);
    this.hoverTimeout = window.setTimeout(() => this.show(), 200);
  }

  private show()
  {
    if(this.open)
    {
      return undefined;
    }

    this.open = true;
  }

  render()
  {
    return html`
      <zn-popup
        class="${classMap({
          'tooltip': true,
          'tooltip--open': this.open
        })}"
        open>
        <slot></slot>
        <slot name="content">${this.content}</slot>
      </zn-popup>`;
  }
}


