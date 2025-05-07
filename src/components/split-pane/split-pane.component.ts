import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {eventOptions, property} from 'lit/decorators.js';
import {on} from "../../utilities/on";
import {Store} from "../../internal/storage";
import ZincElement from '../../internal/zinc-element';

import styles from './split-pane.scss';

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
  mouseMoveHandler: null | ((this: Window, ev: TouchEvent | MouseEvent) => void) = null;
  mouseUpHandler: null | ((this: Window, ev: TouchEvent | MouseEvent) => void) = null;

  private currentPixelSize: number = 0;
  private currentPercentSize: number = 0;
  private currentContainerSize: number = 0;
  private primaryFull: string;

  @property({attribute: 'pixels', type: Boolean, reflect: true}) calculatePixels = false;
  @property({attribute: 'secondary', type: Boolean, reflect: true}) preferSecondarySize = false;
  @property({attribute: 'min-size', type: Number, reflect: true}) minimumPaneSize = 10;
  @property({attribute: 'initial-size', type: Number, reflect: true}) initialSize = 50;
  @property({attribute: 'store-key', reflect: true}) storeKey: string = "";
  @property({attribute: 'bordered', type: Boolean, reflect: true}) border = false;
  @property({attribute: 'vertical', type: Boolean, reflect: true}) vertical: boolean = false;

  @property({attribute: 'primary-caption', reflect: true}) primaryCaption = 'Primary';
  @property({attribute: 'secondary-caption', reflect: true}) secondaryCaption = 'Secondary';

  @property({attribute: 'focus-pane', type: Number, reflect: true}) _focusPane = 0;

  @property({attribute: 'padded', type: Boolean, reflect: true}) padded = false;
  @property({attribute: 'padded-right', type: Boolean, reflect: true}) paddedRight = false;

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
      this._setFocusPane(parseInt((e.selectedTarget as HTMLElement).getAttribute('split-pane-focus') as string));
    });
  }

  firstUpdated(changedProperties: PropertyValues) {
    setTimeout(this.applyStoredSize.bind(this), 100);
    super.firstUpdated(changedProperties);
  }

  applyStoredSize() {
    this.currentContainerSize = (this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width);
    let applyPixels = this.preferSecondarySize ? this.currentContainerSize - this.initialSize : this.initialSize;
    let applyPercent = this.preferSecondarySize ? 100 - this.initialSize : this.initialSize;


    const storedValue = this._store.get(this.storeKey);
    if (storedValue !== null) {
      const parts = storedValue.split(",");
      if (parts.length >= 3) {
        applyPixels = parseInt(parts[0]);
        applyPercent = parseInt(parts[1]);
        const storedBasis = parseInt(parts[2]);
        if (this.preferSecondarySize && this.calculatePixels) {
          applyPixels *= (this.currentContainerSize / storedBasis);
        }
      }
    }
    this.setSize(this.calculatePixels ? applyPixels : (this.currentContainerSize / 100) * applyPercent);
  }

  @eventOptions({passive: true})
  resize = (e: MouseEvent)  => {
    if (this.mouseUpHandler !== null) {
      // @ts-expect-error this context of type this is not assignable to methods
      this.mouseUpHandler(e);
    }

    this.classList.add('resizing');
    this.currentContainerSize = this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width;
    const pageOffset = this.vertical ? this.getBoundingClientRect().top : this.getBoundingClientRect().left;

    this.mouseMoveHandler = (mouseEvent: MouseEvent) => {
      let offset: number = (this.vertical ? mouseEvent.y : mouseEvent.x);
      if (mouseEvent instanceof TouchEvent) {
        offset = (this.vertical ? mouseEvent.touches[0].clientY : mouseEvent.touches[0].clientX);
      }
      this.setSize(offset - pageOffset);
    };

    this.mouseUpHandler = () => {
      this._store.set(this.storeKey, Math.round(this.currentPixelSize) + "," + Math.round(this.currentPercentSize) + "," + this.currentContainerSize);
      this.classList.remove('resizing');
      // @ts-expect-error no overload matches this type
      window.removeEventListener('touchmove', this.mouseMoveHandler);
      // @ts-expect-error no overload matches this type
      window.removeEventListener('mousemove', this.mouseMoveHandler);

      // @ts-expect-error no overload matches this type
      window.removeEventListener('touchend', this.mouseUpHandler);
      // @ts-expect-error no overload matches this type
      window.removeEventListener('mouseup', this.mouseUpHandler);
    };

    window.addEventListener('touchmove', this.mouseMoveHandler);
    window.addEventListener('touchend', this.mouseUpHandler);

    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
  }

  setSize(primaryPanelPixels: number) {
    let pixelSize = primaryPanelPixels;
    let percentSize = (primaryPanelPixels / this.currentContainerSize) * 100;

    if (this.calculatePixels) {
      pixelSize = Math.max(this.minimumPaneSize, pixelSize);
      this.initialSize = pixelSize;
    } else {
      percentSize = Math.max(this.minimumPaneSize, percentSize);
      this.initialSize = percentSize;
    }
    this.currentPixelSize = pixelSize;
    this.currentPercentSize = percentSize;
    this.primaryFull = this.calculatePixels ? (this.currentPixelSize + 'px') : (this.currentPercentSize + '%');
  }

  _togglePane(e: MouseEvent) {
    this._setFocusPane(parseInt((e.target as Element).getAttribute('idx')!));
  }

  _setFocusPane(idx: number) {
    this._focusPane = idx;
    this.querySelectorAll('ul#split-nav li').forEach((el) => {
      el.classList.toggle('active', parseInt(el.getAttribute('idx') as string) === idx);
    });
  }

  protected render(): unknown {
    const resizeWidth = '2px';
    const resizeMargin = '5px';
    return html`
      <style>:host {
        --min-panel-size: ${this.minimumPaneSize}${this.calculatePixels ? 'px' : '%'};
        --initial-size: ${this.primaryFull};
        --resize-size: ${resizeWidth};
        --resize-margin: ${resizeMargin};
      }</style>
      <ul id="split-nav">
        <li idx="0" class="${this._focusPane === 0 ? 'active' : ''}" @click="${this._togglePane}">
          ${this.primaryCaption}
        </li>
        <li idx="1" class="${this._focusPane === 1 ? 'active' : ''}" @click="${this._togglePane}">
          ${this.secondaryCaption}
        </li>
      </ul>
      <div id="primary-pane">
        <slot name="primary"></slot>
      </div>
      <div @mousedown="${this.resize}" @touchstart="${this.resize}" id="resizer"></div>
      <div id="secondary-pane">
        <slot name="secondary"></slot>
      </div>
    `;
  }
}
