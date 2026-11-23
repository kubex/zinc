import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnSkeleton from '../skeleton';

import styles from './message-item.scss';

/**
 * @summary A row in a message list, such as an inbox: who it's from, when, a subject and a preview of the latest message.
 * @documentation https://zinc.style/components/message-item
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-skeleton
 *
 * @slot avatar - An image or avatar shown at the start of the row.
 *
 * @csspart base - The component's base wrapper.
 * @csspart caption - Who the message is from, cut off with an ellipsis.
 * @csspart meta - The time or other detail at the end of the first line.
 * @csspart subject - The subject line.
 * @csspart preview - The preview of the latest message.
 *
 * @cssproperty --zn-message-item-padding - The row's padding.
 */
export default class ZnMessageItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-skeleton': ZnSkeleton};

  /** Who the message is from. */
  @property() caption = '';

  /** A short detail at the end of the first line, such as how long ago the message arrived. */
  @property() meta = '';

  /** A longer form of `meta`, shown on hover, such as the full date. */
  @property({attribute: 'meta-title'}) metaTitle = '';

  /** Draws `meta` in the error colour, such as for a missed deadline. */
  @property({attribute: 'meta-alert', type: Boolean, reflect: true}) metaAlert = false;

  @property() subject = '';

  /** One line of the latest message. */
  @property() preview = '';

  /** A coloured stripe at the start of the row, marking the message's state. */
  @property({reflect: true}) accent: 'primary' | 'warning' | 'error' | 'success' | 'grey' | '' = '';

  /** Draws the caption and subject bold, for a message nobody has read. */
  @property({type: Boolean, reflect: true}) unread = false;

  /** Draws a placeholder in the row's shape, such as while more rows load. */
  @property({type: Boolean, reflect: true}) loading = false;

  private readonly _classObserver = new MutationObserver(() => this._syncSelected());

  connectedCallback() {
    super.connectedCallback();
    if (!this.loading) {
      this.setAttribute('role', 'tab');
      if (!this.hasAttribute('tabindex')) {
        this.tabIndex = -1;
      }
    }
    this.addEventListener('keydown', this._handleKeyDown);
    // zn-tabs marks the open row with a class rather than an attribute
    this._classObserver.observe(this, {attributes: true, attributeFilter: ['class']});
    this._syncSelected();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('keydown', this._handleKeyDown);
    this._classObserver.disconnect();
  }

  /** Whether zn-tabs has this row's panel open. */
  get selected() {
    return this.classList.contains('zn-tb-active');
  }

  private _syncSelected() {
    if (this.loading) return;
    this.setAttribute('aria-selected', String(this.selected));
  }

  private _handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.click();
    }
  };

  render() {
    if (this.loading) {
      // Each bar sits on its line's own height, so loaded rows take the placeholder's place without shifting
      return html`
        <div part="base" class="message-item message-item--loading" aria-hidden="true">
          <zn-skeleton class="message-item__avatar" width="22px" height="22px" radius="50%"></zn-skeleton>
          <div class="message-item__body">
            <div class="message-item__line">
              <zn-skeleton class="message-item__bar message-item__bar--caption" height="10px"></zn-skeleton>
              <zn-skeleton width="28px" height="8px"></zn-skeleton>
            </div>
            <div class="message-item__line">
              <zn-skeleton class="message-item__bar message-item__bar--subject" height="10px"></zn-skeleton>
            </div>
            <div class="message-item__line message-item__line--preview">
              <zn-skeleton class="message-item__bar message-item__bar--preview" height="8px"></zn-skeleton>
            </div>
          </div>
        </div>`;
    }

    return html`
      <div part="base" class="message-item">
        <span class="message-item__avatar"><slot name="avatar"></slot></span>
        <div class="message-item__body">
          <div class="message-item__line">
            <span part="caption" class="message-item__caption">${this.caption}</span>
            ${this.meta
              ? html`<span part="meta" class="message-item__meta" title=${this.metaTitle || this.meta}>${this.meta}</span>`
              : ''}
          </div>
          <div part="subject" class="message-item__subject">${this.subject}</div>
          <div part="preview" class="message-item__preview">${this.preview}</div>
        </div>
      </div>
    `;
  }
}
