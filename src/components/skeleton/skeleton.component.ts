import {html, unsafeCSS} from "lit";
import {property} from "lit/decorators.js";
import {styleMap} from "lit/directives/style-map.js";
import ZincElement from "../../internal/zinc-element";
import type {CSSResultGroup} from "lit";

import styles from './skeleton.scss';

/**
 * @summary Skeleton loaders provide visual placeholders while content is loading, improving perceived performance and user experience.
 * @documentation https://zinc.style/components/skeleton
 * @status experimental
 * @since 1.0
 *
 * @property {string} speed - Animation speed for the shimmer effect. Default: "3s"
 * @property {string} width - Width of the skeleton element. Default: "100%"
 * @property {string} height - Height of the skeleton element. Default: "20px"
 * @property {string} radius - Border radius of the skeleton element. Default: "4px"
 */
export default class ZnSkeleton extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({attribute: 'speed', type: String}) speed = '3s';
  @property({attribute: 'width', type: String}) width = '100%';
  @property({attribute: 'height', type: String}) height = '20px';
  @property({attribute: 'radius', type: String}) radius = '4px';

  protected render(): unknown {
    return html`
      <div class="skeleton"
           style=${styleMap({
             '--skeleton-speed': `${this.speed}`,
             '--skeleton-width': `${this.width}`,
             '--skeleton-height': `${this.height}`,
             '--skeleton-border-radius': `${this.radius}`,
           })}
      ></div>`;
  }
}
