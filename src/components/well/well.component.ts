import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';


import styles from './well.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/well
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 */
export default class ZnWell extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() icon: string = '';
  @property({attribute: 'inline', type: Boolean, reflect: true}) inline: boolean;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'action');

  render() {
    return html`
      <div class="${classMap({
        'well': true,
        'well--inline': this.inline,
      })}">
        ${this.icon ? html`
          <zn-icon src="${this.icon}" size="18"></zn-icon>` : ''}
        ${this.hasSlotController.test('[default]') ? html`
          <div>
            <slot></slot>
          </div>` : ''}
        ${this.hasSlotController.test('action') ? html`
          <slot name="action" class="well__action"></slot>` : ''}
      </div>
    `;
  }
}
