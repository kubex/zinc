import {customElement, property, query} from "lit/decorators.js";
import {html} from "lit/static-html.js";
import {ZincElement} from "@/zinc-element";
import {SubmenuController} from "@/NewMenu/submenu-controller";
import {getTextContent, HasSlotController} from "@/slot";
import {watch} from "@/watch";
import {classMap} from "lit/directives/class-map.js";
import {unsafeCSS} from "lit";

import styles from './menu-item.scss?inline';

@customElement('zn-menu-item')
export class MenuItem extends ZincElement
{
  static styles = unsafeCSS(styles);

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

  private readonly hasSlotController = new HasSlotController(this, 'submenu');
  private submenuController: SubmenuController = new SubmenuController(this, this.hasSlotController);

  connectedCallback()
  {
    super.connectedCallback();
    this.addEventListener('click', this.handleHostClick);
    this.addEventListener('mouseover', this.handleMouseOver);
  }

  disconnectedCallback()
  {
    super.disconnectedCallback();
    this.removeEventListener('click', this.handleHostClick);
    this.removeEventListener('mouseover', this.handleMouseOver);
  }

  private handleDefaultSlotChange()
  {
    const textLabel = this.getTextLabel();

    // Ignore the first time the label is set
    if(typeof this.cachedTextLabel === 'undefined')
    {
      this.cachedTextLabel = textLabel;
      return;
    }

    // When the label changes, emit a slotchange event so parent controls see it
    if(textLabel !== this.cachedTextLabel)
    {
      this.cachedTextLabel = textLabel;
      this.emit('slotchange', {bubbles: true, composed: false, cancelable: false});
    }
  }

  private handleHostClick = (event: MouseEvent) =>
  {
    // Prevent the click event from being emitted when the button is disabled or loading
    if(this.disabled)
    {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };

  private handleMouseOver = (event: MouseEvent) =>
  {
    this.focus();
    event.stopPropagation();
  };

  @watch('checked')
  handleCheckedChange()
  {
    // For proper accessibility, users have to use type="checkbox" to use the checked attribute
    if(this.checked && this.type !== 'checkbox')
    {
      this.checked = false;
      console.error('The checked attribute can only be used on menu items with type="checkbox"', this);
      return;
    }

    // Only checkbox types can receive the aria-checked attribute
    if(this.type === 'checkbox')
    {
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    }
    else
    {
      this.removeAttribute('aria-checked');
    }
  }

  @watch('disabled')
  handleDisabledChange()
  {
    this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
  }

  @watch('type')
  handleTypeChange()
  {
    if(this.type === 'checkbox')
    {
      this.setAttribute('role', 'menuitemcheckbox');
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    }
    else
    {
      this.setAttribute('role', 'menuitem');
      this.removeAttribute('aria-checked');
    }
  }

  /** Returns a text label based on the contents of the menu item's default slot. */
  getTextLabel()
  {
    return getTextContent(this.defaultSlot);
  }

  isSubmenu()
  {
    return this.hasSlotController.test('submenu');
  }

  handleItemClick(event: MouseEvent)
  {
    const anchor = this.querySelector('a');
    const target = event.target as HTMLElement;
    if(anchor && !anchor.contains(target))
    {
      anchor.click();
    }
  }

  render()
  {
    const isSubmenuExpanded = this.submenuController.isExpanded();

    return html`
      <div
        id="anchor"
        part="base"
        class=${classMap({
          'menu-item': true,
          'menu-item--checked': this.checked,
          'menu-item--disabled': this.disabled,
          'menu-item--loading': this.loading,
          'menu-item--has-submenu': this.isSubmenu(),
          'menu-item--submenu-expanded': isSubmenuExpanded
        })}
        ?aria-haspopup="${this.isSubmenu()}"
        ?aria-expanded="${(!!isSubmenuExpanded)}"
        @click=${this.handleItemClick}
      >
        <span part="checked-icon" class="menu-item__check">
          <zn-icon src="check" size="18"></zn-icon>
        </span>

        <slot name="prefix" part="prefix" class="menu-item__prefix"></slot>

        <slot part="label" class="menu-item__label" @slotchange=${this.handleDefaultSlotChange}></slot>

        <slot name="suffix" part="suffix" class="menu-item__suffix"></slot>

        <span part="submenu-icon" class="menu-item__chevron">
          <zn-icon src='chevron_right' aria-hidden="true" size="20"></zn-icon>
        </span>

        ${this.submenuController.renderSubmenu()}
        ${this.loading ? html`
          <sl-spinner part="spinner" exportparts="base:spinner__base"></sl-spinner> ` : ''}
      </div>
    `;
  }
}
