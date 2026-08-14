import {classMap} from 'lit/directives/class-map.js';
import {type CSSResultGroup, html, nothing, unsafeCSS} from 'lit';
import {defaultValue} from '../../internal/default-value';
import {FormControlController, validValidityState} from '../../internal/form';
import {HasSlotController} from '../../internal/slot';
import {LocalizeController} from '../../utilities/localize';
import {property, query, state} from 'lit/decorators.js';
import {styleMap} from 'lit/directives/style-map.js';
import {watch} from '../../internal/watch';
import ZincElement from '../../internal/zinc-element';
import ZnIcon from '../icon';
import ZnInput from '../input';
import ZnOption from '../option';
import ZnSelect from '../select';
import type {ZincFormControl} from '../../internal/zinc-element';

import styles from './schedule-builder.scss';

/** The seven weekday keys used throughout the schedule. */
export type ScheduleDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** A single opening period within a day. Times are `HH:MM` in the schedule's own timezone. */
export interface ScheduleRange {
  start: string;
  end: string;
}

/**
 * A dated deviation from the weekly pattern. Exceptions are never edited by the builder, they only
 * annotate it — the surrounding application owns them.
 */
export interface ScheduleException {
  id?: string;
  /** Human readable name, e.g. `Christmas Eve — early close`. */
  label?: string;
  /** A single calendar date (`YYYY-MM-DD`). */
  date?: string;
  /** Inclusive start of a multi-day exception (`YYYY-MM-DD`). */
  from?: string;
  /** Inclusive end of a multi-day exception (`YYYY-MM-DD`). */
  to?: string;
  /** Weekdays the exception applies to. Defaults to every weekday inside the date window. */
  days?: ScheduleDay[];
  /** When true the affected days close outright and `ranges` is ignored. */
  closed?: boolean;
  /** Replacement opening hours for the affected days. */
  ranges?: ScheduleRange[];
}

export type ScheduleDayMap = Record<ScheduleDay, ScheduleRange[]>;

/** The shape serialised into the form value. */
export interface ScheduleValue {
  timezone?: string;
  days: ScheduleDayMap;
  exceptions: ScheduleException[];
}

export type ScheduleView = 'calendar' | 'form';

const DAY_KEYS: ScheduleDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

const DAY_LABELS: Record<ScheduleDay, { short: string; long: string }> = {
  mon: {short: 'Mon', long: 'Monday'},
  tue: {short: 'Tue', long: 'Tuesday'},
  wed: {short: 'Wed', long: 'Wednesday'},
  thu: {short: 'Thu', long: 'Thursday'},
  fri: {short: 'Fri', long: 'Friday'},
  sat: {short: 'Sat', long: 'Saturday'},
  sun: {short: 'Sun', long: 'Sunday'}
};

const MINUTES_IN_DAY = 24 * 60;

function emptyDays(): ScheduleDayMap {
  return {mon: [], tue: [], wed: [], thu: [], fri: [], sat: [], sun: []};
}

/** Parses `HH:MM`, `H:MM` or `HH:MM:SS` into minutes past midnight. `24:00` is accepted as end of day. */
function parseTime(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.min(Math.max(Math.round(value), 0), MINUTES_IN_DAY);
  }

  if (typeof value !== 'string') return null;

  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 24 || minutes > 59) return null;

  const total = hours * 60 + minutes;
  return total > MINUTES_IN_DAY ? null : total;
}

function formatMinutes(minutes: number): string {
  const clamped = Math.min(Math.max(Math.round(minutes), 0), MINUTES_IN_DAY);
  const hours = Math.floor(clamped / 60);
  const mins = clamped % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/** Sorts, drops zero-length/invalid periods and merges overlapping or touching ones. */
function normaliseRanges(ranges: ScheduleRange[]): ScheduleRange[] {
  const spans: [number, number][] = [];

  ranges.forEach(range => {
    const start = parseTime(range?.start);
    const end = parseTime(range?.end);
    if (start === null || end === null || end <= start) return;
    spans.push([start, end]);
  });

  spans.sort((a, b) => a[0] - b[0]);

  const merged: [number, number][] = [];
  spans.forEach(span => {
    const last = merged[merged.length - 1];
    if (last && span[0] <= last[1]) {
      last[1] = Math.max(last[1], span[1]);
      return;
    }
    merged.push([span[0], span[1]]);
  });

  return merged.map(([start, end]) => ({start: formatMinutes(start), end: formatMinutes(end)}));
}

/** Accepts `{start, end}` objects as well as the `"08:00-18:00"` shorthand. */
function coerceRanges(input: unknown): ScheduleRange[] {
  if (!Array.isArray(input)) return [];

  const ranges: ScheduleRange[] = [];
  input.forEach(entry => {
    if (typeof entry === 'string') {
      const [start, end] = entry.split(/\s*[-–—]\s*/);
      if (start && end) ranges.push({start, end});
      return;
    }

    if (entry && typeof entry === 'object') {
      const range = entry as Partial<ScheduleRange>;
      if (range.start && range.end) ranges.push({start: String(range.start), end: String(range.end)});
    }
  });

  return normaliseRanges(ranges);
}

function unionSpan(ranges: ScheduleRange[], start: number, end: number): ScheduleRange[] {
  return normaliseRanges([...ranges, {start: formatMinutes(start), end: formatMinutes(end)}]);
}

function subtractSpan(ranges: ScheduleRange[], start: number, end: number): ScheduleRange[] {
  const remaining: ScheduleRange[] = [];

  ranges.forEach(range => {
    const rangeStart = parseTime(range.start);
    const rangeEnd = parseTime(range.end);
    if (rangeStart === null || rangeEnd === null) return;

    if (rangeEnd <= start || rangeStart >= end) {
      remaining.push(range);
      return;
    }

    if (rangeStart < start) remaining.push({start: formatMinutes(rangeStart), end: formatMinutes(start)});
    if (rangeEnd > end) remaining.push({start: formatMinutes(end), end: formatMinutes(rangeEnd)});
  });

  return normaliseRanges(remaining);
}

function totalMinutes(ranges: ScheduleRange[]): number {
  return ranges.reduce((total, range) => {
    const start = parseTime(range.start);
    const end = parseTime(range.end);
    return start === null || end === null ? total : total + (end - start);
  }, 0);
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;

  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function exceptionStart(exception: ScheduleException): Date | null {
  return parseDate(exception.date ?? exception.from);
}

function exceptionEnd(exception: ScheduleException): Date | null {
  return parseDate(exception.to ?? exception.date ?? exception.from);
}

/**
 * The weekdays an exception changes. The builder edits a repeating weekly pattern, so only
 * exceptions that describe a change to that pattern are drawn against it: ones that name their
 * `days`, and ones whose date window is at least a full week. A one-off date is a single occurrence,
 * not a pattern, so it rides along in the value but is never painted onto the week.
 */
function exceptionWeekdays(exception: ScheduleException): ScheduleDay[] {
  if (exception.days?.length) {
    return exception.days.filter(day => DAY_KEYS.includes(day));
  }

  const start = exceptionStart(exception);
  const end = exceptionEnd(exception);
  if (!start || !end) return [];

  // Compared as UTC midnights so daylight saving shifts can't skew the day count.
  const startDay = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  const span = Math.round((endDay - startDay) / 86400000);

  return span >= DAY_KEYS.length - 1 ? [...DAY_KEYS] : [];
}

/**
 * The hours an exception leaves open. `null` means the exception carries no hours of its own and is
 * purely informational, so the weekly pattern stands.
 */
function exceptionRanges(exception: ScheduleException): ScheduleRange[] | null {
  if (exception.closed) return [];
  if (!exception.ranges) return null;
  return coerceRanges(exception.ranges);
}

/**
 * A half-open `[start, end)` span of week minutes, where 0 is Monday 00:00 and 10080 is the end of
 * Sunday. Timezone conversion is a rotation of the whole week, so spans — not per-day ranges — are
 * the representation everything is converted in.
 */
type WeekSpan = [number, number];

const WEEK_MINUTES = 7 * MINUTES_IN_DAY;

function normaliseSpans(spans: WeekSpan[]): WeekSpan[] {
  const sorted = spans.filter(([start, end]) => end > start).sort((a, b) => a[0] - b[0]);
  const merged: WeekSpan[] = [];

  sorted.forEach(span => {
    const last = merged[merged.length - 1];
    if (last && span[0] <= last[1]) {
      last[1] = Math.max(last[1], span[1]);
      return;
    }
    merged.push([span[0], span[1]]);
  });

  return merged;
}

function daysToSpans(days: ScheduleDayMap): WeekSpan[] {
  const spans: WeekSpan[] = [];

  DAY_KEYS.forEach((day, index) => {
    const offset = index * MINUTES_IN_DAY;

    days[day].forEach(range => {
      const start = parseTime(range.start);
      const end = parseTime(range.end);
      if (start === null || end === null || end <= start) return;
      spans.push([offset + start, offset + end]);
    });
  });

  return normaliseSpans(spans);
}

function spansToDays(spans: WeekSpan[]): ScheduleDayMap {
  const days = emptyDays();

  normaliseSpans(spans).forEach(([start, end]) => {
    let cursor = start;

    // A span can straddle midnight, so slice it at every day boundary it crosses.
    while (cursor < end) {
      const index = Math.min(Math.floor(cursor / MINUTES_IN_DAY), DAY_KEYS.length - 1);
      const offset = index * MINUTES_IN_DAY;
      const sliceEnd = Math.min(end, offset + MINUTES_IN_DAY);

      days[DAY_KEYS[index]].push({
        start: formatMinutes(cursor - offset),
        end: formatMinutes(sliceEnd - offset)
      });

      cursor = sliceEnd;
    }
  });

  DAY_KEYS.forEach(day => {
    days[day] = normaliseRanges(days[day]);
  });

  return days;
}

/** Rotates spans around the week, splitting any that wrap past Sunday midnight. */
function shiftSpans(spans: WeekSpan[], delta: number): WeekSpan[] {
  if (!delta) return spans.map(span => [span[0], span[1]] as WeekSpan);

  const shifted: WeekSpan[] = [];

  spans.forEach(([start, end]) => {
    const length = Math.min(end - start, WEEK_MINUTES);
    const from = (((start + delta) % WEEK_MINUTES) + WEEK_MINUTES) % WEEK_MINUTES;
    const to = from + length;

    if (to <= WEEK_MINUTES) {
      shifted.push([from, to]);
      return;
    }

    shifted.push([from, WEEK_MINUTES]);
    shifted.push([0, to - WEEK_MINUTES]);
  });

  return normaliseSpans(shifted);
}

function shiftDays(days: ScheduleDayMap, delta: number): ScheduleDayMap {
  return delta ? spansToDays(shiftSpans(daysToSpans(days), delta)) : days;
}

function subtractSpans(spans: WeekSpan[], remove: WeekSpan[]): WeekSpan[] {
  let remaining = normaliseSpans(spans);

  normaliseSpans(remove).forEach(([start, end]) => {
    const next: WeekSpan[] = [];

    remaining.forEach(([spanStart, spanEnd]) => {
      if (spanEnd <= start || spanStart >= end) {
        next.push([spanStart, spanEnd]);
        return;
      }

      if (spanStart < start) next.push([spanStart, start]);
      if (spanEnd > end) next.push([end, spanEnd]);
    });

    remaining = next;
  });

  return remaining;
}

function spansCover(spans: WeekSpan[], minute: number): boolean {
  return spans.some(([start, end]) => minute >= start && minute < end);
}

/**
 * The offset of a timezone from UTC in minutes at a given moment, positive east of Greenwich.
 * Returns 0 for an empty or unrecognised zone so a typo degrades to "no conversion".
 */
function timezoneOffset(timeZone: string, reference: Date): number {
  if (!timeZone) return 0;

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour12: false,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).formatToParts(reference);

    const read = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find(part => part.type === type)?.value);

    // `hour12: false` reports midnight as hour 24 in some engines.
    const hour = read('hour') % 24;
    const asUtc = Date.UTC(read('year'), read('month') - 1, read('day'), hour, read('minute'), read('second'));

    return Math.round((asUtc - reference.getTime()) / 60000);
  } catch {
    return 0;
  }
}

function formatOffset(minutes: number): string {
  const sign = minutes < 0 ? '-' : '+';
  const absolute = Math.abs(minutes);
  return `UTC${sign}${String(Math.floor(absolute / 60)).padStart(2, '0')}:${String(absolute % 60).padStart(2, '0')}`;
}

/** A zone offered by the picker, optionally under a friendlier name than its IANA one. */
interface TimezoneOption {
  zone: string;
  label?: string;
}

/** `Europe/London (UTC+01:00)`, or just `UTC` for the zone that needs no explaining. */
function formatZone(option: TimezoneOption, reference: Date): string {
  if (!option.label && option.zone === 'UTC') return 'UTC';
  const name = option.label ?? option.zone.replace(/_/g, ' ');
  return `${name} (${formatOffset(timezoneOffset(option.zone, reference))})`;
}

function localTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** The named sets accepted by `timezones`, alongside explicit IANA names. */
export type ScheduleTimezoneSet = 'en' | 'offsets' | 'common' | 'all';

/**
 * The zones an English-speaking audience picks from, under the names they know them by rather than
 * their IANA ones. Deliberately short: the four US zones, the UK and Australia.
 */
const EN_TIMEZONES: TimezoneOption[] = [
  {zone: 'America/New_York', label: 'US Eastern'},
  {zone: 'America/Chicago', label: 'US Central'},
  {zone: 'America/Denver', label: 'US Mountain'},
  {zone: 'America/Los_Angeles', label: 'US Pacific'},
  {zone: 'Europe/London', label: 'UK'},
  {zone: 'Australia/Sydney', label: 'Australia'}
];

/** One zone per UTC offset — enough to read a schedule anywhere, without a long list. */
const OFFSET_TIMEZONES = [
  'UTC',
  'Pacific/Auckland', 'Australia/Sydney', 'Australia/Brisbane', 'Australia/Adelaide', 'Australia/Perth',
  'Asia/Tokyo', 'Asia/Seoul', 'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Bangkok',
  'Asia/Jakarta', 'Asia/Kolkata', 'Asia/Karachi', 'Asia/Dubai', 'Europe/Moscow', 'Africa/Nairobi',
  'Europe/Istanbul', 'Europe/Athens', 'Africa/Johannesburg', 'Europe/Berlin', 'Europe/Paris',
  'Europe/Madrid', 'Europe/Amsterdam', 'Europe/Dublin', 'Europe/London', 'Europe/Lisbon',
  'Atlantic/Reykjavik', 'America/Sao_Paulo', 'America/Argentina/Buenos_Aires', 'America/Halifax',
  'America/New_York', 'America/Toronto', 'America/Chicago', 'America/Mexico_City', 'America/Denver',
  'America/Phoenix', 'America/Los_Angeles', 'America/Vancouver', 'America/Anchorage', 'Pacific/Honolulu'
];

/**
 * The zones people actually name when asked where they are: every offset in use, plus the business
 * and population centres that share one. A superset of `OFFSET_TIMEZONES` in offset coverage, short
 * enough to scan and searchable when it isn't.
 */
const COMMON_TIMEZONES = [
  // Americas
  'Pacific/Midway', 'Pacific/Honolulu', 'Pacific/Marquesas', 'America/Anchorage',
  'America/Los_Angeles', 'America/Vancouver', 'America/Tijuana',
  'America/Denver', 'America/Phoenix', 'America/Edmonton',
  'America/Chicago', 'America/Mexico_City', 'America/Winnipeg', 'America/Guatemala',
  'America/New_York', 'America/Toronto', 'America/Bogota', 'America/Lima', 'America/Panama',
  'America/Halifax', 'America/Puerto_Rico', 'America/Santiago', 'America/St_Johns',
  'America/Sao_Paulo', 'America/Argentina/Buenos_Aires', 'America/Montevideo',
  'America/Noronha', 'America/Nuuk', 'Atlantic/Azores', 'Atlantic/Cape_Verde',
  // Europe and Africa
  'UTC',
  'Europe/London', 'Europe/Dublin', 'Europe/Lisbon', 'Atlantic/Reykjavik', 'Africa/Abidjan',
  'Africa/Casablanca', 'Africa/Lagos', 'Africa/Algiers',
  'Europe/Paris', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome', 'Europe/Amsterdam',
  'Europe/Brussels', 'Europe/Zurich', 'Europe/Vienna', 'Europe/Prague', 'Europe/Warsaw',
  'Europe/Stockholm', 'Europe/Oslo', 'Europe/Copenhagen', 'Europe/Budapest',
  'Europe/Athens', 'Europe/Helsinki', 'Europe/Bucharest', 'Europe/Kyiv',
  'Africa/Cairo', 'Africa/Johannesburg', 'Asia/Jerusalem',
  'Europe/Istanbul', 'Europe/Moscow', 'Africa/Nairobi', 'Asia/Riyadh', 'Asia/Baghdad',
  // Middle East and Asia
  'Asia/Tehran', 'Asia/Dubai', 'Asia/Baku', 'Asia/Tbilisi', 'Asia/Kabul',
  'Asia/Karachi', 'Asia/Tashkent', 'Asia/Kolkata', 'Asia/Colombo', 'Asia/Kathmandu',
  'Asia/Dhaka', 'Asia/Almaty', 'Asia/Yangon',
  'Asia/Bangkok', 'Asia/Jakarta', 'Asia/Ho_Chi_Minh',
  'Asia/Shanghai', 'Asia/Hong_Kong', 'Asia/Singapore', 'Asia/Kuala_Lumpur', 'Asia/Taipei',
  'Asia/Manila', 'Asia/Tokyo', 'Asia/Seoul',
  // Oceania
  'Australia/Perth', 'Australia/Eucla', 'Australia/Darwin', 'Australia/Adelaide',
  'Australia/Brisbane', 'Australia/Sydney', 'Australia/Melbourne', 'Australia/Hobart',
  'Pacific/Guam', 'Pacific/Noumea', 'Pacific/Auckland', 'Pacific/Fiji', 'Pacific/Chatham',
  'Pacific/Tongatapu', 'Pacific/Kiritimati'
];

function allTimezones(): string[] {
  return typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : COMMON_TIMEZONES;
}

/** Expands a named set into its zones; anything else is taken as an IANA name. */
function resolveTimezoneSet(entry: string): TimezoneOption[] {
  switch (entry.toLowerCase()) {
    case 'en':
      return EN_TIMEZONES;
    case 'offsets':
      return OFFSET_TIMEZONES.map(zone => ({zone}));
    case 'common':
      return COMMON_TIMEZONES.map(zone => ({zone}));
    case 'all':
      return allTimezones().map(zone => ({zone}));
    default:
      return [{zone: entry}];
  }
}

type SlotState = 'closed' | 'open' | 'reduced';

/**
 * @summary Builds a weekly opening-hours schedule as a drag-to-paint calendar or a compact list of
 * time ranges, and posts the result as JSON.
 * @documentation https://zinc.style/components/schedule-builder
 * @status experimental
 * @since 1.0
 *
 * @dependency zn-icon
 * @dependency zn-input
 * @dependency zn-option
 * @dependency zn-select
 *
 * @event zn-change - Emitted when the schedule changes.
 *
 * @slot label - The schedule's label. Alternatively, use the `label` attribute.
 * @slot help-text - Text that describes how to use the schedule. Alternatively, use the `help-text` attribute.
 *
 * @csspart form-control - The form control that wraps the builder, label and help text.
 * @csspart base - The component's base wrapper.
 * @csspart toolbar - The row above the builder holding the hint, legend and view toggle.
 * @csspart calendar - The calendar view wrapper.
 * @csspart list - The form (list) view wrapper.
 * @csspart summary - The summary panel beside the calendar.
 *
 * @cssproperty --slot-height - The height of a single time slot in the calendar. Defaults to `18px`.
 * @cssproperty --gutter-width - The width of the calendar's time gutter. Defaults to `64px`.
 * @cssproperty --open-color - The fill used for open hours.
 * @cssproperty --reduced-color - The fill used for hours an exception removes.
 */
export default class ZnScheduleBuilder extends ZincElement implements ZincFormControl {
  static styles: CSSResultGroup = unsafeCSS(styles);

  static formAssociated = true;

  static dependencies = {
    'zn-icon': ZnIcon,
    'zn-input': ZnInput,
    'zn-option': ZnOption,
    'zn-select': ZnSelect,
  };

  private readonly formControlController = new FormControlController(this, {
    assumeInteractionOn: ['zn-change']
  });

  private readonly hasSlotController = new HasSlotController(this, 'help-text', 'label');
  private readonly localize = new LocalizeController(this);
  private readonly internals: ElementInternals | null;

  @query('.schedule-builder__canvas') private canvas: HTMLElement;

  @state() private _days: ScheduleDayMap = emptyDays();
  @state() private _exceptions: ScheduleException[] = [];
  @state() private _dragPreview: ScheduleDayMap | null = null;
  @state() private _editing: { day: ScheduleDay; index: number } | null = null;

  private _dragMode: 'open' | 'close' = 'open';
  private _dragAnchor: { col: number; row: number } | null = null;
  private _dragPointerId: number | null = null;

  /** The name of the form control, submitted as a name/value pair with form data. */
  @property({reflect: true}) name: string;

  /** The schedule as a JSON string. This is what gets posted with the form. */
  @property() value: string = '';

  /** The default value, used when resetting the containing form. */
  @defaultValue() defaultValue: string = '';

  /** The schedule's label. If you need to display HTML, use the `label` slot instead. */
  @property() label: string = '';

  /** The schedule's help text. If you need to display HTML, use the `help-text` slot instead. */
  @property({attribute: 'help-text'}) helpText: string = '';

  /** Which view is showing. */
  @property({reflect: true}) view: ScheduleView = 'calendar';

  /** The word used for hours the schedule covers, in the legend and in labels. */
  @property({attribute: 'open-label'}) openLabel: string = 'Available';

  /** The word used for hours the schedule doesn't cover, in the legend and against empty days. */
  @property({attribute: 'closed-label'}) closedLabel: string = 'Closed';

  /** Hides the calendar/form view toggle. */
  @property({attribute: 'no-toggle', type: Boolean}) noToggle: boolean = false;

  /** Hides the summary panel beside the calendar. */
  @property({attribute: 'hide-summary', type: Boolean}) hideSummary: boolean = false;

  /** The first hour shown in the calendar. */
  @property({attribute: 'start-hour', type: Number}) startHour: number = 6;

  /** The last hour shown in the calendar. */
  @property({attribute: 'end-hour', type: Number}) endHour: number = 22;

  /** The granularity of the calendar grid and the time inputs, in minutes. */
  @property({type: Number}) interval: number = 30;

  /** The weekday the week starts on. */
  @property({attribute: 'week-start'}) weekStart: ScheduleDay = 'mon';

  /** Displays times as 12 or 24 hour. The serialised value is always 24 hour `HH:MM`. */
  @property({attribute: 'time-format'}) timeFormat: '12' | '24' = '24';

  /**
   * The IANA timezone the hours are shown in. Accepts `auto` for the viewer's own timezone. Defaults
   * to `save-timezone`, so nothing is converted until you ask for it. Changing this only re-labels
   * the same underlying hours; the value never moves.
   */
  @property({attribute: 'display-timezone'}) displayTimezone: string = '';

  /**
   * The IANA timezone the value is stored in. Defaults to `UTC` as soon as the schedule is
   * timezone-aware (a display timezone is set, or the picker is shown), and to no timezone at all
   * otherwise — in which case the times are stored exactly as they are shown.
   */
  @property({attribute: 'save-timezone'}) saveTimezone: string = '';

  /** Shows the timezone picker, letting the user read the schedule in any timezone. */
  @property({attribute: 'show-timezone', type: Boolean}) showTimezone: boolean = false;

  /**
   * The timezones offered by the picker, as IANA names or one of the named sets — `en` (the four US
   * zones, the UK and Australia, under those names), `offsets` (one zone per UTC offset, the
   * default), `common` (every offset plus the world's major centres) or `all` (the complete IANA
   * list). Names and sets can be mixed, e.g. `en Asia/Tokyo`.
   */
  @property({
    attribute: 'timezones',
    converter: {
      fromAttribute: (value: string) => value.split(/[,\s]+/).filter(Boolean),
      toAttribute: (value: string[]) => value.join(' ')
    }
  }) timezones: string[] = [];

  /**
   * The date (`YYYY-MM-DD`) used to resolve timezone offsets. A weekly pattern has no date of its
   * own, so one has to be picked to know whether daylight saving applies; today is used by default.
   */
  @property({attribute: 'reference-date'}) referenceDate: string = '';

  /** Disables the schedule. */
  @property({type: Boolean, reflect: true}) disabled: boolean = false;

  /** Renders the schedule without any editing affordances. */
  @property({type: Boolean, reflect: true}) readonly: boolean = false;

  /** Makes the schedule a required field, invalid until at least one period is open. */
  @property({type: Boolean, reflect: true}) required: boolean = false;

  /** The id of the form to associate with, when the control sits outside of it. */
  @property({reflect: true}) form: string;

  constructor() {
    super();
    this.internals = typeof this.attachInternals === 'function' ? this.attachInternals() : null;
  }

  /**
   * The schedule as a plain object, with `days` in the save timezone. Assigning to it replaces the
   * whole schedule.
   */
  get schedule(): ScheduleValue {
    return {
      ...(this._saveZone ? {timezone: this._saveZone} : {}),
      days: this._cloneDays(this._days),
      exceptions: this._exceptions
    };
  }

  set schedule(schedule: ScheduleValue | null | undefined) {
    this._applySchedule(schedule);
    this._commit(false);
  }

  /** The exceptions annotating the schedule. Also readable from, and written into, the value. */
  get exceptions(): ScheduleException[] {
    return this._exceptions;
  }

  set exceptions(exceptions: ScheduleException[] | null | undefined) {
    this._exceptions = Array.isArray(exceptions) ? exceptions : [];
    this._commit(false);
  }

  /** Gets the validity state object. */
  get validity(): ValidityState {
    return this.internals?.validity ?? validValidityState;
  }

  /** Gets the validation message. */
  get validationMessage(): string {
    return this.internals?.validationMessage ?? '';
  }

  /** Whether the schedule carries a timezone at all. */
  private get _isZoned(): boolean {
    return Boolean(this.saveTimezone || this.displayTimezone || this.showTimezone);
  }

  /** The timezone the value is stored in. Empty means the times are stored exactly as shown. */
  private get _saveZone(): string {
    if (this.saveTimezone) return this.saveTimezone;
    return this._isZoned ? 'UTC' : '';
  }

  /** The timezone the grid and list are drawn in. */
  private get _displayZone(): string {
    if (this.displayTimezone === 'auto') return localTimezone();
    return this.displayTimezone || this._saveZone;
  }

  /** The moment used to resolve daylight saving for both zones. */
  private get _reference(): Date {
    return parseDate(this.referenceDate) ?? new Date();
  }

  /** Minutes to add to a stored time to get the time shown. */
  private get _offsetDelta(): number {
    const save = this._saveZone;
    const display = this._displayZone;
    if (!save || !display || save === display) return 0;

    const reference = this._reference;
    return timezoneOffset(display, reference) - timezoneOffset(save, reference);
  }

  private get _orderedDays(): ScheduleDay[] {
    const offset = Math.max(DAY_KEYS.indexOf(this.weekStart), 0);
    return [...DAY_KEYS.slice(offset), ...DAY_KEYS.slice(0, offset)];
  }

  private get _interval(): number {
    const interval = Math.round(this.interval);
    return [5, 10, 15, 20, 30, 60].includes(interval) ? interval : 30;
  }

  private get _startMinute(): number {
    return Math.min(Math.max(Math.round(this.startHour), 0), 23) * 60;
  }

  private get _endMinute(): number {
    const end = Math.min(Math.max(Math.round(this.endHour), 1), 24) * 60;
    return end <= this._startMinute ? Math.min(this._startMinute + 60, MINUTES_IN_DAY) : end;
  }

  private get _slotCount(): number {
    return Math.ceil((this._endMinute - this._startMinute) / this._interval);
  }

  private get _slotsPerHour(): number {
    return Math.max(Math.round(60 / this._interval), 1);
  }

  private get _isEditable(): boolean {
    return !this.disabled && !this.readonly;
  }

  private get _hasHours(): boolean {
    return DAY_KEYS.some(day => this._days[day].length > 0);
  }

  connectedCallback() {
    super.connectedCallback();

    if (this.value) {
      this._applySchedule(this.value);
    }

    this._syncFormValue();
  }

  firstUpdated() {
    this._commit(false);
  }

  @watch('value')
  handleValueChange() {
    // Ignore the echo of our own serialisation; anything else is an external assignment.
    if (this.value === this._serialise()) return;
    this._applySchedule(this.value);
    this._syncFormValue();
  }

  @watch(['required', 'disabled'])
  handleValidationStateChange() {
    this._syncFormValue();
  }

  /** Checks validity but does not show a validation message. */
  checkValidity(): boolean {
    return this.internals?.checkValidity() ?? true;
  }

  /** Gets the associated form, if one exists. */
  getForm(): HTMLFormElement | null {
    return this.formControlController.getForm();
  }

  /** Checks for validity and shows the browser's validation message if the control is invalid. */
  reportValidity(): boolean {
    return this.internals?.reportValidity() ?? true;
  }

  /** Sets a custom validation message. Pass an empty string to restore validity. */
  setCustomValidity(message: string) {
    this._customValidity = message;
    this._syncFormValue();
    this.formControlController.updateValidity();
  }

  /** Replaces the hours for a single day, in the save timezone. */
  setDay(day: ScheduleDay, ranges: ScheduleRange[]) {
    if (!DAY_KEYS.includes(day)) return;
    this._days = {...this._days, [day]: coerceRanges(ranges)};
    this._commit();
  }

  /** Reads the hours for a single day, in the save timezone. */
  getDay(day: ScheduleDay): ScheduleRange[] {
    return this._days[day] ?? [];
  }

  /** The hours as currently shown, in the display timezone. */
  get displayedDays(): ScheduleDayMap {
    return this._cloneDays(this._storedAsShown);
  }

  /** Replaces the hours for a single day, given in the display timezone. */
  setDisplayDay(day: ScheduleDay, ranges: ScheduleRange[]) {
    if (!DAY_KEYS.includes(day)) return;
    this._commitShownDays({...this._storedAsShown, [day]: coerceRanges(ranges)});
  }

  formResetCallback() {
    this._applySchedule(this.defaultValue);
    this._commit(false);
  }

  formStateRestoreCallback(restoredValue: string) {
    this._applySchedule(restoredValue);
    this._commit(false);
  }

  private _customValidity: string = '';

  private _cloneDays(days: ScheduleDayMap): ScheduleDayMap {
    const clone = emptyDays();
    DAY_KEYS.forEach(day => {
      clone[day] = days[day].map(range => ({...range}));
    });
    return clone;
  }

  private _serialise(): string {
    return JSON.stringify(this.schedule);
  }

  /** Accepts a JSON string, a full `ScheduleValue`, or a bare day map. */
  private _applySchedule(input: unknown) {
    let parsed: unknown = input;

    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (!trimmed) {
        this._days = emptyDays();
        this._exceptions = [];
        return;
      }

      try {
        parsed = JSON.parse(trimmed);
      } catch {
        // Keep whatever we already have rather than wiping a schedule over a typo.
        return;
      }
    }

    if (!parsed || typeof parsed !== 'object') {
      this._days = emptyDays();
      this._exceptions = [];
      return;
    }

    const source = parsed as Partial<ScheduleValue> & Partial<ScheduleDayMap>;
    const daySource = (source.days ?? source) as Partial<Record<ScheduleDay, unknown>>;
    const days = emptyDays();

    DAY_KEYS.forEach(day => {
      days[day] = coerceRanges(daySource?.[day]);
    });

    const declared = typeof source.timezone === 'string' ? source.timezone : '';

    if (declared && !this.saveTimezone) {
      // Nothing was configured, so the incoming data decides which timezone we store in.
      this.saveTimezone = declared;
    } else if (declared && declared !== this.saveTimezone) {
      // The data is in a different timezone to the one we store in, so bring it across.
      const reference = this._reference;
      const delta = timezoneOffset(this.saveTimezone, reference) - timezoneOffset(declared, reference);
      this._days = shiftDays(days, delta);
      this._exceptions = Array.isArray(source.exceptions) ? source.exceptions : [];
      return;
    }

    this._days = days;
    this._exceptions = Array.isArray(source.exceptions) ? source.exceptions : [];
  }

  private _syncFormValue() {
    if (!this.internals) return;

    this.internals.setFormValue(this.value);

    const anchor = this.shadowRoot?.querySelector<HTMLElement>('.schedule-builder') ?? undefined;

    if (this._customValidity) {
      this.internals.setValidity({customError: true}, this._customValidity, anchor);
      return;
    }

    if (this.required && !this._hasHours) {
      this.internals.setValidity({valueMissing: true}, 'Please open at least one period.', anchor);
      return;
    }

    this.internals.setValidity({});
  }

  private _commit(emit: boolean = true) {
    const serialised = this._serialise();

    if (serialised !== this.value) {
      this.value = serialised;
    }

    this._syncFormValue();
    this.formControlController.updateValidity();

    if (emit) {
      this.emit('zn-change');
    }
  }

  private _formatTime(time: string): string {
    const minutes = parseTime(time);
    if (minutes === null) return time;
    if (this.timeFormat === '24') return formatMinutes(minutes);

    const hours = Math.floor(minutes / 60) % 24;
    const mins = minutes % 60;
    const suffix = hours < 12 ? 'am' : 'pm';
    const display = hours % 12 === 0 ? 12 : hours % 12;

    return mins === 0 ? `${display}${suffix}` : `${display}:${String(mins).padStart(2, '0')}${suffix}`;
  }

  private _formatRange(range: ScheduleRange): string {
    return `${this._formatTime(range.start)}–${this._formatTime(range.end)}`;
  }

  private _formatDate(value: string | undefined): string {
    const date = parseDate(value);
    return date ? this.localize.date(date, {day: 'numeric', month: 'short'}) : '';
  }

  private _summariseDay(day: ScheduleDay, days: ScheduleDayMap): string {
    const ranges = days[day];
    return ranges.length ? ranges.map(range => this._formatRange(range)).join(', ') : this.closedLabel;
  }

  /** The stored hours rotated into the display timezone. */
  private get _storedAsShown(): ScheduleDayMap {
    return shiftDays(this._days, this._offsetDelta);
  }

  /** The hours as drawn, which is the drag preview while a drag is in flight. */
  private get _shownDays(): ScheduleDayMap {
    return this._dragPreview ?? this._storedAsShown;
  }

  /** Stores hours that were edited in display coordinates, rotating them back to the save timezone. */
  private _commitShownDays(days: ScheduleDayMap) {
    this._days = shiftDays(days, -this._offsetDelta);
    this._commit();
  }

  /** The exceptions that touch a given weekday and actually change its hours. */
  private _exceptionsForDay(day: ScheduleDay): ScheduleException[] {
    return this._exceptions.filter(exception => exceptionWeekdays(exception).includes(day));
  }

  /**
   * The week spans an exception takes away, in display coordinates. Computed as spans rather than
   * per-day ranges because a timezone rotation can move an exception's hours onto another weekday.
   */
  private get _shownReductionSpans(): WeekSpan[] {
    const spans: WeekSpan[] = [];

    this._exceptions.forEach(exception => {
      const ranges = exceptionRanges(exception);
      if (ranges === null) return;

      exceptionWeekdays(exception).forEach(day => {
        const offset = DAY_KEYS.indexOf(day) * MINUTES_IN_DAY;

        // Whatever the exception doesn't leave open on that weekday is taken away.
        spans.push(...subtractSpans([[offset, offset + MINUTES_IN_DAY]], ranges.reduce<WeekSpan[]>((open, range) => {
          const start = parseTime(range.start);
          const end = parseTime(range.end);
          if (start !== null && end !== null) open.push([offset + start, offset + end]);
          return open;
        }, [])));
      });
    });

    return shiftSpans(normaliseSpans(spans), this._offsetDelta);
  }

  /** The week minute a calendar cell sits on, measured from Monday 00:00. */
  private _slotMinute(day: ScheduleDay, index: number): number {
    // The midpoint keeps part-covered slots on the right side of the boundary.
    return DAY_KEYS.indexOf(day) * MINUTES_IN_DAY
      + this._startMinute + index * this._interval + this._interval / 2;
  }

  private _slotState(day: ScheduleDay, index: number, open: WeekSpan[], reductions: WeekSpan[]): SlotState {
    const minute = this._slotMinute(day, index);
    if (!spansCover(open, minute)) return 'closed';
    return spansCover(reductions, minute) ? 'reduced' : 'open';
  }

  private _pointerPosition(event: PointerEvent): { col: number; row: number } | null {
    if (!this.canvas) return null;

    const rect = this.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;

    const columns = this._orderedDays.length;
    const col = Math.floor(((event.clientX - rect.left) / rect.width) * columns);
    const row = Math.floor(((event.clientY - rect.top) / rect.height) * this._slotCount);

    return {
      col: Math.min(Math.max(col, 0), columns - 1),
      row: Math.min(Math.max(row, 0), this._slotCount - 1)
    };
  }

  /** Paints the rectangle between the drag anchor and the cursor onto a copy of the shown schedule. */
  private _buildDragPreview(cursor: { col: number; row: number }): ScheduleDayMap {
    const anchor = this._dragAnchor!;
    const preview = this._cloneDays(this._storedAsShown);

    const firstCol = Math.min(anchor.col, cursor.col);
    const lastCol = Math.max(anchor.col, cursor.col);
    const firstRow = Math.min(anchor.row, cursor.row);
    const lastRow = Math.max(anchor.row, cursor.row);

    const start = this._startMinute + firstRow * this._interval;
    const end = Math.min(this._startMinute + (lastRow + 1) * this._interval, this._endMinute);

    const days = this._orderedDays.slice(firstCol, lastCol + 1);
    days.forEach(day => {
      preview[day] = this._dragMode === 'open'
        ? unionSpan(preview[day], start, end)
        : subtractSpan(preview[day], start, end);
    });

    return preview;
  }

  private _handleCanvasPointerDown = (event: PointerEvent) => {
    if (!this._isEditable || event.button !== 0) return;

    const position = this._pointerPosition(event);
    if (!position) return;

    const day = this._orderedDays[position.col];
    const open = daysToSpans(this._storedAsShown);
    this._dragMode = spansCover(open, this._slotMinute(day, position.row)) ? 'close' : 'open';
    this._dragAnchor = position;
    this._dragPointerId = event.pointerId;
    this._dragPreview = this._buildDragPreview(position);

    this.canvas.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  private _handleCanvasPointerMove = (event: PointerEvent) => {
    if (!this._dragAnchor || event.pointerId !== this._dragPointerId) return;

    const position = this._pointerPosition(event);
    if (!position) return;

    this._dragPreview = this._buildDragPreview(position);
  };

  private _handleCanvasPointerUp = (event: PointerEvent) => {
    if (!this._dragAnchor || event.pointerId !== this._dragPointerId) return;

    const position = this._pointerPosition(event) ?? this._dragAnchor;
    const painted = this._buildDragPreview(position);

    this._dragAnchor = null;
    this._dragPointerId = null;
    this._dragPreview = null;

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }

    this._commitShownDays(painted);
  };

  private _handleCanvasPointerCancel = () => {
    this._dragAnchor = null;
    this._dragPointerId = null;
    this._dragPreview = null;
  };

  private _handleViewToggle(view: ScheduleView) {
    if (this.view === view) return;
    this._editing = null;
    this.view = view;
  }

  /** Picks a sensible slot for a newly added range: the first hour-wide gap in the day. */
  private _nextFreeRange(ranges: ScheduleRange[]): ScheduleRange {
    if (!ranges.length) return {start: '09:00', end: '17:00'};

    let cursor = this._startMinute;

    for (const range of ranges) {
      const start = parseTime(range.start) ?? 0;
      const end = parseTime(range.end) ?? 0;
      if (start - cursor >= 60) break;
      cursor = Math.max(cursor, end);
    }

    const start = Math.min(cursor, MINUTES_IN_DAY - 60);
    return {start: formatMinutes(start), end: formatMinutes(start + 60)};
  }

  private _handleAddRange(day: ScheduleDay) {
    if (!this._isEditable) return;

    const shown = this._storedAsShown;
    const range = this._nextFreeRange(shown[day]);
    const ranges = normaliseRanges([...shown[day], range]);

    this._commitShownDays({...shown, [day]: ranges});
    // The new range may merge into a neighbour, so find where it actually landed.
    this._editing = {day, index: Math.max(ranges.findIndex(item => item.start === range.start), 0)};
  }

  private _handleRemoveRange(day: ScheduleDay, index: number) {
    if (!this._isEditable) return;

    const shown = this._storedAsShown;
    this._editing = null;
    this._commitShownDays({...shown, [day]: shown[day].filter((_, position) => position !== index)});
  }

  private _handleRangeEdit(day: ScheduleDay, index: number, edge: 'start' | 'end', value: string) {
    const time = parseTime(value);
    if (time === null) return;

    const shown = this._storedAsShown;
    const normalised = normaliseRanges(shown[day].map((range, position) =>
      position === index ? {...range, [edge]: formatMinutes(time)} : range));

    // Normalising can merge or drop the edited range; keep the editor on something that exists.
    if (this._editing && this._editing.day === day && this._editing.index >= normalised.length) {
      this._editing = normalised.length ? {day, index: normalised.length - 1} : null;
    }

    this._commitShownDays({...shown, [day]: normalised});
  }

  private _handleEditorKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      this._editing = null;
    }
  }

  private _handleEditorFocusOut(event: FocusEvent) {
    const editor = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && editor.contains(next)) return;
    this._editing = null;
  }

  private _renderToolbar() {
    const showToggle = !this.noToggle;
    const showLegend = this.view === 'calendar';

    if (!showToggle && !showLegend && !this.showTimezone) return nothing;

    return html`
      <div class="schedule-builder__toolbar" part="toolbar">
        ${this.view === 'calendar' && this._isEditable
          ? html`<p class="schedule-builder__hint">
            Drag across the grid to open hours; drag over open hours to close them.
          </p>`
          : html`<span class="schedule-builder__hint"></span>`}

        ${showLegend
          ? html`
            <ul class="legend">
              <li class="legend__item"><span class="legend__swatch legend__swatch--open"></span>${this.openLabel}</li>
              <li class="legend__item"><span class="legend__swatch"></span>${this.closedLabel}</li>
            </ul>`
          : nothing}

        ${this.showTimezone ? this._renderTimezonePicker() : nothing}

        ${showToggle
          ? html`
            <div class="view-toggle" role="group" aria-label="Schedule view">
              <button type="button"
                      class="${classMap({
                        'view-toggle__button': true,
                        'view-toggle__button--active': this.view === 'calendar'
                      })}"
                      aria-pressed="${this.view === 'calendar'}"
                      title="Calendar view"
                      @click="${() => this._handleViewToggle('calendar')}">
                <zn-icon src="calendar_view_week" size="16"></zn-icon>
              </button>
              <button type="button"
                      class="${classMap({
                        'view-toggle__button': true,
                        'view-toggle__button--active': this.view === 'form'
                      })}"
                      aria-pressed="${this.view === 'form'}"
                      title="Form view"
                      @click="${() => this._handleViewToggle('form')}">
                <zn-icon src="format_list_bulleted" size="16"></zn-icon>
              </button>
            </div>`
          : nothing}
      </div>
    `;
  }

  /** The picker's options: the configured list plus whatever zones are already in play. */
  private get _timezoneOptions(): TimezoneOption[] {
    const requested = this.timezones.length ? this.timezones : ['offsets'];
    const options = new Map<string, TimezoneOption>();

    requested.flatMap(entry => resolveTimezoneSet(entry)).forEach(option => {
      // First mention of a zone wins, so a named set's label survives a later plain listing.
      if (!options.has(option.zone)) options.set(option.zone, option);
    });

    // The zones in play are always reachable, even when they aren't in the configured list.
    [this._saveZone, this._displayZone, localTimezone()].forEach(zone => {
      if (zone && !options.has(zone)) options.set(zone, {zone});
    });

    const reference = this._reference;
    return [...options.values()].sort((a, b) => {
      const offset = timezoneOffset(a.zone, reference) - timezoneOffset(b.zone, reference);
      return offset || a.zone.localeCompare(b.zone);
    });
  }

  private _handleTimezoneChange(event: Event) {
    // The picker is a view control, so its own change event must not read as a schedule change.
    event.stopPropagation();

    const zone = (event.target as ZnSelect).value;
    if (typeof zone === 'string' && zone) {
      this.displayTimezone = zone;
    }
  }

  private _renderTimezonePicker() {
    const reference = this._reference;

    return html`
      <zn-select class="timezone"
                 size="small"
                 search
                 hoist
                 aria-label="Display timezone"
                 ?disabled=${this.disabled}
                 .value=${this._displayZone}
                 @zn-change=${this._handleTimezoneChange}
                 @zn-input=${(event: Event) => event.stopPropagation()}>
        ${this._timezoneOptions.map(option => html`
          <zn-option value=${option.zone}>${formatZone(option, reference)}</zn-option>`)}
      </zn-select>`;
  }

  private _renderCalendar() {
    const days = this._shownDays;
    const openSpans = daysToSpans(days);
    const reductionSpans = this._shownReductionSpans;
    const hours: number[] = [];

    for (let minute = this._startMinute; minute < this._endMinute; minute += 60) {
      hours.push(minute);
    }

    return html`
      <div class="schedule-builder__calendar" part="calendar">
        <div class="calendar">
          <div class="calendar__head" style=${styleMap({'--columns': String(this._orderedDays.length)})}>
            <div class="calendar__head-gutter"></div>
            ${this._orderedDays.map(day => html`
              <div class=${classMap({
                'calendar__head-cell': true,
                'calendar__head-cell--closed': days[day].length === 0
              })}>
                <span class="calendar__head-day">${DAY_LABELS[day].short}</span>
                <span class="calendar__head-hours">${this._summariseDay(day, days)}</span>
              </div>`)}
          </div>

          <div class="calendar__body"
               style=${styleMap({
                 '--columns': String(this._orderedDays.length),
                 '--slots': String(this._slotCount),
                 '--slots-per-hour': String(this._slotsPerHour)
               })}>
            <div class="calendar__gutter">
              ${hours.map(minute => html`
                <div class="calendar__hour"><span>${this._formatTime(formatMinutes(minute))}</span></div>`)}
            </div>

            <div class="schedule-builder__canvas calendar__canvas"
                 role="grid"
                 aria-label="Weekly opening hours"
                 aria-readonly=${!this._isEditable}
                 @pointerdown=${this._handleCanvasPointerDown}
                 @pointermove=${this._handleCanvasPointerMove}
                 @pointerup=${this._handleCanvasPointerUp}
                 @pointercancel=${this._handleCanvasPointerCancel}>
              ${this._orderedDays.map(day => this._renderCalendarColumn(day, openSpans, reductionSpans))}
            </div>
          </div>
        </div>

        ${this.hideSummary ? nothing : this._renderSummary(days)}
      </div>
    `;
  }

  private _renderCalendarColumn(day: ScheduleDay, openSpans: WeekSpan[], reductionSpans: WeekSpan[]) {
    const slots = [];

    for (let index = 0; index < this._slotCount; index++) {
      const slotState = this._slotState(day, index, openSpans, reductionSpans);
      slots.push(html`
        <div class=${classMap({
          'calendar__slot': true,
          'calendar__slot--open': slotState === 'open',
          'calendar__slot--reduced': slotState === 'reduced',
          'calendar__slot--hour': index % this._slotsPerHour === 0
        })}></div>`);
    }

    return html`
      <div class="calendar__col" role="row" aria-label=${DAY_LABELS[day].long}>${slots}</div>`;
  }

  private _renderSummary(days: ScheduleDayMap) {
    const total = DAY_KEYS.reduce((sum, day) => sum + totalMinutes(days[day]), 0) / 60;

    return html`
      <aside class="summary" part="summary">
        <h4 class="summary__title">Hours by day</h4>
        <dl class="summary__list">
          ${this._orderedDays.map(day => html`
            <div class="summary__row">
              <dt>${DAY_LABELS[day].long}</dt>
              <dd class=${classMap({'summary__closed': days[day].length === 0})}>${this._summariseDay(day, days)}</dd>
            </div>`)}
          <div class="summary__row summary__row--total">
            <dt>Total</dt>
            <dd>${Number(total.toFixed(2))} h</dd>
          </div>
        </dl>
      </aside>
    `;
  }

  private _renderList() {
    const days = this._shownDays;

    return html`
      <div class="schedule-builder__list list" part="list">
        ${this._orderedDays.map(day => this._renderListRow(day, days[day]))}
      </div>
    `;
  }

  private _renderListRow(day: ScheduleDay, ranges: ScheduleRange[]) {
    const editing = this._editing?.day === day ? this._editing.index : -1;
    const note = this._dayNote(day);

    return html`
      <div class=${classMap({list__row: true, 'list__row--editing': editing > -1})}>
        <div class=${classMap({list__day: true, 'list__day--closed': ranges.length === 0})}>
          ${DAY_LABELS[day].short}
        </div>

        <div class="list__ranges">
          ${ranges.length
            ? ranges.map((range, index) => index === editing
              ? this._renderRangeEditor(day, index, range)
              : this._renderRangeChip(day, index, range, note.reduced))
            : html`<span class="list__closed">${this.closedLabel}</span>`}

          ${note.text ? html`<span class="list__note">${note.text}</span>` : nothing}
        </div>

        ${this._isEditable
          ? html`
            <button type="button" class="list__add" @click=${() => this._handleAddRange(day)}>
              <zn-icon src="add" size="16"></zn-icon>
              Add range
            </button>`
          : nothing}
      </div>
    `;
  }

  private _renderRangeChip(day: ScheduleDay, index: number, range: ScheduleRange, reduced: boolean) {
    return html`
      <button type="button"
              class=${classMap({list__chip: true, 'list__chip--reduced': reduced})}
              ?disabled=${!this._isEditable}
              @click=${() => {
                if (this._isEditable) this._editing = {day, index};
              }}>
        ${this._formatRange(range)}
      </button>`;
  }

  private _renderRangeEditor(day: ScheduleDay, index: number, range: ScheduleRange) {
    const step = this._interval * 60;

    return html`
      <div class="list__editor"
           @keydown=${this._handleEditorKeyDown}
           @focusout=${this._handleEditorFocusOut}>
        <zn-input type="time"
                  size="small"
                  step=${step}
                  .value=${range.start}
                  aria-label="${DAY_LABELS[day].long} opens"
                  @zn-input=${(event: Event) => event.stopPropagation()}
                  @zn-change=${(event: Event) => {
                    event.stopPropagation();
                    this._handleRangeEdit(day, index, 'start', (event.target as ZnInput).value as string);
                  }}></zn-input>
        <span class="list__editor-separator">–</span>
        <zn-input type="time"
                  size="small"
                  step=${step}
                  .value=${range.end}
                  aria-label="${DAY_LABELS[day].long} closes"
                  @zn-input=${(event: Event) => event.stopPropagation()}
                  @zn-change=${(event: Event) => {
                    event.stopPropagation();
                    this._handleRangeEdit(day, index, 'end', (event.target as ZnInput).value as string);
                  }}></zn-input>
        <button type="button"
                class="list__remove"
                title="Remove range"
                @click=${() => this._handleRemoveRange(day, index)}>
          <zn-icon src="close" size="14"></zn-icon>
        </button>
      </div>`;
  }

  /** The exception annotation shown against a day in the form view. */
  private _dayNote(day: ScheduleDay): { text: string; reduced: boolean } {
    const exception = this._exceptionsForDay(day).find(item => exceptionRanges(item) !== null);
    if (!exception) return {text: '', reduced: false};

    const ranges = exceptionRanges(exception) ?? [];
    const verb = ranges.length ? 'Reduced' : this.closedLabel;
    const until = exception.to ? `until ${this._formatDate(exception.to)}` : '';
    const on = !exception.to && (exception.date ?? exception.from)
      ? `on ${this._formatDate(exception.date ?? exception.from)}`
      : '';
    const when = until || on;
    const label = exception.label ? ` — ${exception.label}` : '';

    return {text: `${verb}${when ? ` ${when}` : ''}${label}`, reduced: ranges.length > 0};
  }

  render() {
    const hasLabel = this.label ? true : this.hasSlotController.test('label');
    const hasHelpText = this.helpText ? true : this.hasSlotController.test('help-text');

    return html`
      <div part="form-control"
           class=${classMap({
             'form-control': true,
             'form-control--medium': true,
             'form-control--has-label': hasLabel,
             'form-control--has-help-text': hasHelpText
           })}>
        <label part="form-control-label"
               class="form-control__label"
               aria-hidden=${hasLabel ? 'false' : 'true'}>
          <slot name="label">${this.label}</slot>
        </label>

        <div part="base"
             class=${classMap({
               'schedule-builder': true,
               'schedule-builder--disabled': this.disabled,
               'schedule-builder--readonly': this.readonly,
               'schedule-builder--calendar': this.view === 'calendar',
               'schedule-builder--form': this.view === 'form'
             })}>
          ${this._renderToolbar()}
          ${this.view === 'calendar' ? this._renderCalendar() : this._renderList()}
        </div>

        <div part="form-control-help-text"
             class="form-control__help-text"
             aria-hidden=${hasHelpText ? 'false' : 'true'}>
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `;
  }
}
