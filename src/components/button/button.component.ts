import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, nothing, unsafeCSS} from 'lit';
import {FormControlController, validValidityState} from "../../internal/form";
import {HasSlotController} from '../../internal/slot';
import {html, literal} from 'lit/static-html.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {property, query, queryAll, state} from 'lit/decorators.js';
import {styleMap} from "lit/directives/style-map.js";
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from "../dropdown";
import ZnIcon from "../icon";
import ZnTooltip from "../tooltip";
import type {IconColor, IconLibrary} from "../icon";
import type ZnMenu from "../menu";
import type {ZincFormControl} from '../../internal/zinc-element';

import sharedStyles from '../../../scss/shared/index.scss';
import styles from './button.scss';

/**
 * @summary Buttons represent actions that are available to the user.
 * @documentation https://inc.style/components/button
 * @status stable
 * @since 2.0
 *
 * @dependency zn-dropdown
 * @dependency zn-icon
 * @dependency zn-tooltip
 *
 * @event zn-blur - Emitted when the button loses focus.
 * @event zn-focus - Emitted when the button gains focus.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @slot - The button's label.
 * @slot prefix - A presentational prefix icon or similar element.
 * @slot suffix - A presentational suffix icon or similar element.
 * @slot cancel - Slot for custom cancel button/content when autoClick is active.
 * @slot menu - A `<zn-menu>` of advanced options, opened by a long press, a right click, or ArrowDown on the button.
 *
 * @csspart base - The component's base wrapper.
 * @csspart prefix - The container that wraps the prefix.
 * @csspart label - The button's label.
 * @csspart suffix - The container that wraps the suffix.
 * @csspart caret - The button's caret icon, an `<zn-icon>` element.
 * @csspart spinner - The spinner that shows when the button is in the loading state.
 */
export default class ZnButton extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = [unsafeCSS(sharedStyles), unsafeCSS(styles)];
  static dependencies = {
    'zn-dropdown': ZnDropdown,
    'zn-tooltip': ZnTooltip,
    'zn-icon': ZnIcon
  };

  private readonly formControlController = new FormControlController(this);
  private readonly hasSlotController = new HasSlotController(this, '[default]', 'menu');
  private _autoClickTimeout: number | undefined;
  private _loadingState = {
    countdown: null as number | null,
    interval: undefined as number | undefined,
  };

  // Long press menu
  private _longPressTimeout: number | undefined;
  private _longPressOrigin: { x: number, y: number } | null = null;
  /** The pointer that opened the menu is still down, so releasing it over an item selects that item. */
  private _menuPointerHeld = false;
  /** Swallows the click that ends a long press, so the button's own action does not run. */
  private _suppressClick = false;
  private _menuHadFocus = false;

  @state() private menuOpen = false;

  @query('.button') button: HTMLButtonElement;
  @query('.button__menu') menuDropdown: ZnDropdown;
  @queryAll('.loading-countdown') countdownContainer: HTMLElement[];

  /** `ai` is reserved for actions that invoke or act on AI-generated content. */
  @property({}) color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' | 'ai' |
    'transparent' | 'star' | (string & Record<never, never>) = 'default';
  @property() size: 'small' | 'medium' | 'large' = 'medium';
  @property({attribute: 'hover-color'}) hoverColor: string;
  @property({type: Boolean}) text = false;
  @property({type: Boolean}) outline = false;
  /** Keeps the filled look where a container forces `text`, such as a page header's action menu. */
  @property({type: Boolean}) solid = false;
  @property({type: Boolean}) disabled = false;
  @property({type: Boolean}) grow = false;
  @property({type: Boolean}) square = false;
  /** Renders the button as an icon button (40x36). Pass `small` for the
   * 36x36 variant or `round` for a 36x36 circle: `icon-button`,
   * `icon-button="small"` or `icon-button="round"`. */
  @property({
    attribute: 'icon-button',
    converter: {
      fromAttribute: (value: string | null) => (value === 'small' || value === 'round') ? value : value !== null,
      toAttribute: (value: boolean | 'small' | 'round') =>
        (value === 'small' || value === 'round') ? value : (value ? '' : null)
    }
  }) iconButton: boolean | 'small' | 'round' = false;
  /** With `icon-button`, removes the white background and border while
   * keeping the button's size. */
  @property({type: Boolean}) plain = false;
  /** Disables the hover background, for contexts where the tint doesn't fit. */
  @property({type: Boolean, attribute: 'no-hover'}) noHover = false;
  /** Renders the button as a pill: fully rounded, sentence case and regular
   * weight. For label-like triggers such as filter chips. */
  @property({type: Boolean, reflect: true}) pill = false;
  @property({type: Boolean, attribute: 'panel-bg'}) panelBackground = false;

  /** How long, in milliseconds, the button must be held to open the `menu` slot. */
  @property({type: Number, attribute: 'long-press-delay'}) longPressDelay = 500;

  /** Where the `menu` slot opens relative to the button. */
  @property({attribute: 'menu-placement'}) menuPlacement: 'top' | 'top-start' | 'top-end' | 'right' | 'right-start' |
    'right-end' | 'bottom' | 'bottom-start' | 'bottom-end' | 'left' | 'left-start' | 'left-end' = 'bottom-start';

  @property({attribute: 'dropdown-closer', type: Boolean}) dropdownCloser = false;

  @property({type: Number}) notification: number;
  @property({attribute: "muted-notifications", type: Boolean}) mutedNotifications = false;

  @property() verticalAlign: 'start' | 'center' | 'end';

  @property() content = '';
  @property() icon: string = '';
  @property() gaid: string = '';
  @property({attribute: "icon-position"}) iconPosition: 'left' | 'right' = 'left';
  @property({attribute: "icon-size"}) iconSize: string;
  @property({attribute: "icon-color"}) iconColor: IconColor;
  @property({attribute: "icon-fill"}) iconFill: IconColor;
  @property({attribute: "icon-library"}) iconLibrary: IconLibrary;
  @property() type: 'button' | 'submit' | 'reset';

  @property() name: string;
  @property() value: string;

  @property() form: string;
  @property({attribute: 'formaction'}) formAction: string;
  @property({attribute: 'formenctype'}) formEnctype: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain';
  @property({attribute: 'formmethod'}) formMethod: 'post' | 'get';
  @property({attribute: 'formnovalidate', type: Boolean}) formNoValidate: boolean;
  @property({attribute: 'formtarget'}) formTarget: '_self' | '_blank' | '_parent' | '_top' | string;

  // Link Specific
  @property() href: string;
  @property() target: '_self' | '_blank' | '_parent' | '_top' | string;
  @property({attribute: 'data-target'}) dataTarget: 'modal' | 'slide' | string;
  @property() rel: string = 'noreferrer noopener';

  // Tooltip Specific
  @property() tooltip: string;

  /** Accessible name for the button. Icon-only buttons fall back to `tooltip`. */
  @property() label: string;

  /** Toggle state, forwarded to the inner button's `aria-pressed`. */
  @property({attribute: 'aria-pressed'}) pressed: 'true' | 'false' | 'mixed';

  /** Popup state, forwarded to the inner button's `aria-expanded`. */
  @property({attribute: 'aria-expanded'}) expanded: 'true' | 'false';

  /** Popup type, forwarded to the inner button's `aria-haspopup`. */
  @property({attribute: 'aria-haspopup'}) hasPopup: string;

  // Auto Click Specific
  @property({type: Boolean, attribute: 'auto-click'}) autoClick = false;
  @property({type: Number, attribute: 'auto-click-delay'}) autoClickDelay = 2000;
  @property({type: String, attribute: 'loading-text'}) loadingText = 'Loading...';
  @property({
    type: String,
    attribute: 'loading-text-position'
  }) loadingTextPosition: 'left' | 'right' | 'center' | string = 'center';
  @property({type: Boolean}) loading = false;

  /** Shows a spinner and ignores clicks, e.g. while a request is in flight. */
  @property({type: Boolean, reflect: true}) processing = false;

  /** Replaces the label while processing. */
  @property({attribute: 'processing-text'}) processingText = '';

  get validity() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).validity;
    }

    return validValidityState;
  }

  get validationMessage() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).validationMessage;
    }

    return '';
  }

  firstUpdated() {
    if (this._isButton()) {
      this.formControlController.updateValidity();
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleHostClickCapture, {capture: true});
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.teardownAutoClick();
    this.cancelLongPress();
    this.removeEventListener('click', this.handleHostClickCapture, {capture: true});
  }

  @watch('autoClick')
  async handleAutoClickChange(_old: boolean, value: boolean) {
    if (value) {
      await this.updateComplete;
      this.setupAutoClick();
    } else {
      this.teardownAutoClick();
    }
  }

  protected updated(changedProps: Map<string, any>) {
    super.updated(changedProps);
    if (this.button) {
      const oldOverlay = this.button.querySelector('.button--loading-fill');
      if (oldOverlay) {
        oldOverlay.remove();
      }

      if (this.loading) {
        // Add loading overlay
        const duration = `${this.autoClickDelay / 1000}s`;
        const overlay = document.createElement('div');
        overlay.classList.add('button--loading-fill');
        overlay.setAttribute('style', `--loading-duration: ${duration}`);

        if (this.button.classList.contains('button--transparent')) {
          overlay.classList.add('button--loading-fill-transparent');
          this.button.classList.add('button--loading-bg-transparent');
        }

        this.button.prepend(overlay);
        this.button.classList.add('button--loading-bg');
      } else {
        this.button.classList.remove('button--loading-bg');
        this.button.classList.remove('button--loading-bg-transparent');
      }

      this.updateCountdownText();
    }
  }

  checkValidity() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).checkValidity();
    }

    return true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity() {
    if (this._isButton() && this.button) {
      return (this.button as HTMLButtonElement).reportValidity();
    }

    return true;
  }

  setCustomValidity(message: string) {
    if (this._isButton()) {
      (this.button as HTMLButtonElement).setCustomValidity(message);
      this.formControlController.updateValidity();
    }
  }

  // Override native HTMLButtonElement click method
  click() {
    this.handleClick()
  }

  handleClick = () => {
    if (this.disabled || this.processing) {
      return;
    }

    if (this.dropdownCloser) {
      let dropdown: ZnDropdown | null = null;
      let parent: HTMLElement | null = this as HTMLElement | null;
      let count = 0;
      const max = 30; // Break the loop if too deep in the DOM tree

      while (parent && count < max) {
        if (parent instanceof ZnDropdown) {
          dropdown = parent;
          break;
        }
        parent = parent.parentElement || (parent.getRootNode() instanceof ShadowRoot ? (parent.getRootNode() as ShadowRoot).host as HTMLElement : null);
        count++;
      }

      dropdown?.hide();
    }

    // Passing the button through carries its name, value and formaction onto the submission.
    if (this.type === 'submit') {
      this.formControlController.submit(this);
    }

    if (this.type === 'reset') {
      this.formControlController.reset(this);
    }
  }

  private _hasMenu() {
    return this.hasSlotController.test('menu');
  }

  private getMenu() {
    return this.querySelector<ZnMenu>(':scope > zn-menu[slot="menu"], :scope > [slot="menu"] zn-menu');
  }

  /** Opens the advanced options in the `menu` slot. */
  async showMenu() {
    if (!this._hasMenu() || this.disabled || this.processing) return;
    await this.updateComplete;
    await this.menuDropdown?.show();
  }

  /** Closes the advanced options in the `menu` slot. */
  async hideMenu() {
    await this.menuDropdown?.hide();
  }

  // Runs before any click listener on the button, including the consumer's own
  private handleHostClickCapture = (event: MouseEvent) => {
    if (!this._suppressClick) return;

    const menuSlot = this.shadowRoot?.querySelector('slot[name="menu"]');
    const fromMenu = event.composedPath().some(el => (el as Element).assignedSlot === menuSlot);
    if (fromMenu) return;

    this._suppressClick = false;
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  private handleMenuPointerDown = (event: PointerEvent) => {
    if (!this._hasMenu() || this.disabled || this.processing || event.button !== 0) return;

    // Pressing the button while its menu is open only closes the menu, which the dropdown does on mousedown
    if (this.menuOpen) {
      this._suppressClick = true;
      document.addEventListener('pointerup', this.handleMenuPointerUp);
      return;
    }

    this.cancelLongPress();
    this._longPressOrigin = {x: event.clientX, y: event.clientY};
    this._longPressTimeout = window.setTimeout(() => {
      this._longPressTimeout = undefined;
      this._suppressClick = true;
      this._menuPointerHeld = true;
      this.showMenu().then(r => r);
    }, this.longPressDelay);

    document.addEventListener('pointermove', this.handleMenuPointerMove);
    document.addEventListener('pointerup', this.handleMenuPointerUp);
    document.addEventListener('pointercancel', this.handleMenuPointerCancel);
  }

  private handleMenuPointerMove = (event: PointerEvent) => {
    if (this._longPressTimeout === undefined || !this._longPressOrigin) return;

    const moved = Math.hypot(event.clientX - this._longPressOrigin.x, event.clientY - this._longPressOrigin.y);
    if (moved > 8) {
      this.cancelLongPress();
    }
  }

  private handleMenuPointerUp = (event: PointerEvent) => {
    const held = this._menuPointerHeld;
    this.cancelLongPress();

    // Press, drag onto an item and release selects it, as in the macOS Dock
    if (held) {
      const item = document.elementFromPoint(event.clientX, event.clientY)?.closest('zn-menu-item');
      if (item && this.contains(item) && !item.hasAttribute('disabled')) {
        (item as HTMLElement).click();
      }
    }

    // A long press on touch ends without a click, so the flag must not outlive this gesture
    if (this._suppressClick) {
      window.setTimeout(() => this._suppressClick = false, 300);
    }
  }

  private handleMenuPointerCancel = () => {
    this.cancelLongPress();
    this._suppressClick = false;
  }

  private cancelLongPress() {
    window.clearTimeout(this._longPressTimeout);
    this._longPressTimeout = undefined;
    this._longPressOrigin = null;
    this._menuPointerHeld = false;
    document.removeEventListener('pointermove', this.handleMenuPointerMove);
    document.removeEventListener('pointerup', this.handleMenuPointerUp);
    document.removeEventListener('pointercancel', this.handleMenuPointerCancel);
  }

  private handleMenuContextMenu = (event: MouseEvent) => {
    if (!this._hasMenu()) return;

    event.preventDefault();
    // A touch long press also fires contextmenu, after the menu has already opened
    if (!this.menuOpen) {
      this.cancelLongPress();
      this.showMenu().then(r => r);
    }
  }

  private handleMenuKeyDown = async (event: KeyboardEvent) => {
    if (!this._hasMenu()) return;

    const opensMenu = event.key === 'ArrowDown' || event.key === 'ContextMenu' || (event.key === 'F10' && event.shiftKey);
    if (!opensMenu) return;

    event.preventDefault();
    await this.showMenu();

    const menu = this.getMenu();
    const first = menu?.getAllItems()[0];
    if (menu && first) {
      menu.setCurrentItem(first);
      first.focus();
    }
  }

  private handleMenuShow = (event: Event) => {
    if (event.target !== this.menuDropdown) return;
    this.menuOpen = true;
  }

  private handleMenuHide = (event: Event) => {
    if (event.target !== this.menuDropdown) return;
    this.menuOpen = false;
    this._menuHadFocus = !!this.getMenu()?.matches(':focus-within');
  }

  // The dropdown's anchor is not focusable, so focus returns to the button itself
  private handleMenuAfterHide = (event: Event) => {
    if (event.target !== this.menuDropdown) return;
    if (this._menuHadFocus) {
      this._menuHadFocus = false;
      this.button?.focus();
    }
  }

  private _renderMenu() {
    if (!this._hasMenu()) {
      // Kept in the tree so adding a menu later fires slotchange
      return html`<slot name="menu" hidden></slot>`;
    }

    return html`
      <zn-dropdown class="button__menu"
                   placement=${this.menuPlacement}
                   @zn-show=${this.handleMenuShow}
                   @zn-hide=${this.handleMenuHide}
                   @zn-after-hide=${this.handleMenuAfterHide}>
        <span slot="trigger" class="button__menu-anchor"></span>
        <div class="button__menu-panel">
          <slot name="menu"></slot>
        </div>
      </zn-dropdown>`;
  }

  private _isLink() {
    return this.href !== undefined;
  }

  private _isButton() {
    return !this._isLink();
  }

  private getIconButtonColor(color: string | undefined) {
    switch (color) {
      case undefined:
      case '':
      case 'default':
        return 'rgb(var(--zn-text))';
      case 'primary':
        return 'rgb(var(--zn-primary))';
      case 'secondary':
        return 'rgb(var(--zn-text))';
      case 'error':
        return 'rgb(var(--zn-color-error))';
      case 'info':
        return 'rgb(var(--zn-color-info))';
      case 'success':
        return 'rgb(var(--zn-color-success))';
      case 'warning':
        return 'rgb(var(--zn-color-warning))';
      case 'ai':
        return 'var(--zn-color-ai-fg)';
      case 'transparent':
        return 'inherit';
      case 'star':
        return 'rgb(var(--zn-orange))';
      default:
        return color;
    }
  }

  setupAutoClick() {
    if (!this.button) return;

    if (this._autoClickTimeout) {
      window.clearTimeout(this._autoClickTimeout);
      this._autoClickTimeout = undefined;
    }

    if (this._loadingState.interval) {
      window.clearInterval(this._loadingState.interval);
      this._loadingState.interval = undefined;
    }

    this.loading = true;
    this._loadingState.countdown = Math.ceil(this.autoClickDelay / 1000);
    this.updateCountdownText();

    this._loadingState.interval = window.setInterval(() => {
      if (this._loadingState.countdown && this._loadingState.countdown > 0) {
        this._loadingState.countdown--;
        this.updateCountdownText();
      }
    }, 1000);

    this._autoClickTimeout = window.setTimeout(() => {
      this.loading = false;
      this._loadingState.countdown = null;
      this.updateCountdownText();

      if (this._loadingState.interval) {
        window.clearInterval(this._loadingState.interval);
        this._loadingState.interval = undefined;
      }

      this.button?.click();
    }, this.autoClickDelay);
  }

  updateCountdownText() {
    const text = this._loadingState.countdown && this._loadingState.countdown > 0 ? ` (${this._loadingState.countdown}s)` : '';
    if (this.countdownContainer) {
      for (const container of this.countdownContainer) {
        container.textContent = text;
      }
    }
  }

  teardownAutoClick() {
    if (this._autoClickTimeout) {
      window.clearTimeout(this._autoClickTimeout);
      this._autoClickTimeout = undefined;
    }

    if (this._loadingState.interval) {
      window.clearInterval(this._loadingState.interval);
      this._loadingState.interval = undefined;
    }

    this.loading = false;
    this._loadingState.countdown = null;

    if (this.button) {
      this.button.style.width = '';
    }
  }

  protected render(): unknown {
    const isLink = this._isLink();
    const hasMenu = this._hasMenu();
    const showCancel = this.loading && this.autoClick;
    const resolvedIconSize = this.iconSize ? this.iconSize : 20;
    const icon = this.icon && !this.loading && !this.processing ? html`
        <zn-icon part="icon" src="${this.icon}" id="xy2" size="${resolvedIconSize}"
                 color="${ifDefined(this.iconColor)}" fill="${ifDefined(this.iconFill)}"
                 library="${ifDefined(this.iconLibrary)}"></zn-icon>`
      : '';
    const tag = isLink ? literal`a` : literal`button`;
    // An icon-only button has no text to name it, so the tooltip doubles as the
    // accessible name. Buttons with content keep their text as the name.
    const hasContent = this.hasSlotController.test('[default]') || !!this.content;
    const ariaLabel = this.label || (hasContent ? undefined : this.tooltip);
    const buttonStyles = {
      ...(this.iconButton ? {
        '--icon-button-color': this.getIconButtonColor(this.color),
        '--icon-button-hover-color': this.getIconButtonColor(this.hoverColor || 'primary')
      } : {}),
      ...(this.icon ? {'--button-icon-size': `${resolvedIconSize}px`} : {}),
    };

    // A removed `notification` attribute lands here as null, not undefined
    const notification = this.notification ?? undefined;

    const buttonContent = html`
      <${tag}
        part="base"
        class="${classMap({
          'button': true,
          'button--default': this.color === 'default',
          'button--secondary': this.color === 'secondary',
          'button--panel-bg': this.panelBackground,
          'button--error': this.color === 'error',
          'button--info': this.color === 'info',
          'button--success': this.color === 'success',
          'button--warning': this.color === 'warning',
          'button--ai': this.color === 'ai',
          'button--small': this.size === 'small',
          'button--large': this.size === 'large',
          'button--transparent': this.color === 'transparent',
          'button--star': this.color === 'star',
          'button--outline': this.outline,
          'button--text': (this.text && !this.outline && !this.solid),
          'button--icon-button': !!this.iconButton,
          'button--plain': !!this.iconButton && this.plain,
          'button--pill': this.pill,
          'button--no-hover': this.noHover,
          'button--icon-button-small': this.iconButton === 'small',
          'button--icon-button-round': this.iconButton === 'round',
          'button--grow': this.grow,
          'button--standard': !this.outline && !this.text,
          'button--with-icon': this.icon,
          'button--icon-left': this.iconPosition === 'left',
          'button--icon-right': this.iconPosition === 'right',
          'button--with-content': this.hasSlotController.test('[default]') || this.content,
          'button--square': this.square,
          'button--has-notification': notification !== undefined && notification !== 0,
          'button--muted-notification': this.mutedNotifications || notification === -2,
          'button--notification-dot': notification !== undefined && notification < 0,
          'button--processing': this.processing,
          'button--has-menu': hasMenu,
        })}"
        type="${ifDefined(this.type)}"
        href="${ifDefined(this.href)}"
        target="${ifDefined(isLink ? this.target : undefined)}"
        data-target="${ifDefined(isLink ? this.dataTarget : undefined)}"
        rel="${ifDefined(isLink ? this.rel : undefined)}"
        gaid="${ifDefined(this.gaid)}"
        aria-label="${ifDefined(ariaLabel)}"
        aria-pressed="${ifDefined(isLink ? undefined : this.pressed)}"
        aria-expanded="${ifDefined(this.expanded ?? (hasMenu ? String(this.menuOpen) : undefined))}"
        aria-haspopup="${ifDefined(this.hasPopup ?? (hasMenu ? 'menu' : undefined))}"
        draggable="${ifDefined(isLink && hasMenu ? 'false' : undefined)}"
        aria-busy="${this.processing ? 'true' : nothing}"
        data-notification="${ifDefined(notification)}"
        disabled="${this.disabled || nothing}"
        style=${styleMap(buttonStyles)}
        @click="${this.handleClick}"
        @pointerdown="${this.handleMenuPointerDown}"
        @contextmenu="${this.handleMenuContextMenu}"
        @keydown="${this.handleMenuKeyDown}">
        ${this.iconPosition === 'left' ? icon : ''}
        ${this.processing ? html`<span part="spinner" class="button__spinner"></span>` : ''}
        ${this.processing && this.processingText ? html`<span class="button__processing-text">${this.processingText}</span>` : ''}
        <slot part="label"
              class="${classMap({
                'button__label': true,
                'button__label--hidden': this.loading,
                'button__label--replaced': this.processing && !!this.processingText
              })}"
              style="--loading-duration: ${this.autoClickDelay / 1000}s">
          ${this.content}
        </slot>
        ${this.iconPosition === 'right' ? icon : ''}
        ${this._getLoadingContainer()}
      </${tag}>`;

    let content = this.autoClick ? html`
      <div class="button--relative-wrapper">
        ${buttonContent}
        ${showCancel ? html`
          <slot name="cancel" @click="${this.teardownAutoClick}"></slot>
        ` : null}
      </div>
    ` : buttonContent;

    if (this.tooltip !== undefined) {
      content = html`
        <zn-tooltip placement="top" content="${this.tooltip}">
          ${content}
        </zn-tooltip>`;
    }

    return html`${content}${this._renderMenu()}`;
  }

  private _getLoadingContainer() {
    return html`
      ${this.loading ? html`
        <div class="button--loading-container">
            <span class="button--loading-text">
              ${this.loadingText}<span class="loading-countdown"></span>
            </span>
        </div>
      ` : null}`;
  }
}
