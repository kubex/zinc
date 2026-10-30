import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './badge.scss';

/**
 * @summary Badges label the status or category of a record, such as "Active" or "Past due".
 * @documentation https://zinc.style/components/badge
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The badge's label.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnBadge extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** `ai` marks AI-generated content only. */
  @property({reflect: true}) type: 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'ai' = 'neutral';

  @property({reflect: true}) size: 'medium' | 'large' = 'medium';

  /** Fills the badge with its type colour. */
  @property({type: Boolean, reflect: true}) solid = false;

  /** Leads the label with a dot in the type colour. */
  @property({type: Boolean, reflect: true}) dot = false;

  render() {
    return html`
      <span part="base" class="${classMap({
        'badge': true,
        [`badge--${this.type}`]: true,
        'badge--large': this.size === 'large',
        'badge--solid': this.solid,
        'badge--dot': this.dot,
      })}">
        ${this.type === 'ai' ? html`
          <zn-icon class="badge__icon" src="sparkle" library="lucide" size="14"></zn-icon>` : ''}
        <slot></slot>
      </span>
    `;
  }
}
