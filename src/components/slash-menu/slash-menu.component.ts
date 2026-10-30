import {autoUpdate, computePosition, flip, offset, shift, size} from '@floating-ui/dom';
import {classMap} from 'lit/directives/class-map.js';
import {clearRecentSlashItems, readRecentSlashItems, recordRecentSlashItem, slashItemKey} from './slash-menu-items';
import {html, unsafeCSS} from 'lit';
import {property, query, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';
import type {CSSResultGroup, PropertyValues, TemplateResult} from 'lit';
import type {Placement, VirtualElement} from '@floating-ui/dom';
import type {SlashMenuItem} from './slash-menu-items';

import styles from './slash-menu.scss';

export const SLASH_ITEM_SELECT = 'zn-slash-item-select';

function sameItems(a: SlashMenuItem[] | undefined, b: SlashMenuItem[]): boolean {
  return !!a && a.length === b.length && a.every((item, i) =>
    item.label === b[i].label && item.value === b[i].value && item.disabled === b[i].disabled);
}

/**
 * @summary A keyboard-driven list of insertions, anchored to the caret of the field that opened it.
 * @documentation https://zinc.style/components/slash-menu
 * @status experimental
 * @since 1.1
 *
 * @dependency zn-icon
 *
 * @event zn-slash-item-select - Emitted when an item is chosen. Does not cross shadow boundaries; the
 *  component driving the menu (e.g. `zn-textarea`) re-emits it as `zn-slash-select`.
 *
 * @csspart panel - The floating panel that holds the list.
 * @csspart list - The scrolling list of items.
 * @csspart item - An item in the list.
 * @csspart icon - The chip holding an item's icon.
 * @csspart group-heading - A group heading between items.
 * @csspart divider - The rule closing the recently used section, when the items below it have no heading of their own.
 * @csspart footer - The truncation footer, shown when not every match fits.
 * @csspart hints - The pinned footer of keyboard hints.
 * @csspart hint - A single keyboard hint within the footer.
 * @csspart hint-key - The key shown against a hint.
 *
 * @cssproperty --slash-menu-width - The width of the panel.
 * @cssproperty --slash-menu-border-radius - The corner radius of the panel.
 * @cssproperty --slash-menu-item-border-radius - The corner radius of the items and their icon chips.
 * @cssproperty --slash-menu-max-height - The maximum height of the panel before it scrolls.
 */
export default class ZnSlashMenu extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon
  };

  @query('.slash-menu__panel') private panel: HTMLElement;
  @query('.slash-menu__list') private list: HTMLElement;

  private stopAutoUpdate?: () => void;

  /** Whether the menu is showing. */
  @property({type: Boolean, reflect: true}) open = false;

  /** The items to list. Already filtered — the menu displays what it is given. */
  @property({type: Array}) items: SlashMenuItem[] = [];

  /** The query the items were matched against, shown in the heading. */
  @property() query = '';

  /** The name the list is announced by when there is no query. */
  @property() heading = 'Insert';

  /** Shown in place of the list when there are no items. */
  @property({attribute: 'empty-text'}) emptyText = 'No matches';

  /** The most items to render at once. Remaining matches are reported in the footer. */
  @property({attribute: 'max-items', type: Number}) maxItems = 25;

  /** Hides the insertion key (the item's value) normally shown against each item. */
  @property({attribute: 'hide-keys', type: Boolean}) hideKeys = false;

  /** Hides the pinned footer of keyboard hints. */
  @property({attribute: 'hide-hints', type: Boolean}) hideHints = false;

  /**
   * Remembers the items chosen here and lists the most recent of them first, under their own heading.
   * The key scopes the list to where the menu is used, so each place keeps its own history in
   * `localStorage`. Leave unset to offer no recently used section.
   */
  @property({attribute: 'recent-key'}) recentKey = '';

  /** The most recently used items to list. */
  @property({attribute: 'max-recent', type: Number}) maxRecent = 3;

  /** The heading shown above the recently used items. */
  @property({attribute: 'recent-heading'}) recentHeading = 'Recently used';

  /** The element or caret rect the panel is positioned against. */
  @property({attribute: false}) anchor: Element | VirtualElement | null = null;

  /** The preferred placement of the panel. */
  @property() placement: Placement = 'bottom-start';

  /** The gap between the caret and the panel. */
  @property({type: Number}) distance = 4;

  @state() private activeIndex = 0;
  @state() private recentKeys: string[] = [];

  /** How many recently used items the last update listed, to spot the list appearing or reordering. */
  private recentCount = 0;

  private get listItems(): SlashMenuItem[] {
    return this.maxItems > 0 ? this.items.slice(0, this.maxItems) : this.items;
  }

  /**
   * The remembered items that are in the current list, newest first. Only offered without a query —
   * once the user is searching, the ranked matches are the better answer.
   */
  private get recentItems(): SlashMenuItem[] {
    if (!this.recentKey || this.maxRecent < 1 || this.query.trim() !== '') return [];

    const available = new Map<string, SlashMenuItem>();
    for (const item of this.items) {
      const key = slashItemKey(item);
      if (!item.disabled && !available.has(key)) available.set(key, item);
    }

    const recent = this.recentKeys
      .map(key => available.get(key))
      .filter((item): item is SlashMenuItem => item !== undefined)
      .slice(0, this.maxRecent);

    // A section holding everything on offer is nothing but a second copy of the list
    return recent.length < this.items.length ? recent : [];
  }

  private get visibleItems(): SlashMenuItem[] {
    return [...this.recentItems, ...this.listItems];
  }

  /** The item that Enter would insert. */
  get activeItem(): SlashMenuItem | undefined {
    return this.visibleItems[this.activeIndex];
  }

  show() {
    this.open = true;
  }

  hide() {
    this.open = false;
  }

  /** Forgets the items remembered under `recent-key`. */
  clearRecent() {
    clearRecentSlashItems(this.recentKey);
    this.recentKeys = [];
  }

  /** Sets the active item by index, wrapping at both ends and skipping disabled items. */
  setActiveIndex(index: number) {
    const items = this.visibleItems;
    const selectable = items.filter(item => !item.disabled).length;
    if (!selectable) {
      this.activeIndex = -1;
      return;
    }

    let next = (index + items.length) % items.length;
    // Walk in the direction of travel until a selectable item is found
    const step = index < this.activeIndex ? -1 : 1;
    while (items[next]?.disabled) {
      next = (next + step + items.length) % items.length;
    }

    this.activeIndex = next;
    void this.updateComplete.then(() => this.scrollActiveIntoView());
  }

  /** Moves the active item by `delta` places. */
  moveActive(delta: number) {
    this.setActiveIndex(this.activeIndex + delta);
  }

  /** Chooses the active item, as pressing Enter would. */
  selectActive() {
    const item = this.activeItem;
    if (item) this.selectItem(item);
  }

  /** Recalculates the panel's position against its anchor. */
  reposition() {
    void this.position();
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.open) void this.updateComplete.then(() => this.startPositioner());
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.stopPositioner();
    this.hidePanelPopover();
  }

  private showPanelPopover() {
    const panel = this.panel;
    if (typeof panel?.showPopover === 'function' && !panel.matches(':popover-open')) {
      panel.showPopover();
    }
  }

  private hidePanelPopover() {
    const panel = this.panel;
    if (typeof panel?.hidePopover === 'function' && panel.matches(':popover-open')) {
      panel.hidePopover();
    }
  }

  private startPositioner() {
    this.stopPositioner();
    if (!this.anchor || !this.panel) return;

    // autoUpdate keeps the panel on the caret through scrolling and resizes
    this.stopAutoUpdate = autoUpdate(this.anchor, this.panel, () => void this.position());
  }

  private stopPositioner() {
    this.stopAutoUpdate?.();
    this.stopAutoUpdate = undefined;
  }

  private async position() {
    const {anchor, panel} = this;
    if (!this.open || !anchor || !panel) return;

    this.showPanelPopover();

    const {x, y} = await computePosition(anchor, panel, {
      placement: this.placement,
      strategy: 'fixed',
      middleware: [
        offset(this.distance),
        flip({padding: 8}),
        shift({padding: 8}),
        size({
          padding: 8,
          apply: ({availableHeight}) => {
            panel.style.setProperty('--auto-size-available-height', `${Math.max(availableHeight, 0)}px`);
          }
        })
      ]
    });

    Object.assign(panel.style, {left: `${x}px`, top: `${y}px`});
  }

  private selectItem(item: SlashMenuItem) {
    if (item.disabled) return;

    if (this.recentKey) this.recentKeys = recordRecentSlashItem(this.recentKey, item);

    this.dispatchEvent(new CustomEvent(SLASH_ITEM_SELECT, {
      bubbles: true,
      cancelable: true,
      composed: false,
      detail: {item, query: this.query}
    }));
  }

  private scrollActiveIntoView() {
    const active = this.renderRoot.querySelector<HTMLElement>('[data-slash-item][aria-selected="true"]');
    if (!active) return;

    const items = this.visibleItems;
    const list = this.list;

    // Group headings scroll with the items, and `nearest` stops at the item's own box — so landing
    // on the first or last item goes all the way to the list's edge to bring them back
    if (list && items.slice(0, this.activeIndex).every(item => item.disabled)) {
      list.scrollTop = 0;
      return;
    }

    if (list && items.slice(this.activeIndex + 1).every(item => item.disabled)) {
      list.scrollTop = list.scrollHeight;
      return;
    }

    active.scrollIntoView({block: 'nearest'});
  }

  // mousedown, not click: preventDefault keeps focus (and the caret) in the field
  private readonly handleItemMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const index = Number((event.currentTarget as HTMLElement).dataset.index);
    const item = this.visibleItems[index];
    if (item) {
      this.activeIndex = index;
      this.selectItem(item);
    }
  };

  protected willUpdate(changed: PropertyValues) {
    super.willUpdate(changed);

    // Another field may share the key, so the list is re-read each time the menu is shown
    if (changed.has('recentKey') || (changed.has('open') && this.open)) {
      this.recentKeys = readRecentSlashItems(this.recentKey);
    }

    // A genuinely new result set starts on its first selectable item. Re-resolving the same query
    // hands over an equal-but-new array, which must not move the user's place in the list.
    const isNewList = changed.has('items')
      && !sameItems(changed.get('items') as SlashMenuItem[] | undefined, this.items);

    // Items above the list shift every index below them, so the place is given up either way
    const recentCount = this.recentItems.length;
    if (isNewList || recentCount !== this.recentCount) {
      this.recentCount = recentCount;
      this.activeIndex = this.visibleItems.findIndex(item => !item.disabled);
    }
  }

  protected updated(changed: PropertyValues) {
    super.updated(changed);

    if (changed.has('open') || changed.has('anchor')) {
      if (this.open) {
        this.startPositioner();
      } else {
        this.stopPositioner();
        this.hidePanelPopover();
      }
    }

    if (this.open) void this.position();

    if (changed.has('items') || (changed.has('open') && this.open)) {
      this.scrollActiveIntoView();
    }
  }

  private renderItem(item: SlashMenuItem, index: number, showIcons: boolean) {
    const isActive = index === this.activeIndex;
    const token = !this.hideKeys && item.value && item.value !== item.label && !item.value.includes('\n') ? item.value : '';

    return html`
      <button
        type="button"
        part="item"
        class=${classMap({
          'slash-menu__item': true,
          'slash-menu__item--active': isActive,
          'slash-menu__item--disabled': !!item.disabled
        })}
        role="option"
        aria-selected=${isActive ? 'true' : 'false'}
        aria-disabled=${item.disabled ? 'true' : 'false'}
        data-slash-item
        data-index=${index}
        tabindex="-1"
        @mousedown=${this.handleItemMouseDown}>
        ${showIcons
          ? html`
            <span
              part="icon"
              class=${classMap({'slash-menu__icon': true, 'slash-menu__icon--empty': !item.icon})}>
              ${item.icon ? html`
                <zn-icon src=${item.icon} size="16"></zn-icon>` : ''}
            </span>`
          : ''}
        <span class="slash-menu__text">
          <span class="slash-menu__label">${item.label}</span>
          ${item.description ? html`
            <span class="slash-menu__description">${item.description}</span>` : ''}
        </span>
        ${token ? html`
          <code class="slash-menu__token">${token}</code>` : ''}
      </button>`;
  }

  private renderItems() {
    const items = this.visibleItems;
    const recentCount = this.recentItems.length;
    const showIcons = items.some(item => item.icon);
    let lastGroup: string | undefined;

    return items.map((item, index) => {
      const group = index < recentCount ? this.recentHeading : item.group;
      const heading = group && group !== lastGroup
        ? html`
          <div part="group-heading" class="slash-menu__group-heading">${group}</div>`
        : '';
      lastGroup = group;

      // The recently used section needs closing off; a heading of its own does that for the items
      // below it, and where they have none, a rule does it instead
      const divider = index === recentCount && recentCount > 0 && !heading
        ? html`
          <div part="divider" class="slash-menu__divider"></div>`
        : '';

      return html`${divider}${heading}${this.renderItem(item, index, showIcons)}`;
    });
  }

  private renderHint(keys: (TemplateResult | string)[], label: string) {
    return html`
      <span part="hint" class="slash-menu__hint">
        ${keys.map(key => html`
          <kbd part="hint-key" class="slash-menu__key">${key}</kbd>`)}
        ${label}
      </span>`;
  }

  private renderHints() {
    const key = (icon: string) => html`
      <zn-icon src="${icon}@lu" size="12"></zn-icon>`;

    return html`
      <div part="hints" class="slash-menu__hints">
        ${this.renderHint([key('arrow-up'), key('arrow-down')], 'navigate')}
        ${this.renderHint([key('corner-down-left')], 'select')}
        ${this.renderHint(['esc'], 'dismiss')}
      </div>`;
  }

  render() {
    const hidden = this.items.length - this.listItems.length;

    return html`
      <div
        part="panel"
        class="slash-menu__panel"
        popover="manual"
        aria-hidden=${this.open ? 'false' : 'true'}>
        <div
          part="list"
          class="slash-menu__list"
          role="listbox"
          aria-label=${this.query ? `Matches for ${this.query}` : this.heading}>
          ${this.items.length
            ? this.renderItems()
            : html`
              <div class="slash-menu__empty">${this.emptyText}</div>`}
          ${hidden > 0 ? html`
            <div part="footer" class="slash-menu__footer">${hidden} more — keep typing to narrow</div>` : ''}
        </div>
        ${this.hideHints ? '' : this.renderHints()}
      </div>`;
  }
}
