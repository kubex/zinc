export interface SlashMenuItem {
  /** The text shown in the menu. */
  label: string;
  /** The text inserted into the field. Omit for items handled entirely by the `zn-slash-select` event. */
  value?: string;
  /** Icon shown against the item, e.g. `tag@lu`. */
  icon?: string;
  /** Supporting text shown under the label. */
  description?: string;
  /** Extra terms the item can be found by. */
  keywords?: string | string[];
  /** Heading the item is listed under. Items without a group are listed first, in source order. */
  group?: string;
  /** Overrides the position of the item within its match band. Lower sorts first. */
  order?: number;
  /** Identifier passed through on `zn-slash-select`, for items that do something other than insert text. */
  action?: string;
  /** Where the caret lands after insertion, as an offset into `value`. Defaults to the end. */
  caretOffset?: number;
  /** Listed, but not selectable. */
  disabled?: boolean;
}

const presets = new Map<string, SlashMenuItem[]>();

/**
 * Registers a named, reusable set of insertions, so a list defined once (e.g. the merge fields
 * allowed in legal copy) can be referenced from markup with `slash-preset="<name>"`.
 */
export function registerSlashMenuPreset(name: string, items: SlashMenuItem[]) {
  presets.set(name.trim(), items);
}

/** Removes a preset registered with `registerSlashMenuPreset`. */
export function unregisterSlashMenuPreset(name: string) {
  presets.delete(name.trim());
}

/** The names of every registered preset. */
export function slashMenuPresetNames(): string[] {
  return [...presets.keys()];
}

/** Resolves one or more preset names (comma separated, or an array) to their items. */
export function getSlashMenuPreset(names: string | string[]): SlashMenuItem[] {
  const list = Array.isArray(names) ? names : names.split(',');

  return list.reduce<SlashMenuItem[]>((items, name) => {
    const preset = presets.get(name.trim());
    return preset ? [...items, ...preset] : items;
  }, []);
}

function isItemLike(value: unknown): value is SlashMenuItem {
  return typeof value === 'object' && value !== null && typeof (value as SlashMenuItem).label === 'string';
}

/**
 * Parses the `slash-items` attribute. Accepts a JSON array of items, or the shorthand
 * `Label={{TOKEN}}, Other={{OTHER}}` (the label may be omitted to use the token as its own label).
 */
export function parseSlashItems(value: string | null | undefined): SlashMenuItem[] {
  const raw = value?.trim();
  if (!raw) return [];

  if (raw.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isItemLike) : [];
    } catch {
      console.warn('slash-items could not be parsed as JSON', raw);
      return [];
    }
  }

  return raw
    .split(',')
    .map(entry => entry.trim())
    .filter(entry => entry !== '')
    .map(entry => {
      const separator = entry.indexOf('=');
      if (separator === -1) return {label: entry, value: entry};

      const label = entry.slice(0, separator).trim();
      const insert = entry.slice(separator + 1).trim();
      return {label: label || insert, value: insert};
    })
    .filter(item => item.label !== '');
}

function keywordsOf(item: SlashMenuItem): string[] {
  if (!item.keywords) return [];
  const keywords = Array.isArray(item.keywords) ? item.keywords : item.keywords.split(',');
  return keywords.map(keyword => keyword.trim().toLowerCase()).filter(keyword => keyword !== '');
}

// Lower bands sort first, so a label match always beats an incidental hit in a
// description or in the token being inserted.
function scoreItem(item: SlashMenuItem, query: string): number {
  const label = item.label.toLowerCase();
  if (label.startsWith(query)) return 0;
  if (label.split(/\s+/).some(word => word.startsWith(query))) return 1;
  if (label.includes(query)) return 2;
  if (keywordsOf(item).some(keyword => keyword.includes(query))) return 3;
  if (item.value?.toLowerCase().includes(query)) return 4;
  if (item.description?.toLowerCase().includes(query)) return 5;
  return -1;
}

/** Filters and ranks items against a query. An empty query keeps every item in its declared order. */
export function filterSlashItems(items: SlashMenuItem[], query: string): SlashMenuItem[] {
  const needle = query.trim().toLowerCase();

  return items
    .map((item, index) => ({item, index, score: needle ? scoreItem(item, needle) : 0}))
    .filter(entry => entry.score !== -1)
    .sort((a, b) =>
      a.score - b.score ||
      (a.item.order ?? a.index) - (b.item.order ?? b.index) ||
      a.index - b.index)
    .map(entry => entry.item);
}
