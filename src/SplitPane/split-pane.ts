import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc-element";
import {on} from "../on";
import {Store} from "../storage";

@customElement('zn-split-pane')
export class SplitPane extends ZincElement
{
  static styles = unsafeCSS(styles);

  private storage: Storage;
  mouseMoveHandler: null | EventListener = null;
  mouseUpHandler: null | EventListener = null;

  private currentPixelSize: number = 0;
  private currentPercentSize: number = 0;
  private currentContainerSize: number = 0;
  private primaryFull: string;

  @property({attribute: 'pixels', type: Boolean, reflect: true}) calculatePixels = false;
  @property({attribute: 'secondary', type: Boolean, reflect: true}) preferSecondarySize = false;
  @property({attribute: 'min-size', type: Number, reflect: true}) minimumPaneSize = 10;
  @property({attribute: 'initial-size', type: Number, reflect: true}) initialSize = 50;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;
  @property({attribute: 'bordered', type: Boolean, reflect: true}) border = false;
  @property({attribute: 'vertical', type: Boolean, reflect: true}) vertical = false;

  @property({attribute: 'primary-caption', type: String, reflect: true}) primaryCaption = 'Primary';
  @property({attribute: 'secondary-caption', type: String, reflect: true}) secondaryCaption = 'Secondary';

  @property({attribute: 'focus-pane', type: Number, reflect: true}) _focusPane = 0;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;
  @property({attribute: 'store-ttl', type: Number, reflect: true}) storeTtl = 0;
  protected _store: Store;

  connectedCallback()
  {
    super.connectedCallback();
    this._store = new Store(this.localStorage ? window.localStorage : window.sessionStorage, "znsp:", this.storeTtl);
    this.primaryFull = this.calculatePixels ? this.initialSize + 'px' : this.initialSize + '%';
    on(this, 'click', '[split-pane-focus]', (e) =>
    {
      e.preventDefault();
      e.stopPropagation();
      this._setFocusPane(parseInt((e.selectedTarget as HTMLElement).getAttribute('split-pane-focus')));
    });
  }

  firstUpdated(changedProperties)
  {
    super.firstUpdated(changedProperties);
    setTimeout(this.applyStoredSize.bind(this), 100);
  }

  applyStoredSize()
  {
    this.currentContainerSize = (this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width);
    let applyPixels = this.preferSecondarySize ? this.currentContainerSize - this.initialSize : this.initialSize;
    let applyPercent = this.preferSecondarySize ? 100 - this.initialSize : this.initialSize;


    const storedValue = this._store.get(this.storeKey);
    if(storedValue != null)
    {
      const parts = storedValue.split(",");
      if(parts.length >= 3)
      {
        applyPixels = parseInt(parts[0]);
        applyPercent = parseInt(parts[1]);
        const storedBasis = parseInt(parts[2]);
        if(this.preferSecondarySize && this.calculatePixels)
        {
          applyPixels = (this.currentContainerSize / storedBasis) * applyPixels;
        }
      }
    }
    this.setSize(this.calculatePixels ? applyPixels : (this.currentContainerSize / 100) * applyPercent);
  }

  resize(e)
  {
    if(this.mouseUpHandler != null)
    {
      this.mouseUpHandler(e);
    }

    this.classList.add('resizing');
    this.currentContainerSize = this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width;
    const pageOffset = this.vertical ? this.getBoundingClientRect().top : this.getBoundingClientRect().left;

    this.mouseMoveHandler = function (e)
    {
      let offset = (this.vertical ? e.y : e.x);
      if(e instanceof TouchEvent)
      {
        offset = (this.vertical ? e.touches[0].clientY : e.touches[0].clientX);
      }
      this.setSize(offset - pageOffset);
    }.bind(this);

    this.mouseUpHandler = function (e)
    {
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

  setSize(primaryPanelPixels: number)
  {
    let pixelSize = primaryPanelPixels;
    let percentSize = (primaryPanelPixels / this.currentContainerSize) * 100;

    if(this.calculatePixels)
    {
      pixelSize = Math.max(this.minimumPaneSize, pixelSize);
      this.initialSize = pixelSize;
    }
    else
    {
      percentSize = Math.max(this.minimumPaneSize, percentSize);
      this.initialSize = percentSize;
    }
    this.currentPixelSize = pixelSize;
    this.currentPercentSize = percentSize;
    this.primaryFull = this.calculatePixels ? (this.currentPixelSize + 'px') : (this.currentPercentSize + '%');
  }

  _togglePane(e)
  {
    this._setFocusPane(e.target.getAttribute('idx'));
  }

  _setFocusPane(idx: number)
  {
    this._focusPane = idx;
    this.querySelectorAll('ul#split-nav li').forEach((el) =>
    {
      el.classList.toggle('active', parseInt(el.getAttribute('idx')) == idx);
    });
  }

  protected render(): unknown
  {
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
        <li idx="0" class="${this._focusPane == 0 ? 'active' : ''}" @click="${this._togglePane}">
          ${this.primaryCaption}
        </li>
        <li idx="1" class="${this._focusPane == 1 ? 'active' : ''}" @click="${this._togglePane}">
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


