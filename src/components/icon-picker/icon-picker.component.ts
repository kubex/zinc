import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {defaultValue} from '../../internal/default-value';
import {FormControlController} from '../../internal/form';
import {property, query, state} from 'lit/decorators.js';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnDialog from '../dialog';
import ZnIcon from '../icon';
import ZnInput from '../input';
import ZnOption from '../option';
import ZnSelect from '../select';
import type {ZincFormControl} from '../../internal/zinc-element';

import formControlStyles from '../../form-control.scss';
import styles from './icon-picker.scss';

export default class ZnIconPicker extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = [unsafeCSS(formControlStyles), unsafeCSS(styles)];
  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-button': ZnButton,
    'zn-dialog': ZnDialog,
    'zn-input': ZnInput,
    'zn-select': ZnSelect,
    'zn-option': ZnOption
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-change'],
    // With allow-upload, a chosen file is submitted under `name` in place of
    // the icon string — the two are mutually exclusive.
    value: (el: ZnIconPicker) => el._file ?? el.icon
  });

  @property() name = '';
  @property() icon = '';
  @property() label = '';
  // Matches zn-icon's defaultLibrary so the picked icon previews the same way
  // it will render wherever the stored name is displayed.
  @property() library: string = 'material-symbols-outlined';
  @property() color: string = '';
  @property({type: Boolean, attribute: 'no-color'}) noColor: boolean = false;
  @property({type: Boolean, attribute: 'no-library'}) noLibrary: boolean = false;
  @property({attribute: 'help-text'}) helpText: string = '';
  @property({type: Boolean, reflect: true}) disabled = false;
  @property({type: Boolean, reflect: true}) required = false;
  @property({type: Boolean, attribute: 'trigger-submit'}) triggerSubmit = false;
  @property({type: Boolean, attribute: 'allow-upload'}) allowUpload = false;
  @property() accept = 'image/*';
  @property({reflect: true}) form: string;

  @defaultValue() defaultValue = '';

  @state() private _dialogOpen = false;
  @state() private _searchQuery = '';
  @state() private _iconList: string[] = [];
  @state() private _filteredIcons: string[] = [];

  // Pending selections (not committed until confirm)
  @state() private _pendingIcon = '';
  @state() private _pendingLibrary = '';
  @state() private _pendingColor = '';
  @state() private _pendingFile: File | null = null;
  @state() private _pendingFileUrl: string | null = null;
  @state() private _mode: 'icon' | 'upload' = 'icon';

  // Committed upload (allow-upload mode)
  @state() private _file: File | null = null;
  @state() private _fileUrl: string | null = null;

  @query('zn-dialog') private _dialog: ZnDialog;
  @query('.icon-picker__file-input') private _fileInput: HTMLInputElement;

  get value(): string {
    return this.icon;
  }

  set value(val: string) {
    this.icon = val;
  }

  /** The chosen file when the user uploaded an image instead of picking an icon. */
  get file(): File | null {
    return this._file;
  }

  /** True when the current value renders as an image (an uploaded file or a URL) rather than a library icon. */
  get isImageValue(): boolean {
    return !!this._file || this.icon.includes('/');
  }

  get validity(): ValidityState {
    if (this.required && !this.icon && !this._file) {
      return {
        valid: false,
        valueMissing: true,
        badInput: false, customError: false, patternMismatch: false,
        rangeOverflow: false, rangeUnderflow: false, stepMismatch: false,
        tooLong: false, tooShort: false, typeMismatch: false,
      } as ValidityState;
    }
    return {
      valid: true, valueMissing: false, badInput: false, customError: false,
      patternMismatch: false, rangeOverflow: false, rangeUnderflow: false,
      stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false,
    } as ValidityState;
  }

  get validationMessage(): string {
    return this.required && !this.icon && !this._file ? 'Please select an icon.' : '';
  }

  checkValidity(): boolean { return this.validity.valid; }
  getForm(): HTMLFormElement | null { return this.formControlController.getForm(); }
  reportValidity(): boolean { return this.checkValidity(); }
  setCustomValidity(_message: string) { this.formControlController.updateValidity(); }

  private static readonly freeInputLibraries = new Set(['gravatar', 'libravatar', 'avatar']);

  private isFreeInputLibrary(library: string): boolean {
    return ZnIconPicker.freeInputLibraries.has(library);
  }

  // The icon name lists are only needed once the picker dialog opens, so they
  // load lazily into their own chunks. Falls back to an empty list on a failed
  // chunk load so callers never reject.
  private async getIconsForLibrary(library: string): Promise<string[]> {
    try {
      switch (library) {
        case 'brands':
          return (await import('./brand-icons')).brandIcons;
        case 'line':
          return (await import('./line-icons')).lineIcons;
        case 'lucide':
          return (await import('./lucide-icons')).lucideIcons;
        default: {
          const lists = await import('./material-icons');
          switch (library) {
            case 'material-outlined':
              return lists.material_outlinedIcons;
            case 'material-round':
              return lists.material_roundIcons;
            case 'material-sharp':
              return lists.material_sharpIcons;
            case 'material-two-tone':
              return lists.material_two_toneIcons;
            case 'material-symbols-outlined':
              return lists.material_symbols_outlinedIcons;
            default:
              return lists.materialIcons;
          }
        }
      }
    } catch {
      return [];
    }
  }

  private async openDialog() {
    this._pendingIcon = this.isImageValue ? '' : this.icon;
    this._pendingLibrary = this.library;
    this._pendingColor = this.color;
    this._searchQuery = '';
    this._mode = this.allowUpload && this.isImageValue ? 'upload' : 'icon';
    this._iconList = await this.getIconsForLibrary(this.library);
    this._filteredIcons = this._iconList.slice(0, 200);
    this._dialogOpen = true;

    await this.updateComplete;
    this._dialog.show();
  }

  private closeDialog() {
    this.discardPendingFile();
    this._dialog.hide();
    this._dialogOpen = false;
  }

  private handleConfirm() {
    if (this._mode === 'upload') {
      if (this._pendingFile) {
        if (this._fileUrl) {
          URL.revokeObjectURL(this._fileUrl);
        }
        this._file = this._pendingFile;
        this._fileUrl = this._pendingFileUrl;
        this._pendingFile = null;
        this._pendingFileUrl = null;
        this.icon = '';
      }
    } else {
      this.icon = this._pendingIcon;
      this.library = this._pendingLibrary;
      this.color = this._pendingColor;
      this.clearFile();
    }
    this.closeDialog();
    this.emit('zn-change');
    if (this.triggerSubmit) {
      this.formControlController.submit();
    }
  }

  private handleCancel() {
    this.closeDialog();
  }

  private handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    if (!file) return;
    this.discardPendingFile();
    this._pendingFile = file;
    this._pendingFileUrl = URL.createObjectURL(file);
    input.value = '';
  }

  private discardPendingFile() {
    if (this._pendingFileUrl) {
      URL.revokeObjectURL(this._pendingFileUrl);
    }
    this._pendingFile = null;
    this._pendingFileUrl = null;
  }

  private clearFile() {
    if (this._fileUrl) {
      URL.revokeObjectURL(this._fileUrl);
    }
    this._file = null;
    this._fileUrl = null;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.discardPendingFile();
    if (this._fileUrl) {
      URL.revokeObjectURL(this._fileUrl);
    }
  }

  private handleSearchInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this._searchQuery = input.value.toLowerCase();
    this.filterIcons();
  }

  private filterIcons() {
    if (!this._searchQuery) {
      this._filteredIcons = this._iconList.slice(0, 200);
    } else {
      this._filteredIcons = this._iconList
        .filter(name => name.includes(this._searchQuery))
        .slice(0, 200);
    }
  }

  private handleIconSelect(iconName: string) {
    this._pendingIcon = iconName;
  }

  private async handleLibraryChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    const wasFreeInput = this.isFreeInputLibrary(this._pendingLibrary);
    this._pendingLibrary = select.value;
    const isFreeInput = this.isFreeInputLibrary(this._pendingLibrary);

    // Clear pending icon when switching between grid and free-input modes
    if (wasFreeInput !== isFreeInput) {
      this._pendingIcon = '';
    }

    if (!isFreeInput) {
      this._iconList = await this.getIconsForLibrary(this._pendingLibrary);
      this.filterIcons();
    }
  }

  private handleColorInput(e: Event) {
    const input = e.target as ZnInput;
    this._pendingColor = input.value;
  }

  private handleFreeInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this._pendingIcon = input.value;
  }

  private handleClear(e: Event) {
    e.stopPropagation();
    this.icon = '';
    this.color = '';
    this.clearFile();
    this.emit('zn-change');
    if (this.triggerSubmit) {
      this.formControlController.submit();
    }
  }

  private _handleTriggerClick() {
    if (this.disabled) return;
    this.openDialog();
  }

  private _handleTriggerKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._handleTriggerClick();
    }
  }

  render() {
    const hasLabel = !!this.label;
    const hasHelpText = !!this.helpText;
    const hasValue = !!this.icon || !!this._file;
    // Image values (uploaded file or URL) omit the library so zn-icon's URL
    // auto-detection renders an <img> instead of a font ligature.
    const triggerIcon = this._fileUrl ?? this.icon;
    const triggerLibrary = hasValue && !this.isImageValue ? this.library : nothing;
    const pendingPreviewUrl = this._pendingFileUrl ?? (this.isImageValue && !this._file ? this.icon : this._fileUrl);

    return html`
      <div part="form-control"
           class="form-control form-control--medium ${hasLabel ? 'form-control--has-label' : ''} ${hasHelpText ? 'form-control--has-help-text' : ''}">

        <label part="form-control-label" class="form-control__label"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          ${this.label}
        </label>

        <div part="form-control-input" class="form-control-input">
          ${hasValue && this.isImageValue ? html`
            <div
              part="trigger"
              class="icon-picker__image-trigger"
              role="button"
              aria-label="Click to edit"
              tabindex=${this.disabled ? '-1' : '0'}
              @click=${this._handleTriggerClick}
              @keydown=${this._handleTriggerKeyDown}>
              <zn-button
                class="icon-picker__image-clear"
                color="default"
                outline
                icon="close"
                icon-size="18"
                ?disabled=${this.disabled}
                @click="${this.handleClear}"
              ></zn-button>
              <div class="icon-picker__image-trigger-background">
                <img class="icon-picker__image-trigger-preview" src=${triggerIcon} alt="">
              </div>
            </div>
          ` : html`
            <zn-button
              part="trigger"
              class="icon-picker__trigger"
              panel-bg
              icon=${hasValue ? triggerIcon : nothing}
              icon-library=${triggerLibrary}
              icon-color=${(hasValue && this.color) || nothing}
              icon-size="24"
              ?disabled=${this.disabled}
              @click=${this._handleTriggerClick}>
              ${hasValue ? 'Click to edit' : 'Set an icon'}
            </zn-button>
            ${hasValue ? html`
              <zn-button
                class="icon-picker__clear"
                color="transparent"
                icon="close"
                icon-size="16"
                @click="${this.handleClear}"
              ></zn-button>
            ` : nothing}
          `}
        </div>

        ${this.name ? html`
          <input type="hidden" name="${this.name}[icon]" .value=${this.icon}>
          ${!this.noLibrary ? html`<input type="hidden" name="${this.name}[library]" .value=${this.library}>` : nothing}
          ${!this.noColor ? html`<input type="hidden" name="${this.name}[color]" .value=${this.color}>` : nothing}
        ` : nothing}

        <div
          part="form-control-help-text"
          class="form-control__help-text"
          aria-hidden=${hasHelpText ? 'false' : 'true'}>
          ${this.helpText}
        </div>

        ${this._dialogOpen ? html`
          <zn-dialog size="custom" label="Select Icon" @zn-close=${this.handleCancel}>
            <div class="icon-picker__dialog-layout">
              <div class="icon-picker__dialog-main">
                ${this.allowUpload ? html`
                  <div class="icon-picker__mode-switch">
                    <zn-button
                      size="small"
                      color=${this._mode === 'icon' ? 'secondary' : 'transparent'}
                      icon="apps"
                      @click=${() => this._mode = 'icon'}>
                      Icon Library
                    </zn-button>
                    <zn-button
                      size="small"
                      color=${this._mode === 'upload' ? 'secondary' : 'transparent'}
                      icon="upload"
                      @click=${() => this._mode = 'upload'}>
                      Upload Image
                    </zn-button>
                  </div>
                ` : nothing}

                ${this._mode === 'upload' ? html`
                  <div class="icon-picker__upload">
                    <input class="icon-picker__file-input" type="file" accept=${this.accept} hidden
                           @change=${this.handleFileSelect}>
                    <zn-icon src="image" size="48"></zn-icon>
                    ${this._pendingFile ? html`
                      <span class="icon-picker__upload-filename">${this._pendingFile.name}</span>
                    ` : nothing}
                    <zn-button icon="upload" color="secondary" @click=${() => this._fileInput.click()}>
                      ${pendingPreviewUrl ? 'Choose a different file' : 'Choose a file'}
                    </zn-button>
                  </div>
                ` : html`
                <div class="icon-picker__dialog-controls">
                  ${!this.noLibrary ? html`
                    <zn-select
                      class="icon-picker__library-select"
                      value=${this._pendingLibrary}
                      size="small"
                      @zn-change=${this.handleLibraryChange}>
                      <zn-option value="material">Material</zn-option>
                      <zn-option value="material-outlined">Material Outlined</zn-option>
                      <zn-option value="material-round">Material Round</zn-option>
                      <zn-option value="material-sharp">Material Sharp</zn-option>
                      <zn-option value="material-two-tone">Material Two Tone</zn-option>
                      <zn-option value="material-symbols-outlined">Material Symbols Outlined</zn-option>
                      <zn-option value="brands">Brands</zn-option>
                      <zn-option value="line">Line</zn-option>
                      <zn-option value="lucide">Lucide</zn-option>
                      <zn-option value="gravatar">Gravatar</zn-option>
                      <zn-option value="libravatar">Libravatar</zn-option>
                      <zn-option value="avatar">Avatar</zn-option>
                    </zn-select>
                  ` : nothing}
                  ${!this.noColor ? html`
                    <zn-input
                      class="icon-picker__color-input"
                      type="color"
                      size="small"
                      value=${this._pendingColor}
                      @zn-input=${this.handleColorInput}
                      @zn-change=${this.handleColorInput}
                    ></zn-input>
                  ` : nothing}
                </div>

                ${this.isFreeInputLibrary(this._pendingLibrary) ? html`
                  <zn-input
                    class="icon-picker__free-input"
                    placeholder=${this._pendingLibrary === 'avatar' ? 'Enter a name...' : 'Enter an email address...'}
                    size="small"
                    value=${this._pendingIcon}
                    @zn-input=${this.handleFreeInput}>
                    <zn-icon slot="prefix" src=${this._pendingLibrary === 'avatar' ? 'person' : 'email'} size="18"></zn-icon>
                  </zn-input>
                ` : html`
                  <zn-input
                    class="icon-picker__icon-input"
                    placeholder="Enter icon name..."
                    size="small"
                    value=${this._pendingIcon}
                    @zn-input=${this.handleFreeInput}>
                    <zn-icon slot="prefix" src="edit" size="18"></zn-icon>
                  </zn-input>

                  <zn-input
                    class="icon-picker__search"
                    placeholder="Search icons..."
                    size="small"
                    clearable
                    @zn-input=${this.handleSearchInput}>
                    <zn-icon slot="prefix" src="search" size="18"></zn-icon>
                  </zn-input>

                  <div class="icon-picker__grid">
                    ${this._filteredIcons.length === 0 ? html`
                      <div class="icon-picker__no-results">No icons found</div>
                    ` : this._filteredIcons.map(iconName => html`
                      <button
                        type="button"
                        class=${classMap({
                          'icon-picker__grid-item': true,
                          'icon-picker__grid-item--selected': iconName === this._pendingIcon
                        })}
                        title=${iconName}
                        @click=${() => this.handleIconSelect(iconName)}>
                        <zn-icon
                          src=${iconName}
                          library=${this._pendingLibrary}
                          color=${this._pendingColor || nothing}
                          size="36"
                        ></zn-icon>
                      </button>
                    `)}
                  </div>
                `}
                `}
              </div>

              <div class="icon-picker__dialog-sidebar">
                ${this._mode === 'upload' ? html`
                  <div class="icon-picker__preview ${pendingPreviewUrl ? '' : 'icon-picker__preview--empty'}">
                    ${pendingPreviewUrl ? html`
                      <img class="icon-picker__upload-preview" src=${pendingPreviewUrl} alt="">
                      <span class="icon-picker__preview-name">${this._pendingFile?.name ?? ''}</span>
                    ` : html`
                      <zn-icon src="image" size="48"></zn-icon>
                      <span class="icon-picker__preview-hint">Choose an image</span>
                    `}
                  </div>
                ` : this._pendingIcon ? html`
                  <div class="icon-picker__preview">
                    <zn-icon
                      src=${this._pendingIcon}
                      library=${this._pendingLibrary}
                      color=${this._pendingColor || nothing}
                      size="64"
                    ></zn-icon>
                    <span class="icon-picker__preview-name">${this._pendingIcon}</span>
                    <span class="icon-picker__preview-library">${this._pendingLibrary}</span>
                  </div>
                ` : html`
                  <div class="icon-picker__preview icon-picker__preview--empty">
                    <zn-icon src="touch_app" size="48"></zn-icon>
                    <span class="icon-picker__preview-hint">Select an icon</span>
                  </div>
                `}
              </div>
            </div>

            <div slot="footer" class="icon-picker__footer">
              <zn-button panel-bg icon="close" @click=${this.handleCancel}>Cancel</zn-button>
              <zn-button color="primary" icon="check" @click=${this.handleConfirm}
                         ?disabled=${this._mode === 'upload' ? !this._pendingFile && !this.isImageValue : !this._pendingIcon}>
                Save
              </zn-button>
            </div>
          </zn-dialog>
        ` : nothing}

      </div>`;
  }
}
