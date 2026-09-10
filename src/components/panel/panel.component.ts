import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {property, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';

import styles from './panel.scss';

/**
 * @summary Panels are versatile containers that provide structure for organizing content with optional headers and footers.
 * @documentation https://zinc.style/components/panel
 * @status experimental
 * @since 1.0
 *
 * @slot - The panel's main content.
 * @slot actions - Actions displayed in the panel header (buttons, chips, etc).
 * @slot footer - Content displayed in the panel footer.
 *
 * @csspart base - The component's base wrapper.
 * @csspart header - The header region, when a caption or actions are given.
 * @csspart header-content - The padded row inside the header, forwarded from zn-header.
 * @csspart footer - The footer region, when the footer slot is filled.
 *
 * @cssproperty --zn-panel-basis - The flex-basis of the panel. Can be set using the basis-px attribute.
 * @cssproperty --zn-panel-header-padding - Padding around the header row. Defaults to `--zn-base-gap`.
 * @cssproperty --zn-panel-footer-padding - Padding around the footer row.
 */
export default class ZnPanel extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'actions', 'footer');

  @property({attribute: 'basis-px', type: Number}) basis: number;
  @property() caption: string;
  @property() icon: string;
  @property({type: Boolean}) tabbed: boolean;
  @property({attribute: 'header-borderless', type: Boolean}) headerBorderless: boolean;
  @property({type: Boolean}) cosmic: boolean;
  @property({type: Boolean}) flush: boolean;
  @property({attribute: 'flush-x', type: Boolean}) flushX: boolean;
  @property({attribute: 'flush-y', type: Boolean}) flushY: boolean;
  @property({attribute: 'flush-footer', type: Boolean}) flushFooter: boolean;
  @property({type: Boolean}) transparent: boolean;
  @property({type: Boolean}) shadow: boolean;

  @state() private bodyEmpty = false;

  private resizeObserver: ResizeObserver | null = null;

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.observeBodyContent();
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
    if (this.hasUpdated) {
      this.observeBodyContent();
    }

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

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }

  private get bodySlot(): HTMLSlotElement | null {
    return this.renderRoot?.querySelector('.panel__body > slot') ?? null;
  }

  // Slotted content can grow without the body's own box changing, so the observers go on the
  // slotted elements rather than the body.
  private observeBodyContent() {
    const slot = this.bodySlot;
    if (!slot) return;

    this.resizeObserver ??= new ResizeObserver(() => this.measureBodyContent());
    this.resizeObserver.disconnect();
    slot.assignedElements({flatten: true}).forEach(el => this.resizeObserver!.observe(el));
    this.measureBodyContent();
  }

  private measureBodyContent() {
    const nodes = this.bodySlot?.assignedNodes({flatten: true}) ?? [];
    this.bodyEmpty = !nodes.some(node => node.nodeType === Node.TEXT_NODE
      ? node.textContent!.trim() !== ''
      : (node as Element).getBoundingClientRect().height > 0);
  }

  protected render(): unknown {
    const hasActionSlot = this.hasSlotController.test('actions');
    const hasFooterSlot = this.hasSlotController.test('footer');
    const hasHeader = this.caption || hasActionSlot;
    const isBodyEmpty = !this.hasSlotController.test('[default]') || this.bodyEmpty;
    const isFlushY = this.flush || this.tabbed || this.flushY;
    const underlineHeader = !this.headerBorderless && !(this.transparent && isFlushY) && !isBodyEmpty;

    return html`
      <div class="${classMap({
        panel: true,
        'panel--flush': this.flush || this.tabbed,
        'panel--flush-x': this.flushX,
        'panel--flush-y': this.flushY,
        'panel--flush-footer': this.flushFooter,
        'panel--tabbed': this.tabbed,
        'panel--transparent': this.transparent,
        'panel--has-actions': hasActionSlot,
        'panel--has-footer': hasFooterSlot,
        'panel--empty': isBodyEmpty,
        'panel--has-header': hasHeader,
        'panel--borderless-header': this.headerBorderless,
        'panel--cosmic': this.cosmic,
        'panel--shadow': this.shadow,
      })}">

        <div class="panel__inner">
          ${hasHeader ? html`
            <zn-header part="header"
                       exportparts="content:header-content"
                       class="${classMap({
                         "panel__header": true,
                         "panel__header--underline": underlineHeader,
                       })}"
                       icon="${this.icon}"
                       caption="${this.caption}"
                       transparent>
              ${hasActionSlot ? html`
                <slot name="actions" slot="actions" class="panel__header__actions"></slot>` : null}
            </zn-header>` : null}

          <div class="panel__content">
            <div class="panel__body">
              <slot @slotchange="${this.observeBodyContent}"></slot>
            </div>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" part="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>`;
  }
}
