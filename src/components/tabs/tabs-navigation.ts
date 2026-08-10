// A tab selection belongs to a visit: one starts the first time a tab is
// recorded at a location and ends when that location is left. A reload continues
// the visit it interrupted, so the tab stays open and Back still steps through
// the tabs the visit opened; navigating away ends it, so returning starts from
// the default tab with no tab history behind it.
//
// Selections are remembered in two places, because neither is sufficient alone:
//
// - Every history entry carries the tab each container was showing when the
//   entry was created, so a tab change is its own Back step. Entries are always
//   merged into, never replaced, so nested pages keep their own records.
// - Session storage keyed by location survives a reload, which history state
//   does not: the console pushes a fresh `{uri}` state on every document load,
//   discarding whatever the reloaded entry held before a page can read it.
//
// Both name the visit they were written for. Ending a visit deletes its stored
// tabs outright; the tabs left on its history entries cannot be rewritten, so
// they are retired instead - the visit they name no longer exists.

export const TAB_STORE_PREFIX = 'zntab:';

const RESTORING_NAVIGATION_TYPES = ['reload', 'back_forward'];

const VISIT_STORE_KEY = '__znTabsVisit';

const TABS_HISTORY_KEY = '__znTabs';

interface TabsHistoryRecord {
  visit: string;
  tabs: Record<string, string>;
}

interface TabsHistoryState {
  [TABS_HISTORY_KEY]?: TabsHistoryRecord;
}

const restorableLocations = new Set<string>();

let visitCount = 0;

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function locationKey(): string {
  return window.location.pathname + window.location.search;
}

function documentNavigationType(): string {
  const entries = window.performance?.getEntriesByType('navigation') as PerformanceNavigationTiming[] | undefined;
  return entries?.[0]?.type ?? '';
}

/** Scopes a store key to the current location, so each page keeps its own tab. */
export function locationScopedKey(key: string): string {
  return `${key}@${locationKey()}`;
}

function visitStoreKey(): string {
  return TAB_STORE_PREFIX + locationScopedKey(VISIT_STORE_KEY);
}

/** The visit the current location is on, or an empty string before one starts. */
function currentVisit(): string {
  return sessionStore()?.getItem(visitStoreKey()) ?? '';
}

// Starts a visit for the current location, unless one is already under way - a
// reload lands mid visit and must continue it rather than begin a new one.
function startLocationVisit(): void {
  const store = sessionStore();
  if (store === null || currentVisit() !== '') {
    return;
  }

  visitCount += 1;
  store.setItem(visitStoreKey(), `${Date.now()}-${visitCount}`);
}

/**
 * Ends the visits to every location other than the one on screen, discarding
 * the tabs they were left showing. Called whenever the location may have
 * changed, so the only tabs ever remembered are the current page's.
 */
export function endVisitsToOtherLocations(): void {
  const store = sessionStore();
  if (store === null) {
    return;
  }

  const suffix = `@${locationKey()}`;
  for (let index = store.length - 1; index >= 0; index--) {
    const key = store.key(index);
    if (key !== null && key.startsWith(TAB_STORE_PREFIX) && !key.endsWith(suffix)) {
      store.removeItem(key);
    }
  }
}

if (RESTORING_NAVIGATION_TYPES.includes(documentNavigationType())) {
  restorableLocations.add(locationKey());
}

// A document load lands on the only location still worth remembering: every
// other one was navigated away from, whether or not a page was around to see it.
endVisitsToOtherLocations();

window.addEventListener('popstate', () => {
  restorableLocations.add(locationKey());
  endVisitsToOtherLocations();
}, {passive: true});

/**
 * Whether the current location was reached in a way that should replay the tab
 * it was last left on: a reload, or a history traversal. A fresh navigation -
 * including a client side one to a location visited earlier - returns false.
 */
export function isRestorableLocation(): boolean {
  return restorableLocations.has(locationKey());
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : null;
}

function historyRecord(): TabsHistoryRecord | null {
  const state = asRecord(window.history.state);
  const record = state === null ? null : asRecord((state as TabsHistoryState)[TABS_HISTORY_KEY]);
  const tabs = record === null ? null : asRecord(record.tabs);

  if (record === null || tabs === null || typeof record.visit !== 'string') {
    return null;
  }

  return {visit: record.visit, tabs: tabs as Record<string, string>};
}

/** The tab the current history entry was left showing, if it recorded one for the visit under way. */
export function getHistoryTab(key: string): string | null {
  if (!key) {
    return null;
  }

  const visit = currentVisit();
  const record = historyRecord();
  if (visit === '' || record === null || record.visit !== visit) {
    return null;
  }

  const tab = record.tabs[key];
  return typeof tab === 'string' ? tab : null;
}

// The host's own state is carried over so its entry stays intact - the console
// reads `state.uri` on popstate - and the url is left exactly as it is.
function writeHistoryTab(key: string, tab: string, push: boolean): void {
  startLocationVisit();

  const visit = currentVisit();
  if (!key || visit === '') {
    return;
  }

  const record = historyRecord();
  const tabs = record !== null && record.visit === visit ? record.tabs : {};

  // Re-recording what the entry already says would be a wasted history write,
  // and browsers cap how many of those a page may make.
  if (!push && tabs[key] === tab) {
    return;
  }

  const state = {
    ...asRecord(window.history.state),
    [TABS_HISTORY_KEY]: {visit, tabs: {...tabs, [key]: tab}}
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
