import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import {styleMap} from "lit/directives/style-map.js";
import ZincElement from '../../internal/zinc-element';

import styles from './expanding-action.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/expanding-action
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
export default class ZnExpandingAction extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() icon: string;

  @property() method: 'drop' | 'fill' = 'drop';

  @property({reflect: true}) count: string;

  @property({type: Boolean}) prefetch = false;

  @property() basis: string = '300';

  @property({attribute: 'max-height'}) maxHeight: string;

  @property({reflect: true, type: Boolean}) open = false;

  private observer?: MutationObserver;

  connectedCallback() {
    super.connectedCallback();
    this.observeMetaCount();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  observeMetaCount() {
    const appContent = this.querySelector('app-content');

    this.observer = new MutationObserver(() => {
      const metaCount = appContent?.shadowRoot?.querySelector('meta[name="count"]');
      if (!metaCount) {
        return;
      }
      const count = metaCount.getAttribute('content');
      const notification = this.shadowRoot?.querySelector('.expanding-action__dropdown zn-button');
      if (count && notification) {
        notification.setAttribute('notification', count);
      }
    });

    this.observer.observe(this, {
      subtree: true,
      attributes: true
    });
  }

  handleIconClicked = () => {
    this.open = !this.open;
  }

  handleIconCloseClicked = () => {
    this.open = false;
  }

  render() {
    return html`
      ${this.method === 'fill' ? html`
        <zn-button color="transparent"
                   size="x-small"
                   @click=${this.handleIconClicked}
                   icon=${this.icon}
                   icon-size="24">
        </zn-button>` : nothing}
      <div
        class=${classMap({
          "expanding-action": true,
          'expanding-action--open': this.open,
          'expanding-action--closed': !this.open,
          'expanding-action--drop': this.method === 'drop',
          'expanding-action--fill': this.method === 'fill',
        })}
        style=${styleMap({
          '--expanding-action-basis': this.method === "drop" && this.basis ? this.basis.replace('px', '') + 'px' : 'none',
          '--expanding-action-max-height': this.method === "drop" && this.maxHeight ? this.maxHeight.replace('px', '') + 'px' : 'none',
        })}>
        ${this.method === 'drop' ? this.renderDropdown() : this.renderFill()}
      </div>`;
  }

  protected renderDropdown() {
    return html`
      <zn-dropdown class="expanding-action__dropdown"
                   placement="bottom-end">
        <zn-button slot="trigger"
                   color="transparent"
                   size="x-small"
                   icon=${this.icon}
                   icon-size="24"
                   notification="${this.count || nothing}"
                   @click=${this.handleIconClicked}>
        </zn-button>
        <div class="expanding-action__content">
          <slot></slot>
        </div>
      </zn-dropdown>`
  }

  protected renderFill() {
    return html`
      <zn-icon src=${this.icon} size="24"></zn-icon>
      <div class='expanding-action__content'>
        <slot></slot>
      </div>
      <zn-button slot="trigger"
                 class="expanding-action__close-icon"
                 color="transparent"
                 size="x-small"
                 @click=${this.handleIconCloseClicked}
                 icon="close"
                 icon-size="24">
      </zn-button>`
  }
}
