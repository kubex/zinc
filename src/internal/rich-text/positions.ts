import {atomOf, isLeafTag} from './extension';
import type {Schema} from './extension';

// Each character and atom counts as one position, and every block ends with one for its line break.

export type Point = [Node, number];

/**
 * A zero-width character beside an inline atom with no text on that side, so the caret sits in text there: browsers
 * draw a caret at an element offset beside a non-editable inline in the wrong place. It is no position, and the
 * content as saved leaves it out.
 */
export const GUARD = '\ufeff';
const GUARDS = /\ufeff/g;

const textLength = (data: string) => data.replace(GUARDS, '').length;

// The offset in a text node of its `count`th position, skipping guards
function domOffset(text: Text, count: number): number {
  let offset = 0;
  for (let seen = 0; seen < count && offset < text.length; offset++) {
    if (text.data[offset] !== GUARD) seen++;
  }
  return offset;
}

export interface Slot {
  kind: 'text' | 'atom' | 'break';
  node: Node;
  start: number;
  length: number;
  /** The block the slot belongs to; for a block atom, the atom itself. */
  block: Element;
  /** The point at which the slot is fully behind the caret. */
  end: Point;
  /** Where a caret at the slot's start sits. */
  caret: Point;
}

const LISTS = new Set(['UL', 'OL']);
// Stray blocks a browser or a paste leaves behind, read as blocks until the next tidy rewrites them
const BLOCKISH = new Set([
  'DIV', 'H3', 'H4', 'H5', 'H6', 'SECTION', 'ARTICLE', 'HEADER', 'FOOTER', 'ASIDE', 'NAV', 'MAIN', 'ADDRESS', 'FIGURE',
  'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TD', 'TH', 'CENTER', 'DL', 'DT', 'DD',
]);

export const isList = (node: Node | null): boolean => node instanceof Element && LISTS.has(node.tagName);

export function isBlockish(schema: Schema, el: Element) {
  return isLeafTag(schema, el.tagName) || BLOCKISH.has(el.tagName) || isList(el);
}

const indexIn = (node: Node) => Array.prototype.indexOf.call(node.parentNode!.childNodes, node) as number;

/** Where a block's own content stops: before any nested list. */
export function contentEnd(block: Element): number {
  const list = Array.from(block.childNodes).findIndex(isList);
  return list === -1 ? block.childNodes.length : list;
}

export function slots(root: Element, schema: Schema): Slot[] {
  const out: Slot[] = [];
  let at = 0;
  const push = (slot: Omit<Slot, 'start'>) => {
    out.push({...slot, start: at});
    at += slot.length;
  };

  const inline = (node: Node, block: Element) => {
    node.childNodes.forEach(child => {
      if (child instanceof Text) {
        push({kind: 'text', node: child, length: textLength(child.data), block, end: [child, child.length], caret: [child, 0]});
      } else if (child instanceof Element) {
        if (isList(child) || child.tagName === 'BR') return;
        if (atomOf(schema, child) || (child as HTMLElement).contentEditable === 'false') {
          const i = indexIn(child);
          push({kind: 'atom', node: child, length: 1, block, end: [node, i + 1], caret: [node, i]});
        } else {
          inline(child, block);
        }
      }
    });
  };

  const leaf = (block: Element) => {
    inline(block, block);
    const end = contentEnd(block);
    let caret = end;
    while (caret > 0 && (block.childNodes[caret - 1] as Element).tagName === 'BR') caret--;
    push({kind: 'break', node: block, length: 1, block, end: [block, end], caret: [block, caret]});
    Array.from(block.children).filter(isList).forEach(list => Array.from(list.children).forEach(leaf));
  };

  const container = (parent: Element) => {
    // Inline content sitting straight in the root reads as one block per run
    let run: Node[] = [];
    const flush = () => {
      if (!run.length) return;
      const last = run[run.length - 1];
      run.forEach(node => {
        if (node instanceof Text) {
          push({kind: 'text', node, length: textLength(node.data), block: parent, end: [node, node.length], caret: [node, 0]});
        } else if (node instanceof Element && atomOf(schema, node)) {
          const i = indexIn(node);
          push({kind: 'atom', node, length: 1, block: parent, end: [parent, i + 1], caret: [parent, i]});
        } else {
          inline(node, parent);
        }
      });
      const i = indexIn(last) + 1;
      push({kind: 'break', node: parent, length: 1, block: parent, end: [parent, i], caret: [parent, i]});
      run = [];
    };

    parent.childNodes.forEach(child => {
      if (!(child instanceof Element)) {
        if (child instanceof Text) run.push(child);
        return;
      }
      if (isList(child)) {
        flush();
        Array.from(child.children).forEach(leaf);
      } else if (atomOf(schema, child)?.block) {
        flush();
        const i = indexIn(child);
        push({kind: 'atom', node: child, length: 1, block: child, end: [parent, i + 1], caret: [parent, i]});
      } else if (isBlockish(schema, child)) {
        flush();
        leaf(child);
      } else if (child.tagName !== 'BR') {
        run.push(child);
      }
    });
    flush();
  };

  container(root);
  return out;
}

export function length(root: Element, schema: Schema) {
  const all = slots(root, schema);
  const last = all[all.length - 1];
  return last ? last.start + last.length : 0;
}

export function pointToIndex(root: Element, schema: Schema, node: Node, offset: number): number {
  const range = document.createRange();
  range.setStart(node, offset);
  let index = 0;
  for (const slot of slots(root, schema)) {
    if (slot.kind === 'text' && slot.node === node) return slot.start + textLength((node as Text).data.slice(0, offset));
    const order = range.comparePoint(...slot.end);
    // A caret at the end of a block's content sits before its line break, not after it
    if (order < 0 || (order === 0 && slot.kind !== 'break')) {
      index = slot.start + slot.length;
    } else {
      break;
    }
  }
  return index;
}

export function indexToPoint(root: Element, schema: Schema, index: number): Point {
  const all = slots(root, schema);
  for (const slot of all) {
    if (slot.kind === 'text' && index <= slot.start + slot.length) {
      if (index >= slot.start) return [slot.node, domOffset(slot.node as Text, index - slot.start)];
    } else if (slot.kind !== 'text' && index === slot.start) {
      return slot.caret;
    }
  }
  const last = all[all.length - 1];
  return last ? last.caret : [root, 0];
}

export function toRange(root: Element, schema: Schema, index: number, len = 0): Range {
  const range = document.createRange();
  range.setStart(...indexToPoint(root, schema, index));
  range.setEnd(...indexToPoint(root, schema, index + len));
  return range;
}

export interface Line {
  block: Element;
  start: number;
  /** The index of the block's line break, or the atom's own index. */
  end: number;
  atom: boolean;
}

/** Each block and block atom in order, with the span of indexes it covers. */
export function lines(root: Element, schema: Schema): Line[] {
  const out: Line[] = [];
  let start = 0;
  for (const slot of slots(root, schema)) {
    if (slot.kind === 'break') {
      out.push({block: slot.block, start, end: slot.start, atom: false});
      start = slot.start + 1;
    } else if (slot.kind === 'atom' && slot.block === slot.node) {
      out.push({block: slot.block, start: slot.start, end: slot.start, atom: true});
      start = slot.start + 1;
    }
  }
  return out;
}

export function lineAt(root: Element, schema: Schema, index: number): Line | undefined {
  const all = lines(root, schema);
  return all.find(line => index >= line.start && index <= line.end) ?? all[all.length - 1];
}

export function linesIn(root: Element, schema: Schema, index: number, len: number): Line[] {
  const end = index + len;
  return lines(root, schema).filter(line =>
    len === 0 ? line.start <= index && index <= line.end : line.start < end && line.end >= index);
}

export function textOf(root: Element, schema: Schema): string {
  return slots(root, schema).map(slot =>
    slot.kind === 'text' ? (slot.node as Text).data.replace(GUARDS, '').replace(/\u00a0/g, ' ') : slot.kind === 'atom' ? '\ufffc' : '\n').join('');
}
