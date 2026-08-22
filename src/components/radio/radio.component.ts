import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {live} from "lit/directives/live.js";
import {property, query, state} from 'lit/decorators.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from "../icon";
import type {SelectionCardControlPosition, SelectionCardImagePosition} from '../../internal/selection-card';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './radio.scss';

/**
 * @summary Short summary of the component's intended use.
 * @documentation https://zinc.style/components/radio
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 *
 * @slot - The radio's label.
 * @slot image - Replaces the built-in image used by contained radios.
 * @slot description - A description of the radio's label. Serves as help text for a radio item. Alternatively, you can use the `description` attribute.
 * @slot selected-content - Use to nest rich content (like an input) inside a selected radio item. Use only with the contained style.
 *
 * @event zn-blur - Emitted when the radio loses focus.
 * @event zn-change - Emitted when the checked state changes.
 * @event zn-focus - Emitted when the radio gains focus.
 * @event zn-input - Emitted when the radio receives input.
 * @event zn-invalid - Emitted when the form control has been checked for validity and its constraints aren't satisfied.
 *
 * @csspart base - The component's base wrapper.
 * @csspart control - The square container that wraps the radio's checked state.
 * @csspart control--checked - Matches the control part when the radio is checked.
 * @csspart checked-icon - The checked icon, an `<zn-icon>` element.
 * @csspart image-container - The wrapper around the built-in image or image slot.
 * @csspart image - The built-in image.
 * @csspart card-title - The title inside a selection card.
 * @csspart label - The container that wraps the radio's label.
 * @csspart description - The container that wraps the radio's description.
 * @csspart selected-content - The container that wraps optional content that appears when a radio is checked.
 *
 * @cssproperty --zn-selection-card-image-width - Width of the built-in card image.
 * @cssproperty --zn-selection-card-image-height - Height of the built-in card image.
 * @cssproperty --zn-selection-card-min-height - Minimum height of a contained radio with an image.
 * @cssproperty --zn-selection-card-content-min-width - Width the card text keeps before it wraps below the image.
 * @cssproperty --zn-selection-card-title-font-size - Font size of a selection card title.
 * @cssproperty --zn-selection-card-padding - Equal inset around the contents of a selection card.
 * @cssproperty --zn-selection-card-gap - Space between the image, title, and indicator gutter.
 * @cssproperty --zn-selection-card-control-offset - Distance between a positioned control and the card edge.
 * @cssproperty --zn-selection-card-border-radius - Corner radius of a contained container.
 */
export default class ZnRadio extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {'zn-icon': ZnIcon};

  private readonly formControlController = new FormControlController(this, {
    value: (control: ZnRadio) => (control.checked ? control.value || 'on' : undefined),
    defaultValue: (control: ZnRadio) => control.defaultChecked,
    setValue: (control: ZnRadio, checked: boolean) => (control.checked = checked)
  });
  private readonly hasSlotController = new HasSlotController(this, '[default]', 'description', 'image');

  @query('input[type="radio"]') input: HTMLInputElement;

  @state() private hasFocus = false;

  @property() title = ''; // make reactive to pass through

  /** The name of the radio, submitted as a name/value pair with form data. */
  @property() name = '';

  /** The current value of the radio, submitted as a name/value pair with form data. */
  @property() value: string;

  /** Title rendered inside the card. The default slot takes precedence when provided. */
  @property({attribute: 'card-title'}) cardTitle = '';

  /** The radio's size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** Disables the radio. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Draws the radio in a checked state. */
  @property({type: Boolean, reflect: true}) checked = false;

  /** Draws a container around the radio. */
  @property({type: Boolean, reflect: true}) contained = false;

  /** Squares off the corners of the container drawn by `contained`, which is rounded by default. */
  @property({type: Boolean, reflect: true}) square = false;

  /** URL for the image shown in a contained radio. */
  @property() src = '';

  /** Accessible text for the built-in image. Leave empty when the image is decorative. */
  @property({attribute: 'image-alt'}) imageAlt = '';

  /** Places the image above, beside, or below the radio's text. Requires `contained`. */
  @property({attribute: 'image-position', reflect: true}) imagePosition: SelectionCardImagePosition = 'left';

  /**
   * Places the radio indicator within a contained card. Use `none` to hide the indicator so the card itself
   * shows the selected state. Requires `contained`.
   */
  @property({attribute: 'control-position', reflect: true}) controlPosition: SelectionCardControlPosition = 'start';

  /** Applies styles relevant to radios in a horizontal layout. */
  @property({type: Boolean, reflect: true}) horizontal = false;

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue('checked') defaultChecked = false;

  /**
   * By default, form controls are associated with the nearest containing `<form>` element. This attribute allows you
   * to place the form control outside a form and associate it with the form that has this `id`. The form must be in
   * the same document or shadow root for this to work.
   */
  @property({reflect: true}) form = '';

  /** Makes the radio a required field. */
  @property({type: Boolean, reflect: true}) required = false;

  /** The radio's help text. If you need to display HTML, use the `description` slot instead. */
  @property({attribute: 'description'}) description = '';

  @property() label: string;

  @property({attribute: 'label-tooltip'}) labelTooltip: string;

  /** Gets the validity state object */
  get validity() {
    return this.input?.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  firstUpdated() {
    this.formControlController.updateValidity();
  }

  private handleClick() {
    if (this.disabled) {
      return;
    }

    this.checked = !this.checked;
    this.emit('zn-change');
  }

  private handleBlur() {
    this.hasFocus = false;
    this.emit('zn-blur');
  }

  private handleInput() {
    this.emit('zn-input');
  }

  private handleInvalid(event: Event) {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(event);
  }

  private handleFocus() {
    this.hasFocus = true;
    this.emit('zn-focus');
  }

  private handleSelectedContentClick(event: MouseEvent) {
    // Prevent clicks on selected content from unchecking the radio
    event.preventDefault();
  }

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    // Disabled form controls are always valid
    this.formControlController.setValidity(this.disabled);
  }

  @watch(['checked'], {waitUntilFirstUpdate: true})
  handleStateChange() {
    this.input.checked = this.checked; // force a sync update
    this.formControlController.updateValidity();
  }

  /** Simulates a click on the radio. */
  click() {
    this.input.click();
  }

  /** Sets focus on the radio. */
  focus(options?: FocusOptions) {
    this.input.focus(options);
  }

  /** Removes focus from the radio. */
  blur() {
    this.input.blur();
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

  /**
   * Sets a custom validation message. The value provided will be shown to the user when the form is submitted. To clear
   * the custom validation message, call this method with an empty string.
   */
  setCustomValidity(message: string) {
    this.input.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  render() {
    const hasDescriptionSlot = this.hasSlotController.test('description');
    const hasDescription = this.description ? true : hasDescriptionSlot;
    const hasImage = this.contained && (Boolean(this.src) || this.hasSlotController.test('image'));
    const hasDefaultSlot = this.hasSlotController.test('[default]');
    const isCard = this.contained && (hasImage || Boolean(this.cardTitle) || this.controlPosition !== 'start');
    const hasLabelSlot = this.hasSlotController.test('label');
    const hasLabelTooltip = this.hasSlotController.test('label-tooltip');
    const hasLabel = this.label || hasLabelSlot;

    //
    // NOTE: we use a <div> around the label slot because of this Chrome bug.
    //
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1413733
    //
    return html`
      <div
        class=${classMap({
          'form-control': true,
          'form-control--small': this.size === 'small',
          'form-control--medium': this.size === 'medium',
          'form-control--large': this.size === 'large',
          'form-control--radio-contained-wrapper': this.contained,
          'form-control--has-label': hasLabel,
        })}>

        <div
          part="form-control-label"
          id="label"
          class="form-control__label"
          aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
          ${hasLabelTooltip
            ? html`
              <zn-tooltip class="form-control--label-tooltip">
                <div slot="content">
                  <slot name="label-tooltip">${this.labelTooltip}</slot>
                </div>
                <zn-icon src="info"></zn-icon>
              </zn-tooltip>`
            : ''}
        </div>

        <label
          part="base"
          class=${classMap({
            radio: true,
            'radio--checked': this.checked,
            'radio--disabled': this.disabled,
            'radio--focused': this.hasFocus,
            'radio--contained': this.contained,
            'radio--horizontal': this.horizontal,
            'radio--small': this.size === 'small',
            'radio--medium': this.size === 'medium',
            'radio--large': this.size === 'large',
            'radio--has-description': hasDescription,
            'radio--has-selected-content': this.hasSlotController.test('selected-content'),
            'selection-card': isCard,
            'selection-card--has-image': hasImage,
            [`selection-card--image-${this.imagePosition}`]: hasImage,
            [`selection-card--control-${this.controlPosition}`]: isCard && this.controlPosition !== 'start'
          })}>

          <input
            class="radio__input"
            type="radio"
            title=${this.title /* An empty title prevents browser validation tooltips from appearing on hover */}
            name=${this.name}
            value=${ifDefined(this.value)}
            .checked=${live(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            aria-checked=${this.checked ? 'true' : 'false'}
            aria-describedby=${hasDescription ? 'description' : ''}
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
          />
          <span
            part="control${this.checked ? ' control--checked' : ''}"
            class="radio__control selection-card__control">
            ${this.checked
              ? html`
                <zn-icon part="checked-icon" size="18" class="radio__checked-icon"
                         src="radio_button_checked"></zn-icon>`
              : ''}
          </span>

          ${hasImage
            ? html`
              <span part="image-container" class="selection-card__image-container">
                <slot name="image">
                  ${this.src
                    ? html`<img part="image" class="selection-card__image" src=${this.src} alt=${this.imageAlt}>`
                    : ''}
                </slot>
              </span>`
            : ''}

          <div part="label" class="radio__label selection-card__content">
            <span part="card-title" class="selection-card__title">
              <slot></slot>${hasDefaultSlot ? '' : this.cardTitle}
            </span>
            <div
              aria-hidden=${hasDescription ? 'false' : 'true'}
              class="radio__description"
              id="description"
              part="description">
              <slot name="description">${this.description}</slot>
            </div>
            ${this.checked
              ? html`
                <zn-animation name="fadeIn" easing="ease" duration="300" iterations="1" play>
                  <slot
                    name="selected-content"
                    part="selected-content"
                    class="radio__selected-content"
                    @click=${this.handleSelectedContentClick}></slot>
                </zn-animation>`
              : ''}
          </div>
        </label>
      </div>
    `;
  }
}
