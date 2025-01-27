import {html, unsafeCSS} from 'lit';
import {customElement, property, query} from 'lit/decorators.js';

import styles from './index.scss?inline';
import {ZincElement, ZincFormControl} from "@/zinc-element";
import {FormControlController} from "@/form";
import {PropertyValues} from "@lit/reactive-element";
import {Select} from "@/FormElements/Select";


@customElement('zn-linked-select')
export class LinkedSelect extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  @property() name: string = "";
  @property() value: string;

  @property({type: Boolean, reflect: true}) checked = false;
  @property({type: Array}) options;
  @property({attribute: 'linked-select'}) linkedSelect: string = "";

  @property({attribute: 'cache-key'}) cacheKey: string = "";
  @property() label: string = "";

  @query('zn-select') input: HTMLInputElement;

  private linkedSelectElement: HTMLSelectElement | Select;
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

    let level = 0;
    let currentElement = this.parentElement;
    while (level < 10 && currentElement.tagName !== 'DOCUMENT')
    {
      const element = currentElement.querySelector(`[id="${this.linkedSelect}"]`);
      if(element instanceof Select)
      {
        this.linkedSelectElement = element as Select;
        break;
      }
      currentElement = currentElement.parentElement;
      level++;
    }

    if(!this.linkedSelectElement)
    {
      throw new Error(`Linked select element with name ${this.linkedSelect} not found`);
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues)
  {
    this.linkedSelectElement.addEventListener('zn-change', this.handleLinkedSelectChange);
    this.input.addEventListener('zn-change', this.handleChange);
    this.formControlController.updateValidity();
  }

  disconnectedCallback()
  {
    this.linkedSelectElement.removeEventListener('zn-change', this.handleLinkedSelectChange);
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
    this.value = (e.target as HTMLSelectElement).value;
    this.formControlController.updateValidity();
  }

  render()
  {
    let selected = this.linkedSelectElement?.value as string;
    if(!selected)
    {
      selected = Object.keys(this.options)[0];
    }

    const options = this.options[selected];
    return html`
      <zn-select part="select"
                 class="linked-select"
                 name="${this.name}"
                 id="main-input"
                 cache-key="${this.cacheKey}"
                 label="${this.label}">
        ${Object.entries(options).map(([key, value]) => html`
          <zn-option value="${key}" ?selected="${key === this.value}">${value}</zn-option>
        `)}
      </zn-select>`;
  }
}
