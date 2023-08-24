import {html, LitElement, unsafeCSS} from "lit";
import {customElement, property, query} from 'lit/decorators.js';
import {PropertyValues} from "@lit/reactive-element";

import styles from './index.scss';

@customElement('zn-toggle')
export class Toggle extends LitElement
{
  @property({attribute: 'name', type: String, reflect: true})
  public name: string;
  @property({attribute: 'required', type: Boolean, reflect: true})
  private _isRequired: boolean;
  @property({attribute: 'checked', type: Boolean, reflect: true})
  public checked: boolean;
  @property({attribute: 'value', type: String, reflect: true})
  public value: string;

  @query('span')
  private _input: HTMLInputElement;

  private internals: ElementInternals;

  static styles = unsafeCSS(styles);

  static get formAssociated()
  {
    return true;
  }

  get required()
  {
    return this._isRequired;
  }

  set required(isRequired)
  {
    this._isRequired = isRequired;
    this.internals.ariaRequired = isRequired ? 'true' : 'false';
  }

  _toggleValue()
  {
    this.checked = !this.checked;
    this._updateInternals();
  }

  constructor()
  {
    super();
    this.internals = this.attachInternals();
    this.addEventListener('click', this._toggleValue);
    this.addEventListener('keydown', (e) =>
    {
      if (e.key == ' ')
      {
        e.preventDefault();
        this._toggleValue();
      }
    });
  }

  _updateInternals()
  {
    this.internals.setFormValue(this.checked ? this.value : null);
    if (this.required && !this.checked)
    {
      this.internals.setValidity({valueMissing: true}, 'This field is required', this._input);
    }
    else
    {
      this.internals.setValidity({});
    }
  }

  firstUpdated(_changedProperties: PropertyValues)
  {
    super.firstUpdated(_changedProperties);
    this._updateInternals();
  }

  render()
  {
    return html`<span tabindex="0"></span>`;
  }
}
