import DOMPurify from 'dompurify';

const FORMATTING = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'a'];

/** What zn-editor writes beyond the formatting tags, for the views that show its messages. Use with `colors`. */
export const EDITOR_TAGS = ['s', 'code', 'pre', 'blockquote', 'hr', 'span', 'sub', 'sup'];

// Allowed through so their text doesn't run together, then turned into paragraphs
const BLOCKS = ['div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'table', 'tr', 'center', 'section'];

// Removed with their contents; any other disallowed element is unwrapped to its children.
// img is dropped because a remote src in an email is a tracking pixel.
const DROPPED = [
  'script', 'style', 'template', 'iframe', 'frame', 'object', 'embed', 'noscript', 'noembed', 'noframes', 'xmp',
  'plaintext', 'title', 'head', 'meta', 'link', 'base', 'svg', 'math', 'img', 'picture', 'video', 'audio', 'form',
  'input', 'button', 'select', 'textarea',
];

// An image whose data travels in the message itself, so showing it fetches nothing. SVG is left out, as it can
// carry script.
const INLINE_IMAGE = /^data:image\/(?:png|jpe?g|gif|webp);base64,/i;

// Matched on the parsed URL's origin and path, so `https://cdn.test` can't be met by `https://cdn.test.evil.net`
function fromSource(src: string, sources: string[]) {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  return sources.some(source => {
    try {
      const base = new URL(source);
      return url.origin === base.origin && url.pathname.startsWith(base.pathname);
    } catch {
      return false;
    }
  });
}

/**
 * Sanitizes untrusted HTML down to formatting tags, keeping only a link's href when it is http(s) or mailto.
 * Tags in `keep` are allowed as they are, so a block such as `pre` isn't turned into a paragraph; `img` keeps
 * images held inline as data, and remote ones only under one of `imageSources`, URL prefixes the app trusts.
 * With `colors`, a `style` attribute survives holding only its text and background colour.
 */
export function sanitizeHtml(source: string, keep: string[] = [], colors = false, imageSources: string[] = []): string {
  const images = keep.includes('img');
  const fragment = DOMPurify.sanitize(source, {
    ALLOWED_TAGS: [...FORMATTING, ...BLOCKS, ...keep],
    ALLOWED_ATTR: [...colors ? ['href', 'style'] : ['href'], ...images ? ['src', 'alt'] : []],
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
    FORBID_CONTENTS: images ? DROPPED.filter(tag => tag !== 'img') : DROPPED,
    RETURN_DOM_FRAGMENT: true,
  });
  fragment.querySelectorAll('img').forEach(img => {
    const src = img.getAttribute('src') ?? '';
    if (!INLINE_IMAGE.test(src) && !fromSource(src, imageSources)) img.remove();
  });

  const blocks = BLOCKS.filter(tag => !keep.includes(tag));
  fragment.querySelectorAll(blocks.join(',')).forEach(block => {
    const p = document.createElement('p');
    p.append(...block.childNodes);
    block.replaceWith(p);
  });
  // Spacer paragraphs, and ones that held only a dropped image, would leave gaps
  fragment.querySelectorAll('p').forEach(p => {
    if (!p.textContent?.trim() && !p.querySelector('img')) p.remove();
  });
  // Any other declaration could load a remote url(), which in an email is a tracking pixel
  fragment.querySelectorAll<HTMLElement>('[style]').forEach(el => {
    const {color, backgroundColor} = el.style;
    el.removeAttribute('style');
    el.style.color = color;
    el.style.backgroundColor = backgroundColor;
    if (!el.getAttribute('style')) el.removeAttribute('style');
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
