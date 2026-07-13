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

import styles from './icon-picker.scss';

export default class ZnIconPicker extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);
  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-button': ZnButton,
    'zn-dialog': ZnDialog,
    'zn-input': ZnInput,
    'zn-select': ZnSelect,
    'zn-option': ZnOption
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-change']
  });

  @property() name = '';
  @property() icon = '';
  @property() label = '';
  @property() library: string = 'material';
  @property() color: string = '';
  @property({type: Boolean, attribute: 'no-color'}) noColor: boolean = false;
  @property({type: Boolean, attribute: 'no-library'}) noLibrary: boolean = false;
  @property({attribute: 'help-text'}) helpText: string = '';
  @property({type: Boolean, reflect: true}) disabled = false;
  @property({type: Boolean, reflect: true}) required = false;
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

  @query('zn-dialog') private _dialog: ZnDialog;

  get value(): string {
    return this.icon;
  }

  set value(val: string) {
    this.icon = val;
  }

  get validity(): ValidityState {
    if (this.required && !this.icon) {
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
    return this.required && !this.icon ? 'Please select an icon.' : '';
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
    this._pendingIcon = this.icon;
    this._pendingLibrary = this.library;
    this._pendingColor = this.color;
    this._searchQuery = '';
    this._iconList = await this.getIconsForLibrary(this.library);
    this._filteredIcons = this._iconList.slice(0, 200);
    this._dialogOpen = true;

    await this.updateComplete;
    this._dialog.show();
  }

  private closeDialog() {
    this._dialog.hide();
    this._dialogOpen = false;
  }

  private handleConfirm() {
    this.icon = this._pendingIcon;
    this.library = this._pendingLibrary;
    this.color = this._pendingColor;
    this.closeDialog();
    this.emit('zn-change');
  }

  private handleCancel() {
    this.closeDialog();
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
    this.emit('zn-change');
  }

  private _handleTriggerClick() {
    if (this.disabled) return;
    this.openDialog();
  }

  render() {
    const hasLabel = !!this.label;
    const hasHelpText = !!this.helpText;
    const hasIcon = !!this.icon;

    return html`
      <div part="form-control"
           class="form-control ${hasLabel ? 'form-control--has-label' : ''} ${hasHelpText ? 'form-control--has-help-text' : ''}">

        <label part="form-control-label" class="form-control__label"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          ${this.label}
        </label>

        <div part="form-control-input" class="form-control-input">
          <zn-button
            part="trigger"
            class="icon-picker__trigger"
            panel-bg
            icon=${hasIcon ? this.icon : nothing}
            icon-library=${hasIcon ? this.library : nothing}
            icon-color=${(hasIcon && this.color) || nothing}
            icon-size="24"
            ?disabled=${this.disabled}
            @click=${this._handleTriggerClick}>
            ${hasIcon ? 'Click to edit' : 'Set an icon'}
          </zn-button>
          ${hasIcon ? html`
            <zn-button
              class="icon-picker__clear"
              color="transparent"
              icon="close"
              icon-size="16"
              @click="${this.handleClear}"
            ></zn-button>
          ` : nothing}
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
              </div>

              <div class="icon-picker__dialog-sidebar">
                ${this._pendingIcon ? html`
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

            <div slot="footer">
              <zn-button color="default" @click=${this.handleCancel}>Cancel</zn-button>
              <zn-button color="primary" @click=${this.handleConfirm} ?disabled=${!this._pendingIcon}>Confirm</zn-button>
            </div>
          </zn-dialog>
        ` : nothing}

      </div>`;
  }
}
