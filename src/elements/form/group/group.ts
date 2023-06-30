import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../../ts/element";

import styles from './group.scss';

@customElement('zn-form-group')
export class ZincFormGroup extends ZincElement {
  @property({attribute: 'caption', type: String, reflect: true}) caption;
  @property({attribute: 'description', type: String, reflect: true}) description;

  static get styles() {
    return [unsafeCSS(styles)];
  }

  render() {
    return html`
      <div><h2 class="text-base font-semibold leading-7">${this.caption}</h2>
        <p class="mt-1 text-sm leading-6">${this.description}</p></div>
      <div class="fg-inputs">
        <slot></slot>
      </div>`
  }
}
