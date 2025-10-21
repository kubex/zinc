import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './panel.scss';

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

  @property({attribute: 'basis-px', type: Number}) basis: number;
  @property() caption: string;
  @property() icon: string;
  @property() description: string;
  @property({type: Boolean}) tabbed: boolean;
  @property({type: Boolean}) cosmic: boolean;
  @property({type: Boolean}) flush: boolean;
  @property({attribute: 'flush-x', type: Boolean}) flushX: boolean;
  @property({attribute: 'flush-y', type: Boolean}) flushY: boolean;
  @property({attribute: 'flush-footer', type: Boolean}) flushFooter: boolean;
  @property({type: Boolean}) transparent: boolean;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    if (this.basis) {
      this.style.setProperty('--zn-panel-basis', this.basis.toString() + 'px');
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

  connectedCallback() {
    super.connectedCallback();
    if (window.CSS.registerProperty) {
      try {
        window.CSS.registerProperty({
          inherits: false,
          initialValue: '0deg',
          name: '--rotate',
          syntax: '<angle>',
        });
      } catch (e) {
        // do nothing
      }
    }
  }

  protected render(): unknown {
    const hasActionSlot = this.hasSlotController.test('actions');
    const hasFooterSlot = this.hasSlotController.test('footer');
    const hasHeader = this.caption || hasActionSlot;

    return html`
      <div part="base" class="${classMap({
        panel: true,
        'panel--flush': this.flush || this.tabbed,
        'panel--flush-x': this.flushX,
        'panel--flush-y': this.flushY,
        'panel--flush-footer': this.flushFooter,
        'panel--tabbed': this.tabbed,
        'panel--transparent': this.transparent,
        'panel--has-actions': hasActionSlot,
        'panel--has-footer': hasFooterSlot,
        'panel--has-header': hasHeader,
        'panel--cosmic': this.cosmic
      })}">

        <div class="panel__inner">
          ${hasHeader ? html`
            <zn-header class="panel__header"
                       icon="${this.icon}"
                       caption="${this.caption}"
                       description="${ifDefined(this.description)}"
                       transparent>
              ${hasActionSlot ? html`
                <slot name="actions" slot="actions" class="panel__header__actions"></slot>` : null}
            </zn-header>` : null}

          <div class="panel__body">
            <slot></slot>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>`;
  }
}
