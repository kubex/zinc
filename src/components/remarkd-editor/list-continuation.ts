/** A textarea edit: the new value and where the caret lands in it. */
export interface TextEdit {
  value: string;
  caret: number;
}

// Nesting depth is the marker's repeat count (`--`, `**`), never indentation.
const LIST_ITEM = /^(-+|\*+|(\d+)\.) (\[[ xX_*]\] )?/;
const ORDERED_ITEM = /^(\d+)\. /;
// `::` must end the line or be followed by a space, so macros (`include::x[]`) never match.
const DEFINITION = /^[^:\s][^\n]*?::(?: |$)/;

// Code, listing and literal blocks — their content is verbatim, so a `- ` there is not a list.
const VERBATIM_DELIMITER = /^(`{3,}|-{4,}|\.{4,})/;

function insideVerbatim(before: string): boolean {
  return before.split('\n').filter(line => VERBATIM_DELIMITER.test(line)).length % 2 === 1;
}

/** A new checklist item starts unticked, keeping the editable/readonly kind of the one above. */
function nextCheckbox(box: string): string {
  return box === '[_] ' || box === '[*] ' ? '[_] ' : '[ ] ';
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
  const clearLine = {value: value.slice(0, lineStart) + value.slice(lineEnd), caret: lineStart};
  // The bare `:: ` a definition continuation leaves behind.
  if (line.trim() === '::') return clearLine;

  const item = LIST_ITEM.exec(line);
  const definition = item ? null : DEFINITION.exec(line);
  const marker = item?.[0] ?? definition?.[0];
  if (!marker || start - lineStart < marker.length) return null;
  if (item && line.slice(marker.length).trim() === '') return clearLine;

  if (definition) {
    // The caret goes before `::` — the term is typed first.
    return {value: `${value.slice(0, start)}\n:: ${value.slice(start).replace(/^ +/, '')}`, caret: start + 1};
  }

  const [, bullet, ordinal, box] = item!;
  const next = (ordinal ? `${Number(ordinal) + 1}.` : bullet) + ' ' + (box ? nextCheckbox(box) : '');
  const head = `${value.slice(0, start)}\n${next}`;
  const rest = value.slice(start).replace(/^ +/, '');
  const tail = ordinal ? renumber(rest, Number(ordinal) + 2) : rest;
  return {value: head + tail, caret: head.length};
}

/**
 * Shifts the ordered items that directly follow the split line up by one, so the source keeps
 * counting in step. `text` starts with the rest of the split line, which is left alone.
 */
function renumber(text: string, from: number): string {
  const lines = text.split('\n');
  for (let i = 1, n = from; i < lines.length; i++, n++) {
    if (!ORDERED_ITEM.test(lines[i])) break;
    lines[i] = lines[i].replace(ORDERED_ITEM, `${n}. `);
  }
  return lines.join('\n');
}
