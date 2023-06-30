import {html, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {ZincElement} from "../../ts/element";

import styles from './heading.scss';

@customElement('zn-heading')
export class ZincHeading extends ZincElement {
  static get styles() {
    return [unsafeCSS(styles)];
  }

  @property({attribute: 'caption', type: String, reflect: true})
  private caption: String = "";


  render() {
    return html`
      <div>
        <h1>${this.caption}</h1>
        <div>
          <slot></slot>
        </div>
      </div>
    `;
  }
}
