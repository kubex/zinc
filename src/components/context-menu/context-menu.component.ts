import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import ZincElement from '../../internal/zinc-element';
import ZnDropdown from '../dropdown';
import type ZnMenu from '../menu';

import styles from './context-menu.scss';

/**
 * @summary Opens a menu where its content is right-clicked.
 * @documentation https://zinc.style/components/context-menu
 * @status experimental
 * @since 2.0
 *
 * @dependency zn-dropdown
 *
 * @slot - The content that opens the menu when right-clicked. A descendant with `context-menu-trigger` also opens it on click.
 * @slot menu - The `zn-menu` to open.
 */
export default class ZnContextMenu extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-dropdown': ZnDropdown};

  /** Disables the menu, leaving the browser's own context menu. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Reflects whether the menu is showing, so the content can keep a highlight while it is. */
  @property({type: Boolean, reflect: true}) open = false;

  @query('.context-menu__dropdown') dropdown: ZnDropdown;

  // The point the menu opens at, relative to the host.
  @state() private _at = {x: 0, y: 0};
  @state() private _placement: 'bottom-start' | 'bottom-end' = 'bottom-start';

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('contextmenu', this.handleContextMenu);
    this.addEventListener('keydown', this.handleKeyDown);
    this.addEventListener('click', this.handleTriggerClick);
  }

  disconnectedCallback() {
    this.removeEventListener('contextmenu', this.handleContextMenu);
    this.removeEventListener('keydown', this.handleKeyDown);
    this.removeEventListener('click', this.handleTriggerClick);
    super.disconnectedCallback();
  }

  private getMenu() {
    return this.querySelector<ZnMenu>(':scope > zn-menu[slot="menu"]');
  }

  /** Opens the menu at a point given in viewport coordinates; `bottom-end` hangs it to the left of the point. */
  async showMenu(clientX: number, clientY: number, placement: 'bottom-start' | 'bottom-end' = 'bottom-start') {
    if (this.disabled || !this.getMenu()) return;
    const box = this.getBoundingClientRect();
    this._at = {x: clientX - box.left, y: clientY - box.top};
    this._placement = placement;
    await this.updateComplete;
    await this.dropdown.hide();
    await this.dropdown.show();
  }

  async hideMenu() {
    await this.dropdown?.hide();
  }

  private handleContextMenu = (event: MouseEvent) => {
    if (this.disabled || !this.getMenu() || event.composedPath().includes(this.getMenu()!)) return;
    event.preventDefault();
    this.showMenu(event.clientX, event.clientY).then(r => r);
  };

  private handleKeyDown = async (event: KeyboardEvent) => {
    if (event.key !== 'ContextMenu' && !(event.key === 'F10' && event.shiftKey)) return;
    const menu = this.getMenu();
    if (this.disabled || !menu || event.composedPath().includes(menu)) return;

    event.preventDefault();
    const target = (event.composedPath()[0] as Element).getBoundingClientRect();
    await this.showMenu(target.left, target.bottom);
    await this.focusFirstItem();
  };

  // preventDefault also stops a trigger inside a <summary> from toggling its <details>.
  private handleTriggerClick = async (event: MouseEvent) => {
    const menu = this.getMenu();
    if (this.disabled || !menu) return;
    const path = event.composedPath();
    if (path.includes(menu)) return;
    const trigger = path.find(el => el instanceof Element && el.hasAttribute('context-menu-trigger')) as Element | undefined;
    if (!trigger) return;

    event.preventDefault();
    const box = trigger.getBoundingClientRect();
    await this.showMenu(box.right, box.bottom, 'bottom-end');
    // detail is 0 for a click from Enter or Space.
    if (event.detail === 0) await this.focusFirstItem();
  };

  // The dropdown reports it has opened a frame before its popup can take focus.
  private async focusFirstItem() {
    await new Promise(requestAnimationFrame);
    const menu = this.getMenu();
    const first = menu?.getAllItems()[0];
    if (menu && first) {
      menu.setCurrentItem(first);
      first.focus();
    }
  }

  // The menu is slotted from outside the dropdown, so its own lookup for a dropdown to close never finds this one.
  private handleSelect = (event: Event) => {
    const item = event.target as HTMLElement;
    if (this.getMenu()?.contains(item) && !item.hasAttribute('keep-open')) {
      this.hideMenu().then(r => r);
    }
  };

  private handleShow = (event: Event) => {
    if (event.target === this.dropdown) this.open = true;
  };

  private handleHide = (event: Event) => {
    if (event.target === this.dropdown) this.open = false;
  };

  render() {
    return html`
      <slot></slot>
      <zn-dropdown class="context-menu__dropdown"
                   placement=${this._placement}
                   @zn-menu-select=${this.handleSelect}
                   @zn-show=${this.handleShow}
                   @zn-hide=${this.handleHide}>
        <span slot="trigger"
              class="context-menu__anchor"
              style=${styleMap({left: `${this._at.x}px`, top: `${this._at.y}px`})}></span>
        <div class="context-menu__panel">
          <slot name="menu"></slot>
        </div>
      </zn-dropdown>`;
  }
}
