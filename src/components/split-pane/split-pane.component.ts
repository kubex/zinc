import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {eventOptions, property} from 'lit/decorators.js';
import {on} from "../../utilities/on";
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';

import styles from './split-pane.scss';

type NavigationItem = {
  caption: string;
  active: boolean;
  select: () => void;
};

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/split-pane
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
export default class ZnSplitPane extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  storage: Storage;
  mouseMoveHandler: null | EventListener = null;
  mouseUpHandler: null | EventListener = null;

  private currentPixelSize: number = 0;
  private currentPercentSize: number = 0;
  private currentContainerSize: number = 0;
  private focusChangeHandler = () => this.requestUpdate();
  private primaryFull: string;

  @property({attribute: 'pixels', type: Boolean, reflect: true}) calculatePixels = false;
  @property({attribute: 'secondary', type: Boolean, reflect: true}) preferSecondarySize = false;
  @property({attribute: 'min-size', type: Number, reflect: true}) minimumPaneSize = 10;
  @property({attribute: 'min-secondary-size', type: Number, reflect: true}) minimumSecondaryPaneSize: number;
  @property({attribute: 'max-size', type: Number, reflect: true}) maximumPaneSize: number;
  @property({attribute: 'initial-size', type: Number, reflect: true}) initialSize = 50;
  @property({attribute: 'store-key', reflect: true}) storeKey: string = "";
  @property({attribute: 'bordered', type: Boolean, reflect: true}) border = false;
  @property({attribute: 'vertical', type: Boolean, reflect: true}) vertical = false;

  @property({attribute: 'primary-caption', reflect: true}) primaryCaption = 'Primary';
  @property({attribute: 'secondary-caption', reflect: true}) secondaryCaption = 'Secondary';

  @property({attribute: 'focus-pane', type: Number, reflect: true}) _focusPane = 0;

  @property({attribute: 'padded', type: Boolean, reflect: true}) padded = false;
  @property({attribute: 'padded-right', type: Boolean, reflect: true}) paddedRight = false;
  @property({type: Boolean, reflect: true}) gap = false;
  @property({reflect: true}) hide: 'primary' | 'secondary' | '' = '';
  @property({attribute: 'merged-navigation', type: Boolean, reflect: true}) mergedNavigation = false;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage: boolean;
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;
  protected _store: Store;

  connectedCallback() {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znsp:", this.storeTtl);
    this.primaryFull = this.calculatePixels ? this.initialSize + 'px' : this.initialSize + '%';
    on(this, 'click', '[split-pane-focus]', (e: Event & { selectedTarget: EventTarget }) => {
      e.preventDefault();
      e.stopPropagation();
      this._setFocusPane(parseInt((e.selectedTarget as HTMLElement).getAttribute('split-pane-focus')!));
    });
    this.addEventListener('zn-split-pane-focus-change', this.focusChangeHandler);
  }

  disconnectedCallback() {
    this.removeEventListener('zn-split-pane-focus-change', this.focusChangeHandler);
    super.disconnectedCallback();
  }

  firstUpdated(changedProperties: any) {
    setTimeout(this.applyStoredSize.bind(this), 100);
    super.firstUpdated(changedProperties);
  }

  applyStoredSize() {
    this.currentContainerSize = (this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width);
    let applyPixels = this.preferSecondarySize ? this.currentContainerSize - this.initialSize : this.initialSize;
    let applyPercent = this.preferSecondarySize ? 100 - this.initialSize : this.initialSize;


    const storedValue = this._store.get(this.storeKey);
    if (storedValue != null) {
      const parts = storedValue.split(",");
      if (parts.length >= 3) {
        applyPixels = parseInt(parts[0]);
        applyPercent = parseInt(parts[1]);
        const storedBasis = parseInt(parts[2]);
        if (this.preferSecondarySize && this.calculatePixels) {
          applyPixels = (this.currentContainerSize / storedBasis) * applyPixels;
        }
      }
    }
    this.setSize(this.calculatePixels ? applyPixels : (this.currentContainerSize / 100) * applyPercent);
  }

  @eventOptions({passive: true})
  resize(e: any) {
    if (this.hide === 'primary' || this.hide === 'secondary') {
      return;
    }

    if (this.mouseUpHandler != null) {
      this.mouseUpHandler(e);
    }

    this.classList.add('resizing');
    this.currentContainerSize = this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width;
    const pageOffset = this.vertical ? this.getBoundingClientRect().top : this.getBoundingClientRect().left;

    this.mouseMoveHandler = function (e: any) {
      let offset = (this.vertical ? e.y : e.x);
      //'touches' in e fixes Safari
      if ('touches' in e && e instanceof TouchEvent) {
        offset = (this.vertical ? e.touches[0].clientY : e.touches[0].clientX);
      }
      this.setSize(offset - pageOffset);
    }.bind(this);

    this.mouseUpHandler = function () {
      this._store.set(this.storeKey, Math.round(this.currentPixelSize) + "," + Math.round(this.currentPercentSize) + "," + this.currentContainerSize);
      this.classList.remove('resizing');
      window.removeEventListener('touchmove', this.mouseMoveHandler);
      window.removeEventListener('mousemove', this.mouseMoveHandler);

      window.removeEventListener('touchend', this.mouseUpHandler);
      window.removeEventListener('mouseup', this.mouseUpHandler);
    }.bind(this);

    window.addEventListener('touchmove', this.mouseMoveHandler);
    window.addEventListener('touchend', this.mouseUpHandler);

    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
  }

  setSize(primaryPanelPixels: number) {
    const hasMinimumSecondaryPaneSize = Number.isFinite(this.minimumSecondaryPaneSize);
    const maximumPrimaryPanelPixels = hasMinimumSecondaryPaneSize
      ? this.currentContainerSize - (this.calculatePixels
        ? this.minimumSecondaryPaneSize
        : (this.currentContainerSize / 100) * this.minimumSecondaryPaneSize)
      : undefined;

    let pixelSize = maximumPrimaryPanelPixels === undefined
      ? primaryPanelPixels
      : Math.min(primaryPanelPixels, maximumPrimaryPanelPixels);
    let percentSize = (pixelSize / this.currentContainerSize) * 100;

    if (this.calculatePixels) {
      const minimumPrimaryPanelPixels = maximumPrimaryPanelPixels === undefined
        ? this.minimumPaneSize
        : Math.min(this.minimumPaneSize, maximumPrimaryPanelPixels);
      if (this.maximumPaneSize || maximumPrimaryPanelPixels !== undefined) {
        pixelSize = Math.max(
          minimumPrimaryPanelPixels,
          Math.min(this.maximumPaneSize ?? Infinity, maximumPrimaryPanelPixels ?? Infinity, pixelSize)
        );
      } else {
        pixelSize = Math.max(minimumPrimaryPanelPixels, pixelSize);
      }
      percentSize = (pixelSize / this.currentContainerSize) * 100;
      this.initialSize = pixelSize;
    } else {
      const maximumPrimaryPanelPercent = hasMinimumSecondaryPaneSize ? 100 - this.minimumSecondaryPaneSize : undefined;
      const minimumPrimaryPanelPercent = maximumPrimaryPanelPercent === undefined
        ? this.minimumPaneSize
        : Math.min(this.minimumPaneSize, maximumPrimaryPanelPercent);
      if (this.maximumPaneSize || maximumPrimaryPanelPercent !== undefined) {
        percentSize = Math.max(
          minimumPrimaryPanelPercent,
          Math.min(this.maximumPaneSize ?? Infinity, maximumPrimaryPanelPercent ?? Infinity, percentSize)
        );
      } else {
        percentSize = Math.max(minimumPrimaryPanelPercent, percentSize);
      }
      pixelSize = (this.currentContainerSize / 100) * percentSize;
      this.initialSize = percentSize;
    }
    this.currentPixelSize = pixelSize;
    this.currentPercentSize = percentSize;
    this.primaryFull = this.calculatePixels ? (this.currentPixelSize + 'px') : (this.currentPercentSize + '%');
  }

  _setFocusPane(idx: number) {
    this._focusPane = idx;
    this.dispatchEvent(new CustomEvent('zn-split-pane-focus-change', {bubbles: true, composed: true}));
  }

  private getDirectNestedSplitPanes() {
    return Array.from(this.querySelectorAll<ZnSplitPane>('zn-split-pane')).filter(child => {
      return child.parentElement?.closest('zn-split-pane') === this && !child.vertical;
    });
  }

  private updateNestedNavigationMerging() {
    this.getDirectNestedSplitPanes().forEach(child => {
      child.mergedNavigation = !this.vertical;
    });
  }

  private getPaneIndexForNestedSplitPane(child: ZnSplitPane) {
    let node: Element | null = child;
    while (node && node.parentElement !== this) {
      node = node.parentElement;
    }

    return node?.getAttribute('slot') === 'secondary' ? 1 : 0;
  }

  private getNestedNavigationItems(parentIdx: number): NavigationItem[] {
    return this.getDirectNestedSplitPanesForPane(parentIdx)
      .flatMap(child => child.getNavigationItems().map(item => {
        return {
          caption: item.caption,
          active: this._focusPane === parentIdx && item.active,
          select: () => {
            this._setFocusPane(parentIdx);
            item.select();
          }
        };
      }));
  }

  private getDirectNestedSplitPanesForPane(parentIdx: number) {
    return this.getDirectNestedSplitPanes().filter(child => this.getPaneIndexForNestedSplitPane(child) === parentIdx);
  }

  private getNavigationItems(): NavigationItem[] {
    this.updateNestedNavigationMerging();

    const primaryNestedItems = this.getNestedNavigationItems(0);
    const secondaryNestedItems = this.getNestedNavigationItems(1);
    const primaryItems = primaryNestedItems.length > 0
      ? primaryNestedItems
      : [{
        caption: this.primaryCaption,
        active: this._focusPane === 0,
        select: () => this._setFocusPane(0)
      }];
    const secondaryItems = secondaryNestedItems.length > 0
      ? secondaryNestedItems
      : [{
        caption: this.secondaryCaption,
        active: this._focusPane === 1,
        select: () => this._setFocusPane(1)
      }];

    return [
      ...primaryItems,
      ...secondaryItems
    ];
  }

  protected render(): unknown {
    const resizeWidth = '2px';
    const resizeMargin = '5px';
    const minimumSecondaryPaneSize = Number.isFinite(this.minimumSecondaryPaneSize)
      ? this.minimumSecondaryPaneSize + (this.calculatePixels ? 'px' : '%')
      : 'var(--min-panel-size)';
    return html`
      <style>:host {
        --min-panel-size: ${this.minimumPaneSize}${this.calculatePixels ? 'px' : '%'};
        --min-secondary-panel-size: ${minimumSecondaryPaneSize};
        --max-panel-size: ${this.maximumPaneSize ? this.maximumPaneSize + (this.calculatePixels ? 'px' : '%') : 'none'};
        --initial-size: ${this.primaryFull};
        --resize-size: ${resizeWidth};
        --resize-margin: ${resizeMargin};
      }</style>
      <ul id="split-nav">
        ${this.getNavigationItems().map(item => html`
          <li class="${item.active ? 'active' : ''}" @click="${item.select}">
            ${item.caption}
          </li>
        `)}
      </ul>
      <div id="primary-pane">
        <slot name="primary" @slotchange="${() => this.requestUpdate()}"></slot>
      </div>
      <div @mousedown="${this.resize}" @touchstart="${this.resize}" id="resizer"></div>
      <div id="secondary-pane">
        <slot name="secondary" @slotchange="${() => this.requestUpdate()}"></slot>
      </div>
    `;
  }
}
