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

  private domObserver: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this.observerDom();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.domObserver?.disconnect();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.resize();
  }

  resize() {
    let newSize = 0;
    Array.from(this.children).forEach((child) => {
      newSize += child.getBoundingClientRect().height;
    });
    this.style.minHeight = newSize + 'px';
  }

  observerDom() {
    // observe the DOM for changes
    this.domObserver = new MutationObserver(() => {
      this.resize();
    });

    this.domObserver.observe(this,
      {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
  }

  // the height of this element is set to the height of its children (absolute positioned)
  // to push the content element down
  createRenderRoot() {
    return this;
  }
}
