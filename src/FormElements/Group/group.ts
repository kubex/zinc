import {CSSResultGroup, html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../zinc-element";

import styles from './index.scss?inline';

@customElement('zn-form-group')
export class Group extends ZincElement
{
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'description', type: String, reflect: true}) description;

  static get styles(): CSSResultGroup
  {
    return [unsafeCSS(styles)];
  }

  render()
  {
    const caption = this.caption ? html`<h2 class="caption">${this.caption}</h2>` : null;
    const description = this.description ? html`<p class="description">${this.description}</p>` : null;

    let header = null;

    if(caption || header)
    {
      header = html`
        <div class="header">
          ${caption}
          ${description}
        </div>`;
    }

    return html`
      ${header}
      <div class="fg-inputs">
        <slot></slot>
      </div>`;
  }
}
