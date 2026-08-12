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
import type ZnFile from "../file";

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

interface ImageBlockData {
  caption: string;
  align: '' | 'center' | 'right';
  src: string;
  alt: string;
  width: string;
  height: string;
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
 * @dependency zn-file
 *
 * @event zn-input - Emitted on each keystroke while editing a block.
 * @event zn-change - Emitted when a block edit is committed and the value changes.
 *
 * @csspart base - The component's base wrapper.
 * @csspart toolbar - The always-visible block-insert toolbar.
 * @csspart raw-toggle - The button that switches between the block view and the raw source view.
 * @csspart block - A rendered block wrapper.
 * @csspart rendered - The rendered remarkd output of a block.
 * @csspart input - The textarea shown while editing a block.
 * @csspart raw - The full-document textarea shown in raw source mode.
 * @csspart slash-menu - The context menu opened by typing "/" in a block.
 * @csspart image-controls - The caption / alignment / size panel shown when an image block is clicked.
 */
export default class ZnRemarkdEditor extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-input', 'zn-change'],
  });

  private editingDraft = '';
  private rawEntryValue = '';
  private suppressValueSync = false;
  private suppressBlurCommit = false;

  @query('.remarkd-editor__validation') private validationInput: HTMLTextAreaElement;

  @state() private blocks: string[] = [];
  @state() private editingIndex: number | null = null;
  @state() private slashMenuOpen = false;
  @state() private slashQuery = '';
  @state() private slashActiveIndex = 0;
  @state() private imagePickerIndex: number | null = null;
  @state() private imageEdit: ImageBlockData | null = null;
  @state() private dropIndicator: number | null = null;
  @state() private dragIndex: number | null = null;
  @state() private editShell = '';
  @state() private rawMode = false;

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
   * Endpoint for image uploads — required for image support. Posting the file
   * metadata here must return `{uploadPath, uploadUrl}`; the file is then PUT
   * to `uploadUrl` and the returned `uploadPath` is embedded as the image URL.
   */
  @property({attribute: 'attachment-url'}) attachmentUrl = '';

  /** Adds a toolbar toggle that swaps the block view for the full remarkd source. */
  @property({type: Boolean, attribute: 'allow-raw', reflect: true}) allowRaw = false;

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
    if (this.rawMode) {
      this.shadowRoot?.querySelector<HTMLTextAreaElement>('.remarkd-editor__raw')?.focus();
      return;
    }
    if (this.blocks.length) {
      this.startEdit(0);
    } else {
      this.insertDraftBlock(0);
    }
  }

  /** Commits any in-progress block or raw edit. */
  blur() {
    const selector = this.rawMode ? '.remarkd-editor__raw' : '.remarkd-editor__input';
    this.shadowRoot?.querySelector<HTMLTextAreaElement>(selector)?.blur();
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

    // Image blocks get a controls panel instead of source editing.
    const image = this.parseImageBlock(this.blocks[index]);
    if (image) {
      this.editingIndex = index;
      this.imageEdit = image;
      this.slashMenuOpen = false;
      return;
    }

    this.startEdit(index);
  }

  /** Parses a block that is purely an image (with optional caption/align lines). */
  private parseImageBlock(block: string): ImageBlockData | null {
    const data: ImageBlockData = {caption: '', align: '', src: '', alt: '', width: '', height: ''};
    let found = false;
    for (const raw of (block ?? '').split('\n')) {
      const line = raw.trim();
      if (!line) continue;
      const macro = /^image::([^[]+)\[([^\]]*)]$/.exec(line);
      const markdown = /^!\[([^\]]*)]\(([^)\s]+)\s*(?:"[^"]*")?\)$/.exec(line);
      const align = /^\[\.align-(center|right)]$/.exec(line);
      if (macro || markdown) {
        if (found) return null;
        found = true;
        if (macro) {
          data.src = macro[1].trim();
          const parts = macro[2].split(',').map(part => part.trim());
          data.alt = parts[0] ?? '';
          data.width = parts[1] ?? '';
          data.height = parts[2] ?? '';
        } else if (markdown) {
          data.alt = markdown[1];
          data.src = markdown[2];
        }
      } else if (align) {
        data.align = align[1] as ImageBlockData['align'];
      } else if (line.startsWith('.') && !line.startsWith('..')) {
        data.caption = line.slice(1);
      } else {
        return null;
      }
    }
    return found ? data : null;
  }

  private serializeImageBlock(data: ImageBlockData): string {
    const lines: string[] = [];
    if (data.caption.trim()) lines.push(`.${data.caption.trim()}`);
    if (data.align) lines.push(`[.align-${data.align}]`);
    const attrs = [data.alt, data.width, data.height].map(attr => attr.trim());
    while (attrs.length && !attrs[attrs.length - 1]) attrs.pop();
    lines.push(`image::${data.src}[${attrs.join(',')}]`);
    return lines.join('\n');
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
    this.imageEdit = null;
    this.editShell = this.computeEditShell(this.editingDraft);
    this.slashMenuOpen = false;
    void this.focusInput();
  }

  private updateImageEdit(patch: Partial<ImageBlockData>) {
    if (this.imageEdit) this.imageEdit = {...this.imageEdit, ...patch};
  }

  private saveImageEdit = () => {
    if (this.editingIndex === null || !this.imageEdit) return;
    const blocks = [...this.blocks];
    blocks[this.editingIndex] = this.serializeImageBlock(this.imageEdit);
    this.closeImageEdit();
    this.updateBlocks(blocks);
  };

  private closeImageEdit = () => {
    this.editingIndex = null;
    this.imageEdit = null;
  };

  private deleteImageBlock = () => {
    if (this.editingIndex === null) return;
    const blocks = [...this.blocks];
    blocks.splice(this.editingIndex, 1);
    this.closeImageEdit();
    this.updateBlocks(blocks);
  };

  private editImageSource = () => {
    if (this.editingIndex === null) return;
    const index = this.editingIndex;
    this.imageEdit = null;
    this.startEdit(index);
  };

  private handleImageControlsKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.closeImageEdit();
    } else if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT') {
      e.preventDefault();
      this.saveImageEdit();
    }
  };

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

  private deleteBlock(index: number) {
    if (this.disabled || this.readonly) return;
    const blocks = [...this.blocks];
    blocks.splice(index, 1);
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
    if (this.imageEdit) {
      // The image panel saves explicitly — just close it.
      const index = this.editingIndex ?? this.blocks.length;
      this.closeImageEdit();
      return index + 1;
    }
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
    if (this.rawMode) return;
    if (e.dataTransfer?.types.includes('Files')) e.preventDefault();
  };

  private handleDrop = (e: DragEvent) => {
    if (this.rawMode) return;
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
    this.imagePickerIndex = index;
  }

  private closeImagePicker = () => {
    this.imagePickerIndex = null;
  };

  private handleImagePicked = (e: Event) => {
    const file = (e.target as ZnFile).files?.[0];
    if (!file) return;
    const index = this.imagePickerIndex ?? this.blocks.length;
    this.imagePickerIndex = null;
    void this.insertImage(file, index);
  };

  private async insertImage(file: File, index: number) {
    try {
      const path = await this.uploadImage(file);
      const alt = file.name.replace(/[[\],]/g, '');
      this.addBlockAt(index, `image::${path}[${alt}]`);
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

    // resolve relative upload targets against the attachment url so both keep
    // the same base path when the host page rewrites attachment-url (e.g. the
    // kubex console proxying apps under an app base); absolute urls pass through
    const target = new URL(data.uploadUrl, new URL(this.attachmentUrl, window.location.href)).toString();
    const put = await fetch(target, {
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

  private toggleRawMode = () => {
    if (this.rawMode) {
      this.commitRaw();
      this.rawMode = false;
      return;
    }
    if (this.editingIndex !== null) this.commitEdit();
    this.rawEntryValue = this.value;
    this.rawMode = true;
    void this.focusRaw();
  };

  private async focusRaw() {
    await this.updateComplete;
    const raw = this.shadowRoot?.querySelector<HTMLTextAreaElement>('.remarkd-editor__raw');
    if (!raw) return;
    raw.focus();
    raw.setSelectionRange(raw.value.length, raw.value.length);
  }

  /**
   * Raw mode keeps the whole document in one textarea, so the textarea — not
   * the block list — is authoritative while it is open: re-splitting on every
   * keystroke would normalise blank lines out from under the cursor.
   */
  private handleRawInput = (e: Event) => {
    const input = e.target as HTMLTextAreaElement;
    if (input.value === this.value) return;
    this.suppressValueSync = true;
    this.value = input.value;
    this.formControlController.updateValidity();
    this.emit('zn-input');
  };

  /**
   * Re-splits the raw source into blocks. Not `updateBlocks` — that only
   * reports a change when the re-join differs from the value, and raw edits
   * have already written straight to the value.
   */
  private commitRaw = () => {
    const blocks = this.splitBlocks(this.value || '');
    const joined = blocks.join('\n\n');
    this.blocks = blocks;
    if (joined !== this.value) {
      this.suppressValueSync = true;
      this.value = joined;
    }
    if (this.value === this.rawEntryValue) return;
    this.rawEntryValue = this.value;
    this.formControlController.updateValidity();
    this.emit('zn-change');
  };

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

  private renderImageControls() {
    const data = this.imageEdit;
    if (!data) return '';
    const aligns: {value: ImageBlockData['align']; icon: string; label: string}[] = [
      {value: '', icon: 'align-left@lu', label: 'Align left'},
      {value: 'center', icon: 'align-center@lu', label: 'Align center'},
      {value: 'right', icon: 'align-right@lu', label: 'Align right'},
    ];
    return html`
      <div part="image-controls" class="remarkd-editor__image-controls"
           @keydown=${this.handleImageControlsKeydown}>
        ${data.src ? html`
          <div class=${classMap({
            'remarkd-editor__image-controls-preview': true,
            [`remarkd-editor__image-controls-preview--${data.align}`]: !!data.align,
          })}>
            <img src=${data.src}
                 alt=${data.alt}
                 width=${data.width || ''}
                 height=${data.height || ''}>
          </div>` : ''}
        <label class="remarkd-editor__image-field">
          <span>Caption</span>
          <input .value=${data.caption}
                 placeholder="Optional caption"
                 @input=${(e: Event) => this.updateImageEdit({caption: (e.target as HTMLInputElement).value})}>
        </label>
        <div class="remarkd-editor__image-row">
          <div class="remarkd-editor__image-field">
            <span>Alignment</span>
            <zn-button-group>
              ${aligns.map(align => html`
                <zn-button type="button" icon-button="small" icon=${align.icon}
                           ?plain=${data.align !== align.value}
                           tooltip=${align.label}
                           @click=${() => this.updateImageEdit({align: align.value})}></zn-button>`)}
            </zn-button-group>
          </div>
          <label class="remarkd-editor__image-field">
            <span>Width</span>
            <input .value=${data.width} placeholder="auto" size="6"
                   @input=${(e: Event) => this.updateImageEdit({width: (e.target as HTMLInputElement).value})}>
          </label>
          <label class="remarkd-editor__image-field">
            <span>Height</span>
            <input .value=${data.height} placeholder="auto" size="6"
                   @input=${(e: Event) => this.updateImageEdit({height: (e.target as HTMLInputElement).value})}>
          </label>
          <label class="remarkd-editor__image-field">
            <span>Alt text</span>
            <input .value=${data.alt}
                   @input=${(e: Event) => this.updateImageEdit({alt: (e.target as HTMLInputElement).value})}>
          </label>
        </div>
        <div class="remarkd-editor__image-buttons">
          <zn-button type="button" color="primary" size="small" @click=${this.saveImageEdit}>Save</zn-button>
          <zn-button type="button" color="secondary" size="small" @click=${this.closeImageEdit}>Cancel</zn-button>
          <span class="remarkd-editor__image-buttons-spacer"></span>
          <zn-button type="button" icon-button="small" plain icon="code@lu"
                     tooltip="Edit source" @click=${this.editImageSource}></zn-button>
          <zn-button type="button" icon-button="small" plain icon="trash-2@lu" color="error"
                     tooltip="Delete image" @click=${this.deleteImageBlock}></zn-button>
        </div>
      </div>`;
  }

  private renderBlock(block: string, index: number) {
    if (this.editingIndex === index) {
      if (this.imageEdit) {
        return this.renderImageControls();
      }
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
            <span class="remarkd-editor__drag-handle"
                  title="Drag to move"
                  @pointerdown=${this.handleHandlePointerDown}>
              <zn-icon src="grip-vertical@lu" size="16"></zn-icon>
            </span>
            <zn-button type="button" icon-button="small" plain icon="plus@lu" icon-size="16"
                       tooltip="Add block below"
                       @click=${() => this.insertDraftBlock(index + 1)}></zn-button>
          </div>
          <zn-button class="remarkd-editor__delete"
                     type="button" icon-button="small" plain icon="x@lu" icon-size="16" color="error"
                     tooltip="Delete block"
                     @click=${() => this.deleteBlock(index)}></zn-button>`}
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
            ${this.rawMode ? '' : BLOCK_TYPES.map(item => html`
              <zn-button type="button" icon-button plain icon=${item.icon} icon-size="18"
                         tooltip=${item.label}
                         @click=${() => this.handleToolbarInsert(item)}></zn-button>`)}
            ${this.allowRaw ? html`
              <zn-button part="raw-toggle" class="remarkd-editor__raw-toggle"
                         type="button" icon-button icon="code-xml@lu" icon-size="18"
                         ?plain=${!this.rawMode}
                         tooltip=${this.rawMode ? 'Show blocks' : 'Show raw source'}
                         @click=${this.toggleRawMode}></zn-button>` : ''}
          </div>` : ''}
        <div class=${classMap({
          'remarkd-editor__body': true,
          'remarkd-editor__body--raw': this.rawMode,
        })}>
          ${this.rawMode ? this.renderRaw() : html`
            ${this.renderBody()}
            <div class="remarkd-editor__add" @click=${() => this.insertDraftBlock(this.blocks.length)}>
              ${this.blocks.length === 0 && this.editingIndex === null ? this.placeholder : ''}
            </div>`}
        </div>
        <textarea class="remarkd-editor__validation"
                  .value=${this.value}
                  ?required=${this.required}
                  tabindex="-1"
                  aria-hidden="true"></textarea>
      </div>`;
  }

  private renderRaw() {
    return html`
      <textarea part="raw"
                class="remarkd-editor__raw"
                placeholder=${this.placeholder}
                spellcheck="false"
                .value=${this.value}
                @input=${this.handleRawInput}
                @blur=${this.commitRaw}></textarea>`;
  }

  /** The block views, with the inline image picker spliced in when active. */
  private renderBody() {
    const views = this.blocks.map((block, index) => this.renderBlock(block, index));
    if (this.imagePickerIndex !== null) {
      views.splice(this.imagePickerIndex, 0, this.renderImagePicker());
    }
    return views;
  }

  private renderImagePicker() {
    return html`
      <div class="remarkd-editor__image-picker">
        <zn-file class="remarkd-editor__image-file"
                 label="Image"
                 accept="image/*"
                 droparea
                 @zn-change=${this.handleImagePicked}></zn-file>
        <zn-button type="button" icon-button="small" plain icon="x@lu"
                   tooltip="Cancel"
                   @click=${this.closeImagePicker}></zn-button>
      </div>`;
  }
}
