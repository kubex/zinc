import {html, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc";

@customElement('zn-split-pane')
export class SplitPane extends ZincElement
{
  static styles = unsafeCSS(styles);

  private storage: Storage;
  mouseMoveHandler: null | EventListener = null;
  mouseUpHandler: null | EventListener = null;
  private maxPercent = 80;

  @property({attribute: 'min-primary-size', type: Number, reflect: true}) minimumPrimarySize = 15;
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
    if(this.storeKey != "" && this.storeKey != null)
    {
      const storedValue = this.storage.getItem('znsp:' + this.storeKey);
      if(storedValue != null && storedValue != "")
      {
        if(storedValue.indexOf(",") == -1)
        {
          this.primarySize = parseInt(storedValue);
        }
        else
        {
          const parts = storedValue.split(",");
          const currentSize = this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width;
          let storedPrimary = parseInt(parts[0]);
          let storedInitial = parseInt(parts[1]);
          if(storedInitial < 300)
          {
            storedInitial = currentSize;
          }
          storedPrimary = Math.round(storedPrimary * (storedInitial / currentSize));
          this.primarySize = storedPrimary;
        }
      }
    }
  }

  resize(e)
  {
    if(this.mouseUpHandler != null)
    {
      this.mouseUpHandler(e);
    }

    this.classList.add('resizing');
    const initialSize = this.vertical ? this.getBoundingClientRect().height : this.getBoundingClientRect().width;
    const pageOffset = this.vertical ? this.getBoundingClientRect().top : this.getBoundingClientRect().left;

    this.mouseMoveHandler = function (e)
    {
      let offset = (this.vertical ? e.y : e.x);
      if(e instanceof TouchEvent)
      {
        offset = (this.vertical ? e.touches[0].clientY : e.touches[0].clientX);
      }

      const primarySize = ((offset - pageOffset) / initialSize) * 100;
      this.setSize(primarySize, false, initialSize);
    }.bind(this);

    this.mouseUpHandler = function (e)
    {
      this.setSize(this.primarySize, true, initialSize);
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

  setSize(w, apply, initialSize)
  {
    w = Math.round(Math.max(this.minimumPrimarySize, Math.min(100 - this.minimumPrimarySize, w)));
    this.primarySize = w;
    if(apply && this.storeKey != null && this.storeKey != "")
    {
      this.storage.setItem('znsp:' + this.storeKey, w + "," + initialSize);
    }
  }

  _togglePane(e)
  {
    e.target.parentElement.querySelectorAll('li').forEach((el) =>
    {
      el.classList.remove('active');
    });
    e.target.classList.add('active');
    this._focusPane = parseInt(e.target.getAttribute('idx'));
  }

  protected render(): unknown
  {
    const resizeWidth = '2px';
    const resizeMargin = '5px';
    return html`
      <style>:host {
        --primary-size: ${this.primarySize}%;
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


