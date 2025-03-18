import {property} from 'lit/decorators.js';
import {type CSSResultGroup, html, PropertyValues, unsafeCSS} from 'lit';
import ZincElement from '../../internal/zinc-element';

import styles from './panel.scss';
import {classMap} from "lit/directives/class-map.js";
import {HasSlotController} from "../../internal/slot";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/panel
 * @status experimental
 * @since 1.0
 *
 * @slot - The default slot.
 * @slot actions - The actions slot.
 * @slot footer - The footer slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnPanel extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'actions', 'footer');

  @property({type: Number}) basis: number;

  @property() caption: string;

  @property() description: string;

  @property({type: Boolean}) tabbed: boolean;

  @property({type: Boolean}) flush: boolean;


  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);

    if (this.basis) {
      this.style.setProperty('--zn-panel-basis', this.basis.toString());
    }

    if (!this.tabbed) {
      const tabs = this.querySelector('zn-tabs')!;
      if (tabs) {
        tabs.setAttribute('flush-x', '');
        const body = this.shadowRoot?.querySelector('.body');
        if (body) {
          body.classList.toggle('ntp', true);
        }
      }
    }
  }


  protected render(): unknown {
    const hasActionSlot = this.hasSlotController.test('actions');
    const hasFooterSlot = this.hasSlotController.test('footer');
    const hasHeader = this.caption || hasActionSlot;

    return html`
      <div part="base" class=${classMap({
        panel: true,
        'panel--flush': this.flush || this.tabbed,
        'panel--tabbed': this.tabbed,
        'panel--has-actions': hasActionSlot,
        'panel--has-footer': hasFooterSlot,
        'panel--has-header': hasHeader,
      })}>

        ${hasHeader ? html`
          <div class="panel__header">
            <div class="panel__header__left">
              <span class="panel__caption">${this.caption}</span>
              <span class="panel__description">${this.description}</span>
            </div>
            ${hasActionSlot ? html`
              <slot name="actions" class="panel__header__actions"></slot>
            ` : null}
          </div>
        ` : null}

        <div class="panel__body">
          <slot></slot>
        </div>

        ${hasFooterSlot ? html`
          <slot name="footer" class="panel__footer"></slot>` : null}
      </div>`;
  }
}
