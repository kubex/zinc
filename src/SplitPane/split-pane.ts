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

  @property({attribute: 'right-width', type: Number, reflect: true}) rightWidth = 50;
  @property({attribute: 'store-key', type: String, reflect: true}) storeKey = null;
  @property({attribute: 'bordered', type: Boolean, reflect: true}) border = false;

  // session storage if not local
  @property({attribute: 'local-storage', type: Boolean, reflect: true}) localStorage;

  connectedCallback()
  {
    super.connectedCallback();

    this.storage = this.localStorage ? window.localStorage : window.sessionStorage;
    if(this.storeKey != "" && this.storeKey != null)
    {
      let storedValue = this.storage.getItem('znsp:' + this.storeKey);
      if(storedValue != null && storedValue != "")
      {
        this.rightWidth = parseInt(storedValue);
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
    let initialWidth = this.getBoundingClientRect().width;
    let pageLeft = this.getBoundingClientRect().left;

    this.mouseMoveHandler = function (e)
    {
      let leftWidth = ((e.x - pageLeft) / initialWidth) * 100;
      this.setWidth((100 - leftWidth), false);
    }.bind(this);

    this.mouseUpHandler = function (e)
    {
      this.setWidth(this.rightWidth, true);
      this.classList.remove('resizing');
      window.removeEventListener('mousemove', this.mouseMoveHandler);
      window.removeEventListener('mouseup', this.mouseUpHandler);
    }.bind(this);

    window.addEventListener('mousemove', this.mouseMoveHandler);
    window.addEventListener('mouseup', this.mouseUpHandler);
  }

  setWidth(w, apply)
  {
    w = Math.max(15, Math.min(85, w));
    this.rightWidth = w;
    if(apply && this.storeKey != null && this.storeKey != "")
    {
      this.storage.setItem('znsp:' + this.storeKey, w);
    }
  }

  protected render(): unknown
  {
    const resizeWidth = '2px';
    const resizeMargin = '5px';
    return html`
      <style>:host {
        --right-width: ${this.rightWidth}%;
        --resize-width: ${resizeWidth};
        --resize-margin: ${resizeMargin};
      }</style>
      <div id="left-pane">
        <slot name="left"></slot>
      </div>
      <div @mousedown="${this.resize}" id="resizer"></div>
      <div id="right-pane">
        <slot name="right"></slot>
      </div>
    `;
  }
}


