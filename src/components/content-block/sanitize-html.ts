const ALLOWED = new Set(['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a']);

// Removed with their contents; any other disallowed element is unwrapped to its children.
// img is dropped because a remote src in an email is a tracking pixel.
const DROPPED = new Set([
  'script', 'style', 'template', 'iframe', 'frame', 'object', 'embed', 'noscript', 'title', 'head',
  'meta', 'link', 'base', 'svg', 'math', 'img', 'picture', 'video', 'audio', 'form', 'input', 'button',
  'select', 'textarea',
]);

// Unwrapped like any disallowed element, but kept as a paragraph so their text doesn't run together
const BLOCKS = new Set(['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'tr', 'center', 'section']);

const SAFE_PROTOCOLS = new Set(['http:', 'https:', 'mailto:']);

const HTML_TAG = /<\/?(p|div|span|strong|b|em|i|u|a|img|ul|ol|li|table|tr|td|h[1-6]|blockquote|font|center)\b[^>]*>/i;

/** Whether a plain-text body is really HTML source. `<br>` alone doesn't count. */
export function looksLikeHtml(text: string): boolean {
  return HTML_TAG.test(text);
}

function safeHref(href: string | null): string | null {
  if (!href) return null;
  try {
    const url = new URL(href.trim());
    return SAFE_PROTOCOLS.has(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function copyChildren(from: Node, to: Node, doc: Document) {
  from.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      to.appendChild(doc.createTextNode(child.textContent ?? ''));
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;

    const tag = (child as Element).localName;
    if (DROPPED.has(tag)) return;
    if (tag === 'p' || BLOCKS.has(tag)) {
      appendParagraph(child, to, doc);
      return;
    }
    if (!ALLOWED.has(tag)) {
      copyChildren(child, to, doc);
      return;
    }

    const el = doc.createElement(tag);
    if (tag === 'a') {
      const href = safeHref((child as Element).getAttribute('href'));
      if (href) {
        el.setAttribute('href', href);
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noopener noreferrer');
      }
    }
    copyChildren(child, el, doc);
    to.appendChild(el);
  });
}

// Skips paragraphs left empty, e.g. spacer paragraphs or ones that only held an image
function appendParagraph(from: Node, to: Node, doc: Document) {
  const p = doc.createElement('p');
  copyChildren(from, p, doc);
  if (p.textContent?.trim()) {
    to.appendChild(p);
  }
}

/**
 * Rebuilds untrusted HTML from an allowlist of formatting tags. Attributes are never copied,
 * except a link's href when it is http(s) or mailto.
 */
export function sanitizeHtml(source: string): string {
  const parsed = new DOMParser().parseFromString(source, 'text/html');
  const out = document.implementation.createHTMLDocument('');
  const root = out.createElement('div');
  copyChildren(parsed.body, root, out);
  return root.innerHTML;
}

/** Plain text of a body that may be HTML source or text holding encoded entities like `&nbsp;`. */
export function htmlToText(source: string): string {
  // Plain text is escaped so an address like `<bob@example.com>` isn't parsed as a tag
  const markup = looksLikeHtml(source)
    ? sanitizeHtml(source)
    : source.replace(/<br\s*\/?>/gi, ' ').replace(/</g, '&lt;');
  const parsed = new DOMParser().parseFromString(markup, 'text/html');
  parsed.body.querySelectorAll('br, p, li').forEach((el) => el.after(' '));
  return (parsed.body.textContent ?? '').replace(/\s+/g, ' ').trim();
}
