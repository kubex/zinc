import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './container.scss';

/**
 * @summary Layout container, used to wrap content with optional padding and breakpoint width.
 * @documentation https://zinc.style/components/container
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({type: Boolean}) padded: boolean;
  @property({type: Boolean}) breakpoint: boolean;

  render() {
    return html`
      <div part="base" class=${classMap({
        'container': true,
        'container--padded': this.padded,
        'container--breakpoint': this.breakpoint,
      })}>
        <slot></slot>
      </div>`;
  }
}
