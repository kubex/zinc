import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {deepQuerySelectorAll} from "../../utilities/query";
import {EASE_IN_OUT, EASE_OUT, prefersReducedMotion} from "../../internal/animate";
import {MutationController} from '@lit-labs/observers/mutation-controller.js';
import {pointerInitiated} from '../../internal/input-modality';
import {property, state} from "lit/decorators.js";
import {Store} from "../../internal/storage";
import {type ZnChangeEvent} from "../../events/zn-change";
import ZincElement from '../../internal/zinc-element';
import type ZnCheckbox from "../checkbox";

import styles from './settings-container.scss';

// A `display: contents` element never has a box of its own, so it counts as rendered.
const rendered = (el: Element) => el.checkVisibility() || getComputedStyle(el).display === 'contents';

const COLLAPSIBLE = ['height', 'paddingTop', 'paddingBottom', 'marginTop', 'marginBottom', 'borderTopWidth',
  'borderBottomWidth'] as const;
const FADED = ['opacity', 'translate'] as const;

interface SettingsContainerFilter {
  attribute: string;
  checked: boolean;
  label: string;
  itemSelector?: string;
  toggleAttribute?: string;
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/settings-container
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-show - Emitted when the pull tab panel opens.
 * @event zn-hide - Emitted when the pull tab panel closes.
 *
 * @slot - The default slot.
 * @slot filter - Filter definitions used to toggle visibility of content.
 * @slot dropdown-content - Custom content for the settings panel.
 * @slot tab - Extra content rendered inside the pull tab next to the chevron.
 *
 * An `isolated` `zn-navbar` inside the container switches its filters: selecting a tab hides the items carrying the
 * attribute named by the tab's `tab`, and a tab of `""` shows every item.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnSettingsContainer extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @state() filters: SettingsContainerFilter[] = [];

  @property() position: 'top-end' | 'top-start' | 'bottom-end' | 'bottom-start' = 'bottom-start';

  @property({attribute: 'store-key'}) storeKey: string;
  @property({attribute: 'no-scroll'}) noScroll: boolean;
  @property({attribute: 'pull-tab', type: Boolean, reflect: true}) pullTab = false;
  @property({type: Boolean, reflect: true}) open = false;
  /** Hides the settings toggle, for a container whose filters an isolated `zn-navbar` switches. */
  @property({attribute: 'no-settings', type: Boolean, reflect: true}) noSettings = false;

  @state() private panelExpanded = false;

  private readonly _mutationObserver = new MutationController(this, {
    target: null,
    config: {childList: true, subtree: true, attributes: true},
    callback: mutations => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' &&
          (mutation.attributeName === 'hidden' ||
            this.filters.some(f => f.toggleAttribute === mutation.attributeName))) {
          continue;
        }
        this.scheduleUpdateFilters();
        break;
      }
    },
  });

  private _updateFiltersScheduled = false;

  private _store: Store;

  private _hiddenElements: Set<Element> = new Set();

  private _fades = new Map<Element, { animations: Animation[]; pending: Element[] }>();

  connectedCallback() {
    super.connectedCallback();

    this._store = new Store(window.sessionStorage, this.storeKey);

    this.recomputeFiltersFromSlot();

    // Load saved filter states before applying filters
    if (this.storeKey) {
      const savedFilters = this._store.get('filters');
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters) as Record<string, boolean>;
        this.filters = this.filters.map(filter => ({
          ...filter,
          checked: Object.prototype.hasOwnProperty.call(parsedFilters, filter.attribute) ? parsedFilters[filter.attribute] : filter.checked
        }));
      }
    }

    this.updateFilters();

    this._mutationObserver.observe(this);
    this.addEventListener('zn-select', this.handleNavbarSelect);
  }

  protected firstUpdated() {
    this.syncNavbars();
  }

  disconnectedCallback() {
    this.removeEventListener('zn-select', this.handleNavbarSelect);
    document.removeEventListener('mousedown', this.handleDocumentMouseDown, true);
    super.disconnectedCallback();
  }

  private handleDocumentMouseDown = (e: MouseEvent) => {
    if (!this.open) return;
    const pullTab = this.shadowRoot?.querySelector('.pull-tab');
    if (pullTab && e.composedPath().includes(pullTab)) return;
    this.hidePullTab();
  };

  private togglePullTab = () => {
    if (this.open) {
      this.hidePullTab();
    } else {
      this.open = true;
      document.addEventListener('mousedown', this.handleDocumentMouseDown, true);
      this.emit('zn-show');
    }
  };

  private hidePullTab() {
    this.open = false;
    this.panelExpanded = false;
    document.removeEventListener('mousedown', this.handleDocumentMouseDown, true);
    this.emit('zn-hide');
  }

  private handlePanelTransitionEnd = (e: TransitionEvent) => {
    if (e.propertyName !== 'grid-template-rows') return;
    this.panelExpanded = this.open;
  };

  // Debounced scheduling to avoid excessive updates on rapid DOM mutations
  private scheduleUpdateFilters() {
    if (this._updateFiltersScheduled) return;
    this._updateFiltersScheduled = true;
    Promise.resolve().then(() => {
      this._updateFiltersScheduled = false;
      this.updateFilters();
    });
  }

  private handleContentSlotChange = () => {
    this.updateFilters();
  };

  private handleFiltersSlotChange = () => {
    this.recomputeFiltersFromSlot();
    this.updateFilters();
  };

  private recomputeFiltersFromSlot() {
    const existingChecked = new Map(this.filters.map(f => [f.attribute, f.checked]));
    const slotFilters = this.querySelectorAll('[slot="filter"]');
    const nextFilters: SettingsContainerFilter[] = [];
    slotFilters.forEach(filter => {
      const attribute = filter.getAttribute('attribute');
      if (!attribute) return;
      const defaultChecked = filter.getAttribute('default') === 'true';
      const checked = existingChecked.has(attribute) ? !!existingChecked.get(attribute) : defaultChecked;
      const label = filter.textContent || 'Unnamed Filter';
      const itemSelector = filter.getAttribute('item-selector') || '*';
      const toggleAttribute = filter.getAttribute('toggle-attribute') || undefined;
      nextFilters.push({attribute, checked, label, itemSelector, toggleAttribute});
    });
    this.filters = nextFilters;
  }

  private updateSingleFilter(filter: SettingsContainerFilter, checked: boolean) {
    let items;
    const attrAppend = filter.attribute === "*" ? `` : `[${filter.attribute}]`;
    if (filter.itemSelector && filter.itemSelector.startsWith('>')) {
      items = deepQuerySelectorAll(filter.itemSelector.substring(1) + attrAppend, this, "");
    } else {
      items = this.querySelectorAll(filter.itemSelector + attrAppend);
    }
    items.forEach(item => {
      if (filter.toggleAttribute) {
        if (checked) {
          item.removeAttribute(filter.toggleAttribute);
        } else {
          item.setAttribute(filter.toggleAttribute, 'true');
        }
        return;
      }

      if (checked) {
        const shouldStayHidden = this.filters.some(f => {
          if (f.attribute === filter.attribute || f.checked || f.toggleAttribute) return false;
          const fAttrAppend = f.attribute === "*" ? `` : `[${f.attribute}]`;
          let fItems;
          if (f.itemSelector && f.itemSelector.startsWith('>')) {
            fItems = deepQuerySelectorAll(f.itemSelector.substring(1) + fAttrAppend, this, "");
          } else {
            fItems = this.querySelectorAll(f.itemSelector + fAttrAppend);
          }
          return Array.from(fItems).includes(item);
        });

        if (!shouldStayHidden) {
          item.removeAttribute('hidden');
          this._hiddenElements.delete(item);
        }
      } else {
        item.setAttribute('hidden', 'true');
        this._hiddenElements.add(item);
      }
    });
  }

  updateFilters() {
    // reset all items
    this._hiddenElements.forEach(el => el.removeAttribute('hidden'));
    this._hiddenElements.clear();

    // apply filters
    this.filters.forEach(filter => {
      this.updateSingleFilter(filter, filter.checked);
    });
  }

  private handleNavbarSelect = (e: Event) => {
    const navbar = e.target as HTMLElement;
    const item = (e as CustomEvent<{ item?: HTMLElement }>).detail?.item;
    if (navbar.localName !== 'zn-navbar' || !navbar.hasAttribute('isolated') || !item?.hasAttribute('data-tab')) return;

    const hide = item.getAttribute('data-tab');
    this.filters = this.filters.map(filter => ({...filter, checked: filter.attribute !== hide}));
    this.saveFilters();
    this.animateVisibility(() => this.updateFilters());
    this.syncNavbars();
  };

  // Marks the tab for the hidden attribute active, so the navbar's indicator follows the filter.
  private syncNavbars() {
    const hidden = this.filters.find(filter => !filter.checked)?.attribute ?? '';
    this.querySelectorAll<HTMLElement & {
      navigation: { tab?: string; active?: boolean }[];
    }>('zn-navbar[isolated]').forEach(navbar => {
      navbar.navigation = (navbar.navigation ?? []).map(item => ({...item, active: (item.tab ?? '') === hidden}));
    });
  }

  private saveFilters() {
    if (!this.storeKey) return;
    const filterStates = this.filters.reduce((acc: Record<string, boolean>, filter) => {
      acc[filter.attribute] = filter.checked;
      return acc;
    }, {} satisfies Record<string, boolean>);
    this._store.set('filters', JSON.stringify(filterStates));
  }

  updateFilter(e: ZnChangeEvent) {
    const attribute = (e.target as ZnCheckbox).getAttribute('data-attribute');
    const checked = (e.target as ZnCheckbox).isChecked

    // Find the specific filter that changed
    const changedFilter = this.filters.find(f => f.attribute === attribute);
    if (!changedFilter) return;

    this.filters = this.filters.map(filter => {
      if (filter.attribute === attribute) {
        return {...filter, checked};
      }
      return filter;
    });

    this.saveFilters();

    // Only update elements affected by this specific filter
    this.animateVisibility(() => this.updateSingleFilter(changedFilter, checked));
  }

  // Fades items a click shows or hides; anything else changes them instantly. Each fade runs on the outermost
  // ancestor the toggle shows or hides (e.g. a group heading hidden by `:has()` once its rows are), so the group
  // moves as one.
  private animateVisibility(apply: () => void) {
    const animate = pointerInitiated(this);
    const wasHidden = new Set(this._hiddenElements);
    const unrendered = new Map<Element, Element[]>();
    if (animate) wasHidden.forEach(el => unrendered.set(el, this.ancestors(el).filter(a => !rendered(a))));
    apply();

    const shown = [...wasHidden].filter(el => !this._hiddenElements.has(el));
    const hidden = [...this._hiddenElements].filter(el => !wasHidden.has(el));
    if (!animate) {
      if (shown.length || hidden.length) [...this._fades.keys()].forEach(target => this.settle(target));
      return;
    }

    this.groupByTarget(hidden, a => !rendered(a)).forEach((pending, target) => this.fade(target, true, pending));
    this.groupByTarget(shown, (a, el) => unrendered.get(el)!.includes(a) && rendered(a))
      .forEach((pending, target) => this.fade(target, false, pending));
  }

  private ancestors(el: Element) {
    const list: Element[] = [];
    for (let a = el.parentElement; a && a !== this; a = a.parentElement) list.push(a);
    return list;
  }

  private groupByTarget(elements: Element[], changed: (ancestor: Element, el: Element) => boolean) {
    const groups = new Map<Element, Element[]>();
    elements.forEach(el => {
      const target = this.ancestors(el).findLast(a => this._fades.has(a) || changed(a, el)) ?? el;
      groups.set(target, [...(groups.get(target) ?? []), el]);
    });
    return groups;
  }

  private fade(target: Element, hide: boolean, pending: Element[]) {
    const running = this._fades.get(target);
    // Start from where an interrupted fade had got to, so reversing mid-way doesn't jump.
    const current = running ? this.frame(target) : null;
    const exiting = hide ? [...(running?.pending ?? []), ...pending] : [];
    if (hide) this._fades.delete(target);
    this.settle(target);
    running?.animations.forEach(a => a.cancel());

    // Exiting items stay rendered until the fade ends, then get `hidden` back.
    exiting.forEach(el => el.removeAttribute('hidden'));
    // The box collapses with the fade so the content below slides into place rather than jumping once it's hidden.
    const natural = this.frame(target);
    const parent = target.parentElement ? getComputedStyle(target.parentElement) : null;
    // A hidden flex item also drops its gap, so the collapse swallows it with a negative margin.
    const gap = parent?.display.includes('flex') && parent.flexDirection.startsWith('column')
      ? parseFloat(parent.rowGap) || 0 : 0;
    const hiddenFrame: Keyframe = {
      ...Object.fromEntries(COLLAPSIBLE.map(p => [p, '0px'])),
      marginBottom: `${-gap}px`,
      opacity: 0,
      translate: prefersReducedMotion() ? 'none' : '0 -4px',
    };
    const from = current ?? (hide ? natural : hiddenFrame);
    const to = hide ? hiddenFrame : natural;
    const pick = (frame: Keyframe, props: readonly string[]) => Object.fromEntries(props.map(p => [p, frame[p]]));
    // Ease-in-out on the layout move: an ease-out tail crawls in sub-pixel steps that snap visibly. The fade-out
    // finishes first so the content isn't seen being clipped. `overflow: hidden` drops a flex item's automatic
    // minimum size, so without `flex-shrink: 0` a scroll container squeezes it to fit and it snaps back on finish.
    const clip = {overflow: 'hidden', flexShrink: '0'};
    const box = target.animate([{...pick(from, COLLAPSIBLE), ...clip}, {...pick(to, COLLAPSIBLE), ...clip}],
      {duration: 220, easing: EASE_IN_OUT, fill: 'forwards'});
    const fade = target.animate([pick(from, FADED), pick(to, FADED)], {
      duration: hide ? 120 : 220,
      easing: EASE_OUT,
      fill: 'forwards'
    });
    this._fades.set(target, {animations: [box, fade], pending: exiting});
    box.addEventListener('finish', () => this.settle(target), {once: true});
  }

  private frame(el: Element): Keyframe {
    const style = getComputedStyle(el);
    return Object.fromEntries([...COLLAPSIBLE, ...FADED].map(p => [p, style[p]]));
  }

  private settle(target: Element) {
    const fade = this._fades.get(target);
    if (!fade) return;
    this._fades.delete(target);
    fade.pending.forEach(el => {
      if (this._hiddenElements.has(el)) el.setAttribute('hidden', 'true');
    });
    fade.animations.forEach(a => a.cancel());
  }

  render() {
    let placement = 'top-start';

    switch (this.position) {
      case 'top-end':
        placement = 'bottom-end';
        break;
      case 'top-start':
        placement = 'bottom-start';
        break;
      case 'bottom-end':
        placement = 'top-end';
        break;
      case 'bottom-start':
        placement = 'top-start';
        break;
    }

    return html`
      <div class="${classMap({
        'container': true,
        'container--scroll': !this.noScroll,
      })}">
        <div class="scroll-content">
          <slot @slotchange="${this.handleContentSlotChange}"></slot>
        </div>
        ${this.noSettings ? '' : this.pullTab ? this.renderPullTab() : html`
          <zn-dropdown placement="${placement}" class="${classMap({
            'setting-container__dropdown': true,
            [`setting-container__dropdown--${this.position}`]: true,
          })}">
            <zn-icon class="setting-container__toggle-button" slot="trigger" size="24" src="settings" round></zn-icon>
            ${this.getDropdownContent()}
          </zn-dropdown>`}
      </div>
    `;
  }

  private renderPullTab() {
    return html`
      <div class="${classMap({
        'pull-tab': true,
        'pull-tab--open': this.open,
        'pull-tab--expanded': this.panelExpanded,
      })}">
        <div class="pull-tab__panel" @transitionend="${this.handlePanelTransitionEnd}">
          <div class="pull-tab__panel-content">
            ${this.getDropdownContent()}
          </div>
        </div>
        <button class="pull-tab__tab"
                type="button"
                aria-expanded="${this.open ? 'true' : 'false'}"
                aria-label="Settings"
                @click="${this.togglePullTab}">
          <slot name="tab"></slot>
          <zn-icon src="${this.open ? 'chevron-up@lu' : 'chevron-down@lu'}" size="20"></zn-icon>
        </button>
      </div>`;
  }

  private getDropdownContent() {
    const hasDropdownContent = this.querySelector('[slot="dropdown-content"]');
    if (hasDropdownContent) {
      return html`
        <slot name="dropdown-content"></slot>`;
    }
    return html`
      <div class="settings-container__dropdown-content">
        <slot name="filter" style="display: none;" @slotchange="${this.handleFiltersSlotChange}"></slot>
        ${this.filters.map(filter => html`
          <zn-checkbox class="settings-container__dropdown-item"
                       data-attribute="${filter.attribute}"
                       .checked=${filter.checked}
                       @zn-change=${this.updateFilter}>
            ${filter.label}
          </zn-checkbox>`)}
      </div>`;
  }
}
