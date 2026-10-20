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

export function toneClass(column: ReportColumn, value: number | null): 'report__pos' | 'report__neg' | '' {
  if ((column.style !== 'breakeven' && column.style !== 'ibreakeven') || value === null || value === undefined) {
    return '';
  }
  const decimals = displayDecimals(column);
  const scale = column.format === 'percent' ? 100 : 1;
  const diff = round(value * scale, decimals) - round((column.threshold ?? 0) * scale, decimals);
  if (round(diff, decimals) === 0) {
    return '';
  }
  const positive = diff > 0;
  return positive === (column.style === 'breakeven') ? 'report__pos' : 'report__neg';
}
