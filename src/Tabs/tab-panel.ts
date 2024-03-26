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

    this.querySelectorAll('*').forEach((element) =>
    {
      const tabName = element.getAttribute('id') || '';
      if(!this._panels.has(tabName))
      {
        this._panels.set(tabName, []);
      }
      this._panels.get(tabName).push(element);
    });
  }

  connectedCallback()
  {
    super.connectedCallback();
    this.selectTab(this._current || '');
  }

  selectTab(tabName: string): boolean
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


