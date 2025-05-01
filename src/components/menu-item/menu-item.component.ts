import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, unsafeCSS} from 'lit';
import {getTextContent, HasSlotController} from '../../internal/slot';
import {html, literal} from "lit/static-html.js";
import {ifDefined} from "lit/directives/if-defined.js";
import {LocalizeController} from '../../utilities/localize';
import {property, query} from 'lit/decorators.js';
import {SubmenuController} from './submenu-controller';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";
import ZnPopup from "../popup";

import styles from './menu-item.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/menu-item
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnMenuItem extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-popup': ZnPopup
  };

  private cachedTextLabel: string;

  @query('slot:not([name])') defaultSlot: HTMLSlotElement;
  @query('.menu-item') menuItem: HTMLElement;

  /** The type of menu item to render. To use `checked`, this value must be set to `checkbox`. */
  @property() type: 'normal' | 'checkbox' = 'normal';

  /** Draws the item in a checked state. */
  @property({type: Boolean, reflect: true}) checked = false;

  /** A unique value to store in the menu item. This can be used as a way to identify menu items when selected. */
  @property() value = '';

  /** Draws the menu item in a loading state. */
  @property({type: Boolean, reflect: true}) loading = false;

  /** Draws the menu item in a disabled state, preventing selection. */
  @property({type: Boolean, reflect: true}) disabled = false;

  // Link Specific
  @property() href: string;

  @property({attribute: "data-path"}) dataPath: string;

  @property() target: '_self' | '_blank' | '_parent' | '_top' | string;

  @property({attribute: 'data-target'}) dataTarget: 'modal' | 'slide' | string;

  @property() rel: string = 'noreferrer noopener';

  @property({attribute: 'gaid'}) gaid: string;

  private readonly localize = new LocalizeController(this);
  private readonly hasSlotController = new HasSlotController(this, 'submenu');
  private submenuController: SubmenuController = new SubmenuController(this, this.hasSlotController, this.localize);

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this.handleHostClick);
    this.addEventListener('mouseover', this.handleMouseOver);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleHostClick);
    this.removeEventListener('mouseover', this.handleMouseOver);
  }

  private handleDefaultSlotChange() {
    const textLabel = this.getTextLabel();

    // Ignore the first time the label is set
    if (typeof this.cachedTextLabel === 'undefined') {
      this.cachedTextLabel = textLabel;
      return;
    }

    // When the label changes, emit a slotchange event so parent controls see it
    if (textLabel !== this.cachedTextLabel) {
      this.cachedTextLabel = textLabel;
      this.emit('slotchange', {bubbles: true, composed: false, cancelable: false});
    }
  }

  private handleHostClick = (event: MouseEvent) => {
    // Prevent the click event from being emitted when the button is disabled or loading
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private handleMouseOver = (event: MouseEvent) => {
    this.focus();
    event.stopPropagation();
  };

  @watch('checked')
  handleCheckedChange() {
    // For proper accessibility, users have to use type="checkbox" to use the checked attribute
    if (this.checked && this.type !== 'checkbox') {
      this.checked = false;
      console.error('The checked attribute can only be used on menu items with type="checkbox"', this);
      return;
    }

    // Only checkbox types can receive the aria-checked attribute
    if (this.type === 'checkbox') {
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else {
      this.removeAttribute('aria-checked');
    }
  }

  @watch('disabled')
  handleDisabledChange() {
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  @watch('type')
  handleTypeChange() {
    if (this.type === 'checkbox') {
      this.setAttribute('role', 'menuitemcheckbox');
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else {
      this.setAttribute('role', 'menuitem');
      this.removeAttribute('aria-checked');
    }
  }

  /** Returns a text label based on the contents of the menu item's default slot. */
  getTextLabel() {
    return getTextContent(this.defaultSlot);
  }

  isSubmenu() {
    return this.hasSlotController.test('submenu');
  }

  private _isLink() {
    return this.href !== undefined || this.dataPath !== undefined;
  }

  render() {
    const isRtl = this.localize.dir() === 'rtl';
    const isSubmenuExpanded = this.submenuController.isExpanded();
    const isLink = this._isLink();
    const tag = isLink ? literal`a` : literal`div`;

    return html`
      <${tag}
        id="anchor"
        part="base"
        data-path=${ifDefined(this.dataPath)}
        href=${ifDefined(this.href)}
        target=${ifDefined(isLink ? this.target : undefined)}
        data-target=${ifDefined(isLink ? this.dataTarget : undefined)}
        rel=${ifDefined(isLink ? this.rel : undefined)}
        gaid=${ifDefined(this.gaid)}
        class=${classMap({
          'menu-item': true,
          'menu-item--rtl': isRtl,
          'menu-item--checked': this.checked,
          'menu-item--disabled': this.disabled,
          'menu-item--loading': this.loading,
          'menu-item--has-submenu': this.isSubmenu(),
          'menu-item--submenu-expanded': isSubmenuExpanded
        })}
        ?aria-haspopup="${this.isSubmenu()}"
        ?aria-expanded="${isSubmenuExpanded}">
        <span part="checked-icon" class="menu-item__check">
          <zn-icon src="check_small" aria-hidden="true"></zn-icon>
        </span>

        <slot name="prefix" part="prefix" class="menu-item__prefix"></slot>

        <slot part="label" class="menu-item__label" @slotchange=${this.handleDefaultSlotChange}></slot>

        <slot name="suffix" part="suffix" class="menu-item__suffix"></slot>

        <span part="submenu-icon" class="menu-item__chevron">
          <zn-icon src=${isRtl ? 'chevron-left' : 'chevron-right'} aria-hidden="true"></zn-icon>
        </span>

        ${this.submenuController.renderSubmenu()}
        ${this.loading ? html`
          <zn-spinner part="spinner" exportparts="base:spinner__base"></zn-spinner> ` : ''}
        </div>
    `;
  }
}
