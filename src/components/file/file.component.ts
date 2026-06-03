import {animateTo} from "../../internal/animate";
import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type HTMLTemplateResult, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {getAnimation, setDefaultAnimation} from "../../utilities/animation-registry";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {LocalizeController} from "../../utilities/localize";
import {property, query, state} from 'lit/decorators.js';
import {repeat} from 'lit/directives/repeat.js';
import {watch} from "../../internal/watch";
import ZincElement, {type ZincFormControl} from '../../internal/zinc-element';
import ZnDialog from "../dialog";
import type ZnButton from "../button";

import styles from './file.scss';

/**
 * @summary File controls allow selecting an arbitrary number of files for uploading.
 * @documentation https://zinc.style/components/drag-upload
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-icon
 * @dependency zn-dialog
 *
 * @slot label - The file control's label. Alternatively, you can use the `label` attribute.
 * @slot help-text - Text that describes how to use the file control.
 *    Alternatively, you can use the `help-text` attribute.
 * @slot trigger - Optional content to be used as trigger instead of the default content.
 *    Opening the file dialog on click and as well as drag and drop will work for this content.
 *    Following attributes will no longer work: *label*, *droparea*, *help-text*, *size*,
 *    *hide-value*. Also if using the disabled attribute, the disabled styling will not be
 *    applied and must be taken care of yourself.
 *
 * @event zn-blur - Emitted when the control loses focus.
 * @event zn-change - Emitted when an alteration to the control's value is committed by the user.
 * @event zn-clear - Emitted when the user confirms clearing the selected file or `src`.
 * @event zn-error - Emitted when multiple files are selected via drag and drop, without
 * the `multiple` property being set.
 * @event zn-focus - Emitted when the control gains focus.
 * @event zn-input - Emitted when the control receives input.
 *
 * @csspart form-control - The form control that wraps the label, input, and help text.
 * @csspart form-control-label - The label's wrapper.
 * @csspart form-control-input - The input's wrapper.
 * @csspart form-control-help-text - The help text's wrapper.
 * @csspart button-wrapper - The wrapper around the button and text value.
 * @csspart button - The zn-button acting as a file input.
 * @csspart button__base - The zn-button's exported `base` part.
 * @csspart value - The chosen files or placeholder text for the file input.
 * @csspart droparea - The element wrapping the drop zone.
 * @csspart droparea-background - The background of the drop zone.
 * @csspart upload - The upload button shown in the droparea when no file is selected.
 * @csspart preview - The image preview rendered in the droparea for previewable files.
 * @csspart filename - The filename label rendered in the droparea for non-previewable files.
 * @csspart clear - The clear button rendered in the droparea when a file is present.
 * @csspart clear-confirm - The confirmation dialog shown before clearing the file.
 * @csspart link - The current link anchor rendered when `show-link` is enabled.
 * @csspart trigger - The container that wraps the trigger.
 *
 * @animation file.iconDrop - The animation to use for the file icon
 * when a file is dropped
 * @animation file.text.disappear - The disappear animation to use for the file placeholder text
 * when a file is dropped
 * @animation file.text.appear - The appear animation to use for the file placeholder text
 * when a file is dropped
 */
export default class ZnFile extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-dialog': ZnDialog
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-change'],
    value: (el: ZnFile) => el.files
  })

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');

  private readonly localize = new LocalizeController(this);

  @state() private userIsDragging = false;
  @state() private fileObjectUrl: string | null = null;

  @query('.input__control') input: HTMLInputElement;

  @query('.button') button: ZnButton;

  @query('.droparea') dropareaWrapper: HTMLDivElement;

  @query('.droparea__icon') dropareaIcon: HTMLSpanElement;

  @query('.input__value') inputChosen: HTMLSpanElement;

  @query('.clear-confirm') clearConfirmDialog: HTMLElement & { show: () => void; hide: () => void };

  /**
   * The selected files as a FileList object containing a list of File objects.
   * The FileList behaves like an array, so you can get the number of selected files
   * via its length property.
   * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#getting_information_on_selected_files)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#getting_information_on_selected_files
   */
  @property({type: Object})
  set files(v: FileList | null) {
    if (this.input) {
      this.input.files = v;
      this.updatePreview();
    }
  }

  get files() {
    return this.input?.files;
  }

  /** The name of the file control, submitted as a name/value pair with form data. */
  @property({type: String}) name = '';

  /**
   * The current value of the input, submitted as a name/value pair with form data.
   * Beware that the only valid value when setting a file input is an empty string!
   */

  /**
   * The value of the file control contains a string that represents the path of the selected file.
   * If multiple files are selected, the value represents the first file in the list.
   * If no file is selected, the value is an empty string.
   * Beware that the only valid value when setting a file control is an empty string!
   * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#value)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#value
   */
  @property({type: String})
  set value(v: string) {
    if (this.input) {
      this.input.value = v;
    }
  }

  get value() {
    return this.input?.value;
  }

  /** The default value of the form control. Primarily used for resetting the form control. */
  @defaultValue() defaultValue: string = '';

  /** The file control's size. */
  @property({reflect: true}) size: 'small' | 'medium' | 'large' = 'medium';

  /** The file control's label. If you need to display HTML, use the `label` slot instead. */
  @property() label = '';

  /** If this is set, then the only way to remove files is to click the cross next to them. */
  @property({type: Boolean}) clearable = false;

  /**
   * The file control's help text.
   * If you need to display HTML, use the `help-text` slot instead.
   */
  @property({attribute: 'help-text'}) helpText = '';

  /** Disables the file control. */
  @property({reflect: true, type: Boolean}) disabled = false;

  /** Draw the file control as a drop area */
  @property({type: Boolean}) droparea = false;

  /**
   * Comma separated list of supported file types
   * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
   * @example <zn-file accept=".jpg,.jpeg,.png,.gif,text/plain,image/*"></zn-file>
   */
  @property({type: String}) accept = '';

  /**
   * Specifies the types of files that the server accepts.
   * Can be set either to user or environment.
   * Works only when not using a droparea!
   * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
   */
  @property({type: String}) capture: 'user' | 'environment';

  /**
   * Indicates whether the user can select more than one file.
   * Has no effect if webkitdirectory is set.
   * [see MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#multiple
   */
  @property({reflect: true, type: Boolean}) multiple = false;

  /**
   * Indicates that the file control should let the user select directories instead of files.
   * When a directory is selected, the directory and its entire hierarchy of contents are included
   * in the set of selected items.
   * Note: This is a non-standard attribute but is supported in the major browsers.
   * [see MDN](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory)
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory
   */
  @property({reflect: true, type: Boolean}) webkitdirectory = false;

  /**
   * By default, form controls are associated with the nearest containing `<form>` element.
   * This attribute allows you to place the form control outside of a form and associate it
   * with the form that has this `id`. The form must be in the same document
   * or shadow root for this to work.
   */
  @property({reflect: true}) form = '';

  /** Makes the input a required field. */
  @property({reflect: true, type: Boolean}) required = false;

  /** Suppress the value from being displayed in the file control */
  @property({attribute: 'hide-value', type: Boolean}) hideValue = false;

  /**
   * URL of an already-uploaded file (e.g., from a CDN) to display as the current value
   * when no file has been selected locally. If the URL points to an image, it is rendered
   * as a preview inside the droparea. Otherwise the URL is shown as a filename.
   */
  @property() src = '';

  /**
   * When enabled, automatically submit the surrounding form whenever the value changes
   * (file selected, dropped, or cleared). Useful for forms that only contain this control
   * and a CSRF token.
   */
  @property({type: Boolean, attribute: 'trigger-submit'}) triggerSubmit = false;

  /**
   * When enabled, render the current link (`previewSrc`) as a clickable URL below the control.
   * Useful for showing the existing CDN link alongside the preview.
   */
  @property({type: Boolean, attribute: 'show-link'}) showLink = false;

  /** Gets the validity state object */
  get validity() {
    return this.input?.validity;
  }

  /** Gets the validation message */
  get validationMessage() {
    return this.input.validationMessage;
  }

  /**
   * Checks for validity but does not show a validation message.
   * Returns `true` when valid and `false` when invalid.
   */
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

  @watch('disabled', {waitUntilFirstUpdate: true})
  handleDisabledChange() {
    // Disabled form controls are always valid
    this.formControlController.setValidity(this.disabled);
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
  }

  /** Sets focus on the button or droparea. */
  focus(options?: FocusOptions) {
    if (this.droparea) {
      this.dropareaWrapper?.focus(options);
      return;
    }

    this.button?.focus(options);
  }

  /** Removes focus from the button or droparea. */
  blur() {
    if (this.droparea) {
      this.dropareaWrapper?.blur();
      return;
    }

    this.button?.blur();
  }

  private handleInvalid = (e: Event) => {
    this.formControlController.setValidity(false);
    this.formControlController.emitInvalidEvent(e);
  }

  private handleFiles(files: FileList | null) {
    if (!files) {
      this.value = '';
      return;
    }

    this.files = files;
  }

  private async handleTransferItems(items: DataTransferItemList | null): Promise<FileList> {
    if (!items) {
      this.value = '';
      return new Promise((_resolve, reject) => {
        reject(new Error('No proper items found'))
      })
    }

    const entries = Array.from(items).map(item => item.webkitGetAsEntry());

    const filesPromise = entries.map(entry => this.getFilesFromEntry(entry));
    const filesArray = await Promise.all(filesPromise);
    const files = filesArray.flat();

    const dataTransfer = new DataTransfer();
    Array.from(files).forEach(f => dataTransfer.items.add(f));
    return dataTransfer.files;
  }

  private async getFilesFromEntry(entry: FileSystemEntry | null): Promise<File[]> {
    if (!entry) {
      return [];
    }

    if (entry.isFile) {
      return new Promise<File[]>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(file => resolve([file]), reject);
      });
    } else if (entry.isDirectory) {
      return new Promise<File[]>((resolve, reject) => {
        const dirReader = (entry as FileSystemDirectoryEntry).createReader();
        dirReader.readEntries(entries => {
          Promise.all(entries.map(e => this.getFilesFromEntry(e)))
            .then(files => {
              resolve(files.flat())
            }).catch(reject);
        });
      });
    }
    return [];
  }

  private handleClick(e: Event) {
    e.preventDefault();
    this.input.click();
  }

  /** Handles the change event of the native input */
  private handleChange(e: Event) {
    e.preventDefault();
    e.stopPropagation();

    this.updatePreview();
    this.emit('zn-input');
    this.emit('zn-change');

    if (this.triggerSubmit) {
      this.formControlController.submit();
    }
  }

  private handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.userIsDragging = true;
  }

  private handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.userIsDragging = false;
  }

  private handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();


    if (!e.dataTransfer) {
      return;
    }

    const files = await this.handleTransferItems(e.dataTransfer.items);
    this.userIsDragging = false;

    if (!files) {
      return;
    }

    // webkitdirectory also allows multiple files
    if (!this.multiple && !this.webkitdirectory && files.length > 1) {
      this.emit('zn-error');
      return;
    }

    // Use the transferred file list from the drag drop interface
    const hasTrigger = this.hasSlotController.test('trigger');
    if (!hasTrigger) {
      const disappearAnimation = getAnimation(this.inputChosen, 'file.text.disappear', {dir: this.localize.dir()});
      const appearAnimation = getAnimation(this.inputChosen, 'file.text.appear', {dir: this.localize.dir()});

      if (this.droparea) {
        const dropIconAnimation = getAnimation(this.dropareaIcon, 'file.iconDrop', {dir: this.localize.dir()});
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        animateTo(this.dropareaIcon, dropIconAnimation.keyframes, dropIconAnimation.options);
      }
      // eslint-disable-next-line max-len
      await animateTo(this.inputChosen, disappearAnimation.keyframes, disappearAnimation.options);
      this.handleFiles(files);
      await animateTo(this.inputChosen, appearAnimation.keyframes, appearAnimation.options);
    } else {
      this.handleFiles(files);
    }

    this.input.dispatchEvent(new Event('change'));
  }

  /**
   * Handle the focus of the droparea and emit focus event
   */
  private handleFocus() {
    this.emit('zn-focus');
  }

  /**
   * Handle the blur of the droparea and emit blur event
   */
  private handleBlur() {
    this.emit('zn-blur');
  }

  /**
   * Remove a file from the list of files
   */
  private removeFile = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(this.files || []);
    const file = (e.target as ZnButton).parentElement?.getAttribute('data-file-name');

    const index = files.findIndex(f => f.name === file);

    if (index !== -1) {
      files.splice(index, 1);
    }

    const dataTransfer = new DataTransfer();
    files.forEach(f => dataTransfer.items.add(f));
    this.files = dataTransfer.files;
    this.input.dispatchEvent(new Event('change'));
  }

  /** Open the confirm dialog before clearing. */
  private handleClearClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    this.clearConfirmDialog?.show();
  }

  /** Clear the current value after the user confirms. */
  private confirmClear = () => {
    const hadLocalFile = (this.files?.length ?? 0) > 0;
    this.input.value = '';
    this.files = null;
    // If only an external `src` was present, clear it. If a local file was selected on top of
    // an external src, leave the src so the droparea reverts to the originally-supplied preview.
    if (!hadLocalFile) {
      this.src = '';
    }
    this.clearConfirmDialog?.hide();
    this.input.dispatchEvent(new Event('change'));
    this.emit('zn-clear');
  }

  private updatePreview() {
    if (this.fileObjectUrl) {
      URL.revokeObjectURL(this.fileObjectUrl);
      this.fileObjectUrl = null;
    }

    const file = this.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.fileObjectUrl = URL.createObjectURL(file);
    }
  }

  /**
   * Returns the URL currently shown in the droparea — the locally-selected file's object URL
   * if a file is selected, otherwise the externally supplied `src`. Useful for getting the
   * current CDN link to submit alongside form data.
   */
  get previewSrc(): string {
    return this.fileObjectUrl ?? this.src ?? '';
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.fileObjectUrl) {
      URL.revokeObjectURL(this.fileObjectUrl);
      this.fileObjectUrl = null;
    }
  }

  private renderFileValueWithDelete(): HTMLTemplateResult {
    // files as an array
    const files = Array.from(this.files || []);
    const isClearable = this.clearable;

    // @ts-expect-error variadic
    const fileChosenLabel = this.localize.term('numFilesSelected', 0, this.webkitdirectory);
    return html`
      ${files ? html`
        <div class="file_wrapper">
          ${repeat(files, (file: File) => html`
            <zn-chip
              class=${classMap({
                'input__value': true,
                'input__value--hidden': this.hideValue,
              })}
              data-file-name="${file.name}"
              part="value">
              ${file.name}
              ${isClearable ? html`
                <zn-button
                  slot="action"
                  class="input__delete"
                  color="transparent"
                  icon="close"
                  size="content"
                  icon-size="18"
                  @click="${this.removeFile}"
                  part="delete"></zn-button>` : ''}
            </zn-chip>
          `)}
        </div>` : html`${fileChosenLabel}`}`;
  }

  private renderDroparea(): HTMLTemplateResult {
    const files = Array.from(this.files || []);
    const firstFile = files[0];

    const hasLocalFile = files.length > 0;
    const hasExternalSrc = !hasLocalFile && !!this.src;
    const hasValue = hasLocalFile || hasExternalSrc;

    const imageSrc = hasLocalFile ? this.fileObjectUrl : (hasExternalSrc ? this.src : null);
    const showImagePreview = !!imageSrc;
    const displayName = hasLocalFile ? firstFile.name : (hasExternalSrc ? this.src : '');

    let buttonText = this.localize.term('fileButtonText');
    if (this.multiple) buttonText = this.localize.term('fileButtonTextMultiple');
    if (this.webkitdirectory) buttonText = this.localize.term('folderButtonText');

    return html`
      <div
        class=${classMap({
          'droparea': true,
          'droparea--has-preview': showImagePreview,
        })}
        @click="${this.handleClick}"
        @keypress="${this.handleClick}"
        @focus="${this.handleFocus}"
        @blur="${this.handleBlur}"
        tabindex="${this.disabled ? '-1' : '0'}"
        part="droparea">
        ${hasValue ? html`
          <zn-button
            class="droparea__clear"
            icon="close"
            icon-size="18"
            size="x-small"
            color="default"
            outline
            ?disabled=${this.disabled}
            @click=${this.handleClearClick}
            part="clear"
            aria-label="${this.localize.term('clearEntry')}"></zn-button>
        ` : ''}
        <div
          class="droparea__background"
          part="droparea-background">
          ${showImagePreview
            ? html`<img
                class="droparea__preview"
                src=${imageSrc!}
                alt=${displayName}
                part="preview">`
            : (hasValue
              ? html`<span class="droparea__filename" part="filename">${displayName}</span>`
              : html`
                <zn-button
                  class="droparea__upload"
                  icon="cloud_upload"
                  icon-size="20"
                  size="small"
                  color="default"
                  outline
                  ?disabled=${this.disabled}
                  part="upload">
                  ${buttonText}
                </zn-button>`)}
        </div>
      </div>
      <zn-dialog class="clear-confirm" label="${this.localize.term('clearEntry')}" part="clear-confirm">
        <p class="clear-confirm__text">Are you sure you want to remove this file?</p>
        <zn-button slot="footer" outline dialog-closer>Cancel</zn-button>
        <zn-button slot="footer" color="error" @click=${this.confirmClear}>Remove</zn-button>
      </zn-dialog>
    `;
  }

  private renderButton(): HTMLTemplateResult {
    let buttonText = this.localize.term('fileButtonText');
    if (this.multiple) {
      buttonText = this.localize.term('fileButtonTextMultiple');
    }
    if (this.webkitdirectory) {
      buttonText = this.localize.term('folderButtonText');
    }

    return html`
      <div
        class="button__wrapper"
        part="button-wrapper">
        <zn-button
          class="button"
          @click="${this.handleClick}"
          ?disabled=${this.disabled}
          exportparts="base:button__base"
          part="button"
          size="small"
          outline>
          ${buttonText}
        </zn-button>
        ${this.renderFileValueWithDelete()}
      </div>`;
  }

  render() {
    const hasLabel = this.label || this.hasSlotController.test('label');
    const hasHelpText = this.helpText || this.hasSlotController.test('help-text');
    const hasTrigger = this.hasSlotController.test('trigger');


    return html`
      <div
        class="${classMap({
          'form-control': true,
          'form-control--droparea': this.droparea,
          'form-control--has-help-text': hasHelpText,
          'form-control--has-label': hasLabel,
          'form-control--large': this.size === 'large',
          'form-control--medium': this.size === 'medium',
          'form-control--small': this.size === 'small',
          'form-control--user-dragging': this.userIsDragging,
        })}"
        @dragenter="${this.handleDragOver}"
        @dragleave="${this.handleDragLeave}"
        @dragover="${this.handleDragOver}"
        @drop="${this.handleDrop}"
        part="form-control">
        ${hasTrigger ?
          html`
            <slot name="trigger" part="trigger" @click="${this.handleClick}" @keypress="${this.handleClick}"></slot>` :
          html`
            <label
              aria-hidden="${hasLabel ? 'false' : 'true'}"
              class="form-control__label"
              for="input"
              part="form-control-label">
              <slot name="label">${this.label}</slot>
            </label>

            <div class="form-control-input" part="form-control-input">
              ${this.droparea ? this.renderDroparea() : this.renderButton()}
            </div>

            ${this.showLink && this.previewSrc ? html`
              <a
                class="form-control__link"
                part="link"
                href=${this.previewSrc}
                target="_blank"
                rel="noopener noreferrer"
                title=${this.previewSrc}>${this.previewSrc}</a>
            ` : ''}

            <div
              aria-hidden="${hasHelpText ? 'false' : 'true'}"
              class="form-control__help-text"
              id="help-text"
              part="form-control-help-text">
              <slot name="help-text">${this.helpText}</slot>
            </div>
          `}
        <input
          accept=${this.accept}
          aria-describedby="help-text"
          @change=${this.handleChange}
          class="input__control"
          ?disabled=${this.disabled}
          id="input"
          @invalid=${this.handleInvalid}
          ?multiple=${this.multiple}
          name=${ifDefined(this.name)}
          ?required=${this.required}
          type="file"
          tabindex="-1"
          ?webkitdirectory=${this.webkitdirectory}>
      </div>`;
  }
}

setDefaultAnimation('file.iconDrop', {
  keyframes: [
    {scale: 1},
    {scale: 0.7},
    {scale: 1},
  ],
  options: {duration: 600, easing: 'ease-out'},
});

setDefaultAnimation('file.text.disappear', {
  keyframes: [
    {opacity: 1},
    {opacity: 0, transform: 'translateY(-40%)'},
  ],
  options: {duration: 300, easing: 'cubic-bezier(0.45, 1.45, 0.8, 1)'},
});

setDefaultAnimation('file.text.appear', {
  keyframes: [
    {opacity: 0, transform: 'translateY(40%)'},
    {opacity: 1},
  ],
  options: {duration: 300, easing: 'cubic-bezier(0.45, 1.45, 0.8, 1)'},
});
