import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, query} from 'lit/decorators.js';
import {waitForEvent} from "../../internal/event";
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import type Popup from "../popup";

import styles from './tooltip.scss';

/**
 * @summary The Tooltip component is used to display additional information when a user hovers over or clicks
 * on an element.
 *
 * @documentation https://zinc.style/components/tooltip
 * @status experimental
 * @since 1.0
 *
 * @event zn-show - Emitted when the tooltip is shown.
 * @event zn-after-show - Emitted after the tooltip is shown.
 * @event zn-hide - Emitted when the tooltip is hidden.
 * @event zn-after-hide - Emitted after the tooltip is hidden.
 *
 * @slot - The content of the tooltip
 * @slot anchor - The anchor the tooltip is attached to.
 */
export default class ZnTooltip extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private hoverTimeout: number;
  private closeWatcher: CloseWatcher | null;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.tooltip__body') body: HTMLElement;
  @query('zn-popup') popup: Popup;

  @property() content = '';

  @property() placement: | 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' | 'right-end' | 'bottom' |
    'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' = 'top';

  @property({type: Boolean, reflect: true}) disabled = false;

  @property({type: Number}) distance = 4;

  @property({type: Boolean, reflect: true}) open = false;

  @property({type: Number}) skidding = 0;

  @property() trigger = 'hover focus';

  @property({type: Boolean}) hoist = true;

  constructor() {
    super();
    this.addEventListener('blur', this.handleBlur, true);
    this.addEventListener('focus', this.handleFocus, true);
    this.addEventListener('click', this.handleClick);
    this.addEventListener('mouseover', this.handleMouseOver);
    this.addEventListener('mouseout', this.handleMouseOut);
  }

  disconnectedCallback() {
    this.closeWatcher?.destroy();
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.body.hidden = !this.open;

    if (this.open) {
      this.popup.active = true;
      this.popup.reposition();
    }

    super.firstUpdated(_changedProperties);
  }

  private hasTrigger(triggerType: string) {
    const triggers = this.trigger.split(' ');
    return triggers.includes(triggerType);
  }

  private handleBlur = () => {
    if (this.hasTrigger('focus')) {
      this.hide();
    }
  };

  private handleClick = () => {
    if (this.hasTrigger('click')) {
      if (this.open) {
        this.hide()
      }
      this.show();
    }
  };

  private handleFocus = () => {
    if (this.hasTrigger('focus')) {
      this.show();
    }
  };

  private handleDocumentKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      this.hide();
    }
  };

  private handleMouseOver() {
    if (this.hasTrigger('hover')) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.show(), 0);
    }
  }

  private handleMouseOut() {
    if (this.hasTrigger('hover')) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = window.setTimeout(() => this.hide(), 0);
    }
  }

  @watch('open', {waitUntilFirstUpdate: true})
  handleOpenChange() {
    if (this.open) {
      if (this.disabled) {
        return;
      }

      this.emit('zn-show');
      if ('CloseWatcher' in window) {
        this.closeWatcher?.destroy();
        this.closeWatcher = new CloseWatcher();
        this.closeWatcher.onclose = () => {
          this.hide();
        };
      } else {
        document.addEventListener('keydown', this.handleDocumentKeyDown);
      }
      this.body.hidden = false;
      this.popup.active = true;
      this.popup.reposition();
      this.emit('zn-after-show');
    } else {
      this.emit('zn-hide');
      this.popup.active = false;
      this.body.hidden = true;
      this.emit('zn-after-hide');
    }
  }

  @watch(['content', 'distance', 'hoist', 'placement', 'skidding'])
  async handleOptionsChange() {
    if (this.hasUpdated) {
      await this.updateComplete;
      this.popup.reposition();
    }
  }

  @watch('disabled')
  handleDisabledChange() {
    if (this.disabled && this.open) {
      this.hide();
    }
  }


  async show() {
    if (this.open) {
      return undefined;
    }

    this.open = true;
    return waitForEvent(this, 'zn-after-show');
  }

  hide() {
    if (!this.open) {
      return;
    }

    this.open = false;
    waitForEvent(this, 'zn-after-hide');
  }

  render() {
    return html`
      <zn-popup
        part="base"
        exportparts="popup:base__popup,arrow:base__arrow"
        class="${classMap({
          tooltip: true,
          'tooltip--open': this.open
        })}"
        placement="${this.placement}"
        distance="${this.distance}"
        skidding="${this.skidding}"
        strategy="${this.hoist ? 'fixed' : 'absolute'}"
        flip
        shift
        arrow
        hover-bridge>
        <slot slot="anchor"></slot>
        <div part="body" id="tooltip" class="tooltip__body"
             role="tooltip"
             aria-live="${this.open ? 'polite' : 'off'}"
             aria-label="tooltip">
          <slot name="content">${this.content}</slot>
        </div>
      </zn-popup>`;
  }
}
