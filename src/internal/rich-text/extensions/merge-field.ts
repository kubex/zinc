import type {Extension} from '../extension';

export interface MergeFieldValue {
  token: string;
  label: string;
}

const TOKEN = /\{\{\s*[^{}]+?\s*\}\}/g;
const WHOLE_TOKEN = /^\{\{\s*[^{}]+?\s*\}\}$/;

export const normaliseToken = (token: string) => token.replace(/\s+/g, '');

function chip({token, label}: MergeFieldValue): Element {
  const span = document.createElement('span');
  span.setAttribute('contenteditable', 'false');
  span.setAttribute('data-token', token);
  span.setAttribute('data-label', label);
  span.setAttribute('title', token);
  span.textContent = label;
  return span;
}

/**
 * `{{token}}` placeholders, shown as labelled chips and saved back out as the raw token. Tokens become chips when
 * HTML is loaded or pasted; `labels` maps a token to its chip text, which is the token's name otherwise.
 */
export function mergeFields(labels: Record<string, string> = {}): Extension {
  const valueOf = (raw: string): MergeFieldValue => {
    const token = normaliseToken(raw);
    return {token, label: labels[token] ?? token.slice(2, -2)};
  };

  return {
    name: 'merge-field',
    atoms: [{
      name: 'mergeField',
      selector: 'span[data-token]',
      attributes: ['contenteditable', 'data-token', 'data-label', 'title'],
      create: value => chip(typeof value === 'string' ? valueOf(value) : value as MergeFieldValue),
      text: el => el.getAttribute('data-token') ?? '',
    }],
    // Text nodes only, so tokens inside attributes such as href stay as they are
    parse: root => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const texts: Text[] = [];
      while (walker.nextNode()) {
        const text = walker.currentNode as Text;
        if (text.data.includes('{{') && !text.parentElement?.closest('[data-token]')) texts.push(text);
      }
      texts.forEach(text => {
        const parts: Node[] = [];
        let last = 0;
        for (const match of text.data.matchAll(TOKEN)) {
          if (match.index > last) parts.push(document.createTextNode(text.data.slice(last, match.index)));
          parts.push(chip(valueOf(match[0])));
          last = match.index + match[0].length;
        }
        if (!last) return;
        if (last < text.data.length) parts.push(document.createTextNode(text.data.slice(last)));
        text.replaceWith(...parts);
      });
      // A chip from elsewhere is rebuilt from its token, so what it shows is what it saves
      root.querySelectorAll('span[data-token]').forEach(span => {
        const token = span.getAttribute('data-token') ?? '';
        if (WHOLE_TOKEN.test(token)) span.replaceWith(chip(valueOf(token)));
        else span.replaceWith(...Array.from(span.childNodes));
      });
    },
    serialize: root => root.querySelectorAll('span[data-token]').forEach(span => {
      span.replaceWith(span.getAttribute('data-token') ?? '');
    }),
  };
}
