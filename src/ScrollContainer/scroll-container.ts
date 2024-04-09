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
      setTimeout(() =>
      {
        this.scrollTop = this.scrollHeight;
      }, 100);
    });
  }

  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


