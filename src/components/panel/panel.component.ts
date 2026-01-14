import '../../events/zn-sidebar-toggle';
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

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'actions', 'footer', 'side');

  @property({attribute: 'basis-px', type: Number}) basis: number;
  @property() caption: string;
  @property() icon: string;
  @property() description: string;
  @property({type: Boolean}) tabbed: boolean;
  @property({attribute: 'header-underline', type: Boolean}) underlineHeader: boolean;
  @property({type: Boolean}) cosmic: boolean;
  @property({type: Boolean}) flush: boolean;
  @property({attribute: 'flush-x', type: Boolean}) flushX: boolean;
  @property({attribute: 'flush-y', type: Boolean}) flushY: boolean;
  @property({attribute: 'flush-footer', type: Boolean}) flushFooter: boolean;
  @property({type: Boolean}) transparent: boolean;
  @property({type: Boolean}) shadow: boolean;

  @property({attribute: 'sidebar-position'}) sidebarPosition: 'left' | 'right' = 'left';
  @property({attribute: 'sidebar-tooltip'}) sidebarTooltip: string;
  @property({attribute: 'sidebar-icon'}) sidebarIcon: string;
  @property({attribute: 'sidebar-open', type: Boolean, reflect: true}) sidebarOpen: boolean = true;
  @property({attribute: 'enable-sidebar-toggle', type: Boolean}) enableSidebarToggle: boolean = false;

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

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
    this.emit('zn-sidebar-toggle', {detail: {element: this, open: this.sidebarOpen}});
  }

  protected render(): unknown {
    const hasActionSlot = this.hasSlotController.test('actions');
    const hasFooterSlot = this.hasSlotController.test('footer');
    const hasHeader = this.caption || hasActionSlot || this.enableSidebarToggle;

    return html`
      <div class="${classMap({
        panel: true,
        'panel--flush': this.flush || this.tabbed,
        'panel--flush-x': this.flushX,
        'panel--flush-y': this.flushY,
        'panel--flush-footer': this.flushFooter,
        'panel--tabbed': this.tabbed,
        'panel--transparent': this.transparent,
        'panel--has-actions': hasActionSlot || this.enableSidebarToggle,
        'panel--has-footer': hasFooterSlot,
        'panel--has-header': hasHeader,
        'panel--cosmic': this.cosmic,
        'panel--shadow': this.shadow,
        'panel--has-sidebar': this.hasSlotController.test('side'),
        'panel--sidebar-right': this.sidebarPosition === 'right',
        'panel--sidebar-collapsed': !this.sidebarOpen
      })}">

        <div class="panel__inner">
          ${hasHeader ? html`
            <zn-header class="${classMap({
              "panel__header": true,
              "panel__header--underline": this.underlineHeader,
            })}"
                       icon="${this.icon}"
                       caption="${this.caption}"
                       description="${ifDefined(this.description)}"
                       transparent>
              ${hasActionSlot ? html`
                <slot name="actions" slot="actions" class="panel__header__actions"></slot>` : null}
              ${this.enableSidebarToggle ? html`
                <zn-button color="transparent"
                           size="x-small"
                           icon="${this.sidebarIcon || 'menu'}"
                           icon-size="24"
                           slot="actions"
                           tooltip="${this.sidebarTooltip || 'Toggle Sidebar'}"
                           @click="${this.toggleSidebar}"></zn-icon>` : null}
            </zn-header>` : null}

          <div class="panel__content">
            <div class="panel__sidebar">
              <div class="panel__sidebar-inner">
                <slot name="side"></slot>
              </div>
            </div>
            <div class="panel__body">
              <slot></slot>
            </div>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>`;
  }
}
