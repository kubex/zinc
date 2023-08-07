import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property} from 'lit/decorators.js';
import {PropertyValues} from "@lit/reactive-element";

import styles from './index.scss';

@customElement('zn-toggle')
export class Toggle extends LitElement {
  @property({attribute: 'name', type: String, reflect: true}) name;
  @property({attribute: 'required', type: Boolean, reflect: true}) _isRequired;
  @property({attribute: 'checked', type: Boolean, reflect: true}) checked;
  @property({attribute: 'value', type: String, reflect: true}) value;

  private internals;

  static styles = unsafeCSS(styles);

  get required() {
    return this._isRequired;
  }

  set required(isRequired) {
    this._isRequired = isRequired;
    this.internals.ariaRequired = isRequired;
  }


  _handleClick() {
    let input = this.shadowRoot.querySelector('input');
    input.checked = !input.checked;
    if (input.checked) {
      this.value = input.value;
    } else {
      this.value = '';
    }
    this.checked = input.checked;
    this.internals.setFormValue(this.value);
  }

  constructor() {
    super();
    this.addEventListener('click', this._handleClick);
    this.internals = this.attachInternals();
  }

  _manageRequired() {
    const input = this.shadowRoot.querySelector('input');
    if (!input.checked && this.required) {
      this.internals.setValidity({
        valueMissing: true
      }, 'This field is required', input);
    } else {
      this.internals.setValidity({});
    }
  }

  firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    /** This ensures our element always participates in the form */
    this.internals.setFormValue(this.checked ? this.value : null);

    /** Make sure validations are set up */
    this._manageRequired();
  }

  render() {
    return html`
      <input type="checkbox" name="${this.name}" id="input" .value="${this.value}" ?required="${this.required}"
             novalidate>
      <span></span>
    `;
  }
}


