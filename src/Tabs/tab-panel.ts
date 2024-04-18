import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './panel.scss';

@customElement('zn-tab-panel')
export class TabPanel extends LitElement
{
  private _panels: Map<string, Element[]>;
  @property({attribute: 'active', type: String, reflect: true}) _current = null;

  static styles = unsafeCSS(styles);

  constructor()
  {
    super();
    this._panels = new Map<string, Element[]>();
  }

  connectedCallback()
  {
    super.connectedCallback();
    this._loadPanels(this);
    this.selectTab(this._current || '', false);
  }

  _loadPanels(ele)
  {
    ele.querySelectorAll('*').forEach((element) =>
    {
      if(element instanceof HTMLSlotElement)
      {
        element.assignedElements().forEach((ele) => this._addTab(ele));
        return;
      }
      this._addTab(element);
    });
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

  public addPanel(tabId: string, panel: Element)
  {
    this._panels.set(tabId, [panel]);
    this.appendChild(panel);
  }

  selectTab(tabName: string, refresh: boolean): boolean
  {
    if(!this._panels.has(tabName))
    {
      return false;
    }

    if(this._current !== null)
    {
      let eles = this._panels.get(this._current);
      if(eles)
      {
        eles.forEach((element) =>
        {
          element.removeAttribute('selected');
        });
      }
    }
    this._current = tabName;
    this._panels.get(tabName).forEach((element) =>
    {
      element.setAttribute('selected', '');
      if(refresh)
      {
        document.dispatchEvent(new CustomEvent('zn-refresh-element', {
          detail: {element: element}
        }));
      }
    });

    return true;
  }

  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


