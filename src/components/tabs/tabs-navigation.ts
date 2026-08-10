// Tab selections are remembered in two places, because neither is sufficient
// alone:
//
// - Every history entry carries the tab each container was showing when the
//   entry was created, so a tab change is its own Back step. Entries are always
//   merged into, never replaced, so nested pages keep their own records.
// - Session storage keyed by location survives a reload, which history state
//   does not: the console pushes a fresh `{uri}` state on every document load,
//   discarding whatever the reloaded entry held before a page can read it.
//
// A location only replays a stored selection when it was reached by reloading or
// by a history traversal. Navigating to a page starts from its default tab.

const RESTORING_NAVIGATION_TYPES = ['reload', 'back_forward'];

const TABS_HISTORY_KEY = '__znTabs';

interface TabsHistoryState {
  [TABS_HISTORY_KEY]?: Record<string, string>;
}

const restorableLocations = new Set<string>();

function locationKey(): string {
  return window.location.pathname + window.location.search;
}

function documentNavigationType(): string {
  const entries = window.performance?.getEntriesByType('navigation') as PerformanceNavigationTiming[] | undefined;
  return entries?.[0]?.type ?? '';
}

if (RESTORING_NAVIGATION_TYPES.includes(documentNavigationType())) {
  restorableLocations.add(locationKey());
}

window.addEventListener('popstate', () => restorableLocations.add(locationKey()), {passive: true});

/**
 * Whether the current location was reached in a way that should replay the tab
 * it was last left on: a reload, or a history traversal. A fresh navigation -
 * including a client side one to a location visited earlier - returns false.
 */
export function isRestorableLocation(): boolean {
  return restorableLocations.has(locationKey());
}

/** Scopes a store key to the current location, so each page keeps its own tab. */
export function locationScopedKey(key: string): string {
  return `${key}@${locationKey()}`;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function historyTabs(): Record<string, string> {
  const state = asRecord(window.history.state);
  const tabs = state === null ? null : asRecord((state as TabsHistoryState)[TABS_HISTORY_KEY]);
  return tabs === null ? {} : tabs as Record<string, string>;
}

/** The tab the current history entry was left showing, if it recorded one. */
export function getHistoryTab(key: string): string | null {
  if (!key) {
    return null;
  }

  const tab = historyTabs()[key];
  return typeof tab === 'string' ? tab : null;
}

// The host's own state is carried over so its entry stays intact - the console
// reads `state.uri` on popstate - and the url is left exactly as it is.
function writeHistoryTab(key: string, tab: string, push: boolean): void {
  if (!key) {
    return;
  }

  const state = {
    ...asRecord(window.history.state),
    [TABS_HISTORY_KEY]: {...historyTabs(), [key]: tab}
  };

  if (push) {
    window.history.pushState(state, '', window.location.href);
  } else {
    window.history.replaceState(state, '');
  }
}

/** Adds a history entry for a tab change, making it its own Back step. */
export function pushHistoryTab(key: string, tab: string): void {
  writeHistoryTab(key, tab, true);
}

/** Records the tab on the current entry without adding a Back step. */
export function replaceHistoryTab(key: string, tab: string): void {
  writeHistoryTab(key, tab, false);
}
