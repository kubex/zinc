import {expect} from '@open-wc/testing';
import {formatValue, toneClass, unitLabel} from './report-format';
import type {ReportColumn} from './report-math';

const col = (c: Partial<ReportColumn>): ReportColumn => ({key: 'k', label: 'K', ...c});
const opts = {currency: 'USD', locale: 'en-US'};

describe('formatValue', () => {
  it('formats currency with bracketed negatives', () => {
    const c = col({format: 'currency'});
    expect(formatValue(c, -1396.73, opts)).to.equal('($1,396.73)');
    expect(formatValue(c, 3000.39, opts)).to.equal('$3,000.39');
    expect(formatValue(c, -0.0001, opts)).to.equal('$0.00');
  });

  it('shows the narrow currency symbol in any locale', () => {
    const c = col({format: 'currency'});
    expect(formatValue(c, 3000.39, {currency: 'USD', locale: 'en-GB'})).to.equal('$3,000.39');
    expect(formatValue(c, -1396.73, {currency: 'USD', locale: 'en-GB'})).to.equal('($1,396.73)');
  });

  it('formats financial in decimal style', () => {
    expect(formatValue(col({format: 'financial'}), -1396.73, opts)).to.equal('(1,396.73)');
  });

  it('formats numbers with a leading minus', () => {
    expect(formatValue(col({format: 'number'}), -32128, opts)).to.equal('-32,128');
    expect(formatValue(col({format: 'number'}), -0.2, opts)).to.equal('0');
  });

  it('formats durations in seconds as hours, minutes and seconds', () => {
    expect(formatValue(col({format: 'duration'}), 5400, opts)).to.equal('01:30:00');
    expect(formatValue(col({format: 'duration'}), 59, opts)).to.equal('00:00:59');
    expect(formatValue(col({format: 'duration'}), 453906, opts)).to.equal('126:05:06');
    expect(formatValue(col({format: 'duration'}), -3600, opts)).to.equal('-01:00:00');
  });

  it('labels the unit of durations, currency and percent', () => {
    expect(unitLabel(col({format: 'duration'}), 'USD')).to.equal('hh:mm:ss');
    expect(unitLabel(col({format: 'currency'}), 'USD')).to.equal('USD');
    expect(unitLabel(col({format: 'currency', currency: 'GBP'}), 'USD')).to.equal('GBP');
    expect(unitLabel(col({format: 'percent'}), 'USD')).to.equal('%');
    expect(unitLabel(col({format: 'number'}), 'USD')).to.equal('');
  });

  it('formats percent', () => {
    expect(formatValue(col({format: 'percent', decimals: 2}), -0.0157, opts)).to.equal('-1.57%');
  });

  it('defaults to number format with 0 decimals', () => {
    expect(formatValue(col({}), 1234.5, opts)).to.equal('1,235');
  });

  it('shows no sign on rounded zeros for financial and percent', () => {
    expect(formatValue(col({format: 'financial'}), -0.0001, opts)).to.equal('0.00');
    expect(formatValue(col({format: 'percent'}), -0.00001, opts)).to.equal('0.00%');
  });

  it('honours the column currency override', () => {
    expect(formatValue(col({format: 'currency', currency: 'EUR'}), 5, opts)).to.contain('€');
  });

  it('handles null and text', () => {
    expect(formatValue(col({format: 'number'}), null, opts)).to.equal('–');
    expect(formatValue(col({format: 'text'}), 'abc', opts)).to.equal('abc');
  });
});

describe('toneClass', () => {
  it('colours breakeven columns', () => {
    expect(toneClass(col({style: 'breakeven'}), 5)).to.equal('report__pos');
    expect(toneClass(col({style: 'breakeven'}), -5)).to.equal('report__neg');
    expect(toneClass(col({style: 'ibreakeven'}), 5)).to.equal('report__neg');
    expect(toneClass(col({style: 'none'}), -5)).to.equal('');
  });

  it('scales percent values to display units', () => {
    const c = col({style: 'breakeven', format: 'percent'});
    expect(toneClass(c, 0.004)).to.equal('report__pos');
    expect(toneClass(c, -0.00004)).to.equal('');
  });

  it('ignores values that round to the threshold', () => {
    expect(toneClass(col({style: 'breakeven', format: 'currency'}), -0.0001)).to.equal('');
  });
});
