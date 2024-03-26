import {html, LitElement} from "lit";
import {customElement} from 'lit/decorators.js';
import {TabPanel} from "./tab-panel";

@customElement('zn-tabs')
export class Tabs extends LitElement
{
  private _panel: TabPanel;

  constructor()
  {
    super();
    this.querySelectorAll('zn-tab-panel').forEach((element) =>
    {
      this._panel = element as TabPanel;
    });

    if(this._panel == null)
    {
      console.error("No zn-tab-panel found in zn-tabs", this);
    }


    this.addEventListener('click', this._handleClick);
  }


  _handleClick(event: MouseEvent)
  {
    if(event.target instanceof HTMLElement)
    {
      const target = event.target as HTMLElement;
      if(target.hasAttribute('tab'))
      {
        this._panel.selectTab(target.getAttribute('tab') || '');
      }
    }
  };


  render()
  {
    return html`
      <slot></slot>
    `;
  }
}


