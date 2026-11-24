import {aggregate, columnValue, compileFormula, computeTotals, filterRows, parseColumnFilter} from './report-math';
import {expect} from '@open-wc/testing';
import type {ColumnFilter, ReportColumn, ReportRow, ReportValues} from './report-math';

describe('report-math', () => {
  it('evaluates arithmetic with precedence, parentheses, unary minus and a leading =', () => {
    expect(compileFormula('1 + 2 * 3')({})).to.equal(7);
    expect(compileFormula('(1 + 2) * 3')({})).to.equal(9);
    expect(compileFormula('-{a} + 4')({a: 1})).to.equal(3);
    expect(compileFormula('=10 / 4')({})).to.equal(2.5);
  });

  it('resolves placeholders to 0 when missing, zero-divided or non-numeric, and parses numeric strings', () => {
    expect(compileFormula('{a} / {b}')({a: 5, b: 0})).to.equal(0);
    expect(compileFormula('{x.y.z}')({})).to.equal(0);
    expect(compileFormula('{a}')({a: '12.5'})).to.equal(12.5);
  });

  it('evaluates min and max with any number of arguments', () => {
    expect(compileFormula('max(0, {a} - {b})')({a: 1, b: 5})).to.equal(0);
    expect(compileFormula('min(1, {a} / {b})')({a: 9, b: 3})).to.equal(1);
    expect(compileFormula('MAX(1, 2, 3)')({})).to.equal(3);
  });

  it('throws SyntaxError on bad syntax', () => {
    expect(() => compileFormula('1 +')).to.throw(SyntaxError);
    expect(() => compileFormula('{a')).to.throw(SyntaxError);
    expect(() => compileFormula('sum(1, 2)')).to.throw(SyntaxError);
    expect(() => compileFormula('max 1')).to.throw(SyntaxError);
  });

  it('shows 0 for an invalid formula and warns once', () => {
    const original = console.warn;
    const warnings: unknown[] = [];
    console.warn = (...args: unknown[]) => warnings.push(args);
    try {
      const column: ReportColumn = {key: 'x', label: 'X', formula: '{a} * (2'};
      expect(columnValue(column, {a: 3})).to.equal(0);
      expect(columnValue(column, {a: 4})).to.equal(0);
      expect(warnings).to.have.length(1);
      expect(() => compileFormula('{a} * (2')).to.throw(SyntaxError);
    } finally {
      console.warn = original;
    }
  });

  it('aggregates numeric leaves by path and skips non-numeric strings', () => {
    expect(aggregate([
      {d1: {i: {unique: 2}}, label: 'x'},
      {d1: {i: {unique: 3}}, d2: {total: {revenue: '1.5'}}},
    ])).to.deep.equal({d1: {i: {unique: 5}}, d2: {total: {revenue: 1.5}}});
  });

  it('ignores prototype-polluting keys when aggregating', () => {
    aggregate([JSON.parse('{"__proto__": {"polluted": 1}}') as ReportValues]);
    expect(({} as Record<string, unknown>).polluted).to.be.undefined;
  });

  it('recalculates ratio totals from summed inputs', () => {
    const columns: ReportColumn[] = [{key: 'r', label: 'R', format: 'percent', formula: '{a} / {b}'}];
    const rows: ReportRow[] = [{a: 1, b: 10}, {a: 9, b: 10}, {a: 0, b: 80}].map((values, i) => ({id: `${i}`, label: `${i}`, values}));
    expect(computeTotals(columns, rows).r).to.equal(0.1);
  });

  it('returns null totals for non-summable and text columns', () => {
    const columns: ReportColumn[] = [
      {key: 'a', label: 'A', summable: false},
      {key: 'b', label: 'B', format: 'text'},
    ];
    const totals = computeTotals(columns, [{id: '1', label: '1', values: {a: 1, b: 2}}]);
    expect(totals.a).to.be.null;
    expect(totals.b).to.be.null;
  });

  it('parses typed column filters', () => {
    expect(parseColumnFilter('>1,000')).to.deep.equal({op: 'gt', value: 1000});
    expect(parseColumnFilter('<= -5')).to.deep.equal({op: 'lte', value: -5});
    expect(parseColumnFilter('$50..10')).to.deep.equal({op: 'between', min: 10, max: 50});
    expect(parseColumnFilter('!0')).to.deep.equal({op: 'nonzero'});
    expect(parseColumnFilter('Top 5')).to.deep.equal({op: 'top', count: 5});
    expect(parseColumnFilter('2.5%')).to.deep.equal({op: 'gte', value: 2.5});
    expect(parseColumnFilter('Nova', true)).to.deep.equal({op: 'contains', text: 'nova'});
    expect(parseColumnFilter('  ')).to.be.null;
    expect(parseColumnFilter('>>1')).to.be.null;
    expect(parseColumnFilter('top 0')).to.be.null;
  });

  it('filters rows, ranking top and bottom among the rows the other filters leave', () => {
    const rows = [{id: 'a', n: 5}, {id: 'b', n: -2}, {id: 'c', n: 0}, {id: 'd', n: 9}];
    const value = (row: {n: number}) => row.n;
    type Row = typeof rows[number];
    const ids = (filters: {filter: ColumnFilter; value: (row: Row) => number}[]) => filterRows(rows, filters).map(row => row.id);

    expect(ids([{filter: {op: 'gt', value: 0}, value}])).to.deep.equal(['a', 'd']);
    expect(ids([{filter: {op: 'nonzero'}, value}, {filter: {op: 'lt', value: 6}, value}])).to.deep.equal(['a', 'b']);
    expect(ids([{filter: {op: 'top', count: 1}, value}, {filter: {op: 'lt', value: 6}, value}])).to.deep.equal(['a']);
    expect(ids([{filter: {op: 'bottom', count: 2}, value}])).to.deep.equal(['b', 'c']);
  });
});
