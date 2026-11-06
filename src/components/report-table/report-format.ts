import type {ReportColumn} from './report-math';

export function displayDecimals(column: ReportColumn): number {
  return column.decimals ?? ((column.format ?? 'number') === 'number' ? 0 : 2);
}

function round(value: number, decimals: number): number {
  const rounded = Number(value.toFixed(decimals));
  return rounded === 0 ? 0 : rounded;
}

export function formatValue(column: ReportColumn, value: number | string | null, opts: {currency: string; locale?: string}): string {
  if (value === null || value === undefined) {
    return '–';
  }
  const format = column.format ?? 'number';
  if (format === 'text' || typeof value === 'string') {
    return String(value);
  }

  if (format === 'duration') {
    const seconds = Math.round(Math.abs(value));
    const pad = (part: number) => String(part).padStart(2, '0');
    const text = `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor(seconds / 60) % 60)}:${pad(seconds % 60)}`;
    return value < 0 && seconds > 0 ? `-${text}` : text;
  }

  const decimals = displayDecimals(column);
  const scaled = format === 'percent' ? value * 100 : value;
  const rounded = round(scaled, decimals);
  const digits = {minimumFractionDigits: decimals, maximumFractionDigits: decimals};
  const abs = Math.abs(rounded);

  if (format === 'currency' || format === 'financial') {
    const style = format === 'currency'
      ? {style: 'currency' as const, currency: column.currency ?? opts.currency, currencyDisplay: 'narrowSymbol' as const}
      : {style: 'decimal' as const};
    const text = new Intl.NumberFormat(opts.locale, {...style, ...digits}).format(abs);
    return rounded < 0 ? `(${text})` : text;
  }

  const text = new Intl.NumberFormat(opts.locale, {style: 'decimal', ...digits}).format(abs);
  const signed = rounded < 0 ? `-${text}` : text;
  return format === 'percent' ? `${signed}%` : signed;
}

export function unitLabel(column: ReportColumn, currency: string): string {
  switch (column.format) {
    case 'duration':
      return 'hh:mm:ss';
    case 'currency':
      return column.currency ?? currency;
    case 'percent':
      return '%';
    default:
      return '';
  }
}

export type ReportTone = 'report__pos' | 'report__warn' | 'report__neg' | '';

/** Compared in display units, so a value that rounds to a threshold counts as on it. */
export function toneClass(column: ReportColumn, value: number | null): ReportTone {
  if (value === null || value === undefined) {
    return '';
  }
  const decimals = displayDecimals(column);
  const scale = column.format === 'percent' ? 100 : 1;
  const shown = round(value * scale, decimals);
  const at = (threshold = 0) => round(threshold * scale, decimals);

  switch (column.style) {
    case 'breakeven':
    case 'ibreakeven': {
      const diff = round(shown - at(column.threshold), decimals);
      if (diff === 0) return '';
      return (diff > 0) === (column.style === 'breakeven') ? 'report__pos' : 'report__neg';
    }
    case 'change':
      return shown > 0 ? 'report__pos' : shown < 0 ? 'report__neg' : '';
    case 'targetmin':
      if (shown < at(column.min)) return 'report__neg';
      return shown >= at(column.threshold) ? 'report__pos' : 'report__warn';
    case 'target':
    case 'itarget': {
      const target = at(column.threshold);
      if (target <= 0) return '';
      const reached = Math.min(100, Math.ceil(shown / target * 100));
      const percent = column.style === 'itarget' ? 100 - reached : reached;
      return percent >= 100 ? 'report__pos' : percent >= 50 ? 'report__warn' : 'report__neg';
    }
    case 'bool':
      return (column.threshold === undefined ? shown !== 0 : shown === at(column.threshold)) ? 'report__pos' : 'report__neg';
    default:
      return '';
  }
}
