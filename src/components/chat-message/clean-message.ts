import {sanitizeHtml} from '../../utilities/sanitize-html';

const BARE_URL = /\b((https?:\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/g;

/**
 * Sanitizes an untrusted chat message, turning newlines into breaks and bare URLs into links first so the
 * links are vetted too.
 */
export function cleanHTML(message: string): string {
  const linked = message
    .replace(BARE_URL, url => `<a href="${url.startsWith('www.') ? 'https://' + url : url}">${url}</a>`)
    .replace(/\r\n|\r|\n/g, '<br>');
  return sanitizeHtml(linked, ['pre', 'code', 'blockquote']);
}
