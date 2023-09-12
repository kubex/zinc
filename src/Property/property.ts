import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss';

export type InputType = 'text' | 'number';

@customElement('zn-prop')
export class Property extends LitElement
{
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'icon', type: String, reflect: true}) icon;
  @property({attribute: 'library', type: String, reflect: true}) library = "material-outlined";
  @property({attribute: 'inline', type: Boolean, reflect: true}) inline;
  @property({attribute: 'colspan', type: Number, reflect: true}) colspan;

  static styles = unsafeCSS(styles);

  protected render(): unknown
  {
    let icon = null;
    if(this.icon)
    {
      icon = html`
        <zn-icon library="${this.library}" src="${this.icon}"></zn-icon>`;
    }

    const colspan = this.colspan ? this.colspan : 3;

    return html`
      <style>:host {
        --colspan: ${colspan};
      }</style>
      <dt>${icon}${this.caption}</dt>
      <dd>
        <slot></slot>
      </dd>`;
  }
}


