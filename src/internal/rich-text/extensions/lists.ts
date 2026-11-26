import {createList, indent, liftItem, listKind, outdent, splitBlock, toItem} from '../blocks';
import {isList} from '../positions';
import type {Extension, LineContext} from '../extension';
import type {ListKind} from '../blocks';
import type RichEditor from '../rich-editor';

const plain = (block: Element) => block.tagName === 'P';

/**
 * Quill's list markup as nested lists. Quill marked each item's kind with `data-list` and, in the markup it edited
 * in, kept every item of a run in one flat `<ol>` with its depth as a `ql-indent-N` class.
 */
function rebuildQuillList(list: Element) {
  const out = document.createDocumentFragment();
  const levels: Element[] = [];
  Array.from(list.children).forEach(item => {
    const kind = item.getAttribute('data-list') ?? (list.tagName === 'OL' ? 'ordered' : 'bullet');
    const shape: ListKind = kind === 'ordered' ? 'ordered' : kind === 'bullet' ? 'bullet' : 'checked';
    const indentClass = Array.from(item.classList).find(c => /^ql-indent-\d+$/.test(c));
    // One level deeper than the item before at most, so every nested list has an item to hang from
    const depth = Math.min(Number(indentClass?.slice(10) ?? 0), levels.length);
    if (indentClass) item.classList.remove(indentClass);
    if (!item.classList.length) item.removeAttribute('class');
    item.removeAttribute('data-list');
    if (shape === 'checked') item.setAttribute('data-checked', String(kind === 'checked'));

    levels.length = depth + 1;
    if (levels[depth] && listKind(levels[depth]) !== shape) levels.length = depth;
    if (!levels[depth]) {
      levels[depth] = createList(shape);
      if (depth === 0) out.append(levels[depth]);
      else levels[depth - 1].lastElementChild!.append(levels[depth]);
    }
    levels[depth].append(item);
  });
  list.replaceWith(out);
}

/** An item holding only a deeper list, as Quill wrote one that skipped a level, would show as an empty bullet. */
function liftEmptyWrapper(item: Element) {
  const nested = Array.from(item.children).filter(isList);
  const ownContent = Array.from(item.childNodes).some(node =>
    node instanceof Element ? !isList(node) && node.tagName !== 'BR' : !!node.textContent?.trim());
  if (!nested.length || ownContent || nested.some(list => list.tagName !== item.parentElement?.tagName)) return;
  item.replaceWith(...nested.flatMap(list => Array.from(list.children)));
}

function setList(blocks: Element[], value: unknown) {
  const kind = value as ListKind | false;
  if (!kind || blocks.every(block => block.tagName === 'LI' && listKind(block.parentElement!) === kind)) {
    blocks.filter(block => block.tagName === 'LI').reverse().forEach(liftItem);
    return;
  }
  blocks.forEach(block => toItem(block, kind));
}

function listValue(blocks: Element[]): ListKind | undefined {
  if (!blocks.every(block => block.tagName === 'LI')) return undefined;
  const kinds = blocks.map(block => listKind(block.parentElement!));
  return kinds.every(kind => kind === kinds[0]) ? kinds[0] : undefined;
}

// An empty item steps out a level, then out of the list
function leave({block, index}: LineContext): number | null {
  if (block.tagName !== 'LI') return null;
  if (!outdent(block)) liftItem(block);
  return index;
}

function indentItems(editor: RichEditor, direction: 1 | -1): boolean {
  const items = editor.getLines().filter(block => block.tagName === 'LI');
  if (!items.length) return false;
  editor.transact(() => {
    if (direction === 1) items.forEach(indent);
    else items.reverse().forEach(outdent);
  });
  return true;
}

// Clicks in an item's start padding, where the checkbox is drawn, toggle it
function toggleCheck(editor: RichEditor) {
  const onPointerDown = (e: PointerEvent) => {
    const item = (e.target as Element).closest?.('ul[data-checklist] > li');
    if (!item || !editor.root.contains(item)) return;
    const box = item.getBoundingClientRect();
    const style = getComputedStyle(item);
    const pad = parseFloat(style.paddingInlineStart);
    const onBox = style.direction === 'rtl' ? e.clientX >= box.right - pad : e.clientX <= box.left + pad;
    if (!onBox) return;
    e.preventDefault();
    editor.transact(() => item.setAttribute('data-checked', String(item.getAttribute('data-checked') !== 'true')));
  };
  editor.root.addEventListener('pointerdown', onPointerDown);
  return () => editor.root.removeEventListener('pointerdown', onPointerDown);
}

/** Bulleted, numbered and check lists. Tab and Shift+Tab nest items; `- `, `1. ` and `[] ` start a list. */
export const lists: Extension = {
  name: 'lists',
  lists: true,
  lineFormats: [{name: 'list', apply: setList, value: listValue}],
  release: block => block.tagName === 'LI' ? liftItem(block) : null,
  enter: line => {
    if (line.block.tagName !== 'LI') return null;
    if (line.start === line.end) return leave(line);
    const next = splitBlock(line.block, ...line.point, 'LI');
    if (listKind(line.block.parentElement!) === 'checked') next.setAttribute('data-checked', 'false');
    return line.index + 1;
  },
  backspace: leave,
  parse: root => {
    root.querySelectorAll('.ql-ui').forEach(el => el.remove());
    root.querySelectorAll('ul, ol').forEach(list => {
      if (list.querySelector(':scope > li[data-list]')) rebuildQuillList(list);
    });
    root.querySelectorAll('li').forEach(liftEmptyWrapper);
  },
  keys: [
    {key: 'Tab', run: editor => indentItems(editor, 1)},
    {key: 'Tab', shift: true, run: editor => indentItems(editor, -1)},
  ],
  inputRules: [
    {match: /^[-*] $/, when: plain, run: (editor, index) => editor.formatText(index, 0, 'list', 'bullet')},
    {match: /^1[.)] $/, when: plain, run: (editor, index) => editor.formatText(index, 0, 'list', 'ordered')},
    {match: /^\[ ?\] $/, when: plain, run: (editor, index) => editor.formatText(index, 0, 'list', 'checked')},
  ],
  init: toggleCheck,
};
