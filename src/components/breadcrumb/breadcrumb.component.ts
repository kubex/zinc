import {type CSSResultGroup, html, unsafeCSS, PropertyValues} from 'lit';
import ZincElement from '../../internal/zinc-element';
import {property} from "lit/decorators.js";

import styles from './breadcrumb.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/breadcrumb
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
export default class ZnBreadcrumb extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() separator: string = ">";

  private links: NodeListOf<HTMLAnchorElement>;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    this._getLinks();
    this._renderLinks();
  }

  private _getLinks() {
    const slot = this.shadowRoot!.querySelector('slot');
    const child = slot!.assignedNodes({flatten: true}).find(node => node.nodeType === Node.ELEMENT_NODE) as HTMLElement;

    this.links = child.querySelectorAll('a');

    child.innerHTML = '';
  }

  private _renderLinks() {
    this.links.forEach((link, index) => {
      const isLast = index === this.links.length - 1;
      const separatorSpan = document.createElement('span');
      separatorSpan.classList.add('separator');
      separatorSpan.textContent = isLast ? '' : this.separator;

      const linkWrapper = document.createElement('span');
      linkWrapper.classList.add('link-wrapper');
      linkWrapper.appendChild(link);
      linkWrapper.appendChild(separatorSpan);

      this.shadowRoot!.querySelector('.breadcrumbs')!.appendChild(linkWrapper);
    });
  }

  render() {
    return html`
      <div class="breadcrumbs">
        <slot></slot>
      </div>`;
  }
}
