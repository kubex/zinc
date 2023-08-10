import {html, LitElement, unsafeCSS} from "lit";
import {customElement} from 'lit/decorators.js';

import styles from './index.scss';

@customElement('zn-tabs')
export class Tabs extends LitElement {
  private _tabs: HTMLElement[];
  private _panels: HTMLElement[];

  static styles = unsafeCSS(styles);

  constructor() {
    super();
    this._tabs = Array.from(this.querySelectorAll('[slot="tab"]'));
    this._panels = Array.from(this.querySelectorAll('[slot="panel"]'));
    this.selectTab(0);
    console.log(this._tabs, this._panels)
  }

  selectTab(index) {
    this._tabs.forEach(tab => tab.removeAttribute('selected'));
    this._tabs[index].setAttribute('selected', '');
    this._panels.forEach(panel => panel.removeAttribute('selected'));
    this._panels[index].setAttribute('selected', '');
  }

  handleSelect(e: PointerEvent) {
    const index = this._tabs.indexOf(e.target as HTMLElement);
    this.selectTab(index);
  }

  render() {
    return html`
      <nav>
        <h3>${this.title}</h3>
        <div class="tabs__header">
          <slot name="tab" @click="${(e) => this.handleSelect(e)}"></slot>
        </div>
      </nav>
      <slot name="panel"></slot>
    `;
  }
}


