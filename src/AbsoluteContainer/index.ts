import {html, unsafeCSS} from "lit";
import {customElement} from 'lit/decorators.js';

import styles from './index.scss';
import {ZincElement} from "../zinc-element";
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-absolute-container')
export class AbsoluteContainer extends ZincElement
{
  static styles = unsafeCSS(styles);

  connectedCallback()
  {
    super.connectedCallback();
    this.observerDom();
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    this.resize();
  }

  resize()
  {
    let newSize = 0;
    Array.from(this.children).forEach((child) =>
    {
      newSize += child.getBoundingClientRect().height;
    });
    this.style.minHeight = newSize + 'px';
  }

  observerDom()
  {
    // observe the DOM for changes
    const observer = new MutationObserver((mutations) =>
    {
      this.resize();
    });

    observer.observe(this,
      {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });
  }

  // the height of this element is set to the height of it's children (absolute positioned)
  // to push the content element down

  createRenderRoot()
  {
    return this;
  }
}


