import {animateTo, prefersReducedMotion} from "../../internal/animate";
import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {HasSlotController} from "../../internal/slot";
import {html, literal} from "lit/static-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import {lockBodyScrolling, unlockBodyScrolling} from "../../internal/scroll";
import {property, query, state} from 'lit/decorators.js';
import {styleMap} from "lit/directives/style-map.js";
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";

import styles from './thumbnail.scss';

const PREVIEW_DURATION = 260;
const PREVIEW_EASING = 'cubic-bezier(0.2, 0, 0.2, 1)';

/**
 * @summary A captioned image tile — a fixed aspect-ratio preview with a title beneath it, optional
 * corner badges and actions, and an optional full-screen preview that grows out of the thumbnail.
 * @documentation https://zinc.style/components/thumbnail
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @event zn-select - Emitted when an enabled thumbnail is activated by click or keyboard. Cancelable —
 *  call `preventDefault()` to stop the preview from opening and to stop a parent
 *  `zn-thumbnail-group` from changing its selection.
 * @event zn-show - Emitted when the preview overlay starts opening.
 * @event zn-close - Emitted once the preview overlay has finished closing.
 *
 * @slot - Fallback content rendered in place of the media when no `src` is set.
 * @slot image - Replaces the built-in `<img>` (e.g. a video, canvas or `zn-icon`).
 * @slot caption - Replaces the caption text.
 * @slot badge - Content pinned to the bottom-left of the media (e.g. a play indicator). Badges take
 *  no pointer events and are held back on opacity, so they read as information about the asset
 *  rather than as something to click.
 * @slot actions - Controls pinned to the bottom-right of the media (e.g. a download button). Each
 *  slotted element becomes its own chip, so several actions read as separate icons on the thumbnail
 *  rather than one grouped pill. This sits outside the thumbnail's link, so buttons and links here
 *  behave normally and never select the thumbnail or follow its `href`.
 * @slot preview - Replaces the preview media (e.g. a `<video>` for the full-size asset).
 *
 * @csspart base - The component's base wrapper.
 * @csspart link - The anchor (or div) covering the media and caption.
 * @csspart media - The fixed aspect-ratio media frame.
 * @csspart image - The built-in image element.
 * @csspart overlay - The layer holding the badge, actions and preview button.
 * @csspart badge - The bottom-left badge container.
 * @csspart actions - The bottom-right actions container.
 * @csspart preview-button - The built-in preview trigger, when `preview-trigger="button"`.
 * @csspart caption - The caption beneath the media.
 * @csspart preview - The preview `<dialog>`.
 * @csspart preview-backdrop - The full-screen backdrop behind the preview.
 * @csspart preview-frame - The rounded panel the preview media sits in.
 * @csspart preview-image - The full-size image inside the preview.
 * @csspart preview-close - The preview's close button.
 *
 * @cssproperty --zn-thumbnail-aspect-ratio - Aspect ratio of the media frame. Defaults to 16 / 9. The
 *  `aspect-ratio` attribute sets this on the thumbnail itself; set the property on any ancestor
 *  (including a `zn-thumbnail-group`) to apply it to every thumbnail beneath it.
 * @cssproperty --zn-thumbnail-radius - Corner radius of the media frame.
 * @cssproperty --zn-thumbnail-preview-aspect-ratio - Overrides the measured aspect ratio of the preview
 *  panel. By default the panel takes the asset's own ratio so it wraps the image exactly.
 * @cssproperty --zn-thumbnail-preview-max-width - Largest width the preview may take. Defaults to 70vw.
 * @cssproperty --zn-thumbnail-preview-max-height - Largest height the preview may take. Defaults to 70vh.
 * @cssproperty --zn-thumbnail-preview-radius - Corner radius of the preview panel.
 * @cssproperty --zn-thumbnail-chip-radius - Corner radius of a badge, action or preview chip.
 * @cssproperty --zn-thumbnail-chip-background - Background of a badge, action or preview chip.
 * @cssproperty --zn-thumbnail-chip-background-hover - Hover background of an action or preview chip.
 * @cssproperty --zn-thumbnail-chip-color - Foreground colour of a badge, action or preview chip.
 * @cssproperty --zn-thumbnail-chip-gap - Gap between adjacent chips.
 * @cssproperty --zn-thumbnail-badge-opacity - Opacity of a badge, holding it back from the action
 *  chips beside it. Defaults to 0.65.
 * @cssproperty --zn-thumbnail-selected-color - Ring colour for the selected state.
 * @cssproperty --zn-thumbnail-active-color - Ring colour for the active state.
 */
export default class ZnThumbnail extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-icon': ZnIcon};

  private readonly hasSlotController = new HasSlotController(this, '[default]', 'image', 'caption', 'badge', 'actions', 'preview');

  /** Image URL for the built-in `<img>`. */
  @property() src: string;

  /** Alternative text for the built-in image. Falls back to the caption. */
  @property() alt: string;

  /** The title shown beneath the media. */
  @property() caption: string = '';

  /**
   * Aspect ratio of the media frame, as any CSS `aspect-ratio` value (e.g. `1 / 1`, `4 / 3`).
   * Takes precedence over an inherited `--zn-thumbnail-aspect-ratio`. Defaults to `16 / 9`.
   */
  @property({attribute: 'aspect-ratio', reflect: true}) aspectRatio: string = '';

  /** Renders the thumbnail as a link to this URL. */
  @property() href: string;

  /** Where to open `href` (e.g. `_blank`). */
  @property() target: string;

  /**
   * URL of the full-size asset. Setting this enables the preview overlay, which grows out of the
   * thumbnail's position over a full-screen backdrop.
   */
  @property({attribute: 'full-uri'}) fullUri: string = '';

  /**
   * How the preview opens. `click` (the default) opens it when the thumbnail is activated; `button`
   * adds a dedicated expand control to the media instead, leaving clicks for selection or the link.
   */
  @property({attribute: 'preview-trigger'}) previewTrigger: 'click' | 'button' = 'click';

  /** Accessible label for the built-in preview trigger and the preview overlay. */
  @property({attribute: 'preview-label'}) previewLabel: string = 'Preview';

  /** Identifier reported in the `zn-select` event detail and used for group selection. */
  @property() value: string = '';

  /** Draws the selected ring. Managed automatically inside a `selectable` `zn-thumbnail-group`. */
  @property({type: Boolean, reflect: true}) selected: boolean = false;

  /**
   * Draws the active ring — for the thumbnail currently in use (playing, open, being edited), as
   * distinct from the user's selection. Takes the ring colour when a thumbnail is both active and
   * selected. Recolour it with `--zn-thumbnail-active-color`.
   */
  @property({type: Boolean, reflect: true}) active: boolean = false;

  /** Set by `zn-thumbnail-group` when it manages selection, so the thumbnail reads as clickable. */
  @property({type: Boolean, reflect: true}) selectable: boolean = false;

  /** Dims the thumbnail and blocks selection, navigation and preview. */
  @property({type: Boolean, reflect: true}) disabled: boolean = false;

  /** Icon rendered in the bottom-left badge when the `badge` slot is empty. */
  @property() icon: string = '';

  /** Hides the caption row, leaving just the media frame. */
  @property({type: Boolean, attribute: 'hide-caption'}) hideCaption: boolean = false;

  @state() private _previewOpen: boolean = false;

  /** Aspect ratio (width / height) measured from the asset, so the preview wraps it exactly. */
  @state() private _previewRatio: number = 0;

  @query('.thumbnail__media') private _media: HTMLElement;
  @query('.thumbnail__image') private _image: HTMLImageElement;
  @query('.thumbnail__preview-image') private _previewImage: HTMLImageElement;
  @query('.thumbnail__preview') private _preview: HTMLDialogElement;
  @query('.thumbnail__preview-frame') private _previewFrame: HTMLElement;
  @query('.thumbnail__preview-backdrop') private _previewBackdrop: HTMLElement;
  @query('.thumbnail__preview-close') private _previewClose: HTMLElement;

  /** The media rect captured when the preview opened, so the grow animation starts from the thumbnail. */
  private _origin: DOMRect | null = null;
  private _animating: boolean = false;

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._previewOpen) {
      this._preview?.close();
      this._previewOpen = false;
    }
    unlockBodyScrolling(this);
  }

  private _isLink() {
    return Boolean(this.href) && !this.disabled;
  }

  private get _previewable() {
    return (Boolean(this.fullUri) || this.hasSlotController.test('preview')) && !this.disabled;
  }

  /** True when activating the thumbnail itself should open the preview. */
  private get _previewOnActivate() {
    return this._previewable && this.previewTrigger === 'click';
  }

  /**
   * The asset's real aspect ratio, so the preview panel wraps the image instead of letterboxing it
   * inside a fixed-ratio box. The full-size image is preferred, but it usually hasn't loaded when
   * the preview opens — the already-loaded thumbnail shares the asset's ratio, and the rendered
   * media box is the last resort for slotted media that can't be measured.
   */
  private _resolveRatio(): number {
    const candidates = [this._previewImage, this._image];

    for (const image of candidates) {
      if (image?.naturalWidth && image.naturalHeight) {
        return image.naturalWidth / image.naturalHeight;
      }
    }

    const rect = this._media?.getBoundingClientRect();
    return rect?.width && rect.height ? rect.width / rect.height : 0;
  }

  /** Opens the preview overlay. */
  async showPreview() {
    if (!this._previewable || this._previewOpen || this._animating) return;

    // Captured before the dialog opens, while the thumbnail is still where the user clicked.
    this._origin = this._media?.getBoundingClientRect() ?? null;
    // Resolved before the first paint so the panel is already the right size to animate to.
    this._previewRatio = this._resolveRatio();

    this.emit('zn-show');
    this._previewOpen = true;
    await this.updateComplete;

    if (!this._preview) return;
    this._preview.showModal();
    lockBodyScrolling(this);

    await this._animatePreview('in');
    this._previewClose?.focus();
  }

  /** Closes the preview overlay. */
  async hidePreview() {
    if (!this._previewOpen || this._animating) return;

    await this._animatePreview('out');

    this._preview?.close();
    this._previewOpen = false;
    unlockBodyScrolling(this);
    this.emit('zn-close');
  }

  private async _animatePreview(direction: 'in' | 'out') {
    const frame = this._previewFrame;
    const backdrop = this._previewBackdrop;
    if (!frame || !backdrop) return;

    this._animating = true;

    // On the way out the thumbnail is re-measured: the row may have been scrolled, or the
    // window resized, while the preview was open.
    const origin = direction === 'in' ? this._origin : (this._media?.getBoundingClientRect() ?? this._origin);
    const collapsed = [
      {transform: this._collapsedTransform(origin, frame.getBoundingClientRect()), opacity: '0.4'},
      {transform: 'none', opacity: '1'}
    ];
    const fade = [{opacity: '0'}, {opacity: '1'}];

    const options: KeyframeAnimationOptions = {duration: PREVIEW_DURATION, easing: PREVIEW_EASING};
    const frameKeyframes = direction === 'in' ? collapsed : [...collapsed].reverse();
    const backdropKeyframes = direction === 'in' ? fade : [...fade].reverse();

    await Promise.all([
      animateTo(frame, frameKeyframes, options),
      animateTo(backdrop, backdropKeyframes, options)
    ]);

    this._animating = false;
  }

  /** Maps the preview panel onto the thumbnail's box, so the panel appears to grow out of it. */
  private _collapsedTransform(from: DOMRect | null, to: DOMRect) {
    if (!from || !to.width || !to.height || prefersReducedMotion()) {
      return 'scale(0.94)';
    }

    const scaleX = Math.max(from.width / to.width, 0.01);
    const scaleY = Math.max(from.height / to.height, 0.01);
    const x = from.left + from.width / 2 - (to.left + to.width / 2);
    const y = from.top + from.height / 2 - (to.top + to.height / 2);

    return `translate(${x}px, ${y}px) scale(${scaleX}, ${scaleY})`;
  }

  private _activate(event: Event, allowPreview: boolean) {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    const selectEvent = this.emit('zn-select', {detail: {item: this}});

    // A canceled selection also cancels navigation and the preview, so a consumer can intercept a
    // linked thumbnail without the browser leaving the page.
    if (selectEvent.defaultPrevented) {
      event.preventDefault();
      return;
    }

    if (allowPreview && this._previewOnActivate) {
      event.preventDefault();
      void this.showPreview();
    }
  }

  private _handleClick = (event: MouseEvent) => {
    // Modifier and middle clicks are left alone so a linked thumbnail can still be opened in a
    // new tab or window rather than being swallowed by the preview.
    const modified = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    this._activate(event, !modified);
  };

  private _handleKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    // A link already activates on Enter; only the space and non-link cases need synthesising.
    if (this._isLink() && event.key === 'Enter') return;
    event.preventDefault();
    this._activate(event, true);
  };

  private _handlePreviewButtonClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    void this.showPreview();
  };

  private _handlePreviewCancel = (event: Event) => {
    // Escape closes through hidePreview() so the shrink animation still runs.
    event.preventDefault();
    void this.hidePreview();
  };

  private _handleBackdropClick = () => void this.hidePreview();

  private _handlePreviewImageLoad = (event: Event) => {
    const image = event.target as HTMLImageElement;
    if (!image.naturalWidth || !image.naturalHeight) return;

    const ratio = image.naturalWidth / image.naturalHeight;
    // Only resize if the full asset genuinely differs from what the panel was sized against,
    // so the common case doesn't reflow the panel out from under the open animation.
    if (this._previewRatio && Math.abs(ratio - this._previewRatio) / this._previewRatio < 0.01) return;

    this._previewRatio = ratio;
  };

  render() {
    const isLink = this._isLink();
    const previewable = this._previewable;
    const showPreviewButton = previewable && this.previewTrigger === 'button';
    // Only links, selection targets and click-to-preview thumbnails take focus; a decorative
    // thumbnail stays out of the tab order.
    const interactive = isLink || this.selectable || this._previewOnActivate;
    const tag = isLink ? literal`a` : literal`div`;
    const hasImage = this.hasSlotController.test('image');
    const hasBadge = this.hasSlotController.test('badge') || Boolean(this.icon);
    const hasActions = this.hasSlotController.test('actions');
    const hasOverlay = hasBadge || hasActions || showPreviewButton;
    const hasCaption = !this.hideCaption && (Boolean(this.caption) || this.hasSlotController.test('caption'));

    return html`
      <div
        part="base"
        style="${styleMap({'--zn-thumbnail-aspect-ratio': this.aspectRatio || null})}"
        class="${classMap({
          thumbnail: true,
          'thumbnail--link': isLink,
          'thumbnail--interactive': interactive,
          'thumbnail--selected': this.selected,
          'thumbnail--active': this.active,
          'thumbnail--disabled': this.disabled,
        })}">
        <${tag}
          part="link"
          class="thumbnail__link"
          href="${ifDefined(isLink ? this.href : undefined)}"
          target="${ifDefined(isLink ? this.target : undefined)}"
          role="${ifDefined(!isLink && interactive ? 'button' : undefined)}"
          tabindex="${ifDefined(interactive ? (this.disabled ? '-1' : '0') : undefined)}"
          aria-disabled="${ifDefined(this.disabled ? 'true' : undefined)}"
          aria-pressed="${ifDefined(!isLink && this.selectable ? String(this.selected) : undefined)}"
          aria-current="${ifDefined(isLink && this.selected ? 'true' : undefined)}"
          @click="${this._handleClick}"
          @keydown="${this._handleKeyDown}">
          <div part="media" class="thumbnail__media">
            ${hasImage || !this.src ? html`
              <slot name="image" class="thumbnail__slotted-media">
                <slot class="thumbnail__slotted-media"></slot>
              </slot>` : html`
              <img
                part="image"
                class="thumbnail__image"
                src="${this.src}"
                alt="${this.alt ?? this.caption}"
                loading="lazy"
                decoding="async">`}
          </div>
          ${hasCaption ? html`
            <div part="caption" class="thumbnail__caption">
              <slot name="caption">${this.caption}</slot>
            </div>` : ''}
        </${tag}>

        ${hasOverlay ? html`
          <!-- Sits outside the link so slotted controls keep their own click behaviour. -->
          <div part="overlay" class="thumbnail__overlay">
            ${showPreviewButton ? html`
              <button
                part="preview-button"
                type="button"
                class="thumbnail__preview-button"
                aria-label="${this.previewLabel}"
                @click="${this._handlePreviewButtonClick}">
                <zn-icon src="fullscreen" size="16"></zn-icon>
              </button>` : ''}
            ${hasBadge ? html`
              <div part="badge" class="thumbnail__badge">
                <slot name="badge" class="thumbnail__badge-items">
                  <zn-icon class="thumbnail__badge-icon" src="${this.icon}" size="14"></zn-icon>
                </slot>
              </div>` : ''}
            ${hasActions ? html`
              <div part="actions" class="thumbnail__actions">
                <slot name="actions" class="thumbnail__action-items"></slot>
              </div>` : ''}
          </div>` : ''}

        ${previewable ? html`
          <dialog
            part="preview"
            class="thumbnail__preview"
            aria-label="${this.caption || this.previewLabel}"
            @cancel="${this._handlePreviewCancel}">
            <div
              part="preview-backdrop"
              class="thumbnail__preview-backdrop"
              @click="${this._handleBackdropClick}"></div>
            <div
              part="preview-frame"
              class="thumbnail__preview-frame"
              style="${styleMap({'--zn-thumbnail-preview-measured-ratio': this._previewRatio || null})}">
              ${this.src ? html`
                <img class="thumbnail__preview-placeholder" src="${this.src}" alt="" aria-hidden="true">` : ''}
              <slot name="preview" class="thumbnail__preview-media">
                <img
                  part="preview-image"
                  class="thumbnail__preview-image"
                  src="${ifDefined(this._previewOpen && this.fullUri ? this.fullUri : undefined)}"
                  alt="${this.alt ?? this.caption}"
                  decoding="async"
                  @load="${this._handlePreviewImageLoad}">
              </slot>
              <button
                part="preview-close"
                type="button"
                class="thumbnail__preview-close"
                aria-label="Close preview"
                @click="${() => void this.hidePreview()}">
                <zn-icon src="close" size="20"></zn-icon>
              </button>
            </div>
          </dialog>` : ''}
      </div>`;
  }
}
