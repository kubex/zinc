import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './key.scss';

/**
 * @summary A key item used within a key container to filter content.
 * @documentation https://zinc.style/components/key
 * @status experimental
 * @since 1.0
 *
 * @slot - The description of the key.
 */
export default class ZnKey extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() icon: string = '';
  @property() attribute: string = '';
  @property() value: string = '';
  @property() color: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral' = 'primary';
  @property({type: Boolean, reflect: true}) active: boolean = false;
  @property({attribute: 'icon-size', type: Number}) iconSize: number = 24;

  private _handleClick() {
    this.active = !this.active;
    this.emit('zn-change');
  }

  render() {
    const chipType = this.active ? this.color : 'transparent';

    return html`
      <div class="key" @click="${this._handleClick}">
        <zn-chip
          .icon="${this.icon}"
          .iconSize="${this.iconSize}"
          .type="${chipType}"
          size="medium"
        ></zn-chip>
        <div class="key__description">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
