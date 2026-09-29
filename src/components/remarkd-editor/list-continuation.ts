/** A textarea edit: the new value and where the caret lands in it. */
export interface TextEdit {
  value: string;
  caret: number;
}

// Nesting depth is the marker's repeat count (`--`, `**`) or dot count (`1.2.`), never indentation.
const LIST_ITEM = /^(-+|\*+|((?:\d+\.)+)) (\[[ xX_*]\] )?/;
const ORDERED_PATH = /^(?:\d+\.)+(?= )/;
// `::` must end the line or be followed by a space, so macros (`include::x[]`) never match.
const DEFINITION = /^[^:\s][^\n]*?::(?: |$)/;

// Code, listing and literal blocks — their content is verbatim, so a `- ` there is not a list.
// A `----`/`....` delimiter is the whole line; `---- x` is a fourth-level bullet.
const VERBATIM_DELIMITER = /^(?:`{3,}|-{4,} *$|\.{4,} *$)/;

function insideVerbatim(before: string): boolean {
  return before.split('\n').filter(line => VERBATIM_DELIMITER.test(line)).length % 2 === 1;
}

/** A new checklist item starts unticked, keeping the editable/readonly kind of the one above. */
function nextCheckbox(box: string): string {
  return box === '[_] ' || box === '[*] ' ? '[_] ' : '[ ] ';
}

/** Whether `line` is a list marker with nothing after it — `- `, `2. `, `- [ ] `, or a bare `::`. */
export function isEmptyListItem(line: string): boolean {
  if (line.trim() === '::') return true;
  const item = LIST_ITEM.exec(line);
  return !!item && line.slice(item[0].length).trim() === '';
}

/**
 * What Enter does on a list line: continues the list with the next marker, or ends it by
 * clearing the marker of an item that has no text. Null when Enter should just insert a
 * newline — no list line, a selection, or the caret before the marker.
 */
export function continueList(value: string, start: number, end: number): TextEdit | null {
  if (start !== end) return null;

  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  const newline = value.indexOf('\n', start);
  const lineEnd = newline === -1 ? value.length : newline;
  const line = value.slice(lineStart, lineEnd);

  if (insideVerbatim(value.slice(0, lineStart))) return null;
  if (isEmptyListItem(line)) {
    return {value: value.slice(0, lineStart) + value.slice(lineEnd), caret: lineStart};
  }

  const item = LIST_ITEM.exec(line);
  const definition = item ? null : DEFINITION.exec(line);
  const marker = item?.[0] ?? definition?.[0];
  if (!marker || start - lineStart < marker.length) return null;

  if (definition) {
    // The caret goes before `::` — the term is typed first.
    return {value: `${value.slice(0, start)}\n:: ${value.slice(start).replace(/^ +/, '')}`, caret: start + 1};
  }

  const [, bullet, ordinal, box] = item!;
  const own = ordinal ? parsePath(ordinal) : null;
  const path = own && nextPath(own, own.length);
  const next = (path ? formatPath(path) : bullet) + ' ' + (box ? nextCheckbox(box) : '');
  const head = `${value.slice(0, start)}\n${next}`;
  const edited = head + value.slice(start).replace(/^ +/, '');
  if (!path) return {value: edited, caret: head.length};

  const lines = edited.split('\n');
  renumber(lines, head.split('\n').length);
  return {value: lines.join('\n'), caret: head.length};
}

/** The numbers of an ordered marker: `1.2.` is `[1, 2]`. */
function parsePath(marker: string): number[] {
  return marker.split('.').filter(Boolean).map(Number);
}

function formatPath(path: number[]): string {
  return path.map(n => `${n}.`).join('');
}

/** The marker of the ordered item at `depth` that follows the one numbered `previous`. */
function nextPath(previous: number[], depth: number): number[] {
  if (depth <= previous.length) return [...previous.slice(0, depth - 1), previous[depth - 1] + 1];
  return [...previous, ...Array<number>(depth - previous.length).fill(1)];
}

/** The number of the nearest ordered item above line `i` in the same list, passing over nested bullets. */
function orderedAbove(lines: string[], i: number): number[] | null {
  for (let j = i - 1; j >= 0; j--) {
    const item = LIST_ITEM.exec(lines[j]);
    if (!item) return null;
    if (item[2]) return parsePath(item[2]);
  }
  return null;
}

/**
 * Renumbers the ordered items from line `from` on as an outline counting on from the item above,
 * so the source stays in step with the rendered numbering. Bullet items nested among them are
 * passed over; any other line ends the list. With no ordered item above, the first keeps its
 * number.
 */
function renumber(lines: string[], from: number) {
  let path = orderedAbove(lines, from);
  for (let i = from; i < lines.length; i++) {
    const item = LIST_ITEM.exec(lines[i]);
    if (!item) break;
    if (!item[2]) continue;
    const own = parsePath(item[2]);
    path = path ? nextPath(path, own.length) : own;
    lines[i] = lines[i].replace(ORDERED_PATH, formatPath(path));
  }
}

/** A textarea edit that keeps a selection: the new value and the selected range in it. */
export interface RangeEdit {
  value: string;
  start: number;
  end: number;
}

// The parser caps bullet depth at ten marker characters.
const MAX_BULLET_DEPTH = 10;

/**
 * What Tab (or Shift+Tab when `outdent`) does on the list items the selection touches: nests
 * each one level deeper or shallower, renumbering the ordered items that follow. Null when no
 * list item is touched, so Tab keeps its default. Items already at the limit are left as they
 * are, but the key is still claimed.
 */
export function indentList(value: string, start: number, end: number, outdent: boolean): RangeEdit | null {
  const firstStart = value.lastIndexOf('\n', start - 1) + 1;
  if (insideVerbatim(value.slice(0, firstStart))) return null;
  // A selection ending at the start of a line does not touch that line.
  const last = end > start && value[end - 1] === '\n' ? end - 1 : end;

  const before = value.split('\n');
  const lines = [...before];
  const first = value.slice(0, firstStart).split('\n').length - 1;
  const lastIndex = value.slice(0, last).split('\n').length - 1;

  let touched = false;
  let renumberFrom = -1;
  for (let i = first; i <= lastIndex; i++) {
    const item = LIST_ITEM.exec(lines[i]);
    if (!item) continue;
    touched = true;
    const [, bullet, ordinal] = item;
    if (ordinal) {
      const own = parsePath(ordinal);
      // An item nests at most one level below the item above it.
      const deepest = (orderedAbove(lines, i)?.length ?? 0) + 1;
      if (outdent ? own.length === 1 : own.length >= deepest) continue;
      lines[i] = lines[i].replace(ORDERED_PATH, formatPath(outdent ? own.slice(0, -1) : [...own, 1]));
      if (renumberFrom === -1) renumberFrom = i;
    } else if (outdent ? bullet.length > 1 : bullet.length < MAX_BULLET_DEPTH) {
      lines[i] = outdent ? lines[i].slice(1) : bullet[0] + lines[i];
    }
  }
  if (!touched) return null;
  if (renumberFrom !== -1) renumber(lines, renumberFrom);

  const move = (pos: number) => {
    let oldAt = 0;
    let newAt = 0;
    for (let i = 0; i < before.length; i++) {
      const oldEnd = oldAt + before[i].length;
      if (pos <= oldEnd) {
        const delta = lines[i].length - before[i].length;
        return pos > oldAt ? Math.max(newAt, pos + (newAt - oldAt) + delta) : newAt;
      }
      oldAt = oldEnd + 1;
      newAt += lines[i].length + 1;
    }
    return pos;
  };
  return {value: lines.join('\n'), start: move(start), end: move(end)};
}
