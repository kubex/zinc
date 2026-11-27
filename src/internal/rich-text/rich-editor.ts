import {atomOf, buildSchema, createInline, formatValue, inlineFormatOf} from './extension';
import {GUARD, indexToPoint, isList, length, lineAt, lines, linesIn, pointToIndex, slots, textOf, toRange} from './positions';
import {hasFocus, readRange, writeRange} from './selection';
import {History} from './history';
import {isEmptyDocument, parse, serialize, structure} from './parse';
import {matchesBinding, matchesShortcut} from './keymap';
import {moveContent, rename, splitBlock, unwrapFrom} from './blocks';
import type {Extension, InlineFormat, LineContext, Schema} from './extension';
import type {Slot} from './positions';
import type {Snapshot} from './history';

export interface TextRange {
  index: number;
  length: number;
}

export type Formats = Record<string, unknown>;

export interface RichEditorOptions {
  extensions?: Extension[];
  placeholder?: string;
  readonly?: boolean;
}

export type ChangeSource = 'user' | 'api';

const FORMAT_INPUTS: Record<string, string> = {
  formatBold: 'bold',
  formatItalic: 'italic',
  formatUnderline: 'underline',
  formatStrikeThrough: 'strike',
};

const sameRange = (a: TextRange | null, b: TextRange | null) => a?.index === b?.index && a?.length === b?.length;
const isOff = (value: unknown) => value === false || value === null || value === undefined || value === '';

/**
 * A rich text editor on a contenteditable element. The browser types and deletes within a line; the editor handles
 * everything that changes structure (new lines, joins, pastes, formats) and tidies the DOM back to its schema after
 * every edit, so the content only ever holds what the extensions allow.
 *
 * Emits `change` ({source}) after every edit and `selection-change` ({range}) when the selection moves or the editor
 * loses focus (range null).
 */
export default class RichEditor extends EventTarget {
  readonly root: HTMLElement;
  readonly schema: Schema;
  private readonly history: History;
  // Formats the next typed text takes, set by toggling a format with nothing selected
  private readonly pending = new Map<string, unknown>();
  private readonly cleanups: (() => void)[] = [];
  private composing = false;
  private lastSelection: TextRange | null = null;
  private readonly = false;

  constructor(root: HTMLElement, options: RichEditorOptions = {}) {
    super();
    this.root = root;
    this.schema = buildSchema(options.extensions ?? []);
    root.setAttribute('role', 'textbox');
    root.setAttribute('aria-multiline', 'true');
    root.replaceChildren(structure(root, this.schema));
    this.setReadonly(!!options.readonly);
    this.setPlaceholder(options.placeholder ?? '');
    this.history = new History(this.snapshot());
    this.updateEmpty();

    this.listen(root, 'beforeinput', this.onBeforeInput as EventListener);
    this.listen(root, 'input', this.onInput as EventListener);
    this.listen(root, 'keydown', this.onKeyDown as EventListener);
    this.listen(root, 'paste', this.onPaste as EventListener);
    this.listen(root, 'copy', this.onCopy as EventListener);
    this.listen(root, 'cut', this.onCopy as EventListener);
    this.listen(root, 'dragover', this.onDragOver as EventListener);
    this.listen(root, 'drop', this.onDrop as EventListener);
    this.listen(root, 'compositionstart', () => (this.composing = true));
    this.listen(root, 'compositionend', () => {
      this.composing = false;
      this.afterNativeEdit(true);
    });
    // The selection is only tracked while focused, so idle editors cost nothing per selection change
    this.listen(root, 'focus', () => document.addEventListener('selectionchange', this.onSelectionChange));
    this.listen(root, 'blur', () => {
      document.removeEventListener('selectionchange', this.onSelectionChange);
      this.dispatch('selection-change', {range: null});
    });

    this.schema.extensions.forEach(ext => {
      const cleanup = ext.init?.(this);
      if (cleanup) this.cleanups.push(cleanup);
    });
  }

  destroy() {
    document.removeEventListener('selectionchange', this.onSelectionChange);
    this.cleanups.splice(0).forEach(cleanup => cleanup());
  }

  // Content

  getHTML(): string {
    return serialize(this.root, this.schema);
  }

  /** Replaces the content and starts a fresh undo history. Emits no change. */
  setHTML(html: string) {
    this.root.replaceChildren(parse(html, this.schema));
    // As in restore(): a selection left in the replaced content shows as a stray caret
    if (this.editing()) this.setSelection(0);
    this.pending.clear();
    this.history.reset(this.snapshot());
    this.updateEmpty();
  }

  isEmpty(): boolean {
    return isEmptyDocument(this.root);
  }

  /** The text, with a line break after every line and `\ufffc` for each embed. */
  getText(index = 0, len?: number): string {
    return textOf(this.root, this.schema).slice(index, len === undefined ? undefined : index + len);
  }

  getLength(): number {
    return length(this.root, this.schema);
  }

  // Selection

  /** The selection, or null when the editor isn't focused. With `focus`, focuses first and always returns one. */
  getSelection(focus = false): TextRange | null {
    if (focus && !this.hasFocus()) this.focus();
    const range = readRange(this.root);
    if (!range) return focus ? this.lastSelection ?? {index: Math.max(0, this.getLength() - 1), length: 0} : null;
    const index = pointToIndex(this.root, this.schema, range.startContainer, range.startOffset);
    const end = range.collapsed ? index : pointToIndex(this.root, this.schema, range.endContainer, range.endOffset);
    return {index, length: Math.max(0, end - index)};
  }

  /** Moves the selection, focusing the editor. Null blurs it. */
  setSelection(index: number | null, len = 0) {
    if (index === null) {
      this.root.blur();
      return;
    }
    const max = Math.max(0, this.getLength() - 1);
    const start = Math.min(Math.max(0, index), max);
    const end = Math.min(start + Math.max(0, len), max);
    const previous = this.lastSelection;
    this.lastSelection = {index: start, length: end - start};
    writeRange(this.root, indexToPoint(this.root, this.schema, start), indexToPoint(this.root, this.schema, end));
    if (!sameRange(previous, this.lastSelection)) this.dispatch('selection-change', {range: this.lastSelection});
  }

  /** The index under a point on screen, or null when the point isn't over the text. */
  indexAtPoint(x: number, y: number): number | null {
    const shadow = this.root.getRootNode();
    const shadowRoots = shadow instanceof ShadowRoot ? [shadow] : [];
    let node: Node | undefined;
    let offset = 0;
    if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(x, y, {shadowRoots});
      node = position?.offsetNode;
      offset = position?.offset ?? 0;
    } else {
      // Safari before 18.2
      const range = document.caretRangeFromPoint?.(x, y);
      node = range?.startContainer;
      offset = range?.startOffset ?? 0;
    }
    return node && this.root.contains(node) ? pointToIndex(this.root, this.schema, node, offset) : null;
  }

  focus() {
    if (this.hasFocus()) return;
    const last = this.lastSelection ?? {index: Math.max(0, this.getLength() - 1), length: 0};
    this.setSelection(last.index, last.length);
  }

  hasFocus(): boolean {
    return hasFocus(this.root);
  }

  // Safari types into the selection even after focus has moved to a toolbar, so a caret still inside counts
  private editing(): boolean {
    return this.hasFocus() || !!readRange(this.root);
  }

  /** The viewport rectangle of a range, or of the caret's line when the range has no box of its own. */
  getBounds(index: number, len = 0): DOMRect {
    const rect = toRange(this.root, this.schema, index, len).getBoundingClientRect();
    if (rect.width || rect.height) return rect;
    const line = lineAt(this.root, this.schema, index)?.block.getBoundingClientRect() ?? this.root.getBoundingClientRect();
    return new DOMRect(line.left, line.top, 0, line.height);
  }

  // Editing

  insertText(index: number, text: string, formats: Formats = {}) {
    this.edit(() => {
      this.insertTextAt(index, text);
      Object.entries(formats).forEach(([name, value]) => this.formatRange(index, text.length, name, value));
    }, {index: index + text.length, length: 0});
  }

  /** Inserts sanitised HTML; any blocks it holds split the line at `index`. Returns the index after it. */
  insertHTML(index: number, html: string): number {
    let end = index;
    this.edit(() => (end = this.insertHTMLAt(index, html)), () => ({index: end, length: 0}));
    return end;
  }

  insertEmbed(index: number, name: string, value: unknown = true) {
    const atom = this.schema.atoms.find(a => a.name === name);
    if (!atom) return;
    const el = atom.create(value);
    // After a block, typing carries on in the line below it
    this.edit(() => {
      if (atom.block) {
        this.insertBlockAt(index, el);
      } else {
        this.insertNodeAt(index, el);
      }
    }, () => ({index: atom.block ? pointToIndex(this.root, this.schema, el.nextElementSibling!, 0) : index + 1, length: 0}));
  }

  deleteText(index: number, len: number) {
    this.edit(() => this.deleteRange(index, len), {index, length: 0});
  }

  /** Applies a format to the selection; with nothing selected, an inline format applies to the next typed text. */
  format(name: string, value: unknown = true) {
    const range = this.getSelection() ?? this.lastSelection;
    if (!range) return;
    this.formatText(range.index, range.length, name, value);
  }

  formatText(index: number, len: number, name: string, value: unknown = true) {
    if (this.schema.inline.some(format => format.name === name) && len === 0) {
      this.pending.set(name, value);
      this.dispatch('selection-change', {range: {index, length: 0}});
      return;
    }
    this.edit(() => this.formatRange(index, len, name, value), {index, length: len});
  }

  removeFormat(index: number, len: number) {
    this.edit(() => {
      this.schema.inline.forEach(format => this.formatRange(index, len, format.name, false));
      linesIn(this.root, this.schema, index, len).filter(line => !line.atom).forEach(line => {
        // Its layout too, such as alignment
        rename(this.release(line.block), 'P').removeAttribute('class');
      });
    }, {index, length: len});
  }

  /** The whole run of an inline format around an index, such as the link the caret is in. */
  getFormatExtent(index: number, name: string): TextRange | null {
    const format = this.schema.inline.find(f => f.name === name);
    const slot = this.textSlotsFor({index, length: 0})[0];
    const el = format && slot ? this.closestFormat(slot.node, format, slot.block) : null;
    if (!el) return null;
    const start = pointToIndex(this.root, this.schema, el, 0);
    return {index: start, length: pointToIndex(this.root, this.schema, el, el.childNodes.length) - start};
  }

  /** The formats across a range: an inline format counts only when all of the range has it, with the same value. */
  getFormat(index?: number, len = 0): Formats {
    const range = index === undefined ? this.getSelection() ?? this.lastSelection : {index, length: len};
    if (!range) return {};
    const formats: Formats = {};

    this.schema.inline.forEach(format => {
      const values = this.textSlotsFor(range).map(slot => this.valueAt(slot.node, format, slot.block));
      if (values.length && values.every(v => v !== undefined && v === values[0])) formats[format.name] = values[0];
    });
    if (range.length === 0) {
      this.pending.forEach((value, name) => {
        if (isOff(value)) delete formats[name];
        else formats[name] = value;
      });
    }

    const blocks = linesIn(this.root, this.schema, range.index, range.length).filter(line => !line.atom).map(line => line.block);
    if (blocks.length) {
      const block = this.schema.blocks.get(blocks[0].tagName);
      if (block && blocks.every(b => b.tagName === blocks[0].tagName)) formats[block.name] = block.value;
      this.schema.lineFormats.forEach(format => {
        const value = format.value(blocks);
        if (value !== undefined) formats[format.name] = value;
      });
    }
    return formats;
  }

  /** Runs DOM changes an extension makes to the content as one undoable edit. */
  transact(mutate: () => void) {
    this.edit(mutate, this.getSelection() ?? undefined, 'user');
  }

  /** The index of a node in the content, such as an embed. */
  indexOf(node: Node): number {
    const parent = node.parentNode!;
    return pointToIndex(this.root, this.schema, parent, Array.prototype.indexOf.call(parent.childNodes, node) as number);
  }

  /** The block of each line in a range, or in the selection. */
  getLines(index?: number, len = 0): Element[] {
    const range = index === undefined ? this.getSelection() ?? this.lastSelection : {index, length: len};
    if (!range) return [];
    return linesIn(this.root, this.schema, range.index, range.length).filter(line => !line.atom).map(line => line.block);
  }

  undo() {
    this.restore(this.history.undo());
  }

  redo() {
    this.restore(this.history.redo());
  }

  setReadonly(readonly: boolean) {
    this.readonly = readonly;
    this.root.contentEditable = readonly ? 'false' : 'true';
  }

  setPlaceholder(placeholder: string) {
    this.root.dataset.placeholder = placeholder;
  }

  // Internals

  private listen(target: EventTarget, type: string, listener: EventListener) {
    target.addEventListener(type, listener);
    this.cleanups.push(() => target.removeEventListener(type, listener));
  }

  // Returns false when a listener cancelled a cancelable event
  private dispatch(type: string, detail: unknown, cancelable = false) {
    return this.dispatchEvent(new CustomEvent(type, {detail, cancelable}));
  }

  private snapshot(): Snapshot {
    return {html: this.root.innerHTML, selection: this.getSelection() ?? this.lastSelection};
  }

  private updateEmpty() {
    this.root.toggleAttribute('data-empty', this.isEmpty());
  }

  /** Rewrites the DOM to the schema when the browser has left it otherwise, keeping the selection where it was. */
  private tidy(): boolean {
    const range = this.editing() ? this.getSelection() : null;
    const holder = document.createElement('div');
    holder.append(structure(this.root, this.schema));
    if (holder.innerHTML === this.root.innerHTML) return false;
    this.root.replaceChildren(...Array.from(holder.childNodes));
    if (range) this.setSelection(range.index, range.length);
    return true;
  }

  private edit(mutate: () => void, selection?: TextRange | (() => TextRange), source: ChangeSource = 'api', typing = false) {
    mutate();
    this.tidy();
    if (selection) {
      const range = typeof selection === 'function' ? selection() : selection;
      if (this.editing()) this.setSelection(range.index, range.length);
      else this.lastSelection = range;
    }
    this.afterChange(source, typing);
  }

  private afterChange(source: ChangeSource, typing = false) {
    this.history.record(this.snapshot(), typing);
    this.updateEmpty();
    this.dispatch('change', {source});
  }

  private restore(snapshot: Snapshot | null) {
    if (!snapshot) return;
    this.root.innerHTML = snapshot.html;
    // Replacing the content drops a lingering selection to the start, where it shows as a second caret
    if (snapshot.selection && this.editing()) this.setSelection(snapshot.selection.index, snapshot.selection.length);
    this.updateEmpty();
    this.dispatch('change', {source: 'user'});
  }

  private textSlotsFor(range: TextRange): Slot[] {
    const text = slots(this.root, this.schema).filter(slot => slot.kind === 'text' && slot.length > 0);
    if (range.length > 0) {
      const end = range.index + range.length;
      return text.filter(slot => slot.start < end && slot.start + slot.length > range.index);
    }
    // At a caret, formats come from the character before it, or after it at the start of a line
    const before = text.find(slot => slot.start < range.index && range.index <= slot.start + slot.length);
    const after = text.find(slot => slot.start === range.index);
    const slot = before ?? after;
    return slot ? [slot] : [];
  }

  private closestFormat(node: Node, format: InlineFormat, block: Element): Element | null {
    for (let el = node.parentElement; el && el !== block && el !== this.root; el = el.parentElement) {
      if (inlineFormatOf(this.schema, el) === format) return el;
    }
    return null;
  }

  private valueAt(node: Node, format: InlineFormat, block: Element): unknown {
    const el = this.closestFormat(node, format, block);
    return el ? formatValue(format, el) : undefined;
  }

  private splitTextAt(index: number) {
    const slot = slots(this.root, this.schema)
      .find(s => s.kind === 'text' && s.start < index && index < s.start + s.length);
    (slot?.node as Text | undefined)?.splitText(index - slot!.start);
  }

  private formatRange(index: number, len: number, name: string, value: unknown) {
    const inline = this.schema.inline.find(format => format.name === name);
    if (inline) {
      if (len > 0) this.formatInline(index, len, inline, value);
      return;
    }
    const lineBlocks = linesIn(this.root, this.schema, index, len).filter(line => !line.atom).map(line => line.block);
    const lineFormat = this.schema.lineFormats.find(format => format.name === name);
    if (lineFormat) {
      lineFormat.apply(lineBlocks, isOff(value) ? false : value);
      return;
    }
    const entry = [...this.schema.blocks].find(([, block]) => block.name === name && String(block.value) === String(value));
    const tag = isOff(value) || !entry ? 'P' : entry[0];
    if (!isOff(value) && !entry) return;
    lineBlocks.forEach(block => {
      const current = this.schema.blocks.get(block.tagName);
      // Clearing one block format leaves a block of another format alone
      if (isOff(value) && current?.name !== name) return;
      rename(this.release(block), tag);
    });
  }

  private formatInline(index: number, len: number, format: InlineFormat, value: unknown) {
    this.splitTextAt(index + len);
    this.splitTextAt(index);
    const targets = slots(this.root, this.schema).filter(slot =>
      slot.kind === 'text' && slot.length > 0 && slot.start >= index && slot.start + slot.length <= index + len);
    targets.forEach(({node, block}) => {
      for (let mark = this.closestFormat(node, format, block); mark; mark = this.closestFormat(node, format, block)) {
        if (!isOff(value) && formatValue(format, mark) === value) return;
        unwrapFrom(node, mark);
      }
      if (isOff(value)) return;
      const el = createInline(format, value);
      (node as ChildNode).replaceWith(el);
      el.append(node);
    });
  }

  private release(block: Element): Element {
    for (const ext of this.schema.extensions) {
      const released = ext.release?.(block);
      if (released) return released;
    }
    return block;
  }

  /** Offers a key to the extensions, returning the caret index from the one that handled it. */
  private lineHook(hook: 'enter' | 'backspace', block: Element, index: number, start: number, end: number): number | null {
    const line: LineContext = {editor: this, block, index, start, end, point: indexToPoint(this.root, this.schema, index)};
    for (const ext of this.schema.extensions) {
      const caret = ext[hook]?.(line);
      if (caret !== null && caret !== undefined) return caret;
    }
    return null;
  }

  private insertNodeAt(index: number, node: Node) {
    const [at, offset] = indexToPoint(this.root, this.schema, index);
    if (at instanceof Text) {
      if (offset === 0) at.before(node);
      else if (offset >= at.length) at.after(node);
      else at.splitText(offset).before(node);
    } else {
      at.insertBefore(node, at.childNodes[offset] ?? null);
    }
  }

  private insertTextAt(index: number, text: string) {
    text.split('\n').forEach((part, i) => {
      if (i > 0) {
        this.breakLine(index);
        index++;
      }
      if (part) {
        this.insertNodeAt(index, document.createTextNode(part));
        index += part.length;
      }
    });
  }

  /** Splits the line at `index`, as Enter does without its special cases. */
  private breakLine(index: number) {
    const line = lineAt(this.root, this.schema, index);
    if (!line || line.atom) return;
    const [node, offset] = indexToPoint(this.root, this.schema, index);
    splitBlock(line.block, node, offset);
  }

  /** Puts a block-level node at `index`, splitting the line there; inside a list it goes after the whole list. */
  private insertBlockAt(index: number, el: Element) {
    const line = lineAt(this.root, this.schema, index);
    if (!line) {
      this.root.append(el);
    } else {
      let anchor = line.block;
      if (!line.atom && index > line.start && index < line.end) {
        const [node, offset] = indexToPoint(this.root, this.schema, index);
        splitBlock(line.block, node, offset);
      }
      while (anchor.parentElement && anchor.parentElement !== this.root) anchor = anchor.parentElement;
      if (index === line.start && !line.atom && anchor === line.block) anchor.before(el);
      else anchor.after(el);
    }
    // Something to type in below the block
    const next = el.nextElementSibling;
    if (!next || lineAt(this.root, this.schema, pointToIndex(this.root, this.schema, next, 0))?.atom) {
      el.after(Object.assign(document.createElement('p'), {innerHTML: '<br>'}));
    }
  }

  private insertHTMLAt(index: number, html: string): number {
    const before = this.getLength();
    const fragment = parse(html, this.schema);
    const blocks = Array.from(fragment.children);
    const line = lineAt(this.root, this.schema, index);

    if (blocks.length === 1 && blocks[0].tagName === 'P') {
      const [at, offset] = indexToPoint(this.root, this.schema, index);
      const nodes = Array.from(blocks[0].childNodes).filter(node => (node as Element).tagName !== 'BR');
      const holder = document.createDocumentFragment();
      holder.append(...nodes);
      if (at instanceof Text) {
        const tail = offset < at.length ? at.splitText(offset) : null;
        if (tail) tail.before(holder);
        else at.after(holder);
      } else {
        at.insertBefore(holder, at.childNodes[offset] ?? null);
      }
    } else if (line && !line.atom) {
      const [node, offset] = indexToPoint(this.root, this.schema, index);
      const head = line.block;
      const tail = splitBlock(head, node, offset);
      const first = blocks[0];
      const last = blocks[blocks.length - 1];
      if (first?.tagName === 'P' && blocks.length > 1) {
        moveContent(first, head);
        first.remove();
      }
      if (last?.tagName === 'P' && last.parentNode === fragment && last !== first) {
        moveContent(tail, last);
        tail.replaceWith(last);
      }
      const anchor = tail.isConnected ? tail : last;
      anchor.before(fragment);
      if (tail.isConnected && !tail.textContent && !tail.querySelector('img, iframe, [contenteditable="false"]')) tail.remove();
      if (!head.textContent && !head.querySelector('img, iframe, [contenteditable="false"]')) head.remove();
    } else {
      this.root.append(fragment);
    }
    return index + this.getLength() - before;
  }

  private deleteRange(index: number, len: number) {
    if (len <= 0) return;
    const start = lineAt(this.root, this.schema, index);
    const end = lineAt(this.root, this.schema, index + len);
    toRange(this.root, this.schema, index, len).deleteContents();
    if (!start || !end || start.block === end.block || start.atom || end.atom) return;
    if (!start.block.isConnected || !end.block.isConnected) return;
    moveContent(end.block, start.block);
    this.dropEmptied(end.block);
  }

  /** Removes a block whose content has moved away, lifting any nested items it held into its place. */
  private dropEmptied(block: Element) {
    const nested = Array.from(block.children).filter(isList);
    if (block.tagName === 'LI') {
      block.replaceWith(...nested.flatMap(list => Array.from(list.children)));
    } else {
      block.replaceWith(...nested);
    }
  }

  // Events

  private onSelectionChange = () => {
    const range = this.getSelection();
    if (!range || sameRange(range, this.lastSelection)) return;
    this.lastSelection = range;
    this.pending.clear();
    this.dispatch('selection-change', {range});
  };

  // Left and right past an inline atom or its guard move one position, where the browser would stop on the guard too
  private stepOverAtom(e: KeyboardEvent): boolean {
    if ((e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey) return false;
    const range = this.getSelection();
    if (!range || range.length) return false;
    const forward = e.key === 'ArrowRight';
    const caret = readRange(this.root)?.startContainer;
    const inGuard = caret instanceof Text && caret.data.includes(GUARD);
    if (!inGuard && this.getText(forward ? range.index : range.index - 1, 1) !== '\ufffc') return false;
    this.setSelection(range.index + (forward ? 1 : -1));
    return true;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.readonly || e.isComposing) return;
    if (matchesShortcut(e, {key: 'z'})) {
      e.preventDefault();
      this.undo();
      return;
    }
    if (matchesShortcut(e, {key: 'z', shift: true}) || matchesShortcut(e, {key: 'y'})) {
      e.preventDefault();
      this.redo();
      return;
    }
    if (this.stepOverAtom(e)) {
      e.preventDefault();
      return;
    }
    for (const binding of this.schema.extensions.flatMap(ext => ext.keys ?? [])) {
      if (matchesBinding(e, binding) && binding.run(this, e)) {
        e.preventDefault();
        return;
      }
    }
  };

  // Copies the content as it saves, so a merge field leaves as its token rather than its label
  private onCopy = (e: ClipboardEvent) => {
    const range = this.getSelection();
    const dom = readRange(this.root);
    if (!range?.length || !dom || !e.clipboardData) return;
    let content: Node = dom.cloneContents();
    // Keep the marks and block the selection sits inside
    for (let node = dom.commonAncestorContainer; node !== this.root && node.parentNode; node = node.parentNode) {
      if (node instanceof Element) {
        const shell = node.cloneNode(false);
        shell.appendChild(content);
        content = shell;
      }
    }
    const holder = document.createElement('div');
    holder.append(content);
    const atoms = slots(this.root, this.schema).filter(slot =>
      slot.kind === 'atom' && slot.start >= range.index && slot.start < range.index + range.length);
    let atom = 0;
    const text = this.getText(range.index, range.length).replace(/\ufffc/g, () => {
      const el = atoms[atom++]?.node as Element | undefined;
      return el ? atomOf(this.schema, el)?.text?.(el) ?? '' : '';
    });
    e.preventDefault();
    e.clipboardData.setData('text/html', serialize(holder, this.schema));
    e.clipboardData.setData('text/plain', text);
    if (e.type === 'cut' && !this.readonly) this.deleteText(range.index, range.length);
  };

  private onPaste = (e: ClipboardEvent) => {
    if (this.readonly) return;
    e.preventDefault();
    this.insertTransfer(e.clipboardData);
  };

  // Files dropped in from outside the page; a drop with HTML comes through beforeinput, which knows the drop point
  private onDragOver = (e: DragEvent) => {
    if (!this.readonly && e.dataTransfer?.types.includes('Files')) e.preventDefault();
  };

  private onDrop = (e: DragEvent) => {
    if (this.readonly || !e.dataTransfer?.files.length || e.dataTransfer.types.includes('text/html')) return;
    e.preventDefault();
    this.insertTransfer(e.dataTransfer);
  };

  private insertTransfer(data: DataTransfer | null, at?: number) {
    const range = this.getSelection(true)!;
    const index = at ?? range.index;
    const line = lineAt(this.root, this.schema, index);
    const html = line?.block.tagName === 'PRE' ? '' : data?.getData('text/html') ?? '';
    const text = data?.getData('text/plain') ?? '';
    // A pasted screenshot or a dropped file has no markup; the host takes the files by cancelling the event,
    // otherwise the plain text (a copied file's name) is pasted
    const files = Array.from(data?.files ?? []);
    if (files.length && !html && !this.dispatch('files', {files, index}, true)) {
      if (at === undefined && range.length) this.edit(() => this.deleteRange(range.index, range.length), () => ({index, length: 0}), 'user');
      return;
    }
    let end = index;
    this.edit(() => {
      if (at === undefined) this.deleteRange(range.index, range.length);
      if (html) end = this.insertHTMLAt(index, html);
      else {
        this.insertTextAt(index, text.replace(/\r\n?/g, '\n'));
        end = index + text.replace(/\r\n?/g, '\n').length;
      }
    }, () => ({index: end, length: 0}), 'user');
  }

  private onBeforeInput = (e: InputEvent) => {
    if (this.readonly || this.composing || e.isComposing) return;
    const type = e.inputType;
    const range = this.getSelection();
    if (!range) return;

    if (type === 'historyUndo' || type === 'historyRedo') {
      e.preventDefault();
      if (type === 'historyUndo') this.undo();
      else this.redo();
    } else if (FORMAT_INPUTS[type]) {
      e.preventDefault();
      const name = FORMAT_INPUTS[type];
      this.formatText(range.index, range.length, name, !this.getFormat(range.index, range.length)[name]);
    } else if (type.startsWith('format')) {
      e.preventDefault();
    } else if (type === 'insertParagraph' || type === 'insertLineBreak') {
      e.preventDefault();
      this.enter(range);
    } else if (type === 'insertText' && (range.length || this.pending.size)) {
      e.preventDefault();
      this.typeText(range, e.data ?? '');
    } else if (type === 'insertFromDrop') {
      e.preventDefault();
      const target = e.getTargetRanges()[0];
      const at = target ? pointToIndex(this.root, this.schema, target.startContainer, target.startOffset) : range.index;
      this.insertTransfer(e.dataTransfer, at);
    } else if (type.startsWith('insertFromPaste')) {
      e.preventDefault();
      this.insertTransfer(e.dataTransfer);
    } else if (type.startsWith('delete')) {
      this.deleteInput(e, range);
    }
  };

  private deleteInput(e: InputEvent, range: TextRange) {
    if (range.length) {
      e.preventDefault();
      this.edit(() => this.deleteRange(range.index, range.length), {index: range.index, length: 0}, 'user');
      return;
    }
    const line = lineAt(this.root, this.schema, range.index);
    if (!line) return;
    // A click on a divider or video leaves the caret on it, so either key removes it
    if (line.atom) {
      e.preventDefault();
      this.edit(() => line.block.remove(), {index: line.start, length: 0}, 'user');
      return;
    }
    if (e.inputType.endsWith('Backward') && range.index === line.start) {
      e.preventDefault();
      this.joinBackward(range.index);
    } else if (e.inputType.endsWith('Forward') && range.index === line.end) {
      e.preventDefault();
      this.joinForward(range.index);
    }
  }

  private typeText(range: TextRange, text: string) {
    const formats = new Map(this.pending);
    // Applied to this text only; typing on from inside it carries the format natively
    this.pending.clear();
    this.edit(() => {
      this.deleteRange(range.index, range.length);
      this.insertTextAt(range.index, text);
      formats.forEach((value, name) => this.formatRange(range.index, text.length, name, value));
    }, {index: range.index + text.length, length: 0}, 'user', true);
    this.runInputRules();
  }

  private enter(range: TextRange) {
    let caret = range.index + 1;
    // A link or code run ends with its line; other inline formats carry on to the next
    const carried = Object.fromEntries(Object.entries(this.getFormat(range.index, 0))
      .filter(([name]) => name !== 'link' && name !== 'code' && this.schema.inline.some(format => format.name === name)));
    this.edit(() => {
      this.deleteRange(range.index, range.length);
      const index = range.index;
      const line = lineAt(this.root, this.schema, index);
      if (!line) return;
      if (line.atom) {
        line.block.after(Object.assign(document.createElement('p'), {innerHTML: '<br>'}));
        return;
      }
      const block = line.block;
      const handled = this.lineHook('enter', block, index, line.start, line.end);
      if (handled !== null) {
        caret = handled;
        return;
      }
      // Enter on an empty formatted line turns it back into a paragraph rather than adding a line
      if (line.start === line.end && block.tagName !== 'P') {
        rename(this.release(block), 'P');
        caret = index;
        return;
      }
      // A heading ends at its line; other formats carry on to the next
      const tag = index === line.end && /^H[1-6]$/.test(block.tagName) ? 'P' : block.tagName;
      const [node, offset] = indexToPoint(this.root, this.schema, index);
      splitBlock(block, node, offset, tag);
    }, () => ({index: caret, length: 0}), 'user');
    Object.entries(carried).forEach(([name, value]) => this.pending.set(name, value));
  }

  private joinBackward(index: number) {
    let caret = index;
    this.edit(() => {
      const all = lines(this.root, this.schema);
      const at = all.findIndex(line => line.start === index && !line.atom);
      const line = all[at];
      if (!line) return;
      const block = line.block;
      const handled = this.lineHook('backspace', block, index, line.start, line.end);
      if (handled !== null) {
        caret = handled;
        return;
      }
      if (block.tagName !== 'P') {
        rename(this.release(block), 'P');
        return;
      }
      const previous = all[at - 1];
      if (!previous) return;
      caret = index - 1;
      if (previous.atom) {
        previous.block.remove();
        return;
      }
      moveContent(block, previous.block);
      this.dropEmptied(block);
    }, () => ({index: caret, length: 0}), 'user');
  }

  private joinForward(index: number) {
    this.edit(() => {
      const all = lines(this.root, this.schema);
      const at = all.findIndex(line => line.end === index && !line.atom);
      const next = all[at + 1];
      if (at === -1 || !next) return;
      if (next.atom) {
        next.block.remove();
        return;
      }
      moveContent(next.block, all[at].block);
      this.dropEmptied(next.block);
    }, {index, length: 0}, 'user');
  }

  private onInput = (e: InputEvent) => {
    if (this.composing || e.isComposing) return;
    this.afterNativeEdit(e.inputType === 'insertText');
  };

  private afterNativeEdit(typing: boolean) {
    this.tidy();
    this.afterChange('user', typing);
    if (typing) this.runInputRules();
  }

  private runInputRules() {
    const range = this.getSelection();
    if (!range || range.length) return;
    const line = lineAt(this.root, this.schema, range.index);
    if (!line || line.atom) return;
    const typed = this.getText(line.start, range.index - line.start);
    for (const rule of this.schema.extensions.flatMap(ext => ext.inputRules ?? [])) {
      const match = rule.match.exec(typed);
      if (!match || (rule.when && !rule.when(line.block))) continue;
      this.edit(() => this.deleteRange(line.start, match[0].length), {index: line.start, length: 0}, 'user');
      rule.run(this, line.start);
      return;
    }
  }
}
