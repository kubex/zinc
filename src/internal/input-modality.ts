let lastPointerAt = -Infinity;
let lastPointerPath: EventTarget[] = [];
let lastKeyAt = -Infinity;

// Capture phase, so a component that stops propagation can't hide the input.
document.addEventListener('pointerdown', (e) => {
  lastPointerAt = performance.now();
  lastPointerPath = e.composedPath();
}, {capture: true, passive: true});
document.addEventListener('keydown', () => (lastKeyAt = performance.now()), {capture: true, passive: true});

/** Whether the latest user input was a pointer press inside `within`, made within the last `withinMs`. */
export function pointerInitiated(within: Element, withinMs = 300): boolean {
  return lastPointerAt > lastKeyAt && performance.now() - lastPointerAt < withinMs && lastPointerPath.includes(within);
}
