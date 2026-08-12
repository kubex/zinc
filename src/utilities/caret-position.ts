export interface CaretCoordinates {
  top: number;
  left: number;
  height: number;
}

export type TextField = HTMLTextAreaElement | HTMLInputElement;

// Properties that affect where a character lands, copied onto the mirror so it
// wraps text identically to the field itself.
const mirroredProperties = [
  'direction',
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize'
];

function lineHeightOf(computed: CSSStyleDeclaration): number {
  const lineHeight = parseFloat(computed.lineHeight);
  if (!Number.isNaN(lineHeight)) return lineHeight;

  const fontSize = parseFloat(computed.fontSize);
  return Number.isNaN(fontSize) ? 16 : fontSize * 1.2;
}

/**
 * Measures where the caret sits inside a text field, relative to the field's own top/left corner.
 * There is no browser API for this, so the field is mirrored into an off-screen div and the offset
 * of a marker span at `index` is read back.
 */
export function getCaretCoordinates(field: TextField, index: number): CaretCoordinates {
  const doc = field.ownerDocument;
  const computed = getComputedStyle(field);
  const isInput = field.nodeName === 'INPUT';
  const mirror = doc.createElement('div');
  const style = mirror.style as unknown as Record<string, string>;
  const source = computed as unknown as Record<string, string>;

  style.position = 'absolute';
  style.visibility = 'hidden';
  style.top = '0';
  style.left = '-9999px';
  style.whiteSpace = isInput ? 'pre' : 'pre-wrap';
  style.overflow = 'hidden';
  if (!isInput) style.wordWrap = 'break-word';

  mirroredProperties.forEach(prop => {
    const value = source[prop];
    if (typeof value === 'string') style[prop] = value;
  });

  // Inputs are single line, so the mirror has to grow with its content instead
  if (isInput) style.height = 'auto';

  const before = field.value.slice(0, index);
  mirror.textContent = isInput ? before.replace(/\s/g, '\u00a0') : before;

  const marker = doc.createElement('span');
  // A non-empty marker is needed for the browser to give it a position
  marker.textContent = field.value.slice(index) || '.';
  mirror.appendChild(marker);

  doc.body.appendChild(mirror);
  const coordinates: CaretCoordinates = {
    top: marker.offsetTop + (parseFloat(computed.borderTopWidth) || 0),
    left: marker.offsetLeft + (parseFloat(computed.borderLeftWidth) || 0),
    height: lineHeightOf(computed)
  };
  mirror.remove();

  return coordinates;
}

/**
 * Projects measured caret coordinates onto the viewport, clamped to the field's box so a caret
 * scrolled out of view doesn't drag anchored content off with it. Split from the measurement so a
 * cached measurement can be re-projected as the field scrolls or moves.
 */
export function caretRectFrom(field: TextField, {top, left, height}: CaretCoordinates): DOMRect {
  const fieldRect = field.getBoundingClientRect();

  const maxTop = Math.max(fieldRect.top, fieldRect.bottom - height);
  const y = Math.min(Math.max(fieldRect.top + top - field.scrollTop, fieldRect.top), maxTop);
  const x = Math.min(Math.max(fieldRect.left + left - field.scrollLeft, fieldRect.left), fieldRect.right);

  return new DOMRect(x, y, 1, height);
}

/** The caret's position as a viewport rect. */
export function getCaretRect(field: TextField, index: number): DOMRect {
  return caretRectFrom(field, getCaretCoordinates(field, index));
}
