import { html, LitElement, unsafeCSS } from "lit";
import { customElement } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-scroll-container')
export class ScrollContainer extends LitElement
{
  static styles = unsafeCSS(styles);

  constructor()
  {
    super();

    this.addEventListener('scroll-to-bottom', () =>
    {
      // scroll all the way to the bottom of the container
      this.scrollTop = this.scrollHeight;
    });
  }

  render()
  {
    return html`
      <slot></slot>`;
  }
}


