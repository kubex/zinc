import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";
import {on} from "../on";

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

  @property({attribute: 'pixels', type: Boolean, reflect: true}) calculatePixels = false;
  @property({attribute: 'secondary', type: Boolean, reflect: true}) storeSecondarySize = false;
  @property({attribute: 'min-size', type: Number, reflect: true}) minimumPaneSize = 10;
  @property({attribute: 'primary-size', type: Number, reflect: true}) primarySize = 50;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;
  @property({attribute: 'bordered', type: Boolean, reflect: true}) border = false;
  @property({attribute: 'vertical', type: Boolean, reflect: true}) vertical = false;

  @property({attribute: 'primary-caption', type: String, reflect: true}) primaryCaption = 'Primary';
  @property({attribute: 'secondary-caption', type: String, reflect: true}) secondaryCaption = 'Secondary';

  @property({attribute: 'focus-pane', type: Number, reflect: true}) _focusPane = 0;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;

  connectedCallback()
  {
    super.connectedCallback();
    this.storage = this.localStorage ? window.localStorage : window.sessionStorage;
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
    setTimeout(() =>
    {
      this.applyStoredSize();
    }, 100);
  }

  applyStoredSize()
  {
    if(this.storeKey != "" && this.storeKey != null)
    {
      const storedValue = this.storage.getItem('znsp:' + this.storeKey);
      if(storedValue != null && storedValue != "")
      {
        this.currentContainerSize = (this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width);
        const parts = storedValue.split(",");
        if(parts.length != 3)
        {
          return;
        }
        const storedPixels = parseInt(parts[0]);
        const storedPercent = parseInt(parts[1]);
        const storedBasis = parseInt(parts[2]);

        let setPixelSize = storedPixels;

        if(this.storeSecondarySize)
        {
          if(this.calculatePixels)
          {
            setPixelSize = this.currentContainerSize - (storedBasis - storedPixels);
          }
          else
          {
            setPixelSize = storedBasis * ((100 - storedPercent) / 100);
          }
        }
        else if(!this.calculatePixels)
        {
          setPixelSize = storedBasis * (storedPercent / 100);
        }
        this.setSize(setPixelSize);
      }
    }
  }

  sizeFromStored(storedValue: number, relativeSize: number)
  {
    if(this.calculatePixels)
    {
      return storedValue;
    }
    return storedValue * (relativeSize / 100);
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
      this.store();
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
      this.primarySize = pixelSize;
    }
    else
    {
      percentSize = Math.max(this.minimumPaneSize, percentSize);
      this.primarySize = percentSize;
    }

    this.currentPixelSize = pixelSize;
    this.currentPercentSize = percentSize;
  }

  store()
  {
    if(this.storeKey != null && this.storeKey != "")
    {
      this.storage.setItem('znsp:' + this.storeKey, Math.round(this.currentPixelSize) + "," + Math.round(this.currentPercentSize) + "," + this.currentContainerSize);
    }
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
        --primary-size: ${this.primarySize}${this.calculatePixels ? 'px' : '%'};
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


