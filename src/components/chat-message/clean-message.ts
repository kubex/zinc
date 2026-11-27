import {EDITOR_TAGS, sanitizeHtml} from '../../utilities/sanitize-html';

const BARE_URL = /\b((https?:\/\/|www\.)[^'">\s]+\.[^'">\s]+)(?=\s|$)(?!["<>])/g;

/**
 * Sanitizes an untrusted chat message, turning newlines into breaks and bare URLs into links first so the
 * links are vetted too. Images show when held inline, or served from this page's own origin or under one of
 * `imageSources`; any other remote image could be a tracking pixel.
 */
export function cleanHTML(message: string, imageSources: string[] = []): string {
  const linked = message
    .replace(BARE_URL, url => `<a href="${url.startsWith('www.') ? 'https://' + url : url}">${url}</a>`)
    .replace(/\r\n|\r|\n/g, '<br>');
  return sanitizeHtml(linked, [...EDITOR_TAGS, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'], true,
    [`${window.location.origin}/`, ...imageSources]);
}
