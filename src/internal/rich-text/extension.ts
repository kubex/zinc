import type {KeyBinding} from './keymap';
import type {Point} from './positions';
import type RichEditor from './rich-editor';

/** A mark that wraps text, such as bold or a link. */
export interface InlineFormat {
  name: string;
  /** Upper-case tag the editor writes. */
  tag: string;
  /** Other tags read as this format, e.g. `B` for bold. */
  aliases?: string[];
  attributes?: string[];
  /** Narrows which elements of the tag are this format, e.g. a span only when it has a colour. */
  match?: (el: Element) => boolean;
  create?: (value: unknown) => Element;
  /** The format's value on an element; true when the format has no value. */
  value?: (el: Element) => unknown;
}

/** Block tags and the value each one stands for, e.g. header: H1 → 1. */
export interface BlockFormat {
  name: string;
  tags: Record<string, unknown>;
}

/** A node the caret steps over as one character, such as an image or a divider. */
export interface AtomFormat {
  name: string;
  selector: string;
  /** Sits between blocks rather than inside text. */
  block?: boolean;
  attributes?: string[];
  create: (value: unknown) => Element;
  /** Its plain text when copied, e.g. a merge field's raw token; nothing otherwise. */
  text?: (el: Element) => string;
}

/** Runs when the text typed so far on a line matches, such as `- ` starting a list. The match is already removed. */
export interface InputRule {
  match: RegExp;
  /** Whether the line qualifies, e.g. only a plain paragraph starts a list. */
  when?: (block: Element) => boolean;
  run: (editor: RichEditor, index: number) => void;
}

/** A line format with structure of its own, such as lists. */
export interface LineFormat {
  name: string;
  /** Applies the format to whole lines; a false value removes it. */
  apply: (blocks: Element[], value: unknown) => void;
  /** The value shared by all the lines, or undefined. */
  value: (blocks: Element[]) => unknown;
}

/** The line a key was pressed on. */
export interface LineContext {
  editor: RichEditor;
  block: Element;
  index: number;
  /** Indexes of the line's first character and of its line break. */
  start: number;
  end: number;
  /** The caret as a DOM point. */
  point: Point;
}

export interface Extension {
  name: string;
  inline?: InlineFormat[];
  blocks?: BlockFormat[];
  atoms?: AtomFormat[];
  lists?: boolean;
  /** Extra tags the sanitiser lets through on paste and load. */
  tags?: string[];
  /** Class-name prefixes a block keeps, such as `ql-align-`. */
  blockClasses?: string[];
  /** Rewrites pasted or loaded HTML before it is fitted to the schema, e.g. older saved shapes. */
  parse?: (root: DocumentFragment) => void;
  /** Rewrites a copy of the content before it is saved. */
  serialize?: (root: Element) => void;
  lineFormats?: LineFormat[];
  /** Turns one of the extension's blocks back into a plain line, e.g. lifting an item out of its list; null otherwise. */
  release?: (block: Element) => Element | null;
  /** Handles Enter on a line, returning where the caret goes; null leaves it to the editor. */
  enter?: (line: LineContext) => number | null;
  /** Handles Backspace at the start of a line, as `enter` does. */
  backspace?: (line: LineContext) => number | null;
  keys?: KeyBinding[];
  inputRules?: InputRule[];
  /** Sets the extension up on an editor, returning what undoes it. */
  init?: (editor: RichEditor) => (() => void) | undefined;
}

export interface Schema {
  extensions: Extension[];
  inline: InlineFormat[];
  /** Upper-case leaf block tag → its block format and value. P and LI are always leaves. */
  blocks: Map<string, {name: string; value: unknown}>;
  atoms: AtomFormat[];
  lineFormats: LineFormat[];
  lists: boolean;
  tags: string[];
  blockClasses: string[];
}

export function buildSchema(extensions: Extension[]): Schema {
  const blocks = new Map<string, {name: string; value: unknown}>();
  for (const format of extensions.flatMap(ext => ext.blocks ?? [])) {
    for (const [tag, value] of Object.entries(format.tags)) blocks.set(tag.toUpperCase(), {name: format.name, value});
  }
  return {
    extensions,
    inline: extensions.flatMap(ext => ext.inline ?? []),
    blocks,
    atoms: extensions.flatMap(ext => ext.atoms ?? []),
    lineFormats: extensions.flatMap(ext => ext.lineFormats ?? []),
    lists: extensions.some(ext => ext.lists),
    tags: extensions.flatMap(ext => ext.tags ?? []),
    blockClasses: extensions.flatMap(ext => ext.blockClasses ?? []),
  };
}

export function isLeafTag(schema: Schema, tag: string) {
  return tag === 'P' || tag === 'LI' || schema.blocks.has(tag);
}

export function atomOf(schema: Schema, el: Element) {
  return schema.atoms.find(atom => el.matches(atom.selector));
}

export function inlineFormatOf(schema: Schema, el: Element) {
  return schema.inline.find(format =>
    (format.tag === el.tagName || format.aliases?.includes(el.tagName)) && (format.match?.(el) ?? true));
}

export function formatValue(format: InlineFormat, el: Element): unknown {
  return format.value ? format.value(el) : true;
}

export function createInline(format: InlineFormat, value: unknown): Element {
  return format.create ? format.create(value) : document.createElement(format.tag);
}
