/**
 * Whether the shell's sidebar is collapsed, shared by every navigation-variant zn-menu-item, zn-menu-group and
 * zn-menu-label, including those inside app spaces the shell can't reach. A shell calls setNavigationCollapsed as its
 * sidebar starts to open or close.
 *
 * Kept on a global key and announced on window, not in this module: a shell that bundles zinc's source and the page's
 * zn.min.js each have a copy of this module, and both must see the same state.
 */
const STATE = Symbol.for('zn.navigation.collapsed');
const EVENT = 'zn-navigation-collapse';

type Holder = typeof globalThis & {[STATE]?: boolean};

export function setNavigationCollapsed(collapsed: boolean): void {
  (globalThis as Holder)[STATE] = collapsed;
  window.dispatchEvent(new CustomEvent(EVENT, {detail: {collapsed}}));
}

/** The shell's sidebar state, or undefined while no shell has set one, leaving an element's own `collapsed` alone. */
export function isNavigationCollapsed(): boolean | undefined {
  return (globalThis as Holder)[STATE];
}

/** Calls back with each change to the shared state; returns the function that stops it. */
export function onNavigationCollapse(callback: (collapsed: boolean) => void): () => void {
  const listener = (e: Event) => callback(Boolean((e as CustomEvent<{collapsed: boolean}>).detail?.collapsed));
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
