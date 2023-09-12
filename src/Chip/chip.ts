import {html, LitElement, unsafeCSS} from "lit";
import {customElement} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-chip')
export class Chip extends LitElement
{
  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <slot></slot>`;
  }
}


