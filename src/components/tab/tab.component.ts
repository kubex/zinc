import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './tab.scss';

/**
 * @summary Defines a tab panel for use inside zn-page.
 * @documentation https://zinc.style/components/tab
 * @status experimental
 * @since 1.0
 *
 * @slot - The tab panel content.
 */
export default class ZnTab extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() caption: string;
  @property({type: Number}) priority: number;
  @property() uri: string;

  render() {
    return html`<slot></slot>`;
  }
}
