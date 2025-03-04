import { property } from 'lit/decorators.js';
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './accordion.scss?inline';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/accordion
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
export default class ZnAccordion extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ type: String, reflect: true }) caption = '';
  @property({ type: String, reflect: true }) summary = '';
  @property({ type: String, reflect: true }) label = '';
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;


  render() {
    return html`
      <div @click="${() => (!this.expanded ? (this.expanded = true) : '')}">
        <slot name="header" class="header" @click="${(e: MouseEvent) => this.handleCollapse(e)}">
          <div>
            <p class="caption">${this.caption}</p>
            <p class="summary">${this.summary}</p>
          </div>
          <div class="header__right">
            <p class="label">${this.label}</p>
            <zn-icon library="material-outlined" src="expand_more" class="expand"></zn-icon>
          </div>
        </slot>
        <div class="content">
          <slot @slotchange="${(e: any) => (e.target.assignedNodes().length === 0)}">

          </slot>
        </div>
      </div>`;
  }

  handleCollapse(e: any) {
    if (this.expanded) {
      this.expanded = false;
      e.stopPropagation();
    }
  }
}
