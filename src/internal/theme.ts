import {signal, SignalWatcher} from '@lit-labs/signals';

function getDefaultTheme(): string {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.getAttribute('t')
    || document.body.getAttribute('t')
    || 'light';
}

export const themeSignal = signal<string>(getDefaultTheme());

let listenerInstalled = false;

export function installThemeListener(): void {
  if (listenerInstalled || typeof window === 'undefined') return;
  listenerInstalled = true;

  window.addEventListener('theme-change', (e: Event) => {
    const detail: unknown = (e as CustomEvent<unknown>).detail;
    let next: string;
    if (typeof detail === 'string') {
      next = detail;
    } else if (detail && typeof detail === 'object' && 'theme' in detail && typeof (detail as {theme: unknown}).theme === 'string') {
      next = (detail as {theme: string}).theme;
    } else {
      next = getDefaultTheme();
    }
    if (next !== themeSignal.get()) themeSignal.set(next);
  });
}

installThemeListener();

export {SignalWatcher};