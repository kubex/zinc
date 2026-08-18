import {
  cellRows,
  cloneWithNewIds,
  containerCells,
  containerColumns,
  containerDepth,
  containerHeight,
  extractSection,
  findSection,
  insertIntoCell,
  migrateSection,
  normaliseCells,
  normaliseGrowth,
  normaliseSections,
  padCells,
  patchSection,
  recolumnCells,
  trimTrailingEmptyCells,
  type TypeLookup,
} from './page-tree';
import {
  DEFAULT_WIDTHS,
  defaultLayout,
  isContainer,
  MAX_COLUMNS,
  MAX_SECTIONS,
  type PageSection,
  type PageSectionType,
  sectionSummary,
} from './page.types';
import {expect} from '@open-wc/testing';

const containerType = (over: Partial<PageSectionType> = {}): PageSectionType =>
  ({type: 'row', label: 'Row', container: true, ...over});

describe('page.types container helpers', () => {
  it('treats a container flag and the deprecated slots count as containers', () => {
    expect(isContainer(containerType())).to.be.true;
    expect(isContainer({type: 'grid', label: 'Grid', slots: 6})).to.be.true;
    expect(isContainer({type: 'hero', label: 'Hero'})).to.be.false;
    expect(isContainer(undefined)).to.be.false;
  });

  it('seeds a bare container with three equal columns', () => {
    expect(defaultLayout(containerType())).to.deep.equal({widths: [...DEFAULT_WIDTHS], grow: false});
  });

  it('seeds from defaultWidths and defaultGrow when declared', () => {
    expect(defaultLayout(containerType({defaultWidths: [1, 2, 1], defaultGrow: true})))
      .to.deep.equal({widths: [1, 2, 1], grow: true});
  });

  it('clamps a declared column count to MAX_COLUMNS', () => {
    const widths = Array.from({length: MAX_COLUMNS + 3}, () => 1);
    expect(defaultLayout(containerType({defaultWidths: widths})).widths).to.have.lengthOf(MAX_COLUMNS);
  });

  it('summarises a container by its shape rather than its data', () => {
    const section: PageSection = {
      id: 'c1',
      type: 'row',
      data: {title: 'ignored'},
      layout: {widths: [1, 2, 1], grow: false},
      cells: [[{id: 'a', type: 'hero', data: {}}], [{id: 'b', type: 'hero', data: {}}], []],
    };
    expect(sectionSummary(section, containerType())).to.equal('3 columns · 2 sections');
  });

  it('singularises a one-column, one-section container', () => {
    const section: PageSection = {
      id: 'c1',
      type: 'row',
      data: {},
      layout: {widths: [1], grow: false},
      cells: [[{id: 'a', type: 'hero', data: {}}]],
    };
    expect(sectionSummary(section, containerType())).to.equal('1 column · 1 section');
  });

  it('still summarises a non-container from its data', () => {
    const section: PageSection = {id: 'h1', type: 'hero', data: {title: 'Help Centre'}};
    expect(sectionSummary(section, {type: 'hero', label: 'Hero'})).to.equal('Help Centre');
  });
});

const s = (id: string): PageSection => ({id, type: 'hero', data: {}});

describe('page-tree cell normalisation', () => {
  it('drops only trailing empty cells', () => {
    expect(trimTrailingEmptyCells([[s('a')], [], [s('b')], [], []]))
      .to.deep.equal([[s('a')], [], [s('b')]]);
  });

  it('pads to a whole number of rows', () => {
    expect(padCells([[s('a')], [s('b')]], 3)).to.deep.equal([[s('a')], [s('b')], []]);
  });

  it('keeps at least one row for an empty container', () => {
    expect(padCells([], 3)).to.deep.equal([[], [], []]);
    expect(normaliseCells([], 2, true)).to.deep.equal([[], []]);
  });

  it('keeps a fixed container trailing empty row', () => {
    const cells = [[s('a')], [], [], [], [], []];
    expect(normaliseCells(cells, 3, false)).to.have.lengthOf(6);
    expect(normaliseCells(cells, 3, false)).to.deep.equal(cells);
  });

  it('trims a growable container trailing empty row', () => {
    const cells = [[s('a')], [], [], [], [], []];
    expect(normaliseCells(cells, 3, true)).to.deep.equal([[s('a')], [], []]);
  });

  it('re-chunks losslessly when the column count changes', () => {
    const cells = [[s('a')], [s('b')], [s('c')], [s('d')]];
    const widened = recolumnCells(cells, 4);
    expect(widened).to.deep.equal([[s('a')], [s('b')], [s('c')], [s('d')]]);

    const narrowed = recolumnCells(cells, 2);
    expect(narrowed).to.deep.equal([[s('a')], [s('b')], [s('c')], [s('d')]]);
    expect(cellRows(narrowed, 2)).to.deep.equal([
      [[s('a')], [s('b')]],
      [[s('c')], [s('d')]],
    ]);
  });

  it('never loses a section when narrowing columns', () => {
    const cells = [[s('a'), s('b')], [], [s('c')], [], [], []];
    const narrowed = recolumnCells(cells, 1);
    const ids = narrowed.flat().map(x => x.id);
    expect(ids).to.deep.equal(['a', 'b', 'c']);
  });

  it('chunks cells into rows row-major', () => {
    expect(cellRows([[s('a')], [s('b')], [s('c')], [s('d')]], 3)).to.deep.equal([
      [[s('a')], [s('b')], [s('c')]],
      [[s('d')]],
    ]);
  });

  it('reads a container instance layout, falling back to the type then the default', () => {
    const type: PageSectionType = {type: 'row', label: 'Row', container: true, defaultWidths: [2, 1]};
    const withLayout: PageSection = {id: 'c', type: 'row', data: {}, layout: {widths: [1, 2, 1], grow: true}};
    const bare: PageSection = {id: 'c', type: 'row', data: {}};
    expect(containerColumns(withLayout, type)).to.equal(3);
    expect(containerColumns(bare, type)).to.equal(2);
    expect(containerColumns(bare, {type: 'row', label: 'Row', container: true})).to.equal(3);
  });

  it('returns no cells for a non-container', () => {
    expect(containerCells({id: 'h', type: 'hero', data: {}}, {type: 'hero', label: 'Hero'}))
      .to.deep.equal([]);
  });
});

describe('page-tree recursive operations', () => {
  const nested = (): PageSection[] => [
    {id: 'top', type: 'hero', data: {}},
    {
      id: 'outer',
      type: 'row',
      data: {},
      layout: {widths: [1, 1], grow: false},
      cells: [
        [{id: 'a', type: 'hero', data: {}}],
        [
          {
            id: 'inner',
            type: 'row',
            data: {},
            layout: {widths: [1, 1], grow: false},
            cells: [[{id: 'deep', type: 'hero', data: {}}], []],
          },
        ],
      ],
    },
  ];

  it('finds sections at every level', () => {
    const sections = nested();
    expect(findSection(sections, 'top')?.id).to.equal('top');
    expect(findSection(sections, 'a')?.id).to.equal('a');
    expect(findSection(sections, 'deep')?.id).to.equal('deep');
    expect(findSection(sections, 'nope')).to.be.undefined;
    expect(findSection(sections, null)).to.be.undefined;
  });

  it('patches a section nested two levels down', () => {
    const patched = patchSection(nested(), 'deep', sec => ({...sec, label: 'renamed'}));
    expect(findSection(patched, 'deep')?.label).to.equal('renamed');
    expect(findSection(patched, 'a')?.label).to.be.undefined;
  });

  it('extracts from a nested cell and leaves the cell empty', () => {
    const [removed, rest] = extractSection(nested(), 'deep');
    expect(removed?.id).to.equal('deep');
    expect(findSection(rest, 'deep')).to.be.undefined;
    expect(findSection(rest, 'inner')?.cells?.[0]).to.deep.equal([]);
  });

  it('extracts a whole container with its contents', () => {
    const [removed, rest] = extractSection(nested(), 'inner');
    expect(removed?.id).to.equal('inner');
    expect(findSection(removed ? [removed] : [], 'deep')?.id).to.equal('deep');
    expect(findSection(rest, 'deep')).to.be.undefined;
    expect(findSection(rest, 'inner')).to.be.undefined;
  });

  it('inserts into a cell at an index', () => {
    const sections = insertIntoCell(nested(), 'outer', 0, 0, {id: 'new', type: 'hero', data: {}}, 2);
    expect(findSection(sections, 'outer')?.cells?.[0].map(x => x.id)).to.deep.equal(['new', 'a']);
  });

  it('appends when the insert index is past the end of the stack', () => {
    const sections = insertIntoCell(nested(), 'outer', 0, 99, {id: 'new', type: 'hero', data: {}}, 2);
    expect(findSection(sections, 'outer')?.cells?.[0].map(x => x.id)).to.deep.equal(['a', 'new']);
  });

  it('extends the cell list when inserting past the last row', () => {
    const sections = insertIntoCell(nested(), 'outer', 3, 0, {id: 'new', type: 'hero', data: {}}, 2);
    const cells = findSection(sections, 'outer')?.cells ?? [];
    expect(cells).to.have.lengthOf(4);
    expect(cells[3].map(x => x.id)).to.deep.equal(['new']);
  });

  it('clamps a negative, fractional, or non-finite cell index into cell 0', () => {
    const negative = insertIntoCell(nested(), 'outer', -1, 0, {id: 'new', type: 'hero', data: {}}, 2);
    expect(findSection(negative, 'outer')?.cells?.[0].map(x => x.id)).to.deep.equal(['new', 'a']);

    const fractional = insertIntoCell(nested(), 'outer', 0.5, 0, {id: 'new2', type: 'hero', data: {}}, 2);
    expect(findSection(fractional, 'outer')?.cells?.[0].map(x => x.id)).to.deep.equal(['new2', 'a']);

    const infinite = insertIntoCell(nested(), 'outer', Infinity, 0, {id: 'new3', type: 'hero', data: {}}, 2);
    expect(findSection(infinite, 'outer')?.cells?.[0].map(x => x.id)).to.deep.equal(['new3', 'a']);
  });

  it('reports container nesting depth', () => {
    const sections = nested();
    expect(containerDepth(sections, 'outer')).to.equal(1);
    expect(containerDepth(sections, 'inner')).to.equal(2);
    expect(containerDepth(sections, 'missing')).to.equal(0);
  });

  it('clones a container giving every descendant a fresh id', () => {
    const original = findSection(nested(), 'outer')!;
    const copy = cloneWithNewIds(original);
    expect(copy.id).to.not.equal(original.id);
    expect(copy.cells?.[0][0].id).to.not.equal('a');
    expect(copy.cells?.[1][0].cells?.[0][0].id).to.not.equal('deep');
    expect(findSection([original], 'deep')?.id).to.equal('deep');
  });

  const containerAt = (id: string, cells: PageSection[][]): PageSection =>
    ({id, type: 'row', data: {}, layout: {widths: [1], grow: false}, cells});

  it('heights a flat container (no nested containers) at 1', () => {
    const flat = containerAt('flat', [[{id: 'a', type: 'hero', data: {}}], []]);
    expect(containerHeight(flat)).to.equal(1);
  });

  it('heights a container with one nested level at 2', () => {
    const oneDeep = containerAt('l1', [[containerAt('l2', [[{id: 'leaf', type: 'hero', data: {}}]])]]);
    expect(containerHeight(oneDeep)).to.equal(2);
  });

  it('heights a container with two nested levels at 3', () => {
    const twoDeep = containerAt('l1', [[containerAt('l2', [[containerAt('l3', [[{id: 'leaf', type: 'hero', data: {}}]])]])]]);
    expect(containerHeight(twoDeep)).to.equal(3);
  });

  it('heights a non-container at 0', () => {
    expect(containerHeight({id: 'h', type: 'hero', data: {}})).to.equal(0);
  });
});

describe('page-tree commit-time growth normalisation', () => {
  const lookup: TypeLookup = key => ({
    row: {type: 'row', label: 'Row', container: true},
    hero: {type: 'hero', label: 'Hero'},
  })[key];

  it('trims a growable container trailing empty row across the whole tree', () => {
    const sections: PageSection[] = [{
      id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: true},
      cells: [[s('a')], [s('b')], [], []],
    }];
    const normalised = normaliseGrowth(sections, lookup);
    expect(normalised[0].cells).to.deep.equal([[s('a')], [s('b')]]);
  });

  it('leaves a fixed container trailing empty row untouched', () => {
    const sections: PageSection[] = [{
      id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: false},
      cells: [[s('a')], [s('b')], [], []],
    }];
    expect(normaliseGrowth(sections, lookup)).to.deep.equal(sections);
  });

  it('is idempotent', () => {
    const sections: PageSection[] = [{
      id: 'outer', type: 'row', data: {}, layout: {widths: [1, 1], grow: true},
      cells: [[s('a')], [], [], []],
    }];
    const once = normaliseGrowth(sections, lookup);
    expect(normaliseGrowth(once, lookup)).to.deep.equal(once);
  });

  it('leaves cells untouched on a section whose type is not a registered container', () => {
    const sections: PageSection[] = [{id: 'ghost', type: 'not-registered', data: {}, cells: [[s('a')], []]}];
    expect(normaliseGrowth(sections, lookup)).to.deep.equal(sections);
  });
});

describe('page-tree migration and normalisation', () => {
  const lookup: TypeLookup = key => ({
    hero: {type: 'hero', label: 'Hero'},
    grid: {type: 'grid', label: 'Grid', slots: 6},
    row: {type: 'row', label: 'Row', container: true},
  })[key];

  it('migrates a flat null-padded children array to cells', () => {
    const migrated = migrateSection(
      {
        id: 'g1',
        type: 'grid',
        data: {},
        children: [{id: 'a', type: 'hero', data: {}}, null, {id: 'b', type: 'hero', data: {}}, null, null, null],
      },
      lookup('grid')
    );
    expect(migrated.children).to.be.undefined;
    expect(migrated.layout).to.deep.equal({widths: [1, 1, 1], grow: false});
    expect(migrated.cells).to.have.lengthOf(6);
    expect(migrated.cells?.[0].map(x => x.id)).to.deep.equal(['a']);
    expect(migrated.cells?.[1]).to.deep.equal([]);
    expect(migrated.cells?.[2].map(x => x.id)).to.deep.equal(['b']);
  });

  it('leaves a section without children untouched', () => {
    const section: PageSection = {id: 'h', type: 'hero', data: {}};
    expect(migrateSection(section, lookup('hero'))).to.deep.equal(section);
  });

  it('normalises an old-shape page and reports no warnings', () => {
    const {sections, warnings} = normaliseSections(
      [{id: 'g1', type: 'grid', data: {}, children: [{id: 'a', type: 'hero', data: {}}, null, null]}],
      lookup
    );
    expect(warnings).to.deep.equal([]);
    expect(sections[0].cells?.[0].map(x => x.id)).to.deep.equal(['a']);
    expect(sections[0].children).to.be.undefined;
  });

  it('regenerates duplicate and missing ids across nesting levels', () => {
    const {sections} = normaliseSections(
      [
        {id: 'dup', type: 'row', data: {}, cells: [[{id: 'dup', type: 'hero', data: {}}]]},
        {type: 'hero', data: {}},
      ],
      lookup
    );
    const ids = [sections[0].id, sections[0].cells![0][0].id, sections[1].id];
    expect(new Set(ids).size).to.equal(3);
    expect(ids.every(Boolean)).to.be.true;
  });

  it('drops entries that are not sections', () => {
    const {sections} = normaliseSections(
      [{id: 'a', type: 'hero', data: {}}, null, {id: 'b'}, {type: 42}, 'nope'],
      lookup
    );
    expect(sections.map(x => x.id)).to.deep.equal(['a']);
  });

  it('empties the cells of a container nested past the level cap but keeps the section', () => {
    const {sections, warnings} = normaliseSections(
      [
        {
          id: 'l1',
          type: 'row',
          data: {},
          cells: [[{id: 'l2', type: 'row', data: {}, cells: [[{id: 'l3', type: 'row', data: {}, cells: [[{id: 'x', type: 'hero', data: {}}]]}]]}]],
        },
      ],
      lookup
    );
    expect(findSection(sections, 'l3')?.id).to.equal('l3');
    expect(findSection(sections, 'l3')?.cells).to.deep.equal([]);
    expect(findSection(sections, 'x')).to.be.undefined;
    expect(warnings.some(w => w.includes('nesting'))).to.be.true;
  });

  it('falls back to default widths for an unusable layout and warns', () => {
    const {sections, warnings} = normaliseSections(
      [{id: 'r', type: 'row', data: {}, layout: {widths: [], grow: false}, cells: [[]]}],
      lookup
    );
    expect(sections[0].layout?.widths).to.deep.equal([1, 1, 1]);
    expect(warnings.some(w => w.includes('widths'))).to.be.true;
  });

  it('warns and corrects non-numeric width entries', () => {
    const {sections, warnings} = normaliseSections(
      [{id: 'r', type: 'row', data: {}, layout: {widths: ['a', 'b', 'c'], grow: false}, cells: [[]]}],
      lookup
    );
    expect(sections[0].layout?.widths).to.deep.equal([1, 1, 1]);
    expect(warnings.some(w => w.includes('widths'))).to.be.true;
  });

  it('warns and corrects out-of-range width entries', () => {
    const {sections, warnings} = normaliseSections(
      [{id: 'r', type: 'row', data: {}, layout: {widths: [-5, 0, 999], grow: false}, cells: [[]]}],
      lookup
    );
    expect(sections[0].layout?.widths).to.deep.equal([1, 1, 12]);
    expect(warnings.some(w => w.includes('widths'))).to.be.true;
  });

  it('warns and truncates more than MAX_COLUMNS width entries', () => {
    const {sections, warnings} = normaliseSections(
      [{id: 'r', type: 'row', data: {}, layout: {widths: [1, 1, 1, 1, 1, 1, 1], grow: false}, cells: [[]]}],
      lookup
    );
    expect(sections[0].layout?.widths).to.deep.equal([1, 1, 1, 1, 1, 1]);
    expect(warnings.some(w => w.includes('widths'))).to.be.true;
  });

  it('does not warn when widths are already valid', () => {
    const {sections, warnings} = normaliseSections(
      [{id: 'r', type: 'row', data: {}, layout: {widths: [1, 2, 1], grow: false}, cells: [[]]}],
      lookup
    );
    expect(sections[0].layout?.widths).to.deep.equal([1, 2, 1]);
    expect(warnings.some(w => w.includes('widths'))).to.be.false;
  });

  it('clamps an absurd cells length and warns', () => {
    const cells = Array.from({length: MAX_SECTIONS + 10}, () => [] as PageSection[]);
    const {sections, warnings} = normaliseSections(
      [{id: 'r', type: 'row', data: {}, layout: {widths: [1, 1, 1], grow: false}, cells}],
      lookup
    );
    expect(sections[0].cells!.length).to.be.at.most(MAX_SECTIONS);
    expect(warnings.some(w => w.includes('cells'))).to.be.true;
  });

  it('clamps the total section count and warns', () => {
    const many = Array.from({length: MAX_SECTIONS + 5}, (_, i) => ({id: `s${i}`, type: 'hero', data: {}}));
    const {sections, warnings} = normaliseSections(many, lookup);
    expect(sections).to.have.lengthOf(MAX_SECTIONS);
    expect(warnings.some(w => w.includes('sections'))).to.be.true;
  });

  it('bounds total sections across nested containers, not just the top level', () => {
    const heroesPerInner = 300;
    const heroes = (prefix: string) =>
      Array.from({length: heroesPerInner}, (_, i) => [{id: `${prefix}-h${i}`, type: 'hero', data: {}}]);
    const inner = (id: string): PageSection =>
      ({id, type: 'row', data: {}, layout: {widths: [1], grow: false}, cells: heroes(id)});
    // One level-1 container holding three level-2 containers, each with 300 heroes —
    // 904 sections in total, none of which trips the per-container cells clamp
    // (300 < 500), only the whole-tree budget.
    const outer: PageSection = {
      id: 'outer', type: 'row', data: {}, layout: {widths: [1], grow: false},
      cells: [[inner('a')], [inner('b')], [inner('c')]],
    };
    const {sections, warnings} = normaliseSections([outer], lookup);

    const countAll = (list: PageSection[]): number =>
      list.reduce((n, section) => n + 1 + (section.cells ?? []).reduce((m, cell) => m + countAll(cell), 0), 0);
    expect(countAll(sections)).to.be.at.most(MAX_SECTIONS);
    expect(warnings.some(w => w.includes('sections'))).to.be.true;
  });

  it('preserves cells on an unregistered type', () => {
    const {sections} = normaliseSections(
      [{id: 'ghost', type: 'not-registered', data: {}, cells: [[{id: 'kept', type: 'hero', data: {}}]]}],
      lookup
    );
    expect(findSection(sections, 'kept')?.id).to.equal('kept');
  });
});
