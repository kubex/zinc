import {atomOf, inlineFormatOf, isLeafTag} from './extension';
import {contentEnd, GUARD, isBlockish, isList} from './positions';
import DOMPurify from 'dompurify';
import type {AtomFormat, InlineFormat, Schema} from './extension';

// Removed with their contents rather than unwrapped
const DROPPED = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT', 'TITLE', 'HEAD', 'META', 'LINK', 'OBJECT', 'EMBED',
  'IFRAME', 'SVG', 'MATH', 'SELECT', 'TEXTAREA', 'BUTTON', 'INPUT']);

interface Context {
  container: ParentNode;
  /** Tag for a block opened by loose inline content. */
  leafTag: string;
  marks: Element[];
  pre: boolean;
  /** Shared by inline descendants, so a mark's text lands in the block its parent opened. */
  cur: {leaf: Element | null};
}

function copyAttributes(from: Element, to: Element, names: string[] = []) {
  names.forEach(name => {
    const value = from.getAttribute(name);
    if (value !== null) to.setAttribute(name, value);
  });
}

function copyClasses(from: Element, to: Element, prefixes: string[]) {
  from.classList.forEach(name => {
    if (prefixes.some(prefix => name.startsWith(prefix))) to.classList.add(name);
  });
}

function cloneInline(format: InlineFormat, el: Element) {
  // Rebuilt from its value, so only what the format writes survives, e.g. a colour without other styles
  if (format.create && format.value) return format.create(format.value(el));
  const copy = document.createElement(format.tag);
  copyAttributes(el, copy, format.attributes);
  return copy;
}

function cloneAtom(atom: AtomFormat, el: Element) {
  const copy = el.cloneNode(true) as Element;
  Array.from(copy.attributes).forEach(attr => {
    if (!atom.attributes?.includes(attr.name)) copy.removeAttribute(attr.name);
  });
  return copy;
}

const inList = (ctx: Context) => isList(ctx.container as Node);

function openLeaf(ctx: Context, tag: string): Element {
  const leaf = document.createElement(inList(ctx) ? 'LI' : tag);
  ctx.container.append(leaf);
  ctx.cur.leaf = leaf;
  return leaf;
}

function appendInline(ctx: Context, node: Node) {
  const leaf = ctx.cur.leaf ?? openLeaf(ctx, ctx.leafTag);
  let wrapped = node;
  for (let i = ctx.marks.length - 1; i >= 0; i--) {
    const mark = ctx.marks[i].cloneNode(false);
    mark.appendChild(wrapped);
    wrapped = mark;
  }
  leaf.insertBefore(wrapped, leaf.childNodes[contentEnd(leaf)] ?? null);
}

const hasContent = (leaf: Element) => Array.from(leaf.childNodes)
  .slice(0, contentEnd(leaf))
  .some(node => node instanceof Element ? node.tagName !== 'BR' : !!node.textContent);

function walk(node: ParentNode, ctx: Context, schema: Schema, collapse: boolean) {
  Array.from(node.childNodes).forEach(child => visit(child, ctx, schema, collapse));
}

function visit(child: Node, ctx: Context, schema: Schema, collapse: boolean) {
  if (child instanceof Text) {
    let text = child.data;
    if (collapse && !ctx.pre) {
      text = text.replace(/[\t\n\r ]+/g, ' ');
      if (!ctx.cur.leaf && !text.trim()) return;
    }
    if (text) appendInline(ctx, document.createTextNode(text));
    return;
  }
  if (!(child instanceof Element)) return;

  const tag = child.tagName;
  const atom = atomOf(schema, child);
  if (atom) {
    if (!atom.block) {
      appendInline(ctx, cloneAtom(atom, child));
    } else if (!inList(ctx)) {
      ctx.cur.leaf = null;
      ctx.container.append(cloneAtom(atom, child));
    }
    return;
  }
  if (DROPPED.has(tag)) return;

  if (tag === 'BR') {
    // A break ends the line; a run of them leaves empty lines behind
    if (!ctx.cur.leaf) openLeaf(ctx, ctx.leafTag);
    ctx.cur.leaf = null;
    return;
  }

  if (isList(child) && schema.lists) {
    let parent: ParentNode = ctx.container;
    if (ctx.cur.leaf?.tagName === 'LI') {
      parent = ctx.cur.leaf;
    } else if (inList(ctx)) {
      // A list straight inside a list nests under the item before it
      parent = (ctx.container as Element).lastElementChild ?? openLeaf(ctx, 'LI');
    }
    const list = document.createElement(tag);
    if (child.hasAttribute('data-checklist') && tag === 'UL') list.setAttribute('data-checklist', '');
    parent.appendChild(list);
    walk(child, {container: list, leafTag: 'LI', marks: [], pre: false, cur: {leaf: null}}, schema, collapse);
    ctx.cur.leaf = null;
    return;
  }

  if (isBlockish(schema, child)) {
    const own = isLeafTag(schema, tag) && tag !== 'LI' ? tag : null;
    // A paragraph inside a quote or code block takes that block's tag
    const target = own === 'P' || !own ? ctx.leafTag : own;
    const current = ctx.cur.leaf;
    // A block wrapped straight inside an item, or as the first line of a quote, is that block's content
    const reuse = current && !hasContent(current) && (current.tagName === 'LI' || current.tagName === target);
    const leaf = reuse ? current : openLeaf(ctx, tag === 'LI' && inList(ctx) ? 'LI' : target);
    if (leaf.tagName === 'LI') copyAttributes(child, leaf, ['data-checked']);
    copyClasses(child, leaf, schema.blockClasses);
    const keepsTag = leaf.tagName === 'BLOCKQUOTE' || leaf.tagName === 'PRE';
    walk(child, {
      container: ctx.container,
      leafTag: keepsTag ? leaf.tagName : (inList(ctx) ? 'LI' : 'P'),
      marks: [],
      pre: leaf.tagName === 'PRE',
      cur: ctx.cur,
    }, schema, collapse);
    ctx.cur.leaf = null;
    return;
  }

  const format = inlineFormatOf(schema, child);
  // A code block is plain text
  if (format && !ctx.pre) {
    walk(child, {...ctx, marks: [...ctx.marks, cloneInline(format, child)]}, schema, collapse);
  } else {
    walk(child, ctx, schema, collapse);
  }
}

function sameShell(a: Node, b: Node) {
  return a instanceof Element && b instanceof Element && a.cloneNode(false).isEqualNode(b.cloneNode(false));
}

// Inline only: nested lists and their items are leaves of their own, and neighbouring items must stay apart
function mergeMarks(el: Element, schema: Schema) {
  el.normalize();
  let child = el.firstChild;
  while (child) {
    const next = child.nextSibling;
    if (next && sameShell(child, next) && !isBlockish(schema, child as Element)) {
      (child as Element).append(...Array.from(next.childNodes));
      next.remove();
      continue;
    }
    child = next;
  }
  Array.from(el.children).filter(c => !isBlockish(schema, c)).forEach(c => mergeMarks(c, schema));
  el.normalize();
}

function trimEdges(leaf: Element) {
  const texts = textNodes(leaf);
  if (texts[0]) texts[0].data = texts[0].data.replace(/^ +/, '');
  const last = texts[texts.length - 1];
  if (last) last.data = last.data.replace(/ +$/, '');
}

function textNodes(root: Node): Text[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const texts: Text[] = [];
  while (walker.nextNode()) texts.push(walker.currentNode as Text);
  return texts;
}

/** Takes the caret guards out, along with any the text picked up from elsewhere. */
export function dropGuards(root: Node) {
  textNodes(root).forEach(text => {
    if (!text.data.includes(GUARD)) return;
    text.data = text.data.split(GUARD).join('');
    if (!text.data) text.remove();
  });
}

// Each inline atom in the leaf gets text on both sides, a guard where there is none
function guardAtoms(leaf: Element, schema: Schema) {
  leaf.querySelectorAll('*').forEach(el => {
    const atom = atomOf(schema, el);
    if (!atom || atom.block || el.parentElement?.closest('[contenteditable="false"]')) return;
    if (!(el.previousSibling instanceof Text)) el.before(GUARD);
    if (!(el.nextSibling instanceof Text)) el.after(GUARD);
  });
}

function finish(container: ParentNode, schema: Schema, collapse: boolean) {
  container.querySelectorAll('li, p, ' + [...schema.blocks.keys()].join(', ')).forEach(leaf => {
    dropGuards(leaf);
    if (collapse && leaf.tagName !== 'PRE') trimEdges(leaf);
    mergeMarks(leaf, schema);
    leaf.querySelectorAll('*').forEach(el => {
      if (isBlockish(schema, el) || atomOf(schema, el) || el.tagName === 'BR') return;
      if (!el.textContent && !el.childElementCount) el.remove();
    });
    guardAtoms(leaf, schema);
    if (!hasContent(leaf)) {
      leaf.querySelectorAll(':scope > br').forEach(br => br.remove());
      leaf.insertBefore(document.createElement('br'), leaf.childNodes[contentEnd(leaf)] ?? null);
    }
  });

  container.querySelectorAll('ul, ol').forEach(list => {
    const checklist = list.hasAttribute('data-checklist');
    Array.from(list.children).forEach(item => {
      if (checklist && !item.hasAttribute('data-checked')) item.setAttribute('data-checked', 'false');
      if (!checklist) item.removeAttribute('data-checked');
    });
  });
  // Neighbouring lists of the same kind are one list
  container.querySelectorAll('ul, ol').forEach(list => {
    let next = list.nextElementSibling;
    while (next && sameShell(list, next)) {
      list.append(...Array.from(next.childNodes));
      next.remove();
      next = list.nextElementSibling;
    }
  });
  container.querySelectorAll('ul:empty, ol:empty').forEach(list => list.remove());
}

/**
 * Fits arbitrary markup to the schema: one block per line, marks only inside blocks, lists holding only items.
 * `collapse` applies HTML's whitespace rules, for markup from outside the editor.
 */
export function structure(source: ParentNode, schema: Schema, collapse = false): DocumentFragment {
  const out = document.createDocumentFragment();
  walk(source, {container: out, leafTag: 'P', marks: [], pre: false, cur: {leaf: null}}, schema, collapse);
  finish(out, schema, collapse);
  if (!out.childNodes.length) out.append(Object.assign(document.createElement('p'), {innerHTML: '<br>'}));
  return out;
}

/** Sanitises HTML from outside the editor and fits it to the schema. */
export function parse(html: string, schema: Schema): DocumentFragment {
  const clean = DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    ADD_TAGS: schema.tags,
    ADD_ATTR: ['target', 'contenteditable', 'allowfullscreen', 'frameborder'],
    FORBID_TAGS: ['style'],
  });
  schema.extensions.forEach(ext => ext.parse?.(clean));
  return structure(clean, schema, true);
}

/** The content as saved: extensions rewrite a copy, and an empty document is an empty string. */
export function serialize(root: Element, schema: Schema): string {
  const copy = root.cloneNode(true) as Element;
  dropGuards(copy);
  // Browsers type a lone space as &nbsp; at a line's edge or beside an embed; saved, it would stop the line wrapping
  const walker = document.createTreeWalker(copy, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const text = walker.currentNode as Text;
    text.data = text.data.replace(/(?<![ \u00a0])\u00a0(?![ \u00a0])/g, ' ');
  }
  schema.extensions.forEach(ext => ext.serialize?.(copy));
  return isEmptyDocument(copy) ? '' : copy.innerHTML;
}

/** A single empty paragraph: no text and no embeds. */
export function isEmptyDocument(root: Element): boolean {
  return root.children.length === 1 && root.firstElementChild!.tagName === 'P' && !root.textContent
    && !root.querySelector('img, iframe, hr, [contenteditable="false"]');
}
