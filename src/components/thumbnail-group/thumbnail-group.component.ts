import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type {ZnSelectEvent} from "../../events/zn-select";
import type ZnThumbnail from "../thumbnail";

import styles from './thumbnail-group.scss';

/**
 * @summary Lays a set of `zn-thumbnail` elements out as a single scrollable row, with a
 * "Show All" toggle that expands them into a wrapping grid.
 * @documentation https://zinc.style/components/thumbnail-group
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-thumbnail
 *
 * @event zn-expand - Emitted when the group expands into the full grid.
 * @event zn-collapse - Emitted when the group collapses back to a single row.
 * @event zn-change - Emitted when the selected thumbnail changes (`selectable` groups only).
 *
 * @slot - One or more `zn-thumbnail` elements.
 * @slot caption - Replaces the heading text.
 * @slot actions - Extra content in the header, before the toggle.
 *
 * @csspart base - The component's base wrapper.
 * @csspart header - The header row holding the caption and toggle.
 * @csspart caption - The heading text.
 * @csspart toggle - The show all / show less button.
 * @csspart items - The scrolling row / expanded grid that holds the thumbnails.
 *
 * @cssproperty --zn-thumbnail-width - Track width of a thumbnail. Defaults to 180px. Also settable
 *  with the `thumbnail-width` attribute.
 * @cssproperty --zn-thumbnail-gap - Gap between thumbnails. Also settable with the `gap` attribute.
 * @cssproperty --zn-thumbnail-aspect-ratio - Aspect ratio of every thumbnail in the group. Also
 *  settable with the `aspect-ratio` attribute. Any `zn-thumbnail` custom property set here is
 *  inherited by the slotted thumbnails.
 */
export default class ZnThumbnailGroup extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  /** The heading shown at the top left of the group. */
  @property() caption: string = '';

  /** Expands the group into the full wrapping grid. */
  @property({type: Boolean, reflect: true}) expanded: boolean = false;

  /**
   * Total number of thumbnails in the underlying set, shown in the "Show All (n)" label. Set this when
   * the row only holds the first page of a larger set; otherwise the slotted thumbnails are counted.
   */
  @property({type: Number}) total: number = 0;

  /** Label of the expand toggle. The count is appended in brackets. */
  @property({attribute: 'show-all-label'}) showAllLabel: string = 'Show All';

  /** Label of the collapse toggle. */
  @property({attribute: 'show-less-label'}) showLessLabel: string = 'Show Less';

  /** Never render the toggle, even when the row overflows. */
  @property({type: Boolean, attribute: 'hide-toggle'}) hideToggle: boolean = false;

  /** Always render the toggle, even when every thumbnail already fits on the row. */
  @property({type: Boolean, attribute: 'always-toggle'}) alwaysToggle: boolean = false;

  /** Manages single selection across the slotted thumbnails. */
  @property({type: Boolean, reflect: true}) selectable: boolean = false;

  /**
   * Aspect ratio for every thumbnail in the group, as any CSS `aspect-ratio` value (e.g. `1 / 1`).
   * Shorthand for setting `--zn-thumbnail-aspect-ratio` on the group. A thumbnail's own
   * `aspect-ratio` attribute still wins.
   */
  @property({attribute: 'aspect-ratio', reflect: true}) aspectRatio: string = '';

  /** Track width of each thumbnail (e.g. `140px`). Shorthand for `--zn-thumbnail-width`. */
  @property({attribute: 'thumbnail-width', reflect: true}) thumbnailWidth: string = '';

  /** Gap between thumbnails (e.g. `8px`). Shorthand for `--zn-thumbnail-gap`. */
  @property({reflect: true}) gap: string = '';

  /** The `value` of the selected thumbnail (`selectable` groups only). */
  @property() value: string = '';

  @state() private _overflowing: boolean = false;

  @state() private _count: number = 0;

  @query('.thumbnail-group__items') private _items: HTMLElement;

  private _resizeObserver: ResizeObserver | null = null;

  connectedCallback() {
    super.connectedCallback();
    // Re-observe on reconnect — `firstUpdated` only runs once, so it can't do this on its own.
    this._observe();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._resizeObserver?.disconnect();
    this._resizeObserver = null;
  }

  protected firstUpdated(changed: PropertyValues) {
    super.firstUpdated(changed);
    this._observe();
    this._sync();
  }

  private _observe() {
    if (!this._items) return;
    this._resizeObserver ??= new ResizeObserver(() => this._measure());
    this._resizeObserver.observe(this._items);
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);

    // Toggling `expanded` swaps the items container between nowrap and wrap. That changes
    // scrollWidth without changing the element's box, so the ResizeObserver never fires and
    // the overflow state has to be re-read by hand.
    if (changed.has('expanded')) {
      this._measure();
    }

    if (changed.has('selectable') || changed.has('value')) {
      this._sync();
    }

    this._syncCustomProperties(changed);
  }

  /**
   * Mirrors the shorthand attributes onto host custom properties. They go on the host rather than
   * anywhere in the shadow root because the thumbnails are light-DOM children — inheriting from the
   * host is the only way the values reach them.
   */
  private _syncCustomProperties(changed: PropertyValues) {
    const bindings: [string, string, string][] = [
      ['aspectRatio', '--zn-thumbnail-aspect-ratio', this.aspectRatio],
      ['thumbnailWidth', '--zn-thumbnail-width', this.thumbnailWidth],
      ['gap', '--zn-thumbnail-gap', this.gap]
    ];

    for (const [name, customProperty, value] of bindings) {
      if (!changed.has(name)) continue;

      if (value) {
        this.style.setProperty(customProperty, value);
      } else if (changed.get(name)) {
        // Only clear a property this component previously set, so an inline custom property in
        // the consumer's markup survives the first render.
        this.style.removeProperty(customProperty);
      }
    }
  }

  /** Expands the group into the full grid. */
  show() {
    if (this.expanded) return;
    this.expanded = true;
    this.emit('zn-expand');
  }

  /** Collapses the group back to a single row. */
  hide() {
    if (!this.expanded) return;
    this.expanded = false;
    this.emit('zn-collapse');
  }

  private get _thumbnails(): ZnThumbnail[] {
    return Array.from(this.querySelectorAll<ZnThumbnail>(':scope > zn-thumbnail'));
  }

  private _handleSlotChange = () => {
    this._sync();
    this._measure();
  };

  // Publish the child count for the toggle label and mirror the group's selection
  // settings onto the thumbnails.
  private _sync() {
    const thumbnails = this._thumbnails;
    this._count = thumbnails.length;

    if (!this.selectable) return;

    // Adopt a thumbnail that was marked selected in markup so `value` starts in step.
    if (!this.value) {
      this.value = thumbnails.find(thumbnail => thumbnail.selected)?.value ?? '';
    }

    for (const thumbnail of thumbnails) {
      thumbnail.selectable = true;
      if (this.value) {
        thumbnail.selected = thumbnail.value === this.value;
      }
    }
  }

  private _measure() {
    // Only the collapsed row can overflow horizontally; the expanded grid always wraps, so
    // measuring it would clear the state that decides whether the toggle is offered at all.
    if (this.expanded || !this._items) return;
    this._overflowing = this._items.scrollWidth - this._items.clientWidth > 1;
  }

  private _handleSelect = (event: ZnSelectEvent) => {
    if (!this.selectable) return;

    const thumbnail = event.detail.item as ZnThumbnail;
    if (thumbnail.parentElement !== this) return;

    for (const item of this._thumbnails) {
      item.selected = item === thumbnail;
    }

    this.value = thumbnail.value;
    this.emit('zn-change');
  };

  private _handleToggle = () => {
    if (this.expanded) {
      this.hide();
    } else {
      this.show();
    }
  };

  render() {
    const count = this.total || this._count;
    const showToggle = !this.hideToggle && (this.expanded || this.alwaysToggle || this._overflowing || count > this._count);
    const hasHeader = Boolean(this.caption) || showToggle;

    return html`
      <div
        part="base"
        class="${classMap({
          'thumbnail-group': true,
          'thumbnail-group--expanded': this.expanded,
        })}">
        ${hasHeader ? html`
          <div part="header" class="thumbnail-group__header">
            <div part="caption" class="thumbnail-group__caption">
              <slot name="caption">${this.caption}</slot>
            </div>
            <div class="thumbnail-group__header-actions">
              <slot name="actions"></slot>
              ${showToggle ? html`
                <button
                  part="toggle"
                  type="button"
                  class="thumbnail-group__toggle"
                  aria-expanded="${this.expanded ? 'true' : 'false'}"
                  @click="${this._handleToggle}">
                  ${this.expanded ? this.showLessLabel : `${this.showAllLabel}${count ? ` (${count})` : ''}`}
                </button>` : ''}
            </div>
          </div>` : ''}
        <div part="items" class="thumbnail-group__items">
          <slot @slotchange="${this._handleSlotChange}" @zn-select="${this._handleSelect}"></slot>
        </div>
      </div>`;
  }
}
