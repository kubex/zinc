import {classMap} from "lit/directives/class-map.js";
import {type CSSResultGroup, html, type PropertyValues, unsafeCSS} from 'lit';
import {defaultValue} from "../../internal/default-value";
import {FormControlController} from "../../internal/form";
import {property, query, state} from 'lit/decorators.js';
import {parse as remarkdParse} from "remarkd-js";
import {unsafeHTML} from "lit/directives/unsafe-html.js";
import {watch} from "../../internal/watch";
import ZincElement from '../../internal/zinc-element';
import type {ZincFormControl} from '../../internal/zinc-element';
import type ZnDialog from "../dialog";
import type ZnFile from "../file";
import type ZnInput from "../input";

import styles from './remarkd-editor.scss';

interface UploadResponse {
  uploadPath: string;
  uploadUrl: string;
  originalFilename: string;
}

interface BlockType {
  label: string;
  icon: string;
  prefix?: string;
  image?: boolean;
}

const BLOCK_TYPES: BlockType[] = [
  {label: 'Text', icon: 'text@lu', prefix: ''},
  {label: 'Heading 1', icon: 'heading-1@lu', prefix: '# '},
  {label: 'Heading 2', icon: 'heading-2@lu', prefix: '## '},
  {label: 'Heading 3', icon: 'heading-3@lu', prefix: '### '},
  {label: 'Note', icon: 'info@lu', prefix: 'NOTE: '},
  {label: 'Tip', icon: 'lightbulb@lu', prefix: 'TIP: '},
  {label: 'Warning', icon: 'triangle-alert@lu', prefix: 'WARNING: '},
  {label: 'Code', icon: 'code@lu', prefix: '```\n\n```'},
  {label: 'Image', icon: 'image@lu', image: true},
];

/**
 * @summary A Notion-style block editor for remarkd content. Blocks render inline; click one to edit its source.
 * @documentation https://zinc.style/components/remarkd-editor
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-button
 * @dependency zn-button-group
 * @dependency zn-icon
 * @dependency zn-dialog
 * @dependency zn-file
 * @dependency zn-input
 *
 * @event zn-input - Emitted on each keystroke while editing a block.
 * @event zn-change - Emitted when a block edit is committed and the value changes.
 *
 * @csspart base - The component's base wrapper.
 * @csspart toolbar - The always-visible block-insert toolbar.
 * @csspart block - A rendered block wrapper.
 * @csspart rendered - The rendered remarkd output of a block.
 * @csspart input - The textarea shown while editing a block.
 * @csspart slash-menu - The context menu opened by typing "/" in a block.
 */
export default class ZnRemarkdEditor extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-input', 'zn-change'],
  });

  private editingDraft = '';
  private suppressValueSync = false;
  private suppressBlurCommit = false;

  @query('.remarkd-editor__validation') private validationInput: HTMLTextAreaElement;

  @state() private blocks: string[] = [];
  @state() private editingIndex: number | null = null;
  @state() private slashMenuOpen = false;
  @state() private slashQuery = '';
  @state() private slashActiveIndex = 0;
  @state() private imageDialogOpen = false;
  @state() private dropIndicator: number | null = null;
  @state() private dragIndex: number | null = null;
  @state() private editShell = '';

  private imageInsertIndex = 0;
  private pendingDragHandle: HTMLElement | null = null;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragGhost: HTMLElement | null = null;

  /** The name of the control, submitted as part of form data. */
  @property() name = '';

  /** The current remarkd source. */
  @property() value = '';

  /** The default value — used when resetting the form. */
  @defaultValue() defaultValue = '';

  /** Placeholder shown when the document is empty. */
  @property() placeholder = 'Type something…';

  /**
   * Endpoint for image uploads. Posting the file metadata here must return
   * `{uploadPath, uploadUrl}`; the file is then PUT to `uploadUrl` and
   * `uploadPath` is inserted into the document. When unset, adding an image
   * prompts for a URL instead.
   */
  @property({attribute: 'attachment-url'}) attachmentUrl = '';

  /** Makes the editor required for form submission. */
  @property({type: Boolean, reflect: true}) required = false;

  /** Makes the editor read-only. */
  @property({type: Boolean, reflect: true}) readonly = false;

  /** Disables the editor. */
  @property({type: Boolean, reflect: true}) disabled = false;

  get validity(): ValidityState {
    return this.validationInput?.validity;
  }

  get validationMessage(): string {
    return this.validationInput?.validationMessage ?? '';
  }

  checkValidity(): boolean {
    return this.validationInput?.checkValidity() ?? true;
  }

  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  reportValidity(): boolean {
    return this.validationInput?.reportValidity() ?? true;
  }

  setCustomValidity(message: string): void {
    this.validationInput?.setCustomValidity(message);
    this.formControlController.updateValidity();
  }

  /** Starts editing the first block, or a new block if the document is empty. */
  focus() {
    if (this.blocks.length) {
      this.startEdit(0);
    } else {
      this.insertDraftBlock(0);
    }
  }

  /** Commits any in-progress block edit. */
  blur() {
    this.shadowRoot?.querySelector<HTMLTextAreaElement>('.remarkd-editor__input')?.blur();
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    super.firstUpdated(_changedProperties);
    this.formControlController.updateValidity();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cancelDrag();
  }

  @watch('value')
  handleValueChange() {
    if (this.suppressValueSync) {
      this.suppressValueSync = false;
      return;
    }
    this.blocks = this.splitBlocks(this.value || '');
  }

  /**
   * Splits remarkd source into blocks on blank lines, keeping fenced /
   * delimited containers (``` ==== !!!! .... ----) as single blocks.
   */
  private splitBlocks(source: string): string[] {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const blocks: string[] = [];
    let current: string[] = [];
    let fence: string | null = null;

    const push = () => {
      const text = current.join('\n').trim();
      if (text) blocks.push(text);
      current = [];
    };

    for (const line of lines) {
      const trimmed = line.trimEnd();
      if (fence) {
        current.push(line);
        if (this.closesFence(trimmed, fence)) fence = null;
        continue;
      }
      const marker = this.fenceMarker(trimmed);
      if (marker) {
        current.push(line);
        fence = marker;
        continue;
      }
      if (trimmed === '') {
        push();
        continue;
      }
      current.push(line);
    }
    push();
    return blocks;
  }

  private fenceMarker(line: string): string | null {
    const backticks = /^`{3,}/.exec(line);
    if (backticks) return backticks[0];
    if (/^(={4,}|\.{4,}|-{4,}|!{4,})$/.test(line)) return line;
    if (/^!!\S+!!$/.test(line)) return '!!!!';
    return null;
  }

  private closesFence(line: string, fence: string): boolean {
    const char = fence[0];
    let count = 0;
    while (count < line.length && line[count] === char) count++;
    return count === line.length && count >= fence.length;
  }

  private updateBlocks(blocks: string[]) {
    this.blocks = blocks;
    const joined = blocks.join('\n\n');
    if (joined !== this.value) {
      this.suppressValueSync = true;
      this.value = joined;
      this.formControlController.updateValidity();
      this.emit('zn-change');
    }
  }

  private handleRenderedClick(e: MouseEvent, index: number) {
    const checkbox = (e.target as HTMLElement).closest<HTMLInputElement>('input[type="checkbox"]');
    if (checkbox) {
      // Toggle the task in the source rather than opening the editor.
      e.preventDefault();
      this.toggleCheckbox(index, checkbox);
      return;
    }

    this.startEdit(index);
  }

  private toggleCheckbox(index: number, checkbox: HTMLInputElement) {
    const rendered = checkbox.closest('.remarkd-editor__rendered');
    const ordinal = Array.from(rendered?.querySelectorAll('input[type="checkbox"]') ?? []).indexOf(checkbox);
    if (ordinal < 0) return;

    let seen = -1;
    const updated = this.blocks[index].replace(
      /^(\s*(?:[-*+]|\d+\.)\s+)\[( |x|X)\]/gm,
      (match, prefix: string, mark: string) => {
        seen++;
        if (seen !== ordinal) return match;
        return `${prefix}[${mark === ' ' ? 'x' : ' '}]`;
      });
    if (updated === this.blocks[index]) return;

    const blocks = [...this.blocks];
    blocks[index] = updated;
    this.updateBlocks(blocks);
  }

  private startEdit(index: number, draft?: string) {
    if (this.disabled || this.readonly) return;
    this.editingDraft = draft ?? this.blocks[index] ?? '';
    this.editingIndex = index;
    this.editShell = this.computeEditShell(this.editingDraft);
    this.slashMenuOpen = false;
    void this.focusInput();
  }

  /**
   * The remarkd chrome the editing block should keep, derived from its first
   * line — so a NOTE still looks like a note while its source is edited.
   */
  private computeEditShell(draft: string): string {
    const first = (draft.split('\n', 1)[0] ?? '').trimStart();
    const hint = /^(NOTE|TIP|WARNING|IMPORTANT|CAUTION|DANGER|SUCCESS|NOTICE):\s/.exec(first);
    if (hint) return `hint-${hint[1].toLowerCase()}`;
    if (first.startsWith('### ')) return 'remarkd-editor__edit-shell--h3';
    if (first.startsWith('## ')) return 'remarkd-editor__edit-shell--h2';
    if (first.startsWith('# ')) return 'remarkd-editor__edit-shell--h1';
    if (first.startsWith('```')) return 'remarkd-editor__edit-shell--code';
    return '';
  }

  private async focusInput() {
    await this.updateComplete;
    const input = this.shadowRoot?.querySelector<HTMLTextAreaElement>('.remarkd-editor__input');
    if (input) {
      this.autosize(input);
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
    this.suppressBlurCommit = false;
  }

  private addBlockAt(index: number, content: string) {
    if (this.disabled || this.readonly) return;
    const blocks = [...this.blocks];
    blocks.splice(index, 0, content);
    this.updateBlocks(blocks);
  }

  /** Inserts a draft block — committed (or dropped, if left empty) on blur. */
  private insertDraftBlock(index: number, prefill = '') {
    if (this.disabled || this.readonly) return;
    const blocks = [...this.blocks];
    blocks.splice(index, 0, '');
    this.blocks = blocks;
    this.startEdit(index, prefill);
  }

  /**
   * Blur handler for the editing textarea. Re-renders that replace the
   * focused textarea (e.g. Shift+Enter committing and opening the next
   * block) fire blur mid-transition — `suppressBlurCommit` masks those.
   */
  private handleEditBlur = () => {
    if (this.suppressBlurCommit) return;
    this.commitEdit();
  };

  /** Commits the in-progress edit; returns the index after the committed parts. */
  private commitEdit = (): number => {
    this.slashMenuOpen = false;
    if (this.editingIndex === null) return this.blocks.length;
    const index = this.editingIndex;
    const parts = this.splitBlocks(this.editingDraft);
    const blocks = [...this.blocks];
    blocks.splice(index, 1, ...parts);
    this.editingIndex = null;
    this.updateBlocks(blocks);
    return index + parts.length;
  };

  private get filteredSlashItems(): BlockType[] {
    const filter = this.slashQuery.toLowerCase();
    return BLOCK_TYPES.filter(item => item.label.toLowerCase().includes(filter));
  }

  private handleDraftInput = (e: Event) => {
    const input = e.target as HTMLTextAreaElement;
    this.editingDraft = input.value;
    this.autosize(input);

    const shell = this.computeEditShell(input.value);
    if (shell !== this.editShell) {
      this.editShell = shell;
      void this.updateComplete.then(() => this.autosize(input));
    }

    // A leading "/" in an otherwise fresh block opens the slash menu; the rest
    // of the line filters it.
    if (input.value === '/') {
      this.slashMenuOpen = true;
      this.slashQuery = '';
      this.slashActiveIndex = 0;
    } else if (this.slashMenuOpen) {
      if (input.value.startsWith('/') && !input.value.includes('\n')) {
        this.slashQuery = input.value.slice(1);
        this.slashActiveIndex = 0;
      } else {
        this.slashMenuOpen = false;
      }
    }

    this.emit('zn-input');
  };

  private handleEditKeydown = (e: KeyboardEvent) => {
    const input = e.target as HTMLTextAreaElement;

    if (this.slashMenuOpen) {
      const items = this.filteredSlashItems;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const step = e.key === 'ArrowDown' ? 1 : -1;
        this.slashActiveIndex = (this.slashActiveIndex + step + items.length) % Math.max(items.length, 1);
        return;
      }
      if (e.key === 'Enter' && items.length) {
        e.preventDefault();
        this.applySlashItem(items[this.slashActiveIndex] ?? items[0]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        this.slashMenuOpen = false;
        return;
      }
    }

    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      this.suppressBlurCommit = true;
      const next = this.commitEdit();
      this.insertDraftBlock(next);
    } else if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) {
      e.preventDefault();
      input.blur();
    } else if (e.key === 'Backspace' && input.value === '') {
      e.preventDefault();
      input.blur();
    }
  };

  private applySlashItem(item: BlockType) {
    this.slashMenuOpen = false;
    const index = this.editingIndex ?? this.blocks.length;
    const input = this.shadowRoot?.querySelector<HTMLTextAreaElement>('.remarkd-editor__input');

    if (item.image) {
      // Drop the "/..." draft block, then run the image flow in its place.
      this.editingDraft = '';
      if (input) input.value = '';
      input?.blur();
      this.pickImage(index);
      return;
    }

    this.editingDraft = item.prefix ?? '';
    if (input) {
      input.value = this.editingDraft;
      this.autosize(input);
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  private handleEditPaste = (e: ClipboardEvent) => {
    const file = Array.from(e.clipboardData?.files ?? []).find(f => f.type.startsWith('image/'));
    if (!file) return;
    e.preventDefault();
    const index = this.editingIndex ?? this.blocks.length;
    void this.insertImage(file, index + 1);
  };

  private handleDragOver = (e: DragEvent) => {
    if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
  };

  private handleDrop = (e: DragEvent) => {
    const file = Array.from(e.dataTransfer?.files ?? []).find(f => f.type.startsWith('image/'));
    if (!file) return;
    e.preventDefault();
    void this.insertImage(file, this.blocks.length);
  };

  /** The insertion index a drop at `y` maps to, from the rendered block positions. */
  private insertionIndexFromY(y: number): number {
    const els = Array.from(this.shadowRoot?.querySelectorAll<HTMLElement>('.remarkd-editor__block') ?? []);
    for (let i = 0; i < els.length; i++) {
      const rect = els[i].getBoundingClientRect();
      if (y < rect.top + rect.height / 2) return i;
    }
    return els.length;
  }

  /*
   * Block dragging uses pointer events rather than native HTML5 drag & drop:
   * the browser owns the cursor during a native drag (CSS can't show a
   * grabbing hand), and WebKit's dnd support inside shadow DOM is patchy.
   */

  private handleHandlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    if (this.editingIndex !== null) this.commitEdit();
    this.pendingDragHandle = e.currentTarget as HTMLElement;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    // Document-level listeners for the whole drag — element-level capture is
    // lost if a re-render replaces the handle, stranding the ghost.
    document.addEventListener('pointermove', this.handleDragPointerMove);
    document.addEventListener('pointerup', this.handleDragPointerUp);
    document.addEventListener('pointercancel', this.cancelDrag);
  };

  private handleDragPointerMove = (e: PointerEvent) => {
    if (!this.pendingDragHandle) return;

    if (e.buttons % 2 === 0) {
      // The primary button is no longer held — the pointerup was missed. Abort.
      this.cancelDrag();
      return;
    }

    if (this.dragIndex === null) {
      const moved = Math.abs(e.clientX - this.dragStartX) + Math.abs(e.clientY - this.dragStartY);
      if (moved < 4) return;
      // Resolve the index from the DOM at drag start, after any edit commit.
      const block = this.pendingDragHandle.closest('.remarkd-editor__block');
      const blocks = Array.from(this.shadowRoot?.querySelectorAll('.remarkd-editor__block') ?? []);
      const index = block ? blocks.indexOf(block) : -1;
      if (index < 0) {
        this.cancelDrag();
        return;
      }
      this.dragIndex = index;
      this.createDragGhost(index);
      document.body.style.cursor = 'grabbing';
    }

    this.moveDragGhost(e.clientX, e.clientY);
    this.dropIndicator = this.insertionIndexFromY(e.clientY);
  };

  private handleDragPointerUp = (e: PointerEvent) => {
    const from = this.dragIndex;
    let to = from !== null ? (this.dropIndicator ?? this.insertionIndexFromY(e.clientY)) : null;
    this.cancelDrag();
    if (from === null || to === null || to === from || to === from + 1) return;
    const blocks = [...this.blocks];
    const [moved] = blocks.splice(from, 1);
    if (to > from) to--;
    blocks.splice(to, 0, moved);
    this.updateBlocks(blocks);
  };

  private cancelDrag = () => {
    this.pendingDragHandle = null;
    document.removeEventListener('pointermove', this.handleDragPointerMove);
    document.removeEventListener('pointerup', this.handleDragPointerUp);
    document.removeEventListener('pointercancel', this.cancelDrag);
    this.dragIndex = null;
    this.dropIndicator = null;
    this.dragGhost?.remove();
    this.dragGhost = null;
    document.body.style.cursor = '';
  };

  private createDragGhost(index: number) {
    const blocks = this.shadowRoot?.querySelectorAll<HTMLElement>('.remarkd-editor__block');
    const rendered = blocks?.[index]?.querySelector<HTMLElement>('.remarkd-editor__rendered');
    if (!rendered) return;
    const ghost = rendered.cloneNode(true) as HTMLElement;
    ghost.classList.add('remarkd-editor__ghost');
    ghost.style.width = `${rendered.offsetWidth}px`;
    this.shadowRoot?.querySelector('.remarkd-editor')?.appendChild(ghost);
    this.dragGhost = ghost;
  }

  private moveDragGhost(x: number, y: number) {
    if (this.dragGhost) this.dragGhost.style.transform = `translate(${x + 10}px, ${y + 10}px)`;
  }

  private pickImage(index: number) {
    if (this.disabled || this.readonly) return;
    this.imageInsertIndex = index;
    this.imageDialogOpen = true;
  }

  private handleImageDialogClose = () => {
    this.imageDialogOpen = false;
  };

  private handleImageInsert = () => {
    const index = this.imageInsertIndex;
    if (this.attachmentUrl) {
      const fileEl = this.shadowRoot?.querySelector<ZnFile>('.remarkd-editor__image-file');
      const file = fileEl?.files?.[0];
      if (!file) return;
      void this.insertImage(file, index);
    } else {
      const input = this.shadowRoot?.querySelector<ZnInput>('.remarkd-editor__image-url');
      const url = String(input?.value ?? '').trim();
      if (!url) return;
      this.addBlockAt(index, `![](${url})`);
    }
    this.shadowRoot?.querySelector<ZnDialog>('.remarkd-editor__image-dialog')?.hide();
  };

  private async insertImage(file: File, index: number) {
    try {
      const path = await this.uploadImage(file);
      this.addBlockAt(index, `![${file.name}](${path})`);
    } catch (error) {
      console.error('[zn-remarkd-editor] image upload failed', error);
    }
  }

  private async uploadImage(file: File): Promise<string> {
    if (!this.attachmentUrl) throw new Error('No attachment-url configured');
    const fd = new FormData();
    fd.append('filename', file.name);
    fd.append('size', file.size.toString());
    fd.append('mimeType', file.type);

    const res = await fetch(this.attachmentUrl, {method: 'POST', body: fd});
    if (!res.ok) throw new Error(`Upload request failed: ${res.status}`);
    const data = await res.json() as UploadResponse;

    const put = await fetch(data.uploadUrl, {
      method: 'PUT',
      headers: {'Content-Type': file.type},
      body: file,
    });
    if (!put.ok) throw new Error(`Upload failed: ${put.status}`);
    return data.uploadPath;
  }

  private autosize(input: HTMLTextAreaElement) {
    input.style.height = 'auto';
    input.style.height = `${input.scrollHeight}px`;
  }

  private handleToolbarInsert(item: BlockType) {
    if (this.editingIndex !== null) this.suppressBlurCommit = true;
    const index = this.editingIndex !== null ? this.commitEdit() : this.blocks.length;
    if (item.image) {
      this.pickImage(index);
    } else {
      this.insertDraftBlock(index, item.prefix ?? '');
    }
  }

  private renderSlashMenu() {
    const items = this.filteredSlashItems;
    if (!items.length) return '';
    return html`
      <div part="slash-menu" class="remarkd-editor__slash-menu">
        ${items.map((item, i) => html`
          <button type="button"
                  class=${classMap({
                    'remarkd-editor__slash-item': true,
                    'remarkd-editor__slash-item--active': i === this.slashActiveIndex,
                  })}
                  @mousedown=${(e: Event) => {
                    e.preventDefault();
                    this.applySlashItem(item);
                  }}>
            <zn-icon src=${item.icon} size="16"></zn-icon>
            <span>${item.label}</span>
          </button>`)}
      </div>`;
  }

  private renderBlock(block: string, index: number) {
    if (this.editingIndex === index) {
      return html`
        <div class="remarkd-editor__edit-wrap remarkd-rendered">
          <div class=${classMap({
            'remarkd-editor__edit-shell': true,
            [this.editShell]: !!this.editShell,
          })}>
            <textarea part="input"
                      class="remarkd-editor__input"
                      rows="1"
                      .value=${this.editingDraft}
                      @input=${this.handleDraftInput}
                      @keydown=${this.handleEditKeydown}
                      @paste=${this.handleEditPaste}
                      @blur=${this.handleEditBlur}></textarea>
          </div>
          ${this.slashMenuOpen ? this.renderSlashMenu() : ''}
        </div>`;
    }

    return html`
      <div part="block"
           class=${classMap({
             'remarkd-editor__block': true,
             'remarkd-editor__block--dragging': this.dragIndex === index,
             'remarkd-editor__block--drop-before': this.dropIndicator === index,
             'remarkd-editor__block--drop-after': this.dropIndicator === index + 1 && index === this.blocks.length - 1,
           })}>
        ${this.disabled || this.readonly ? '' : html`
          <div class="remarkd-editor__actions">
            <zn-button type="button" icon-button="small" plain icon="plus@lu"
                       tooltip="Add block below"
                       @click=${() => this.insertDraftBlock(index + 1)}></zn-button>
            <span class="remarkd-editor__drag-handle"
                  title="Drag to move"
                  @pointerdown=${this.handleHandlePointerDown}>
              <zn-icon src="grip-vertical@lu" size="18"></zn-icon>
            </span>
          </div>`}
        <div part="rendered" class="remarkd-editor__rendered remarkd-rendered"
             @click=${(e: MouseEvent) => this.handleRenderedClick(e, index)}>${unsafeHTML(remarkdParse(block))}
        </div>
      </div>`;
  }

  render() {
    const editable = !this.disabled && !this.readonly;
    return html`
      <div part="base"
           class=${classMap({
             'remarkd-editor': true,
             'remarkd-editor--disabled': this.disabled,
             'remarkd-editor--readonly': this.readonly,
           })}
           @dragover=${this.handleDragOver}
           @drop=${this.handleDrop}>
        ${editable ? html`
          <div part="toolbar" class="remarkd-editor__toolbar">
            ${BLOCK_TYPES.map(item => html`
              <zn-button type="button" icon-button plain icon=${item.icon}
                         tooltip=${item.label}
                         @click=${() => this.handleToolbarInsert(item)}></zn-button>`)}
          </div>` : ''}
        <div class="remarkd-editor__body">
          ${this.blocks.map((block, index) => this.renderBlock(block, index))}
          <div class="remarkd-editor__add" @click=${() => this.insertDraftBlock(this.blocks.length)}>
            ${this.blocks.length === 0 && this.editingIndex === null ? this.placeholder : ''}
          </div>
        </div>
        <textarea class="remarkd-editor__validation"
                  .value=${this.value}
                  ?required=${this.required}
                  tabindex="-1"
                  aria-hidden="true"></textarea>
        ${this.imageDialogOpen ? this.renderImageDialog() : ''}
      </div>`;
  }

  private renderImageDialog() {
    return html`
      <zn-dialog class="remarkd-editor__image-dialog"
                 label="Add image"
                 size="small"
                 open
                 @zn-close=${this.handleImageDialogClose}>
        ${this.attachmentUrl ? html`
          <zn-file class="remarkd-editor__image-file"
                   label="Image"
                   accept="image/*"
                   droparea></zn-file>` : html`
          <zn-input class="remarkd-editor__image-url"
                    label="Image URL"
                    placeholder="https://example.com/image.png"></zn-input>`}
        <zn-button slot="footer" color="secondary" @click=${this.handleImageDialogClose}>Cancel</zn-button>
        <zn-button slot="footer" color="primary" @click=${this.handleImageInsert}>Insert</zn-button>
      </zn-dialog>`;
  }
}
