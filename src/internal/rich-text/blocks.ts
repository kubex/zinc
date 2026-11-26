import {contentEnd, isList} from './positions';

export type ListKind = 'bullet' | 'ordered' | 'checked';

export function listKind(list: Element): ListKind {
  if (list.tagName === 'OL') return 'ordered';
  return list.hasAttribute('data-checklist') ? 'checked' : 'bullet';
}

export function createList(kind: ListKind): Element {
  const list = document.createElement(kind === 'ordered' ? 'ol' : 'ul');
  if (kind === 'checked') list.setAttribute('data-checklist', '');
  return list;
}

const nestedLists = (item: Element) => Array.from(item.children).filter(isList);

/** Moves a block's own content (not its nested lists) into another block, at the end of that block's content. */
export function moveContent(from: Element, to: Element) {
  to.querySelectorAll(':scope > br').forEach(br => br.remove());
  const nodes = Array.from(from.childNodes).slice(0, contentEnd(from)).filter(node => (node as Element).tagName !== 'BR');
  const before = to.childNodes[contentEnd(to)] ?? null;
  nodes.forEach(node => to.insertBefore(node, before));
}

export function rename(block: Element, tag: string): Element {
  if (block.tagName === tag) return block;
  const el = document.createElement(tag);
  // A block's classes are its layout, such as alignment, which outlasts a change of tag
  if (block.className) el.className = block.className;
  el.append(...Array.from(block.childNodes));
  block.replaceWith(el);
  return el;
}

/** Moves a nested item up one level, taking the items after it along as its own children. */
export function outdent(item: Element): boolean {
  const list = item.parentElement!;
  const parentItem = list.parentElement;
  if (parentItem?.tagName !== 'LI') return false;
  const rest = [];
  for (let next = item.nextElementSibling; next; next = next.nextElementSibling) rest.push(next);
  if (rest.length) {
    const sub = nestedLists(item).find(el => el.tagName === list.tagName) ?? item.appendChild(list.cloneNode(false) as Element);
    sub.append(...rest);
  }
  parentItem.after(item);
  if (!list.children.length) list.remove();
  return true;
}

/** Nests an item under the one before it. */
export function indent(item: Element): boolean {
  const previous = item.previousElementSibling;
  if (previous?.tagName !== 'LI') return false;
  const list = item.parentElement!;
  const last = previous.lastElementChild;
  const sub = last && isList(last) ? last : previous.appendChild(list.cloneNode(false) as Element);
  sub.append(item);
  return true;
}

/** Turns an item back into a paragraph, splitting its list around it. Its nested lists follow it at the top level. */
export function liftItem(item: Element): Element {
  while (outdent(item)) { /* up to the outermost list */ }
  const list = item.parentElement!;
  const rest = [];
  for (let next = item.nextElementSibling; next; next = next.nextElementSibling) rest.push(next);
  if (rest.length) {
    const after = list.cloneNode(false) as Element;
    after.append(...rest);
    list.after(after);
  }
  const nested = nestedLists(item);
  const p = document.createElement('p');
  p.append(...Array.from(item.childNodes).filter(node => !nested.includes(node as Element)));
  list.after(p);
  p.after(...nested);
  item.remove();
  if (!list.children.length) list.remove();
  return p;
}

/** Turns a block into an item of a list of `kind`, joining a list of that kind just before it. */
export function toItem(block: Element, kind: ListKind): Element {
  if (block.tagName === 'LI') {
    const list = block.parentElement!;
    if (listKind(list) === kind) return block;
    const replacement = createList(kind);
    replacement.append(...Array.from(list.childNodes));
    list.replaceWith(replacement);
    return block;
  }
  const item = document.createElement('li');
  item.append(...Array.from(block.childNodes));
  const previous = block.previousElementSibling;
  if (previous && isList(previous) && listKind(previous) === kind) {
    previous.append(item);
    block.remove();
  } else {
    const list = createList(kind);
    list.append(item);
    block.replaceWith(list);
  }
  return item;
}

/** Splits a block at a point, returning the new block after it, which holds everything past the point. */
export function splitBlock(block: Element, node: Node, offset: number, tag = block.tagName): Element {
  const range = document.createRange();
  range.setStart(node, offset);
  range.setEnd(block, contentEnd(block));
  const tail = range.extractContents();
  const next = document.createElement(tag);
  if (block.className) next.className = block.className;
  next.append(tail);
  const firstNested = nestedLists(block)[0];
  if (block.tagName === 'LI' && firstNested) {
    firstNested.prepend(next);
  } else {
    block.after(next);
  }
  return next;
}

/** Lifts a node out of an ancestor mark, splitting the mark around it. */
export function unwrapFrom(node: Node, mark: Element) {
  const before = document.createRange();
  before.setStart(mark, 0);
  before.setEndBefore(node);
  if (!before.collapsed) {
    const copy = mark.cloneNode(false) as Element;
    copy.append(before.extractContents());
    mark.before(copy);
  }
  const after = document.createRange();
  after.setStartAfter(node);
  after.setEnd(mark, mark.childNodes.length);
  if (!after.collapsed) {
    const copy = mark.cloneNode(false) as Element;
    copy.append(after.extractContents());
    mark.after(copy);
  }
  mark.replaceWith(...Array.from(mark.childNodes));
}
