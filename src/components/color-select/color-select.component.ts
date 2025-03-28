import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';

import styles from './color-select.scss';
import {FormControlController} from "../../internal/form";
import {property, query} from "lit/decorators.js";

export type Colors = 'red' | 'blue' | 'orange' | 'yellow' | 'indigo' | 'violet' | 'green' | 'pink' | 'gray';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/color-select
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
export default class ZnColorSelect extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  protected readonly formControlController = new FormControlController(this);

  @property() name: string;

  @property() value: string;

  @query('#select') select: HTMLSelectElement;

  get validationMessage() {
    return this.select.validationMessage;
  }

  get validity(): ValidityState {
    return this.select.validity;
  }

  checkValidity(): boolean {
    return this.select.checkValidity();
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }


  reportValidity(): boolean {
    return this.select.reportValidity();
  }

  setCustomValidity(message: string): void {
    return this.select.setCustomValidity(message);
  }


  protected render() {
    const colors: Colors[] = ['red', 'blue', 'orange', 'yellow', 'indigo', 'violet', 'green', 'pink', 'gray'];

    return html`
      <zn-select id="select" name="${this.name}" value="${this.value}" placeholder="Choose a color">
        ${colors.map(color => html`
          <zn-option class="select__option" value="${color}">
            <div slot="prefix" class="color-icon color-icon--${color.toLowerCase()}"></div>
            ${color.charAt(0).toUpperCase() + color.slice(1)}
          </zn-option>`)}
      </zn-select>
    `;
  }
}
