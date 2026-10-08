import {sanitizeHtml} from '../../utilities/sanitize-html';

const HTML_TAG = /<\/?(p|div|span|strong|b|em|i|u|a|img|ul|ol|li|table|tr|td|h[1-6]|blockquote|font|center)\b[^>]*>/i;

/** Whether a plain-text body is really HTML source. `<br>` alone doesn't count. */
export function looksLikeHtml(text: string): boolean {
  return HTML_TAG.test(text);
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
