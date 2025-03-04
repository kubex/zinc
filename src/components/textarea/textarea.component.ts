import {property, query, state} from 'lit/decorators.js';
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {watch} from '../../internal/watch';
import ZincElement, {ZincFormControl} from '../../internal/zinc-element';

import styles from './textarea.scss';
import {FormControlController} from "../../internal/form";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/text-area
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
export default class ZnTextarea extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {});

  @query('.textarea__control') input: HTMLTextAreaElement;

  @state() hasFocus = false;

  @property() title = ''; // make reactive to pass through

  /** The name of the textarea, submitted as a name/value pair with form data. */
  @property() name = '';

  /** The current value of the textarea, submitted as a name/value pair with form data. */
  @property() value = '';

  /** Placeholder text to show as a hint when the input is empty. */
  @property() placeholder = '';

  @property() class = '';

  /** Gets the validity state object */
  get validity() {
    return this.input.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  firstUpdated() {
    this.formControlController.updateValidity();
    this.formControlController.getForm()?.addEventListener('zn-formdata', () => {
      this.value = '';
    });
  }

  private handleBlur() {
    this.hasFocus = false;
  }

  private handleChange() {
    this.value = this.input.value;
  }

  private handleFocus() {
    this.hasFocus = true;
  }

  private handleInput() {
    this.value = this.input.value;
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  /** Sets focus on the textarea. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the textarea. */
  blur() {
    this.input.blur();
  }

  /** Selects all the text in the textarea. */
  select() {
    this.input.select();
  }

  /** Checks for validity but does not show a validation message. Returns `true` when valid and `false` when invalid. */
  checkValidity() {
    return this.input.checkValidity();
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity() {
    return this.input.reportValidity();
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  render() {

    return html`
      <textarea
        part="textarea"
        id="input"
        class="textarea__control ${this.class}"
        title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
        name=${ifDefined(this.name)}
        .value=${live(this.value)}
        placeholder=${ifDefined(this.placeholder)}
        aria-describedby="help-text"
        @change=${this.handleChange}
        @input=${this.handleInput}
        @invalid=${this.handleInvalid}
        @focus=${this.handleFocus}
        @blur=${this.handleBlur}
      ></textarea>
    `;
  }
}
