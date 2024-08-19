import {html, unsafeCSS} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement, ZincFormControl} from "@/zinc-element";
import {FormControlController} from "@/form";
import {PropertyValues} from "@lit/reactive-element";


@customElement('zn-linked-select')
export class LinkedSelect extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  @property() name: string = "";
  @property() value: string;

  @property({type: Boolean, reflect: true}) checked = false;
  @property({type: Array}) options;
  @property({attribute: 'linked-select'}) linkedSelect: string = "";

  @query('select') input: HTMLInputElement;

  private linkedSelectElement: HTMLSelectElement;
  private readonly formControlController = new FormControlController(this);

  get validity()
  {
    return this.input.validity;
  }

  get validationMessage()
  {
    return this.input.validationMessage;
  }

  connectedCallback()
  {
    super.connectedCallback();
    const linkedSelectElement = this.parentElement.querySelector(`[id="${this.linkedSelect}"]`) as HTMLSelectElement;

    if(!linkedSelectElement)
    {
      throw new Error(`Linked select element with name ${this.linkedSelect} not found`);
    }

    this.linkedSelectElement = linkedSelectElement as HTMLSelectElement;
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    this.linkedSelectElement.addEventListener('change', this.handleLinkedSelectChange);
    this.formControlController.updateValidity();
  }

  disconnectedCallback()
  {
    this.linkedSelectElement.removeEventListener('change', this.handleLinkedSelectChange);
    super.disconnectedCallback();
  }

  checkValidity(): boolean
  {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean
  {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void
  {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  public handleLinkedSelectChange = (e: Event) =>
  {
    this.requestUpdate();
    this.formControlController.updateValidity();
  };

  public handleChange(e: Event)
  {
    this.formControlController.updateValidity();
  }

  render()
  {
    let selected = this.linkedSelectElement?.value;
    if(!selected)
    {
      selected = Object.keys(this.options)[0];
    }

    const options = this.options[selected];
    return html`
      <select class="linked-select" name="${this.name}" id="main-input" @change="${this.handleChange}">
        ${Object.entries(options).map(([key, value]) => html`
          <option value="${key}" ?selected="${key === this.value}">${value}</option>
        `)}
      </select>`;
  }
}
