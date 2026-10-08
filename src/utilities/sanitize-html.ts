import DOMPurify from 'dompurify';

const FORMATTING = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a'];

// Allowed through so their text doesn't run together, then turned into paragraphs
const BLOCKS = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'tr', 'center', 'section'];

// Removed with their contents; any other disallowed element is unwrapped to its children.
// img is dropped because a remote src in an email is a tracking pixel.
const DROPPED = [
  'script', 'style', 'template', 'iframe', 'frame', 'object', 'embed', 'noscript', 'noembed', 'noframes', 'xmp',
  'plaintext', 'title', 'head', 'meta', 'link', 'base', 'svg', 'math', 'img', 'picture', 'video', 'audio', 'form',
  'input', 'button', 'select', 'textarea',
];

/**
 * Sanitizes untrusted HTML down to formatting tags, keeping only a link's href when it is http(s) or mailto.
 * Tags in `keep` are allowed as they are, so a block such as `pre` isn't turned into a paragraph.
 */
export function sanitizeHtml(source: string, keep: string[] = []): string {
  const fragment = DOMPurify.sanitize(source, {
    ALLOWED_TAGS: [...FORMATTING, ...BLOCKS, ...keep],
    ALLOWED_ATTR: ['href'],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    FORBID_CONTENTS: DROPPED,
    RETURN_DOM_FRAGMENT: true,
  });

  const blocks = BLOCKS.filter(tag => !keep.includes(tag));
  fragment.querySelectorAll(blocks.join(',')).forEach(block => {
    const p = document.createElement('p');
    p.append(...block.childNodes);
    block.replaceWith(p);
  });
  // Spacer paragraphs, and ones that only held an image, would leave gaps
  fragment.querySelectorAll('p').forEach(p => {
    if (!p.textContent?.trim()) p.remove();
  });
  fragment.querySelectorAll('a[href]').forEach(link => {
    try {
      link.setAttribute('href', new URL(link.getAttribute('href')!.trim()).href);
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    } catch {
      link.removeAttribute('href');
    }
  });

  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
}
