import {signal, SignalWatcher} from '@lit-labs/signals';

// Theming has two independent dimensions:
//   `t` — the theme family (base, aura, ...), carrying the identity/palette.
//   `m` — the rendered mode ('light' | 'dark') the family is currently drawn in.
// The host shell owns both attributes on <html>; components mirror them so CSS
// selectors like `[m="dark"]` and `:host-context([t="aura"])` keep working.

function readRootAttribute(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return document.documentElement.getAttribute(name)
    || document.body?.getAttribute(name)
    || fallback;
}

function getDefaultTheme(): string {
  return readRootAttribute('t', 'light');
}

function getDefaultMode(): string {
  return readRootAttribute('m', 'light');
}

export const themeSignal = signal<string>(getDefaultTheme());
export const modeSignal = signal<string>(getDefaultMode());

let listenerInstalled = false;

export function installThemeListener(): void {
  if (listenerInstalled || typeof window === 'undefined') return;
  listenerInstalled = true;

  window.addEventListener('theme-change', (e: Event) => {
    const detail: unknown = (e as CustomEvent<unknown>).detail;
    let theme: string | undefined;
    let mode: string | undefined;

    if (typeof detail === 'string') {
      // Legacy payload: the theme name on its own.
      theme = detail;
    } else if (detail && typeof detail === 'object') {
      const d = detail as {theme?: unknown; mode?: unknown};
      if (typeof d.theme === 'string') theme = d.theme;
      if (typeof d.mode === 'string') mode = d.mode;
    }

    // Anything the event did not carry is read back off the document, which the
    // shell always writes before dispatching.
    if (theme === undefined) theme = getDefaultTheme();
    if (mode === undefined) mode = getDefaultMode();

    if (theme !== themeSignal.get()) themeSignal.set(theme);
    if (mode !== modeSignal.get()) modeSignal.set(mode);
  });
}

installThemeListener();

export {SignalWatcher};
