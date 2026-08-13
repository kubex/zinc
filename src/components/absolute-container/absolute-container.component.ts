import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import ZincElement from '../../internal/zinc-element';
import type {PropertyValues} from 'lit';

/**
 * @summary The absolute container will take the total inner height of the content (positioned absolute), and set that
 * as it's min height, Creating enough space to show the content.
 *
 * @documentation https://zinc.style/components/absolute-container
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot
 *
 */
export default class ZnAbsoluteContainer extends ZincElement {
  private _resizeFrame: number | null = null;

  constructor() {
    super();
    // eslint-disable-next-line no-new
    new MutationController(this, {
      config: {childList: true, subtree: true, attributes: true, characterData: true},
      callback: () => this.resize(),
      skipInitial: true,
    });
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.resize();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._resizeFrame !== null) {
      cancelAnimationFrame(this._resizeFrame);
      this._resizeFrame = null;
    }
  }

  resize() {
    if (this._resizeFrame !== null) {
      return;
    }
    this._resizeFrame = requestAnimationFrame(() => {
      this._resizeFrame = null;
      let newSize = 0;
      Array.from(this.children).forEach((child) => {
        newSize += child.getBoundingClientRect().height;
      });
      const minHeight = newSize + 'px';
      // Guarded write: setting style re-triggers our own MutationController
      if (this.style.minHeight !== minHeight) {
        this.style.minHeight = minHeight;
      }
    });
  }

  // the height of this element is set to the height of its children (absolute positioned)
  // to push the content element down
  createRenderRoot() {
    return this;
  }
}
