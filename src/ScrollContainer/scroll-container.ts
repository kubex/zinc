import { html, LitElement, unsafeCSS } from "lit";
import { customElement, property } from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-scroll-container')
export class ScrollContainer extends LitElement
{
  static styles = unsafeCSS(styles);

  @property({ attribute: "scroll-bottom", type: Boolean })
  scrollBottom = false;

  render()
  {

    this.scrollTop = this.scrollBottom ? this.scrollHeight : 0;


    return html`
      <slot></slot>`;
  }
}


