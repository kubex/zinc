import { html, unsafeCSS } from "lit";
import { customElement, property, query, state } from 'lit/decorators.js';
import { live } from 'lit/directives/live.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import { classMap } from 'lit/directives/class-map.js';
import { PropertyValues } from "@lit/reactive-element";
import { ZincElement, ZincFormControl } from "../../zinc-element";
import { FormControlController } from "../../form";
import { defaultValue } from "../../default-value";

import styles from './index.scss?inline';

@customElement('zn-toggle')
export class Toggle extends ZincElement implements ZincFormControl
{
  static styles = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    value: (control: Toggle) => (control.checked ? control.value || 'on' : undefined),
    defaultValue: (control: Toggle) => control.defaultChecked,
    setValue: (control: Toggle, checked: boolean) => (control.checked = checked)
  });

  @query('input[type="checkbox"]') input: HTMLInputElement;

  @state() private hasFocus = false;

  @property() title: string = "";

  @property() name: string = "";

  @property() value: string;

  @property({ attribute: 'fallback' }) fallbackValue: string = '';

  @property({ reflect: true }) size: 'small' | 'medium' | 'large' = 'medium';

  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  @property({ type: Boolean, reflect: true }) checked: boolean = false;

  @defaultValue('checked') defaultChecked = false;

  @property({ reflect: true }) form = '';

  @property({ type: Boolean, reflect: true }) required = false;

  @property({ attribute: 'help-text' }) helpText = "";

  @property({ type: Boolean, attribute: 'trigger-submit' }) triggerSubmit = false;

  @property() onText: string = '';

  @property() offText: string = '';


  get validity()
  {
    return this.input.validity;
  }

  get validationMessage()
  {
    return this.input.validationMessage;
  }

  firstUpdated(_changedProperties: PropertyValues)
  {
    this.formControlController.updateValidity();
  }

  private handleBlur()
  {
    this.hasFocus = false;
  }

  private handleInvalid(event: Event)
  {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleInput()
  {
    //
  }

  private handleClick()
  {
    this.checked = !this.checked;
    if(this.triggerSubmit)
    {
      this.formControlController.submit(this.input);
    }
  }

  private handleFocus()
  {
    this.hasFocus = true;
  }

  private handleKeyDown(event: KeyboardEvent)
  {
    if(event.key === 'ArrowLeft')
    {
      event.preventDefault();
      this.checked = false;
    }

    if(event.key === 'ArrowRight')
    {
      event.preventDefault();
      this.checked = true;
    }
  }

  // Public API methods

  click()
  {
    this.input.click();
  }

  focus(options?: FocusOptions)
  {
    this.input.focus(options);
  }

  blur()
  {
    this.input.blur();
  }

  checkValidity()
  {
    return this.input.checkValidity();
  }

  getForm(): HTMLFormElement | null
  {
    return this.input.form;
  }

  reportValidity()
  {
    return this.input.reportValidity();
  }

  setCustomValidity(message: string)
  {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  // End Public API methods

  render()
  {
    let fallback = html``;
    if(this.fallbackValue !== '')
    {
      fallback = html`<input type="hidden" name=${this.name} value=${this.fallbackValue}/>`;
    }

    return html`
      <label part="base" class="${classMap({ 'switch': true })}">
        ${fallback}
        <input
          class="switch__input"
          type="checkbox"
          title=${this.title}
          name=${this.name}
          value=${ifDefined(this.value)}
          .checked=${live(this.checked)}
          .disabled=${this.disabled}
          .required=${this.required}
          role="switch"
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-describedby="help-text"
          @click=${this.handleClick}
          @input=${this.handleInput}
          @invalid=${this.handleInvalid}
          @blur=${this.handleBlur}
          @focus=${this.handleFocus}
          @keydown=${this.handleKeyDown}
        />

        <span part="control" class="switch__control"></span>

      </label>
    `;
  }
}
