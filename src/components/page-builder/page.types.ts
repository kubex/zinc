import type {TemplateResult} from 'lit';

/** A section placed on a page. */
export interface PageSection {
  id: string;
  type: string;
  /** Overrides the type label when set (per-instance rename). */
  label?: string;
  /** Section content, keyed by field name (the inspector's `name` attributes). */
  data: Record<string, unknown>;
  /** Slot contents for container sections, sized to the type's `slots`. Empty slots are null. */
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
   * Number of child slots this section offers on the canvas (a container tile);
   * rendered as a 3-column grid. Containers cannot be placed inside other containers.
   */
  slots?: number;
  /** Section type keys allowed in this container's slots. Omit to allow any non-container type. */
  accepts?: string[];
}

/** A container section's slot contents, padded/truncated to the type's slot count. */
export function sectionChildren(section: PageSection, type: PageSectionType): (PageSection | null)[] {
  return Array.from({length: type.slots ?? 0}, (_, i) => section.children?.[i] ?? null);
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

/** Card summary: the section's first non-empty string value, else the type description. */
export function sectionSummary(section: PageSection, type?: PageSectionType): string {
  const first = Object.values(section.data).find(v => typeof v === 'string' && v.trim() !== '');
  return (first as string) ?? type?.description ?? '';
}
