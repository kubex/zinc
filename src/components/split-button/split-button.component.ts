import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController, validValidityState} from "../../internal/form";
import {ifDefined} from "lit/directives/if-defined.js";
import {property, query} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type {ZnMenuSelectEvent} from "../../events/zn-menu-select";
import type ZnButton from "../button";
import type ZnDropdown from "../dropdown";

import styles from './split-button.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/split-button
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
export default class ZnSplitButton extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this);

  @property() caption: string;

  @property() href: string;

  @property() name: string;

  @property() value: string;

  @defaultValue() defaultValue: string;

  @property() type: string;

  @query('zn-dropdown') dropdown: ZnDropdown;

  @query('zn-button#trigger-btn') button: ZnButton;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('zn-menu-select', this.handleMenuItemClick);
    this.defaultValue = this.value;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('zn-menu-select', this.handleMenuItemClick);
  }

  public handleMenuItemClick(e: ZnMenuSelectEvent) {
    if (this.dropdown) {
      this.value = e.detail.value;
      this.dropdown.hide();
    }

    if (this.type === 'submit') {
      this.formControlController.submit();
    }
  }

  public handleTriggerClick() {
    this.value = this.defaultValue;

    if (this.type === 'submit') {
      this.formControlController.submit();
    }
  }

  render() {
    return html`
      <zn-dropdown placement="bottom-end">
        ${this.renderTriggerSlot()}
        <div>
          <slot name="menu"></slot>
        </div>
      </zn-dropdown>
    `;
  }

  private renderTriggerSlot() {
    const hasTriggerSlot = !!this.querySelector('[slot="trigger"]');
    if (hasTriggerSlot) {
      return html`
        <slot name="trigger" slot="trigger"></slot>`;
    }

    return html`
      <div slot="trigger">
        <zn-button-group>
          <zn-button id="trigger-btn"
                     href=${ifDefined(this.href)}
                     @click=${this.handleTriggerClick}>
            ${this.caption}
          </zn-button>
          <zn-button icon="keyboard_arrow_down"></zn-button>
        </zn-button-group>
      </div>
    `;
  }

  checkValidity(): boolean {
    if (this._isButton() && this.button) {
      return this.button.checkValidity();
    }

    return true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity() {
    if (this._isButton() && this.button) {
      return this.button.reportValidity();
    }

    return true;
  }

  setCustomValidity(message: string) {
    if (this._isButton()) {
      this.button.setCustomValidity(message);
      this.formControlController.updateValidity();
    }
  }

  get validity() {
    if (this._isButton() && this.button) {
      return this.button.validity;
    }

    return validValidityState;
  }

  get validationMessage() {
    if (this._isButton() && this.button) {
      return this.button.validationMessage;
    }

    return '';
  }

  private _isButton() {
    return this.type === 'submit' || this.type === 'button' || this.type === 'reset';
  }
}
