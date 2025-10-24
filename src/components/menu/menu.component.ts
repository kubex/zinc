import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnConfirm from "../confirm";
import ZnDropdown from "../dropdown";
import ZnIcon from "../icon";
import ZnMenuItem from "../menu-item";
import ZnTooltip from "../tooltip";

import styles from './menu.scss';

interface NavItem {
  title: string;
  type: string;
  path: string;
  target: string;
  icon: string;
  style: string;
  confirm: {
    type: string;
    title: string;
    caption: string;
    content: string;
    trigger: string;
    action: string;
  };
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/menu
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
export default class ZnMenu extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-confirm': ZnConfirm,
    'zn-dropdown': ZnDropdown,
    'zn-icon': ZnIcon,
    'zn-menu-item': ZnMenuItem,
    'zn-tooltip': ZnTooltip,
  };

  @query('slot') defaultSlot: HTMLSlotElement;

  @property({attribute: 'actions', type: Array}) actions = [];

  connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'menu');
  }

  /** @internal Gets all slotted menu items, ignoring dividers, headers, and other elements. */
  getAllItems() {
    return [...this.defaultSlot.assignedElements({flatten: true})].filter((el: HTMLElement) => {
      return !(el.inert || !this.isMenuItem(el));

    }) as ZnMenuItem[];
  }

  /**
   * @internal Gets the current menu item, which is the menu item that has `tabindex="0"` within the roving tab index.
   * The menu item may or may not have focus, but for keyboard interaction purposes it's considered the "active" item.
   */
  getCurrentItem() {
    return this.getAllItems().find(i => i.getAttribute('tabindex') === '0');
  }

  /**
   * @internal Sets the current menu item to the specified element. This sets `tabindex="0"` on the target element and
   * `tabindex="-1"` to all other items. This method must be called prior to setting focus on a menu item.
   */
  setCurrentItem(item: ZnMenuItem) {
    const items = this.getAllItems();

    // Update tab indexes
    items.forEach(i => {
      i.setAttribute('tabindex', i === item ? '0' : '-1');
    });
  }

  render() {
    return html`
      <div
        @slotchange=${this.handleSlotChange}
        @keydown=${this.handleKeyDown}
        @mousedown=${this.handleMouseDown}>
        <slot></slot>
        ${this.actions.map((item: NavItem) => {
          if( item === null || item === undefined) {
            return html``; // Skip null or undefined items
          }
          if ( item?.confirm) {
            return html`
              <zn-confirm trigger="${ifDefined(item.confirm?.trigger)}"
                          type="${ifDefined(item.confirm?.type)}"
                          caption="${item.confirm?.caption}"
                          content="${item.confirm?.content}"
                          action="${item.confirm?.action}"></zn-confirm>
              <zn-menu-item @mousedown=${this.handleMouseDown}
                            @keydown=${this.handleKeyDown}
                            id="${item.confirm?.trigger}"
                            confirm>
                ${(item.icon) ? html`
                  <zn-icon src="${item.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                ${item.title}
              </zn-menu-item>`;
          } else {
            if (item.type !== 'dropdown') {
              return html`
                <zn-menu-item value="${item.title}"
                              href="${item.path}"
                              data-target="${ifDefined(item.target)}">
                  ${(item.icon) ? html`
                    <zn-icon src="${item.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                  <span @click="${this.handleClick}"
                        @keydown=${this.handleKeyDown}
                        @mousedown=${this.handleMouseDown}
                        data-target="${ifDefined(item.target)}">${item.title}</span>
                </zn-menu-item>`;
            } else {
              return html`
                <zn-menu-item value="${item.title}" data-path="${ifDefined(item.path)}">
                  ${(item.icon) ? html`
                    <zn-icon src="${item.icon}" size="20" slot="prefix"></zn-icon>` : html``}
                  <span @click="${this.handleClick}"
                        @keydown=${this.handleKeyDown}
                        @mousedown=${this.handleMouseDown}>${item.title}</span>
                </zn-menu-item>`;
            }
          }
        })}
      </div>`;
  }

  private handleClick(event: MouseEvent) {
    const menuItemTypes = ['menuitem', 'menuitemcheckbox'];

    const composedPath = event.composedPath();
    const target = composedPath.find((el: Element) => menuItemTypes.includes(el?.getAttribute?.('role') || ''));

    if (!target) return;

    const closestMenu: Element | null = composedPath.find((el: Element) => el?.getAttribute?.('role') === 'menu') as Element;
    const clickHasSubmenu = closestMenu !== this;

    // Make sure we're the menu that's supposed to be handling the click event.
    if (clickHasSubmenu) return;

    // This isn't true. But we use it for TypeScript checks below.
    const item = target as ZnMenuItem;

    if (item.type === 'checkbox') {
      item.checked = !item.checked;
    }

    // get the parent dropdown and close it
    (closestMenu?.closest('zn-dropdown') as ZnDropdown | null)?.hide();

    this.emit('zn-select', {detail: {item}});
  }

  private handleKeyDown(event: KeyboardEvent) {
    // Make a selection when pressing enter or space
    if (event.key === 'Enter' || event.key === ' ') {
      const item = this.getCurrentItem();
      event.preventDefault();
      event.stopPropagation();

      // Simulate a click to support @click handlers on menu items that also work with the keyboard
      item?.click();
    }

    // Move the selection when pressing down or up
    else if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      const items = this.getAllItems();
      const activeItem = this.getCurrentItem();
      let index = activeItem ? items.indexOf(activeItem) : 0;

      if (items.length > 0) {
        event.preventDefault();
        event.stopPropagation();

        if (event.key === 'ArrowDown') {
          index++;
        } else if (event.key === 'ArrowUp') {
          index--;
        } else if (event.key === 'Home') {
          index = 0;
        } else if (event.key === 'End') {
          index = items.length - 1;
        }

        if (index < 0) {
          index = items.length - 1;
        }
        if (index > items.length - 1) {
          index = 0;
        }

        this.setCurrentItem(items[index]);
        items[index].focus();
      }
    }
  }

  private handleMouseDown(event: MouseEvent) {
    const target = event.target as HTMLElement;

    if (this.isMenuItem(target)) {
      this.setCurrentItem(target as ZnMenuItem);
    }
  }

  private handleSlotChange() {
    const items = this.getAllItems();

    // Reset the roving tab index when the slotted items change
    if (items.length > 0) {
      this.setCurrentItem(items[0]);
      this.emit('zn-menu-ready');
    }
  }

  private isMenuItem(item: HTMLElement) {
    return (
      item.tagName.toLowerCase() === 'zn-menu-item' ||
      ['menuitem', 'menuitemcheckbox', 'menuitemradio'].includes(item.getAttribute('role') ?? '')
    );
  }
}
