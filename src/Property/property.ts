import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';

export type InputType = 'text' | 'number';

@customElement('zn-prop')
export class Property extends LitElement
{
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'sub', type: String, reflect: true}) subCaption;
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
        <zn-icon library="${this.library}" src="${this.icon}" size="20"></zn-icon>`;
    }
    let subCaption = null;
    if(this.subCaption)
    {
      subCaption = html`
        <small>${this.subCaption}</small>`;
    }

    const colspan = this.colspan ? this.colspan : 3;

    return html`
      <style>:host {
        --colspan: ${colspan};
      }</style>
      <dt>${icon}${this.caption}${subCaption}</dt>
      <dd>
        <slot></slot>
      </dd>`;
  }
}


