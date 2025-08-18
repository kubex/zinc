import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {FormControlController} from "../../internal/form";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnSelect from "../select";
import type {ZincFormControl} from '../../internal/zinc-element';
import type {ZnSelectEvent} from "../../events/zn-select";

import styles from './linked-select.scss';

interface linkedSelectOption {
  [key: string]: string;
}

interface linkedSelectOptions {
  [key: string]: linkedSelectOption[];
}

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/linked-select
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-example
 *
 * @event zn-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 * @slot example - An example slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ZnLinkedSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() name: string = "";
  @property() value: string;

  @property({type: Boolean, reflect: true}) checked = false;
  @property({type: Array}) options: linkedSelectOptions;
  @property({attribute: 'linked-select'}) linkedSelect: string = "";

  @property({attribute: 'cache-key'}) cacheKey: string = "";
  @property() label: string = "";

  @query('zn-select') input: HTMLInputElement;

  private linkedSelectElement: HTMLSelectElement | ZnSelect;
  private readonly formControlController = new FormControlController(this, {
    value: (input) => {
      const selectElement = this.input;
      if (selectElement) {
        return selectElement.value;
      }

      return input.value;
    }
  });

  get validity() {
    return this.input?.validity;
  }

  get validationMessage() {
    return this.input.validationMessage;
  }

  connectedCallback() {
    super.connectedCallback();

    let level = 0;
    let currentElement: Element | null = this.parentElement;
    while (level < 10 && currentElement && currentElement.tagName !== 'DOCUMENT') {
      const element = currentElement.querySelector(`[id="${this.linkedSelect}"]`);
      if (element instanceof ZnSelect) {
        this.linkedSelectElement = element as ZnSelect;
        break;
      }
      currentElement = currentElement.parentElement;
      level++;
    }

    if (!this.linkedSelectElement) {
      throw new Error(`Linked select element with name ${this.linkedSelect} not found`);
    }
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.linkedSelectElement?.addEventListener('zn-change', this.handleLinkedSelectChange);
    this.input.addEventListener('zn-change', this.handleChange);
    this.formControlController.updateValidity();

    super.firstUpdated(_changedProperties);
  }

  disconnectedCallback() {
    this.linkedSelectElement?.removeEventListener('zn-change', this.handleLinkedSelectChange);
    super.disconnectedCallback();
  }

  checkValidity(): boolean {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string): void {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  public handleLinkedSelectChange = () => {
    this.requestUpdate();
    this.formControlController.updateValidity();
  };

  public handleChange(e: Event) {
    this.value = (e.target as HTMLSelectElement).value;
    this.formControlController.updateValidity();
  }

  handleSelectChange = (e: ZnSelectEvent) => {
    this.value = (e.target as ZnSelect).value as string;
  }

  render() {
    let selected = this.linkedSelectElement?.value as string;
    if (!selected && this.options) {
      selected = Object.keys(this.options)[0];
    }

    const options: linkedSelectOption[] = selected ? this.options[selected] : [];
    return html`
      <zn-select part="select"
                 class="linked-select"
                 name="${this.name}"
                 id="main-input"
                 cache-key="${this.cacheKey}"
                 value="${this.value}"
                 @zn-change=${this.handleSelectChange}
                 label="${this.label}">
        ${options && Object.entries(options).map(([key, value]) => html`
          <zn-option value="${key}">${value}</zn-option>
        `)}
      </zn-select>`;
  }
}
