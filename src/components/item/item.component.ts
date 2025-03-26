import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {LocalizeController} from '../../utilities/localize';
import ZincElement from '../../internal/zinc-element';

import styles from './item.scss';
import {classMap} from "lit/directives/class-map.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/description-item
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
export default class ZnItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  // @ts-expect-error unused property
  private readonly localize = new LocalizeController(this);

  @property() caption: string;

  @property({type: Boolean}) stacked: boolean;

  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  @property({attribute: 'edit-on-hover', type: Boolean}) editOnHover: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
    
    const inlineEdit = this.querySelector('zn-inline-edit');
    if (inlineEdit) {
      inlineEdit.setAttribute('size', this.size);
    }
  }

  render() {
    return html`
      <div class=${classMap({
        'description-item': true,
        'description-item--stacked': this.stacked,
        'description-item--edit-on-hover': this.editOnHover,
        'description-item--small': this.size === 'small',
        'description-item--medium': this.size === 'medium',
        'description-item--large': this.size === 'large',
      })}>
        <div class="description-item__caption">${this.caption}</div>
        <div class="description-item__content">
          <div class="description-item__content-inner">
            <slot></slot>
          </div>
          <div class="description-item__action-wrapper">
            <slot name="actions" class="description-item__actions"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
