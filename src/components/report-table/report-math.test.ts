import {aggregate, columnValue, compileFormula, computeTotals} from './report-math';
import {expect} from '@open-wc/testing';
import type { ReportColumn, ReportRow, ReportValues} from './report-math';

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

  it('throws SyntaxError on bad syntax', () => {
    expect(() => compileFormula('1 +')).to.throw(SyntaxError);
    expect(() => compileFormula('{a')).to.throw(SyntaxError);
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
});
