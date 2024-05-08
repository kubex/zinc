import {html, LitElement, unsafeCSS} from 'lit';
import {customElement, property} from 'lit/decorators.js';

import styles from './index.scss?inline';

@customElement('zn-checkbox')
export class Checkbox extends LitElement
{
  @property({attribute: 'title', type: String, reflect: true}) title;
  @property({attribute: 'description', type: String, reflect: true}) description;
  @property({attribute: 'name', type: String, reflect: true}) name;
  @property({attribute: 'id', type: String, reflect: true}) id;

  static styles = unsafeCSS(styles);

  render()
  {
    return html`
      <div class="checkbox__wrapper">
        <div class="checkbox__input-wrapper">
          <input type="checkbox" name="${this.name}" id="${this.id}">
        </div>
        <div class="checkbox__label-wrapper">
          <label for="${this.name}">${this.title}
            <p>${this.description}</p>
          </label>
        </div>
      </div>`;
  }
}
