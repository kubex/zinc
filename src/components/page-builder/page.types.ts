import type {TemplateResult} from 'lit';

/** A section placed on a page. */
export interface PageSection {
  id: string;
  type: string;
  /** Overrides the type label when set (per-instance rename). */
  label?: string;
  /** Section content, keyed by field name (the inspector's `name` attributes). */
  data: Record<string, unknown>;
  /** Slots per row for a container whose type allows a choice; the type's default applies otherwise. */
  columns?: number;
  /** Slot contents for container sections, sized to {@link slotCount}. Empty slots are null. */
  children?: (PageSection | null)[];
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
  /**
   * Slots per row on the canvas, and what makes a section a container. Rows are
   * added as they fill, so this is a width and not a capacity. Containers cannot
   * be placed inside other containers.
   */
  slots?: number;
  /** Lower bound of a per-section column count. Defaults to 1 when `slotsMax` is set. */
  slotsMin?: number;
  /** Upper bound of a per-section column count. Its presence is what makes the width editable. */
  slotsMax?: number;
  /** Section type keys allowed in this container's slots. Omit to allow any non-container type. */
  accepts?: string[];
}

/** Per-container children beyond this are dropped when external state is applied. */
export const MAX_SLOTS = 24;

/**
 * Slots per row for a placed container: its own choice when the type allows one,
 * clamped to the declared bounds, else the type's fixed width.
 */
export function slotColumns(section: PageSection, type: PageSectionType): number {
  const columns = type.slots ?? 0;
  if (type.slotsMax === undefined) return columns;
  const chosen = Math.round(Number(section.columns ?? NaN));
  return Math.min(Math.max(Number.isFinite(chosen) ? chosen : columns, type.slotsMin ?? 1), type.slotsMax);
}

/**
 * How many slots a placed container shows: enough rows to hold every child it
 * already has, plus a fresh row once the last one fills. Empty rows are never
 * offered ahead of being needed, and the total stays within {@link MAX_SLOTS}.
 */
export function slotCount(section: PageSection, type: PageSectionType): number {
  const columns = slotColumns(section, type);
  if (columns < 1) return 0;
  const placed = section.children?.reduce((last, c, i) => (c ? i + 1 : last), 0) ?? 0;
  const rows = Math.ceil(placed / columns) || 1;
  const full = section.children?.slice((rows - 1) * columns, rows * columns)
    .filter(Boolean).length === columns;
  return Math.min(columns * (full ? rows + 1 : rows), Math.floor(MAX_SLOTS / columns) * columns);
}

/** A container section's slot contents, padded/truncated to its slot count. */
export function sectionChildren(section: PageSection, type: PageSectionType): (PageSection | null)[] {
  return Array.from({length: slotCount(section, type)}, (_, i) => section.children?.[i] ?? null);
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
  const strings = Object.entries(section.data)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].trim() !== '');
  for (const [name, value] of strings) {
    const label = optionLabel(type, name, value);
    if (label) return label;
  }
  return strings[0]?.[1] ?? type?.description ?? '';
}
