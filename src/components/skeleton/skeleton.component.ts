import {html, unsafeCSS} from "lit";
import ZincElement from "../../internal/zinc-element";
import type {CSSResultGroup} from "lit";

import styles from './skeleton.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/skeleton
 * @status experimental
 * @since 1.0
 */
export default class ZnSkeleton extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  protected render(): unknown {
    return html`
      <div class="skeleton"></div>`;
  }
}
