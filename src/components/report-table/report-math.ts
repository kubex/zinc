import type {FilterField} from '../data-table-filter/data-table-filter.component';

export interface ReportValues {[key: string]: number | string | ReportValues}

export type ReportFormat = 'number' | 'decimal' | 'percent' | 'currency' | 'financial' | 'text';
export type ReportStyle = 'none' | 'breakeven' | 'ibreakeven' | 'bold';
export interface ReportColumn {
  key: string; label: string; format?: ReportFormat; decimals?: number; style?: ReportStyle;
  threshold?: number; summable?: boolean; currency?: string; value?: string; formula?: string;
}
export interface ReportGroup {label: string; columns: ReportColumn[]}
export interface ReportLink {uri: string; target?: string}
export interface ReportRow {
  id: string; label: string; uri?: string; target?: string; values: ReportValues; links?: Record<string, ReportLink>;
}
export interface ReportOption {value: string; label: string; category?: string}
export type ReportFilterField = FilterField;
export interface ReportResponse {
  dimension?: {label: string}; groups: ReportGroup[]; rows: ReportRow[];
  totals?: Record<string, number>; currency?: string; groupBy?: string; groupBys?: ReportOption[];
  filterFields?: ReportFilterField[]; error?: {text: string; icon?: string; level?: string};
}

type Formula = (values: ReportValues) => number;

const unsafeKeys = new Set(['__proto__', 'constructor', 'prototype']);

function toNumber(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

export function resolvePath(values: ReportValues | undefined, path: string): number {
  let current: unknown = values;
  for (const part of path.split('.')) {
    if (current === null || typeof current !== 'object') {
      return 0;
    }
    if (unsafeKeys.has(part)) {
      return 0;
    }
    current = (current as ReportValues)[part];
  }
  return toNumber(current);
}

type Token = {type: 'num'; value: number} | {type: 'path'; value: string} | {type: 'op'; value: string};

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    if (/\s/.test(ch)) {
      i++;
    } else if ('+-*/()'.includes(ch)) {
      tokens.push({type: 'op', value: ch});
      i++;
    } else if (ch === '{') {
      const end = source.indexOf('}', i);
      if (end === -1) {
        throw new SyntaxError(`Unclosed placeholder at ${i}`);
      }
      const path = source.slice(i + 1, end).trim();
      if (path === '') {
        throw new SyntaxError(`Empty placeholder at ${i}`);
      }
      tokens.push({type: 'path', value: path});
      i = end + 1;
    } else {
      const match = /^(?:\d+\.?\d*|\.\d+)/.exec(source.slice(i));
      if (!match) {
        throw new SyntaxError(`Unexpected "${ch}" at ${i}`);
      }
      tokens.push({type: 'num', value: Number(match[0])});
      i += match[0].length;
    }
  }
  return tokens;
}

function parse(tokens: Token[]): Formula {
  let pos = 0;
  const isOp = (value: string) => tokens[pos]?.type === 'op' && tokens[pos].value === value;

  function expression(): Formula {
    let left = term();
    while (isOp('+') || isOp('-')) {
      const add = tokens[pos++].value === '+';
      const l = left;
      const r = term();
      left = v => (add ? l(v) + r(v) : l(v) - r(v));
    }
    return left;
  }

  function term(): Formula {
    let left = unary();
    while (isOp('*') || isOp('/')) {
      const mul = tokens[pos++].value === '*';
      const l = left;
      const r = unary();
      left = v => {
        const b = r(v);
        return mul ? l(v) * b : (b === 0 ? 0 : l(v) / b);
      };
    }
    return left;
  }

  function unary(): Formula {
    if (isOp('-')) {
      pos++;
      const operand = unary();
      return v => -operand(v);
    }
    return primary();
  }

  function primary(): Formula {
    const token = tokens[pos++];
    if (!token) {
      throw new SyntaxError('Unexpected end of formula');
    }
    if (token.type === 'num') {
      const n = token.value;
      return () => n;
    }
    if (token.type === 'path') {
      const path = token.value;
      return v => resolvePath(v, path);
    }
    if (token.value === '(') {
      const inner = expression();
      if (!isOp(')')) {
        throw new SyntaxError('Missing closing parenthesis');
      }
      pos++;
      return inner;
    }
    throw new SyntaxError(`Unexpected "${token.value}"`);
  }

  const result = expression();
  if (pos < tokens.length) {
    throw new SyntaxError(`Unexpected "${tokens[pos].value}"`);
  }
  return result;
}

const formulaCache = new Map<string, Formula>();

export function compileFormula(source: string): Formula {
  const cached = formulaCache.get(source);
  if (cached) {
    return cached;
  }
  const body = source.trim().replace(/^=/, '');
  const evaluate = parse(tokenize(body));
  const compiled: Formula = values => {
    const result = evaluate(values);
    return Number.isFinite(result) ? result : 0;
  };
  formulaCache.set(source, compiled);
  return compiled;
}

const safeFormulaCache = new Map<string, Formula>();

// A bad formula from the server must not take the whole report down with it
function safeFormula(source: string): Formula {
  let formula = safeFormulaCache.get(source);
  if (!formula) {
    try {
      formula = compileFormula(source);
    } catch (error) {
      console.warn(`zn-report-table: formula "${source}" is invalid and shows 0: ${(error as Error).message}`);
      formula = () => 0;
    }
    safeFormulaCache.set(source, formula);
  }
  return formula;
}

export function columnValue(column: ReportColumn, values: ReportValues): number {
  if (column.formula) {
    return safeFormula(column.formula)(values);
  }
  return resolvePath(values, column.value ?? column.key);
}

export function aggregate(rows: ReportValues[]): ReportValues {
  const total: ReportValues = {};
  const add = (target: ReportValues, source: ReportValues) => {
    for (const [key, value] of Object.entries(source)) {
      if (unsafeKeys.has(key)) {
        continue;
      }
      if (value !== null && typeof value === 'object') {
        const child = target[key];
        const next: ReportValues = child !== null && typeof child === 'object' ? child : {};
        target[key] = next;
        add(next, value);
      } else if (typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)))) {
        const current = target[key];
        target[key] = (typeof current === 'number' ? current : 0) + Number(value);
      }
    }
  };
  rows.forEach(row => add(total, row));
  return total;
}

export function computeTotals(columns: ReportColumn[], rows: ReportRow[]): Record<string, number | null> {
  const summed = aggregate(rows.map(r => r.values));
  const totals: Record<string, number | null> = {};
  for (const column of columns) {
    totals[column.key] = column.summable === false || column.format === 'text' ? null : columnValue(column, summed);
  }
  return totals;
}
