/** How long the pointer must rest on an element before hover preloading starts. */
export const HOVER_INTENT_DELAY = 150;

/**
 * Calls `callback` once the pointer has rested on `element` for `delay` ms. Preloads hang off this
 * so sweeping across a row of tabs doesn't fetch and render every panel on the way past.
 */
export function onHoverIntent(element: HTMLElement, callback: () => void, delay = HOVER_INTENT_DELAY): void {
  let timer = 0;
  element.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    timer = window.setTimeout(callback, delay);
  });
  element.addEventListener('mouseleave', () => clearTimeout(timer));
}
