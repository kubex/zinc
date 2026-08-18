import type {TemplateResult} from 'lit';

/** A section placed on a page. */
export interface PageSection {
  id: string;
  type: string;
  /** Overrides the type label when set (per-instance rename). */
  label?: string;
  /** Section content, keyed by field name (the inspector's `name` attributes). */
  data: Record<string, unknown>;
  /** Container instances only: the editor-chosen layout. */
  layout?: PageContainerLayout;
  /** Container instances only: one ordered stack per cell, row-major. */
  cells?: PageSection[][];
  /**
   * @deprecated The pre-cells fixed-slot shape. Read on load and migrated to
   * `cells`; never written back.
   */
  children?: (PageSection | null)[];
}

/** A container instance's editor-chosen layout. */
export interface PageContainerLayout {
  /** One weight per column; the array length IS the column count. */
  widths: number[];
  /** When true the builder offers a trailing empty row instead of a pinned cell count. */
  grow: boolean;
}

/** The complete serialisable state of a page. Order = render order. */
export interface PageState {
  sections: PageSection[];
}

/**
 * Describes a kind of section that can be placed on a page. Declared via
 * `<template type slot="config">` children or registered programmatically —
 * the palette and inspector are driven entirely by registered types.
 */
export interface PageSectionType {
  /** Unique key, persisted on every placed section. */
  type: string;
  label: string;
  /** zn-icon `src`. */
  icon?: string;
  iconLibrary?: string;
  /** Accent colour for the icon tile — any CSS colour. */
  color?: string;
  /** Collapsible palette category. */
  category?: string;
  description?: string;
  /** Inspector form markup (from a slotted `<template slot="config">`). */
  configTemplate?: HTMLTemplateElement;
  /** Programmatic inspector body — takes precedence over `configTemplate`. */
  renderConfig?: (section: PageSection, update: (data: Record<string, unknown>) => void) => TemplateResult;
  /** Marks this type a container: its card renders a grid of cells on the canvas. */
  container?: boolean;
  /**
   * Column weights a new instance of this container starts with. Stored as parsed, not
   * guaranteed sanitised — route through `sanitiseWidths`/`defaultLayout` before use.
   */
  defaultWidths?: number[];
  /** Whether a new instance of this container starts growable. */
  defaultGrow?: boolean;
  /**
   * @deprecated Use `container` with `columns`/`widths`. Read as a container of
   * `DEFAULT_WIDTHS` columns with the cell count pinned to this number.
   */
  slots?: number;
  /**
   * Section type keys allowed in this container's cells. On a `container` type,
   * omitting it allows any type, subject to the nesting cap — that is how nesting
   * is reachable without enumerating types. The deprecated `slots=` alias keeps the
   * old rule instead: omitting it there allows any non-container type.
   */
  accepts?: string[];
}

/** Beyond 6 columns a card is under ~170px on the 1024px canvas — unreadable. */
export const MAX_COLUMNS = 6;
/** A single weight beyond 12 makes the other columns unusably thin. */
export const MAX_WIDTH = 12;
/** Container nesting levels: a top-level container is 1, one inside a cell is 2. */
export const MAX_CONTAINER_LEVELS = 2;
/** Global section budget; also the sanity clamp on an incoming `cells` length. */
export const MAX_SECTIONS = 500;
/** What a bare `container` declaration seeds. */
export const DEFAULT_WIDTHS: readonly number[] = [1, 1, 1];

/** Container-ness is a property of the registered type, never of the instance. */
export function isContainer(type: PageSectionType | undefined): boolean {
  return Boolean(type?.container ?? (type?.slots !== undefined && type.slots > 0));
}

/**
 * Coerces a weights list into a usable one: each entry a whole number from 1 to
 * MAX_WIDTH (anything unusable becomes 1), at most MAX_COLUMNS entries, falling
 * back to DEFAULT_WIDTHS only when nothing usable remains.
 */
export function sanitiseWidths(raw: unknown): number[] {
  const list = Array.isArray(raw) ? raw.slice(0, MAX_COLUMNS) : [];
  const clean = list.map(entry => {
    const n = typeof entry === 'number' && Number.isFinite(entry) ? Math.floor(entry) : 1;
    return Math.min(Math.max(n, 1), MAX_WIDTH);
  });
  return clean.length ? clean : [...DEFAULT_WIDTHS];
}

/** The layout a newly placed instance of a container type starts with. */
export function defaultLayout(type: PageSectionType | undefined): PageContainerLayout {
  return {
    widths: sanitiseWidths(type?.defaultWidths ?? [...DEFAULT_WIDTHS]),
    grow: Boolean(type?.defaultGrow),
  };
}

/** Drag-and-drop MIME carrying a section type id from the palette to the canvas. */
export const PAGE_TYPE_MIME = 'application/x-zn-page-type';
/** Drag-and-drop MIME carrying a placed section's id when reordering. */
export const PAGE_SECTION_MIME = 'application/x-zn-page-section';

export function emptyPageState(): PageState {
  return {sections: []};
}

let sectionCounter = 0;

/** Unique-enough id for a new section, stable across edits once assigned. */
export function generateSectionId(): string {
  return `s-${Date.now().toString(36)}-${(sectionCounter++).toString(36)}`;
}

/**
 * The visible text of the option a value was chosen from, so a card summarises a
 * select by what the user picked rather than by the opaque id it stores.
 */
function optionLabel(type: PageSectionType | undefined, name: string, value: string): string {
  const control = type?.configTemplate?.content.querySelector(`[name="${CSS.escape(name)}"]`);
  const escaped = CSS.escape(value);
  const option = control?.querySelector(`option[value="${escaped}"], zn-option[value="${escaped}"]`);
  return option?.textContent?.trim() ?? '';
}

/**
 * Card summary: the label of the first value chosen from a select, else the first
 * non-empty string value, else the type description. Options win over field order
 * so a tile reads as its linked item however its other fields were filled in.
 */
export function sectionSummary(section: PageSection, type?: PageSectionType): string {
  if (isContainer(type)) {
    const columns = sanitiseWidths(section.layout?.widths ?? type?.defaultWidths).length;
    const count = (section.cells ?? []).reduce((n, cell) => n + cell.length, 0);
    const col = `${columns} column${columns === 1 ? '' : 's'}`;
    return `${col} · ${count} section${count === 1 ? '' : 's'}`;
  }
  const strings = Object.entries(section.data)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim() !== '');
  for (const [name, value] of strings) {
    const label = optionLabel(type, name, value);
    if (label) return label;
  }
  return strings[0]?.[1] ?? type?.description ?? '';
}
