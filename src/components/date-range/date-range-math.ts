export type Iso = string;

export interface DatePreset {
  label: string;
  from: Iso;
  to: Iso;
}

export interface RangeState {
  from: Iso | '';
  to: Iso | '';
}

const pad = (n: number) => String(n).padStart(2, '0');

// Day arithmetic runs in UTC so DST changes can't shift a date
export function toUtc(iso: Iso): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fromUtc(date: Date): Iso {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}

// Years below 1000 are rejected: Chromium's date input reports partial years like 0202 while typing
export function isIso(value: unknown): value is Iso {
  return typeof value === 'string' && /^[1-9]\d{3}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value;
}

export function addDays(iso: Iso, days: number): Iso {
  const date = toUtc(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return fromUtc(date);
}

/** The same day `months` away, clamped to the target month's last day. */
export function addMonths(iso: Iso, months: number): Iso {
  const date = toUtc(iso);
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
  target.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return fromUtc(target);
}

export function daysBetween(from: Iso, to: Iso): number {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86400000);
}

export function todayIso(now: Date = new Date()): Iso {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function defaultPresets(today: Iso): DatePreset[] {
  const [y, m] = today.split('-').map(Number);
  const lastDayPrev = fromUtc(new Date(Date.UTC(y, m - 1, 0)));
  const days = (n: number) => ({label: `Last ${n} days`, from: addDays(today, -n), to: today});

  return [
    {label: 'Today', from: today, to: today},
    {label: 'Yesterday', from: addDays(today, -1), to: addDays(today, -1)},
    days(7),
    days(14),
    days(30),
    {label: 'This month', from: `${today.slice(0, 7)}-01`, to: today},
    {label: 'Last month', from: `${lastDayPrev.slice(0, 7)}-01`, to: lastDayPrev},
    days(90),
  ];
}

export function monthGrid(year: number, month0: number, weekStart = 1): (Iso | null)[] {
  const first = new Date(Date.UTC(year, month0, 1));
  const length = new Date(Date.UTC(year, month0 + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() - weekStart + 7) % 7;

  return Array.from({length: 42}, (_, i) => {
    const day = i - lead + 1;
    return day >= 1 && day <= length ? fromUtc(new Date(Date.UTC(year, month0, day))) : null;
  });
}

// Fixed rather than Intl: ICU builds disagree on short months (en-GB gives "Sept" in Chromium)
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(iso: Iso): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${SHORT_MONTHS[m - 1]} ${y}`;
}

export function rangeLabel(from: Iso, to: Iso): string {
  return from === to ? formatDate(from) : `${formatDate(from)} to ${formatDate(to)}`;
}

export function clampRange(range: {from: Iso; to: Iso}, min: Iso | '', max: Iso | ''): {from: Iso; to: Iso} | null {
  const from = min && range.from < min ? min : range.from;
  const to = max && range.to > max ? max : range.to;
  return from <= to ? {from, to} : null;
}

export function pick(state: RangeState, day: Iso): {from: Iso; to: Iso | ''} {
  if (!state.from || state.to || day < state.from) {
    return {from: day, to: ''};
  }
  return {from: state.from, to: day};
}
