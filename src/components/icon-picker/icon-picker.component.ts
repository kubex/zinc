import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {defaultValue} from '../../internal/default-value';
import {property, query, state} from 'lit/decorators.js';
import {FormControlController} from '../../internal/form';
import ZincElement from '../../internal/zinc-element';
import ZnButton from '../button';
import ZnDialog from '../dialog';
import ZnIcon from '../icon';
import ZnInput from '../input';
import ZnOption from '../option';
import ZnSelect from '../select';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './icon-picker.scss';

let _iconCache: string[] | null = null;
let _iconFetchPromise: Promise<string[]> | null = null;

async function fetchIconList(): Promise<string[]> {
  if (_iconCache) return _iconCache;
  if (_iconFetchPromise) return _iconFetchPromise;

  _iconFetchPromise = fetch('https://fonts.google.com/metadata/icons?incomplete=true')
    .then(res => res.text())
    .then(text => {
      // Google prefixes the response with )]}' - strip it
      const json = JSON.parse(text.replace(/^\)\]\}'/, ''));
      const icons: string[] = json.icons.map((i: {name: string}) => i.name);
      _iconCache = icons;
      return icons;
    })
    .catch(() => {
      _iconFetchPromise = null;
      return [];
    });

  return _iconFetchPromise;
}

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
  @state() private _loading = false;

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

  private async openDialog() {
    this._pendingIcon = this.icon;
    this._pendingLibrary = this.library;
    this._pendingColor = this.color;
    this._searchQuery = '';
    this._dialogOpen = true;

    await this.updateComplete;
    this._dialog.show();

    if (this._iconList.length === 0) {
      this._loading = true;
      this._iconList = await fetchIconList();
      this._loading = false;
    }
    this._filteredIcons = this._iconList.slice(0, 200);
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

  private handleLibraryChange(e: Event) {
    const select = e.target as HTMLSelectElement;
    this._pendingLibrary = select.value;
  }

  private handleColorInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this._pendingColor = input.value;
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

  private _handleTriggerKeyDown(event: KeyboardEvent) {
    if (this.disabled) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this._handleTriggerClick();
    }
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
          <div
            part="trigger"
            class="icon-picker__trigger ${this.disabled ? 'icon-picker__trigger--disabled' : ''}"
            role="button"
            tabindex=${this.disabled ? '-1' : '0'}
            aria-disabled=${this.disabled ? 'true' : 'false'}
            @click=${this._handleTriggerClick}
            @keydown=${this._handleTriggerKeyDown}>
            ${hasIcon
              ? html`
                <zn-icon
                  src=${this.icon}
                  library=${this.library}
                  style=${this.color ? `color: ${this.color}` : ''}
                  size=${24}
                ></zn-icon>
                <span class="icon-picker__edit-text">Click to edit</span>
                <zn-button
                  class="icon-picker__clear"
                  size="x-small"
                  color="transparent"
                  icon="close"
                  icon-size="16"
                  @click="${this.handleClear}"
                ></zn-button>`
              : html`
                <span class="icon-picker__placeholder">Set an icon</span>`
            }
          </div>
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
          <zn-dialog label="Select Icon" size="large" @zn-close=${this.handleCancel}>
            <div class="icon-picker__dialog-controls">
              ${!this.noLibrary ? html`
                <zn-select
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
                </zn-select>
              ` : nothing}
              ${!this.noColor ? html`
                <zn-input
                  type="color"
                  size="small"
                  value=${this._pendingColor}
                  @zn-input=${this.handleColorInput}
                ></zn-input>
              ` : nothing}
            </div>

            <zn-input
              class="icon-picker__search"
              placeholder="Search icons..."
              size="small"
              clearable
              @zn-input=${this.handleSearchInput}>
              <zn-icon slot="prefix" src="search" size="18"></zn-icon>
            </zn-input>

            ${this._loading ? html`
              <div class="icon-picker__loading">
                <zn-icon class="icon-picker__spinner" src="progress_activity" size="24"></zn-icon>
                Loading icons...
              </div>
            ` : html`
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
                      size="24"
                    ></zn-icon>
                  </button>
                `)}
              </div>
            `}

            ${this._pendingIcon ? html`
              <div class="icon-picker__preview">
                <zn-icon
                  src=${this._pendingIcon}
                  library=${this._pendingLibrary}
                  style=${this._pendingColor ? `color: ${this._pendingColor}` : ''}
                  size="48"
                ></zn-icon>
                <span class="icon-picker__preview-name">${this._pendingIcon}</span>
              </div>
            ` : nothing}

            <div slot="footer">
              <zn-button color="default" @click=${this.handleCancel}>Cancel</zn-button>
              <zn-button color="primary" @click=${this.handleConfirm} ?disabled=${!this._pendingIcon}>Confirm</zn-button>
            </div>
          </zn-dialog>
        ` : nothing}

      </div>`;
  }
}
