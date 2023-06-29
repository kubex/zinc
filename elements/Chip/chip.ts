import {html, unsafeCSS} from 'lit';
import {customElement} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './chip.scss';

@customElement('zn-chip')
export class ZincChip extends ZincElement {
  static styles = unsafeCSS(styles);

  render() {
    return html`
        <slot></slot>`;
  }
}
