import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";

import styles from './item.scss';

/**
 * @summary Used for listing items in a description list. Caption on the right, content on the left.
 * @documentation https://zinc.style/components/item
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The default slot. Can either be slotted or use the value attribute
 * @slot actions - Used for adding actions to a zn-item.
 *
 * @csspart base - The items base wrapper
 * @csspart caption - The items caption
 * @csspart icon - The items icon
 */
export default class ZnItem extends ZincElement {
  static dependencies = {
    'zn-icon': ZnIcon
  };

  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() caption: string;
  @property() description: string;

  @property({type: Boolean}) stacked: boolean;

  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  @property({attribute: 'edit-on-hover', type: Boolean}) editOnHover: boolean;

  @property() icon: string;

  @property() value: string;

  @property({type: Boolean}) inline: boolean;

  @property({type: Boolean}) grid: boolean;

  @property({type: Boolean, attribute: 'no-padding'}) noPadding: boolean;

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'listitem');
  }

  protected updated(_changedProperties: PropertyValues) {
    super.updated(_changedProperties);

    const inlineEdit = this.querySelector('zn-inline-edit');
    if (inlineEdit) {
      inlineEdit.setAttribute('size', this.size);
    }
  }

  render() {
    const hasIcon = this.icon && this.icon.length > 0;

    const headings = html`
      <div class="item__headings">
        <div class="item__caption" part="caption">${this.caption}</div>
        ${this.description ? html`<div class="item__description">${this.description}</div>` : ''}
      </div>`;

    return html`
      <div
        class=${classMap({
          'item': true,
          'item--stacked': this.stacked,
          'item--edit-on-hover': this.editOnHover,
          'item--inline': this.inline,
          'item--grid': this.grid,
          'item--small': this.size === 'small',
          'item--medium': this.size === 'medium',
          'item--large': this.size === 'large',
          'item--has-icon': hasIcon,
          'item--no-padding': this.noPadding
        })}
        part="base">

        ${this.icon ? html`
          <div class="item__header">
            <div class="item__icon">
              <zn-icon src="${this.icon}" size="20" part="icon"></zn-icon>
            </div>
            ${headings}
          </div>` : headings}

        <div class="item__content">
          <div class="item__content-inner">
            <slot>${this.value}</slot>
          </div>
          <div class="item__action-wrapper">
            <slot name="actions" class="item__actions"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
