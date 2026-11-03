import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './menu-label.scss';

/**
 * @summary A heading for a group of items in a `zn-menu`. It is skipped by the menu's keyboard navigation.
 * @documentation https://zinc.style/components/menu
 * @status experimental
 * @since 1.0
 *
 * @slot - The label text.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --zn-menu-label-padding - Space around the label.
 * @cssproperty --zn-menu-label-color - The label's text colour.
 */
export default class ZnMenuLabel extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'presentation');
  }

  render() {
    return html`<div part="base" class="menu-label"><slot></slot></div>`;
  }
}
