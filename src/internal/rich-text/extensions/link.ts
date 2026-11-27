import type {Extension} from '../extension';

const PROTOCOLS = ['http', 'https', 'mailto', 'tel', 'sms'];

/** A link's href, or `about:blank` for a protocol that could run script. Relative links are kept. */
export function sanitizeHref(href: string): string {
  // Browsers drop tabs and line breaks inside a URL and control characters around it, so `java\tscript:` still runs
  // eslint-disable-next-line no-control-regex -- the control characters are what's being removed
  const url = href.replace(/[\t\n\r]/g, '').replace(/^[\u0000-\u0020]+|[\u0000-\u0020]+$/g, '');
  const protocol = /^([a-z][a-z0-9+.-]*):/i.exec(url)?.[1]?.toLowerCase();
  return protocol && !PROTOCOLS.includes(protocol) ? 'about:blank' : url;
}

/** Links, opening in a new tab. Cmd/Ctrl+K emits `link-request` on the editor for the host to ask for a URL. */
export const link: Extension = {
  name: 'link',
  inline: [{
    name: 'link',
    tag: 'A',
    attributes: ['href', 'target', 'rel'],
    match: el => el.hasAttribute('href'),
    create: value => {
      const a = document.createElement('a');
      a.setAttribute('href', sanitizeHref(String(value)));
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
      return a;
    },
    value: el => el.getAttribute('href'),
  }],
  keys: [{
    key: 'k',
    mod: true,
    run: editor => {
      editor.dispatchEvent(new CustomEvent('link-request', {detail: {range: editor.getSelection(), href: editor.getFormat().link}}));
      return true;
    },
  }],
};
