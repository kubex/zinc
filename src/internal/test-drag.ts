// Drives the pointer drag of a ReorderController from a test.

const init = (x: number, y: number): PointerEventInit => ({
  pointerId: 1,
  pointerType: 'mouse',
  isPrimary: true,
  button: 0,
  clientX: x,
  clientY: y,
  bubbles: true,
  composed: true,
  cancelable: true,
});

/** The centre of an element. */
export function centre(el: Element) {
  const rect = el.getBoundingClientRect();
  return {x: rect.left + rect.width / 2, y: rect.top + rect.height / 2};
}

/** Presses on an element and moves far enough to start dragging it. */
export function startDrag(el: Element) {
  const {x, y} = centre(el);
  el.dispatchEvent(new PointerEvent('pointerdown', init(x, y)));
  window.dispatchEvent(new PointerEvent('pointermove', init(x, y + 1)));
  window.dispatchEvent(new PointerEvent('pointermove', init(x + 6, y + 6)));
}

export function dragTo(x: number, y: number) {
  window.dispatchEvent(new PointerEvent('pointermove', init(x, y)));
}

export function drop(x: number, y: number) {
  window.dispatchEvent(new PointerEvent('pointerup', init(x, y)));
}
