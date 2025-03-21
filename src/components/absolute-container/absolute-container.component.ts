import {PropertyValues} from 'lit';
import ZincElement from '../../internal/zinc-element';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/absolute-container
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
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

  // the height of this element is set to the height of it's children (absolute positioned)
  // to push the content element down
  createRenderRoot() {
    return this;
  }
}
