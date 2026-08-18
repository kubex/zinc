import {
  DEFAULT_WIDTHS,
  defaultLayout,
  generateSectionId,
  isContainer,
  MAX_COLUMNS,
  MAX_CONTAINER_LEVELS,
  MAX_SECTIONS,
  type PageContainerLayout,
  type PageSection,
  type PageSectionType,
  sanitiseWidths,
} from './page.types';

/** Clamps a requested column count into the supported range. */
function columnCount(columns: number): number {
  return Math.min(Math.max(Math.floor(columns) || 1, 1), MAX_COLUMNS);
}

/** Drops trailing cells that hold nothing. Interior empties are meaningful and kept. */
export function trimTrailingEmptyCells(cells: PageSection[][]): PageSection[][] {
  let end = cells.length;
  while (end > 0 && cells[end - 1].length === 0) end--;
  return cells.slice(0, end);
}

/** Pads to a whole number of rows, always leaving at least one row to drop into. */
export function padCells(cells: PageSection[][], columns: number): PageSection[][] {
  const cols = columnCount(columns);
  const remainder = cells.length % cols;
  const pad = cells.length === 0 ? cols : remainder === 0 ? 0 : cols - remainder;
  return [...cells, ...Array.from({length: pad}, () => [] as PageSection[])];
}

/**
 * The canonical cell list for a container. A growable container never keeps a
 * trailing all-empty row (the renderer supplies the `+` row itself, so keeping
 * one would show two); a fixed container's trailing empty row is its layout and
 * survives untouched.
 */
export function normaliseCells(cells: PageSection[][], columns: number, grow: boolean): PageSection[][] {
  return padCells(grow ? trimTrailingEmptyCells(cells) : cells, columns);
}

/**
 * Re-chunks the same ordered list of stacks into a different column count. Only
 * trailing empties are dropped, so no section can be lost by a column change.
 */
export function recolumnCells(cells: PageSection[][], columns: number): PageSection[][] {
  return padCells(trimTrailingEmptyCells(cells), columns);
}

/** Row-major view of the flat cell list, for rendering. */
export function cellRows(cells: PageSection[][], columns: number): PageSection[][][] {
  const cols = columnCount(columns);
  const rows: PageSection[][][] = [];
  for (let i = 0; i < cells.length; i += cols) rows.push(cells.slice(i, i + cols));
  return rows;
}

export function containerWidths(section: PageSection, type?: PageSectionType): number[] {
  return sanitiseWidths(section.layout?.widths ?? type?.defaultWidths ?? [...DEFAULT_WIDTHS]);
}

export function containerColumns(section: PageSection, type?: PageSectionType): number {
  return containerWidths(section, type).length;
}

export function containerGrow(section: PageSection, type?: PageSectionType): boolean {
  return section.layout?.grow ?? Boolean(type?.defaultGrow);
}

/** A container's cells, normalised. Empty for a non-container. */
export function containerCells(section: PageSection, type?: PageSectionType): PageSection[][] {
  if (!isContainer(type)) return [];
  return normaliseCells(section.cells ?? [], containerColumns(section, type), containerGrow(section, type));
}

/** Depth-first search across top-level sections and every cell stack. */
export function findSection(sections: PageSection[], id: string | null): PageSection | undefined {
  if (!id) return undefined;
  for (const section of sections) {
    if (section.id === id) return section;
    for (const cell of section.cells ?? []) {
      const hit = findSection(cell, id);
      if (hit) return hit;
    }
  }
  return undefined;
}

/** New section array with `id` replaced by `patch(section)`, wherever it lives. */
export function patchSection(
  sections: PageSection[],
  id: string,
  patch: (section: PageSection) => PageSection
): PageSection[] {
  return sections.map(section => {
    if (section.id === id) return patch(section);
    if (!section.cells) return section;
    return {...section, cells: section.cells.map(cell => patchSection(cell, id, patch))};
  });
}

/** Detaches a section from wherever it lives, returning it and the remaining tree. */
export function extractSection(
  sections: PageSection[],
  id: string
): [PageSection | undefined, PageSection[]] {
  let removed: PageSection | undefined;
  const out: PageSection[] = [];
  for (const section of sections) {
    if (section.id === id) {
      removed = section;
      continue;
    }
    if (section.cells) {
      const cells = section.cells.map(cell => {
        const [hit, rest] = extractSection(cell, id);
        if (hit) removed = hit;
        return rest;
      });
      out.push({...section, cells});
    } else {
      out.push(section);
    }
  }
  return [removed, out];
}

/** Inserts a section into a container's cell at a stack position. */
export function insertIntoCell(
  sections: PageSection[],
  containerId: string,
  cellIndex: number,
  insertIndex: number,
  section: PageSection,
  columns: number
): PageSection[] {
  return patchSection(sections, containerId, container => {
    const cells = (container.cells ?? []).map(cell => [...cell]);
    const target = Number.isFinite(cellIndex) ? Math.max(0, Math.floor(cellIndex)) : 0;
    while (cells.length <= target) cells.push([]);
    const cell = cells[target];
    cell.splice(Math.max(0, Math.min(insertIndex, cell.length)), 0, section);
    return {...container, cells: padCells(cells, columns)};
  });
}

/**
 * Nesting level of the container with this id: 1 at the top level, 2 inside a
 * cell, 0 when not found. Only containers have cells, so every cell level is a
 * container level.
 */
export function containerDepth(sections: PageSection[], containerId: string, depth = 1): number {
  for (const section of sections) {
    if (section.id === containerId) return depth;
    for (const cell of section.cells ?? []) {
      const hit = containerDepth(cell, containerId, depth + 1);
      if (hit) return hit;
    }
  }
  return 0;
}

/** Deep copy with a fresh id for the section and every descendant. */
export function cloneWithNewIds(section: PageSection): PageSection {
  const reid = (s: PageSection): PageSection => ({
    ...structuredClone(s),
    id: generateSectionId(),
    ...(s.cells ? {cells: s.cells.map(cell => cell.map(reid))} : {}),
  });
  return reid(section);
}

/** Resolves a type key to its registered type — the registry's `get`. */
export type TypeLookup = (type: string) => PageSectionType | undefined;

/**
 * Height of a container's subtree: 1 for a container with no nested containers,
 * otherwise 1 + the tallest nested container's height. 0 for a non-container, so
 * it composes with containerDepth to bound how deep a moved subtree would reach:
 * dropping a section into a container at depth d puts the section's own deepest
 * descendant at d + containerHeight(section).
 */
export function containerHeight(section: PageSection): number {
  if (!section.cells) return 0;
  const nested = section.cells.flat().map(containerHeight);
  return 1 + Math.max(0, ...nested);
}

/**
 * Re-applies each container's own grow/columns normalisation throughout the
 * tree, so a growable container never carries a trailing all-empty row once
 * committed — not only when read out via containerCells. A section whose
 * current type isn't a registered container is left untouched, preserving its
 * cells verbatim per the unknown-type contract.
 */
export function normaliseGrowth(sections: PageSection[], lookup: TypeLookup): PageSection[] {
  return sections.map(section => {
    if (!section.cells) return section;
    const type = lookup(section.type);
    if (!isContainer(type)) return section;
    const cells = normaliseCells(section.cells, containerColumns(section, type), containerGrow(section, type))
      .map(cell => normaliseGrowth(cell, lookup));
    return {...section, cells};
  });
}

/**
 * Rewrites the pre-cells `children` shape as `cells`. The old grid was always
 * DEFAULT_WIDTHS wide, and the slot count was the layout, so cells are padded
 * out to the declared slot count, then rounded up to a whole number of
 * DEFAULT_WIDTHS-wide rows; never trimmed.
 */
export function migrateSection(section: PageSection, type?: PageSectionType): PageSection {
  if (!section.children) return section;
  const {children, ...rest} = section;
  const slots = type?.slots ?? children.length;
  const cells = Array.from({length: slots}, (_, i) => {
    const child = children[i];
    return child && typeof child.type === 'string' ? [child] : [];
  });
  return {
    ...rest,
    layout: section.layout ?? {widths: [...DEFAULT_WIDTHS], grow: false},
    cells: padCells(cells, DEFAULT_WIDTHS.length),
  };
}

function isSectionLike(value: unknown): value is PageSection {
  return Boolean(value) && typeof value === 'object' && typeof (value as PageSection).type === 'string';
}

/**
 * Normalises externally supplied sections: migrates the old shape, gives every
 * section a unique id, drops malformed entries, sanitises layouts, caps nesting
 * and clamps sizes. Pure — warnings are returned for the caller to log.
 */
export function normaliseSections(
  sections: unknown,
  lookup: TypeLookup
): {sections: PageSection[]; warnings: string[]} {
  const warnings: string[] = [];
  const seen = new Set<string>();
  // A running admitted-section budget shared across every level, so 500 containers
  // of 500 cells each can't slip past MAX_SECTIONS by hiding depth in nesting —
  // only the top-level count was ever bounded before.
  let remaining = MAX_SECTIONS;
  let budgetExceeded = false;

  const walk = (raw: PageSection, depth: number): PageSection | undefined => {
    if (remaining <= 0) {
      budgetExceeded = true;
      return undefined;
    }
    remaining--;
    const type = lookup(raw.type);
    const migrated = migrateSection(raw, type);
    const id = !migrated.id || seen.has(migrated.id) ? generateSectionId() : migrated.id;
    seen.add(id);

    const out: PageSection = {
      id,
      type: migrated.type,
      label: migrated.label,
      data: structuredClone(migrated.data ?? {}),
    };

    if (!migrated.cells) return out;

    // A container past the cap keeps its identity but not its contents, so a
    // malformed page loses as little as possible without unbounded recursion.
    if (depth > MAX_CONTAINER_LEVELS) {
      warnings.push(`container "${migrated.type}" exceeds ${MAX_CONTAINER_LEVELS} nesting levels; its cells were dropped`);
      out.layout = sanitiseLayout(migrated.layout, type, warnings);
      out.cells = [];
      return out;
    }

    const layout = sanitiseLayout(migrated.layout, type, warnings);
    // Slice to a whole number of rows (not MAX_SECTIONS itself) so the padding
    // below is a no-op and the clamped length never overshoots MAX_SECTIONS.
    const cols = layout.widths.length;
    const maxCells = Math.floor(MAX_SECTIONS / cols) * cols;
    let rawCells = migrated.cells;
    if (rawCells.length > maxCells) {
      warnings.push(`container "${migrated.type}" declared ${rawCells.length} cells; keeping the first ${maxCells}`);
      rawCells = rawCells.slice(0, maxCells);
    }

    out.layout = layout;
    out.cells = normaliseCells(
      rawCells.map(cell => (Array.isArray(cell)
        ? cell.filter(isSectionLike).map(child => walk(child, depth + 1)).filter(isDefined)
        : [])),
      layout.widths.length,
      layout.grow
    );
    return out;
  };

  const incoming = (Array.isArray(sections) ? sections : []).filter(isSectionLike);
  const kept = incoming.map(section => walk(section, 1)).filter(isDefined);
  if (budgetExceeded) {
    warnings.push(`page tree has more than ${MAX_SECTIONS} sections including nested ones; the rest were dropped`);
  }
  return {sections: kept, warnings};
}

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function sanitiseLayout(
  layout: PageContainerLayout | undefined,
  type: PageSectionType | undefined,
  warnings: string[]
): PageContainerLayout {
  const seeded = defaultLayout(type);
  if (!layout) return seeded;
  const widths = sanitiseWidths(layout.widths);
  const raw = layout.widths;
  const unchanged = Array.isArray(raw) && raw.length === widths.length && raw.every((w, i) => w === widths[i]);
  if (!unchanged) {
    warnings.push(`container layout had unusable widths; corrected to ${widths.join(' ')}`);
  }
  return {widths, grow: Boolean(layout.grow)};
}
