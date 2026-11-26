import type RichEditor from './rich-editor';

export interface Shortcut {
  key: string;
  shift?: boolean;
}

export interface KeyBinding extends Shortcut {
  /** Needs Cmd on Apple platforms and Ctrl elsewhere. */
  mod?: boolean;
  /** Returns true when it handled the key, which stops the browser's default. */
  run: (editor: RichEditor, event: KeyboardEvent) => boolean;
}

export function isApple(): boolean {
  // Safari and Firefox have no userAgentData yet.
  const platform = (navigator as Navigator & { userAgentData?: { platform: string } }).userAgentData?.platform
    ?? navigator.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function modPressed(e: KeyboardEvent) {
  return isApple() ? e.metaKey && !e.ctrlKey : e.ctrlKey && !e.metaKey;
}

export function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  // Ctrl+Alt is AltGr on Windows keyboards, so Alt must be up for the combo to count.
  return modPressed(e) && !e.altKey && e.shiftKey === !!shortcut.shift && e.key.toLowerCase() === shortcut.key;
}

export function matchesBinding(e: KeyboardEvent, binding: KeyBinding): boolean {
  if (binding.mod) return matchesShortcut(e, binding);
  return !e.metaKey && !e.ctrlKey && !e.altKey && e.shiftKey === !!binding.shift
    && e.key.toLowerCase() === binding.key.toLowerCase();
}

/** The shortcut as shown to people, e.g. `⌘⇧X` or `Ctrl+Shift+X`. */
export function shortcutLabel(shortcut: Shortcut): string {
  const key = shortcut.key.toUpperCase();
  if (isApple()) return `⌘${shortcut.shift ? '⇧' : ''}${key}`;
  return `Ctrl+${shortcut.shift ? 'Shift+' : ''}${key}`;
}
