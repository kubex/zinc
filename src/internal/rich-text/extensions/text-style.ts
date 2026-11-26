import type {Extension, InlineFormat} from '../extension';

// Each is read as its own format, so a span carries only one of them
const STYLES = ['color', 'background-color'];
const CLASSES = ['ql-size-', 'ql-font-'];
const INLINE_TAGS = 'span, strong, b, em, i, u, s, strike, del, a, code, sub, sup';
// What a `background` shorthand leaves behind, such as one that only set an image, and shows nothing
const UNSET = new Set(['', 'transparent', 'initial', 'inherit', 'unset', 'rgba(0, 0, 0, 0)']);

const styleOf = (el: Element, property: string) => {
  const value = (el as HTMLElement).style.getPropertyValue(property);
  return UNSET.has(value) ? '' : value;
};

const style = (name: string, property: string): InlineFormat => ({
  name,
  tag: 'SPAN',
  match: el => !!styleOf(el, property),
  create: value => {
    const span = document.createElement('span');
    span.style.setProperty(property, String(value));
    return span;
  },
  value: el => styleOf(el, property),
});

const quillClass = (name: string, prefix: string): InlineFormat => ({
  name,
  tag: 'SPAN',
  match: el => Array.from(el.classList).some(c => c.startsWith(prefix)),
  create: value => {
    const span = document.createElement('span');
    span.className = `${prefix}${String(value)}`;
    return span;
  },
  value: el => Array.from(el.classList).find(c => c.startsWith(prefix))?.slice(prefix.length),
});

const hasStyling = (el: HTMLElement, key: string) =>
  key.startsWith('ql-') ? Array.from(el.classList).some(c => c.startsWith(key)) : !!styleOf(el, key);

/** Moves each colour, highlight, size and font onto a span of its own, nested inside the element that had them. */
function splitStyling(el: HTMLElement) {
  const keys = [...STYLES, ...CLASSES].filter(key => hasStyling(el, key));
  // A span keeps its first one
  if (el.tagName === 'SPAN') keys.shift();
  if (!keys.length) return;
  const spans = keys.map(key => {
    const span = document.createElement('span');
    if (key.startsWith('ql-')) {
      const name = Array.from(el.classList).find(c => c.startsWith(key))!;
      span.className = name;
      el.classList.remove(name);
    } else {
      span.style.setProperty(key, el.style.getPropertyValue(key));
      el.style.removeProperty(key);
    }
    return span;
  });
  spans[spans.length - 1].append(...Array.from(el.childNodes));
  spans.reduce((outer, span) => {
    outer.append(span);
    return span;
  });
  el.append(spans[0]);
}

/**
 * Highlight colour, and Quill's text sizes and fonts. Nothing offers them; they keep content written in the editor's
 * Quill version intact when it is edited.
 */
export const textStyle: Extension = {
  name: 'text-style',
  inline: [style('background', 'background-color'), quillClass('size', 'ql-size-'), quillClass('font', 'ql-font-')],
  // Quill put these, and colour, on whichever inline element held the text, such as `<strong style="color: red">`
  parse: root => root.querySelectorAll<HTMLElement>(INLINE_TAGS).forEach(splitStyling),
};
