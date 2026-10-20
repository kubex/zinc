import {clampRange, defaultPresets, isIso, monthGrid, pick, rangeLabel, todayIso} from './date-range-math';
import {expect} from '@open-wc/testing';

describe('date-range-math', () => {
  it('lists the eight quick ranges relative to today', () => {
    const presets = defaultPresets('2026-10-20');
    const byLabel = Object.fromEntries(presets.map(p => [p.label, {from: p.from, to: p.to}]));

    expect(presets.map(p => p.label)).to.deep.equal([
      'Today', 'Yesterday', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'This month', 'Last month', 'Last 90 days'
    ]);
    expect(byLabel['Today']).to.deep.equal({from: '2026-10-20', to: '2026-10-20'});
    expect(byLabel['Yesterday']).to.deep.equal({from: '2026-10-19', to: '2026-10-19'});
    expect(byLabel['Last 7 days']).to.deep.equal({from: '2026-10-13', to: '2026-10-20'});
    expect(byLabel['Last 90 days']).to.deep.equal({from: '2026-07-22', to: '2026-10-20'});
    expect(byLabel['This month']).to.deep.equal({from: '2026-10-01', to: '2026-10-20'});
    expect(byLabel['Last month']).to.deep.equal({from: '2026-09-01', to: '2026-09-30'});
  });

  it('handles last month across a year boundary', () => {
    const lastMonth = defaultPresets('2026-01-15').find(p => p.label === 'Last month');
    expect(lastMonth).to.deep.include({from: '2025-12-01', to: '2025-12-31'});
  });

  it('builds a 42-cell Monday-first month grid', () => {
    const grid = monthGrid(2026, 9);
    expect(grid).to.have.length(42);
    expect(grid.slice(0, 3)).to.deep.equal([null, null, null]);
    expect(grid[3]).to.equal('2026-10-01');
    expect(grid[33]).to.equal('2026-10-31');
    expect(grid[34]).to.equal(null);
  });

  it('formats a range label, or a single date when both ends match', () => {
    expect(rangeLabel('2026-10-19', '2026-10-20')).to.equal('19 Oct 2026 to 20 Oct 2026');
    expect(rangeLabel('2026-10-20', '2026-10-20')).to.equal('20 Oct 2026');
    expect(rangeLabel('2026-09-01', '2026-09-30')).to.equal('1 Sep 2026 to 30 Sep 2026');
  });

  it('picks a start, then an end, and restarts on an earlier day or after a full range', () => {
    let state = pick({from: '', to: ''}, '2026-10-10');
    expect(state).to.deep.equal({from: '2026-10-10', to: ''});

    state = pick(state, '2026-10-15');
    expect(state).to.deep.equal({from: '2026-10-10', to: '2026-10-15'});

    state = pick(state, '2026-10-12');
    expect(state).to.deep.equal({from: '2026-10-12', to: ''});

    state = pick(state, '2026-10-05');
    expect(state).to.deep.equal({from: '2026-10-05', to: ''});

    expect(pick({from: '2026-10-05', to: ''}, '2026-10-05')).to.deep.equal({from: '2026-10-05', to: '2026-10-05'});
  });

  it('clamps a range to min and max, or returns null when it lies wholly outside', () => {
    expect(clampRange({from: '2026-10-13', to: '2026-10-20'}, '', '2026-10-18')).to.deep.equal({from: '2026-10-13', to: '2026-10-18'});
    expect(clampRange({from: '2026-10-13', to: '2026-10-20'}, '2026-10-15', '')).to.deep.equal({from: '2026-10-15', to: '2026-10-20'});
    expect(clampRange({from: '2026-10-19', to: '2026-10-20'}, '', '2026-10-18')).to.equal(null);
  });

  it('rejects partial years a date input reports while typing', () => {
    expect(isIso('0202-10-20')).to.be.false;
    expect(isIso('2026-02-30')).to.be.false;
    expect(isIso('2026-10-20')).to.be.true;
  });

  it('uses the local date for today', () => {
    expect(todayIso(new Date(2026, 9, 20, 23, 59))).to.equal('2026-10-20');
  });
});
