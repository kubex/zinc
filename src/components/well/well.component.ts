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
 * @slot action - Content displayed on the right hand side of the well.
 */
export default class ZnWell extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() icon: string = '';
  @property({attribute: 'inline', type: Boolean, reflect: true}) inline: boolean;

  /** Renders the default slot inside a `pre` element, preserving whitespace using a monospace font. */
  @property({attribute: 'pre', type: Boolean, reflect: true}) pre: boolean;

  /** Breaks long unbroken words, so they wrap instead of forcing the well wider. */
  @property({attribute: 'break-long', type: Boolean, reflect: true}) breakLong: boolean;

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'action');

  render() {
    const contentClasses = classMap({
      'well__content': true,
      'well__content--pre': this.pre,
      'well__content--break-long': this.breakLong,
    });

    return html`
      <div class="${classMap({
        'well': true,
        'well--inline': this.inline,
      })}">
        ${this.icon ? html`
          <zn-icon src="${this.icon}" size="18"></zn-icon>` : ''}
        ${this.hasSlotController.test('[default]')
          ? (this.pre
            ? html`
              <pre class="${contentClasses}"><slot></slot></pre>`
            : html`
              <div class="${contentClasses}">
                <slot></slot>
              </div>`)
          : ''}
        ${this.hasSlotController.test('action') ? html`
          <slot name="action" class="well__action"></slot>` : ''}
      </div>
    `;
  }
}
