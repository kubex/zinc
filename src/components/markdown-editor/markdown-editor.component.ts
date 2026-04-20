import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {HasSlotController} from "../../internal/slot";
import {ifDefined} from "lit/directives/if-defined.js";
import {marked} from "marked";
import {property, query} from 'lit/decorators.js';
import {watch} from "../../internal/watch";
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnTextarea from "../textarea";

import styles from './markdown-editor.scss';
import ZnPanel from "../panel/panel.component";

type ViewMode = 'editor' | 'split' | 'preview';

const VIEW_MODES: { mode: ViewMode; icon: string; label: string }[] = [
  {mode: 'editor', icon: 'edit_note', label: 'Editor'},
  {mode: 'split', icon: 'vertical_split', label: 'Split'},
  {mode: 'preview', icon: 'visibility', label: 'Preview'},
];

/**
 * @summary A markdown editor with live preview, split view, and a fullscreen mode.
 * @documentation https://zinc.style/components/markdown-editor
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-textarea
 * @dependency zn-button-group
 * @dependency zn-icon
 *
 * @event zn-change - Emitted when the markdown content changes.
 * @event zn-input - Emitted on each keystroke in the editor.
 * @event zn-view-mode-change - Emitted when the user switches between editor / split / preview.
 *
 * @slot label - The editor label. Alternatively, use the `label` attribute.
 * @slot help-text - Help text shown below the editor. Alternatively, use the `help-text` attribute.
 *
 * @csspart base - The component's base wrapper.
 * @csspart toolbar - The toolbar containing the view-mode and fullscreen controls.
 * @csspart editor - The textarea wrapper.
 * @csspart preview - The rendered markdown preview.
 */
export default class ZnMarkdownEditor extends ZnPanel implements ZincFormControl {
  static styles: CSSResultGroup = [ZnPanel.styles as CSSResultGroup, unsafeCSS(styles)];

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-input', 'zn-change'],
  });
  private readonly markdownSlotController = new HasSlotController(this, 'label', 'help-text', 'actions', 'footer');

  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  @query('zn-textarea') textarea: ZnTextarea;
  @query('.markdown-editor__preview') previewEl: HTMLDivElement;

  /** The name of the control, submitted as part of form data. */
  @property() name = '';

  /** The current markdown content. */
  @property() value = '';

  /** The default value — used when resetting the form. */
  @defaultValue() defaultValue = '';

  /** The control's label. If you need HTML, use the `label` slot. */
  @property() label = '';

  /** Help text displayed below the editor. If you need HTML, use the `help-text` slot. */
  @property({attribute: 'help-text'}) helpText = '';

  /** Placeholder text shown when the editor is empty. */
  @property() placeholder = 'Enter markdown content...';

  /** Number of rows for the textarea. */
  @property({type: Number}) rows = 20;

  /** Which view to show. */
  @property({reflect: true, attribute: 'view-mode'})
  viewMode: ViewMode = 'editor';

  /**
   * Key used to persist the selected view mode to `localStorage`. Set to an empty string to disable persistence.
   */
  @property({attribute: 'storage-key'}) storageKey = 'zn-markdown-editor-view-mode';

  /** Makes the editor required for form submission. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Makes the editor read-only. */
  @property({type: Boolean, reflect: true}) readonly = false;

  /** Disables the editor. */
  @property({type: Boolean, reflect: true}) disabled = false;

  /** Whether the editor is currently expanded to cover its containing positioned ancestor. */
  @property({type: Boolean, reflect: true}) expanded = false;

  get validity(): ValidityState {
    return this.textarea?.validity;
  }

  get validationMessage(): string {
    return this.textarea?.validationMessage ?? '';
  }

  checkValidity(): boolean {
    return this.textarea?.checkValidity() ?? true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.textarea?.reportValidity() ?? true;
  }

  setCustomValidity(message: string): void {
    this.textarea?.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  /** Sets focus on the editor. */
  focus(options?: FocusOptions) {
    this.textarea?.focus(options);
  }

  /** Removes focus from the editor. */
  blur() {
    this.textarea?.blur();
  }

  connectedCallback() {
    super.connectedCallback();

    // Pull initial value from light-DOM text content if no value attr/property is set.
    if (!this.hasAttribute('value') && !this.value) {
      const textNodes = Array.from(this.childNodes).filter(n => n.nodeType === Node.TEXT_NODE);
      const raw = textNodes.map(n => n.textContent ?? '').join('');
      const content = raw.replace(/\r\n/g, '\n').trim();
      if (content.length > 0) {
        this.value = content;
        this.defaultValue = content;
        textNodes.forEach(n => {
          if ((n.textContent ?? '').trim().length > 0) n.parentNode?.removeChild(n);
        });
      }
    }

    const stored = this.readStoredViewMode();
    if (stored) this.viewMode = stored;

    this.addEventListener('toggle', this.handleExpandToggle as EventListener);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.removeEventListener('toggle', this.handleExpandToggle as EventListener);
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.formControlController.updateValidity();
    if (this.viewMode !== 'editor') this.renderPreview();
  }

  private readStoredViewMode(): ViewMode | null {
    if (!this.storageKey) return null;
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved === 'editor' || saved === 'split' || saved === 'preview') return saved;
    } catch {
      // localStorage not available
    }
    return null;
  }

  private writeStoredViewMode(mode: ViewMode) {
    if (!this.storageKey) return;
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {
      // ignore
    }
  }

  private renderPreview() {
    if (this.viewMode === 'editor') return;
    if (!this.previewEl) return;
    const parsed = marked.parse(this.value || '', {async: false});
    this.previewEl.innerHTML = typeof parsed === 'string' ? parsed : '';
  }

  private handleInput = () => {
    this.value = this.textarea.value;
    this.emit('zn-input');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.renderPreview(), 150);
  };

  private handleChange = () => {
    this.value = this.textarea.value;
    this.emit('zn-change');
    this.renderPreview();
  };

  private handleViewToggle = (e: Event) => {
    const host = (e.target as HTMLElement).closest<HTMLElement>('[data-mode]');
    const mode = host?.dataset.mode as ViewMode | undefined;
    if (!mode || mode === this.viewMode) return;
    this.viewMode = mode;
  };

  private handleExpandToggle = () => {
    this.expanded = !this.expanded;
  };

  @watch('viewMode', {waitUntilFirstUpdate: true})
  async handleViewModeChange() {
    await this.updateComplete;
    this.writeStoredViewMode(this.viewMode);
    this.renderPreview();
    this.dispatchEvent(new CustomEvent('zn-view-mode-change', {
      bubbles: true,
      composed: true,
      detail: {mode: this.viewMode},
    }));
  }

  @watch('value', {waitUntilFirstUpdate: true})
  async handleValueChange() {
    await this.updateComplete;
    this.formControlController.updateValidity();
    this.renderPreview();
  }

  @watch('markedReady', {waitUntilFirstUpdate: true})
  handleMarkedReady() {
    this.renderPreview();
  }

  render() {
    const hasLabelSlot = this.markdownSlotController.test('label');
    const hasHelpSlot = this.markdownSlotController.test('help-text');
    const hasActionSlot = this.markdownSlotController.test('actions');
    const hasFooterSlot = this.markdownSlotController.test('footer');
    const hasLabel = !!this.label || hasLabelSlot;
    const hasHelpText = !!this.helpText || hasHelpSlot;
    const hasHeader = !!this.caption || hasActionSlot;
    const showEditor = this.viewMode === 'editor' || this.viewMode === 'split';
    const showPreview = this.viewMode === 'preview' || this.viewMode === 'split';

    return html`
      <div part="base" class=${classMap({
        panel: true,
        'panel--flush': this.flush || this.tabbed,
        'panel--flush-x': this.flushX,
        'panel--flush-y': this.flushY,
        'panel--flush-footer': this.flushFooter,
        'panel--tabbed': this.tabbed,
        'panel--transparent': this.transparent,
        'panel--has-actions': hasActionSlot,
        'panel--has-footer': hasFooterSlot,
        'panel--has-header': hasHeader,
        'panel--cosmic': this.cosmic,
        'panel--shadow': this.shadow,
      })}>
        <div class="panel__inner">
          ${hasHeader ? html`
            <zn-header class=${classMap({
              panel__header: true,
              'panel__header--underline': this.underlineHeader,
            })}
                       icon=${this.icon}
                       caption=${this.caption}
                       description=${ifDefined(this.description)}
                       transparent>
              ${hasActionSlot ? html`
                <slot name="actions" slot="actions" class="panel__header__actions"></slot>` : null}
            </zn-header>` : null}

          <div class="panel__content">
            <div class="panel__body">
              <div class=${classMap({
                'markdown-editor': true,
                'markdown-editor--split': this.viewMode === 'split',
                'markdown-editor--preview-only': this.viewMode === 'preview',
                'markdown-editor--expanded': this.expanded,
              })}>
                ${hasLabel ? html`
                  <label class="markdown-editor__label">
                    <slot name="label">${this.label}</slot>
                  </label>` : ''}

                <div part="toolbar" class="markdown-editor__toolbar">
                  <zn-button-group class="markdown-editor__view-toggle" @click=${this.handleViewToggle}>
                    ${VIEW_MODES.map(v => this.renderViewButton(v.mode, v.icon, v.label))}
                  </zn-button-group>
                  <zn-button
                    class="markdown-editor__expand-btn"
                    type="button"
                    size="medium"
                    color="secondary"
                    icon=${this.expanded ? 'close_fullscreen' : 'open_in_full'}
                    icon-size="18"
                    tooltip=${this.expanded ? 'Collapse' : 'Expand'}
                    @click=${this.handleExpandToggle}
                  ></zn-button>
                </div>

                <div class="markdown-editor__body">
                  <div part="editor"
                       class="markdown-editor__editor"
                       ?hidden=${!showEditor}>
                    <zn-textarea
                      .value=${this.value}
                      name=${this.name || ''}
                      placeholder=${this.placeholder}
                      rows=${this.rows}
                      resize="auto"
                      ?required=${this.required}
                      ?readonly=${this.readonly}
                      ?disabled=${this.disabled}
                      @zn-input=${this.handleInput}
                      @zn-change=${this.handleChange}
                    ></zn-textarea>
                  </div>
                  <div part="preview"
                       class="markdown-editor__preview-wrapper"
                       ?hidden=${!showPreview}>
                    <div class="markdown-editor__preview"></div>
                  </div>
                </div>

                ${hasHelpText ? html`
                  <div class="markdown-editor__help-text">
                    <slot name="help-text">${this.helpText}</slot>
                  </div>` : ''}
              </div>
            </div>
          </div>

          ${hasFooterSlot ? html`
            <slot name="footer" class="panel__footer"></slot>` : null}
        </div>
      </div>
    `;
  }

  private renderViewButton(mode: ViewMode, icon: string, label: string) {
    const isActive = this.viewMode === mode;
    return html`
      <zn-button
        class=${classMap({
          'markdown-editor__view-btn': true,
          'markdown-editor__view-btn--active': isActive,
        })}
        data-mode=${mode}
        type="button"
        size="medium"
        color="default"
        ?outline=${!isActive}
        square
        icon=${icon}
        icon-size="18"
        tooltip=${label}
        aria-pressed=${isActive ? 'true' : 'false'}
      ></zn-button>
    `;
  }
}
