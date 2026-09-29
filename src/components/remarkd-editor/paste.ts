const BLOCK_TAGS = new Set([
  'ADDRESS', 'ARTICLE', 'ASIDE', 'BLOCKQUOTE', 'DD', 'DIV', 'DL', 'DT', 'FIGCAPTION', 'FIGURE', 'FOOTER',
  'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEADER', 'HR', 'LI', 'MAIN', 'NAV', 'OL', 'P', 'PRE', 'SECTION',
  'TABLE', 'UL',
]);
const SKIPPED_TAGS = new Set(['HEAD', 'META', 'LINK', 'SCRIPT', 'STYLE', 'TEMPLATE', 'TITLE', 'NOSCRIPT']);

// Markup that carries formatting worth keeping; HTML without any of it (e.g. a code editor's
// coloured spans) pastes as its plain text.
const FORMATTED = 'ul, ol, h1, h2, h3, h4, h5, h6, table, blockquote, pre, hr, b, strong, i, em, u, s, strike, del, '
  + 'code, a[href], [style*="font-weight"], [style*="italic"], [style*="line-through"], [style*="mso-list"]';

// Word marks list paragraphs with `mso-list:l0 level2 lfo1`, and its bullet/number with `mso-list:Ignore`.
const WORD_LIST_LEVEL = /mso-list:\s*l\d+\s+level(\d+)/i;
const WORD_LIST_MARKER = 'span[style*="mso-list:Ignore" i], span[style*="mso-list: Ignore" i]';
const ORDERED_MARKER = /^\s*(\d+|[a-z]{1,4})[.)]/i;

const PLAIN_BULLET = /^([ \t]*)[•◦▪▫●○■□·‣⁃]\s+/;

type Style = 'strong' | 'emphasis' | 'underline' | 'strike' | 'code';
const MARKS: Record<Style, string> = {strong: '**', emphasis: '__', underline: '___', strike: '~~', code: '`'};

/**
 * The clipboard as remarkd source, keeping the lists, headings, tables and inline formatting of
 * rich content. Null when a plain-text paste already says the same thing.
 */
export function pastedRemarkd(data: DataTransfer | null): string | null {
  if (!data) return null;
  // VS Code's HTML is just coloured spans around the source that text/plain already holds.
  if (data.types.includes('vscode-editor-data')) return null;
  const html = data.getData('text/html');
  const converted = html ? htmlToRemarkd(html) : null;
  return converted ?? plainTextToRemarkd(data.getData('text/plain'));
}

/** Remarkd source for pasted HTML, or null when it has no formatting to keep. */
export function htmlToRemarkd(html: string): string | null {
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  if (!body.querySelector(FORMATTED)) return null;
  const source = tidy(blocks(body).join('\n\n'));
  return source || null;
}

/** Turns bullet glyphs (as copied from PDFs and slides) into list markers, or null when there are none. */
export function plainTextToRemarkd(text: string): string | null {
  if (!text || !text.split('\n').some(line => PLAIN_BULLET.test(line))) return null;
  return text.replace(/\r\n?/g, '\n').split('\n').map(line => line.replace(PLAIN_BULLET, (_, indent: string) =>
    '-'.repeat(1 + Math.min(9, Math.floor(indent.replace(/\t/g, '    ').length / 2))) + ' ')).join('\n');
}

function tidy(source: string): string {
  return source.replace(/[ \t]+$/gm, '').replace(/\n{3,}/g, '\n\n').trim();
}

function isBlock(node: Node): node is HTMLElement {
  return node instanceof HTMLElement && (BLOCK_TAGS.has(node.tagName) || !!node.querySelector(
    [...BLOCK_TAGS].join(',')));
}

function wordListLevel(el: Element): number | null {
  const level = WORD_LIST_LEVEL.exec(el.getAttribute('style') ?? '');
  return level ? Number(level[1]) : null;
}

/** The blocks of `root`, each a remarkd block with no blank lines inside it unless it is a container. */
function blocks(root: Node): string[] {
  const out: string[] = [];
  let run: Node[] = [];
  const flush = () => {
    const text = paragraph(run);
    if (text) out.push(text);
    run = [];
  };

  const children = Array.from(root.childNodes);
  for (let i = 0; i < children.length; i++) {
    const node = children[i];
    if (node instanceof Element && SKIPPED_TAGS.has(node.tagName)) continue;
    if (node instanceof Element && wordListLevel(node) !== null) {
      flush();
      const items: Element[] = [];
      while (i < children.length) {
        const next = children[i];
        if (next instanceof Element && wordListLevel(next) !== null) items.push(next);
        else if (!(next.nodeType === Node.TEXT_NODE && !next.textContent!.trim())) break;
        i++;
      }
      i--;
      out.push(wordList(items));
      continue;
    }
    if (!isBlock(node)) {
      run.push(node);
      continue;
    }
    flush();
    out.push(...block(node));
  }
  flush();
  return out.filter(Boolean);
}

function block(el: HTMLElement): string[] {
  const tag = el.tagName;
  if (/^H[1-6]$/.test(tag)) {
    // Headings render bold already; a bold span inside one is just the source app's styling.
    const text = oneLine(inline(el, new Set(['strong'])));
    return text ? [`${'#'.repeat(Number(tag[1]))} ${text}`] : [];
  }
  if (tag === 'UL' || tag === 'OL') return [listLines(el, 0, []).join('\n')];
  if (tag === 'HR') return ['---'];
  if (tag === 'PRE') {
    const code = (el.textContent ?? '').replace(/\n$/, '');
    return code.trim() ? ['```\n' + code + '\n```'] : [];
  }
  if (tag === 'BLOCKQUOTE') {
    const inner = blocks(el);
    return inner.length ? [`____\n${inner.join('\n\n')}\n____`] : [];
  }
  if (tag === 'TABLE') return [table(el)];
  return blocks(el);
}

function paragraph(nodes: Node[]): string {
  return nodes.map(node => inline(node)).join('')
    .split('\n').map(line => line.replace(/\s+/g, ' ').trim()).filter(Boolean).join('\n');
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, ' ').trim();
}

function styleOf(el: HTMLElement): Style[] {
  const styles: Style[] = [];
  const tag = el.tagName;
  const weight = el.style.fontWeight;
  const decoration = el.style.textDecorationLine || el.style.textDecoration;
  // Google Docs wraps the whole selection in `<b style="font-weight:normal">`.
  const unbolded = weight === 'normal' || (Number(weight) > 0 && Number(weight) < 600);
  if (((tag === 'B' || tag === 'STRONG') && !unbolded) || weight === 'bold' || Number(weight) >= 600) {
    styles.push('strong');
  }
  if (((tag === 'I' || tag === 'EM') && el.style.fontStyle !== 'normal') || el.style.fontStyle === 'italic') {
    styles.push('emphasis');
  }
  if (tag === 'U' || decoration.includes('underline')) styles.push('underline');
  if (tag === 'S' || tag === 'STRIKE' || tag === 'DEL' || decoration.includes('line-through')) styles.push('strike');
  if (tag === 'CODE' || tag === 'KBD' || tag === 'TT' || tag === 'SAMP') styles.push('code');
  return styles;
}

/** Puts `open`/`close` around the text of `inner`, leaving its outer whitespace outside the marks. */
function wrap(inner: string, open: string, close = open): string {
  const [, lead, text, trail] = /^(\s*)([\s\S]*?)(\s*)$/.exec(inner)!;
  return text ? `${lead}${open}${text}${close}${trail}` : inner;
}

function linkTarget(href: string | null): string | null {
  return href && /^(https?:|mailto:|tel:)/i.test(href) ? href : null;
}

/** The inline source of `node`. `active` holds the marks already open around it, so they never nest twice. */
function inline(node: Node, active: Set<Style> = new Set()): string {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').replace(/[ \t\r\n\f]+/g, ' ');
  if (!(node instanceof HTMLElement)) return '';
  if (SKIPPED_TAGS.has(node.tagName) || node.matches(WORD_LIST_MARKER)) return '';
  if (node.tagName === 'BR') return '\n';
  if (node.tagName === 'IMG') {
    const src = linkTarget(node.getAttribute('src'));
    return src ? `![${node.getAttribute('alt') ?? ''}](${src})` : '';
  }
  if (node.tagName === 'INPUT' && (node as HTMLInputElement).type === 'checkbox') {
    return (node as HTMLInputElement).checked ? '[x] ' : '[ ] ';
  }

  const styles = styleOf(node).filter(style => !active.has(style));
  const inner = styles.includes('code')
    ? (node.textContent ?? '').replace(/\s+/g, ' ')
    : Array.from(node.childNodes).map(child => inline(child, new Set([...active, ...styles]))).join('');

  let text = BLOCK_TAGS.has(node.tagName) ? ` ${inner} ` : inner;
  for (const style of styles) text = wrap(text, MARKS[style]);
  if (node.tagName === 'SUP') text = wrap(text, '^');
  if (node.tagName === 'SUB') text = wrap(text, '~');
  const href = node.tagName === 'A' ? linkTarget(node.getAttribute('href')) : null;
  return href && text.trim() ? wrap(text.replace(/\n/g, ' '), '[', `](${href})`) : text;
}

/**
 * Remarkd list lines for `list`: bullets nest by marker count, numbers as an outline under
 * `path`, and each item stays on one line — a remarkd item cannot span lines.
 */
function listLines(list: HTMLElement, bulletDepth: number, path: number[]): string[] {
  const ordered = list.tagName === 'OL';
  const depth = ordered ? bulletDepth : bulletDepth + 1;
  const lines: string[] = [];
  let n = ordered ? Number(list.getAttribute('start') ?? 1) - 1 : 0;
  for (const child of Array.from(list.children)) {
    if (child.tagName === 'UL' || child.tagName === 'OL') {
      // Google Docs nests a level as a list directly inside the list.
      lines.push(...listLines(child as HTMLElement, depth, ordered ? [...path, Math.max(n, 1)] : path));
      continue;
    }
    if (child.tagName !== 'LI') continue;
    n++;
    const itemPath = ordered ? [...path, n] : path;
    const nested = Array.from(child.children).filter(el => el.tagName === 'UL' || el.tagName === 'OL');
    const text = oneLine(Array.from(child.childNodes).filter(node => !nested.includes(node as Element))
      .map(node => inline(node)).join(''));
    if (text) {
      const marker = ordered ? itemPath.map(i => `${i}.`).join('') : '-'.repeat(Math.min(depth, 10));
      lines.push(`${marker} ${text}`);
    }
    for (const sub of nested) lines.push(...listLines(sub as HTMLElement, depth, itemPath));
  }
  return lines;
}

/** Word's list paragraphs, numbered by their `levelN`; bullet or number is read off Word's own marker. */
function wordList(items: Element[]): string {
  const counters: number[] = [];
  return items.map(item => {
    const level = wordListLevel(item)!;
    const ordered = ORDERED_MARKER.test(item.querySelector(WORD_LIST_MARKER)?.textContent ?? '');
    counters.length = level;
    counters[level - 1] = (counters[level - 1] ?? 0) + 1;
    for (let i = 0; i < level - 1; i++) counters[i] ??= 1;
    const marker = ordered ? counters.map(i => `${i}.`).join('') : '-'.repeat(Math.min(level, 10));
    return `${marker} ${oneLine(inline(item))}`;
  }).filter(line => !/^\S+ $/.test(line)).join('\n');
}

function table(el: HTMLElement): string {
  const rows = Array.from(el.querySelectorAll('tr'))
    .filter(row => row.closest('table') === el)
    .map(row => Array.from(row.children)
      .filter(cell => cell.tagName === 'TD' || cell.tagName === 'TH')
      .map(cell => oneLine(inline(cell)) || ' '))
    .filter(cells => cells.length);
  return `|===\n${rows.map(cells => cells.map(cell => `|${cell}`).join(' ')).join('\n\n')}\n|===`;
}
