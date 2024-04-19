import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './panel.scss';
import {PropertyValues} from "@lit/reactive-element";

@customElement('zn-tab-panel')
export class TabPanel extends LitElement
{
  private _panels: Map<string, Element[]>;
  @property({attribute: 'active', type: String, reflect: true}) _current = '';

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this._panels = new Map<string, Element[]>();
  }

  connectedCallback()
  {
    super.connectedCallback();
    Array.from(this.children).forEach((element) =>
    {
      if(element instanceof HTMLSlotElement)
      {
        element.assignedElements().forEach((subEle) =>
        {
          this._addTab(subEle as Element);
        });
      }
      else
      {
        this._addTab(element as Element);
      }
    });
    this.observerDom();
    this.selectTab(this._current || '', false);
  }


  observerDom()
  {
    // observe the DOM for changes
    const observer = new MutationObserver((mutations) =>
    {
      mutations.forEach((mutation) =>
      {
        if(mutation.type === 'childList')
        {
          mutation.addedNodes.forEach((node) =>
          {
            if(node instanceof Element)
            {
              this._addTab(node);
            }
          });
        }
      });
    });

    observer.observe(this, {childList: true});
  }

  _addTab(element: Element)
  {
    const tabName = element.getAttribute('id') || '';

    if(!this._panels.has(tabName))
    {
      this._panels.set(tabName, []);
    }
    this._panels.get(tabName).push(element);
  }

  selectTab(tabName: string, refresh: boolean): boolean
  {
    if(tabName && !this._panels.has(tabName))
    {
      return false;
    }

    this._panels.forEach((elements, key) =>
    {
      const isActive = key === tabName;
      elements.forEach((element) =>
      {
        element.toggleAttribute('selected', isActive);
        if(refresh)
        {
          document.dispatchEvent(new CustomEvent('zn-refresh-element', {
            detail: {element: element}
          }));
        }
      });
    });

    this._current = tabName;

    return true;
  }

  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


