# ECharts Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace ApexCharts + Chart.js with Apache ECharts across `zn-chart` and `zn-simple-chart`, preserve the public API of `zn-chart`, add `type="sankey"` and a `sync-group` cross-chart interaction attribute.

**Architecture:** `zn-chart` keeps all existing attributes. Internals rewritten to use a single ECharts instance plus pure builder functions per chart type (`buildBarOption`, `buildLineOption`, `buildAreaOption`, `buildSankeyOption`). Each builder takes resolved props and returns an `EChartsOption` object. `zn-simple-chart` is rewritten inline (hardcoded data ported as-is).

**Tech Stack:** TypeScript, Lit (web components), Apache ECharts (`echarts/core` tree-shakeable imports), web-test-runner + Mocha + `@open-wc/testing`, esbuild.

**Spec:** `docs/superpowers/specs/2026-04-21-echarts-migration-design.md`

---

## File Structure

**New files:**
- `src/components/chart/builders.ts` — pure builder functions per chart type, plus shared types.
- `src/components/chart/builders.test.ts` — unit tests for builders (source-imported, no dist dependency).

**Modified files:**
- `src/components/chart/chart.component.ts` — rewrite internals to ECharts; preserve public API; add `sync-group`, `colors`.
- `src/components/chart/chart.test.ts` — extend existing smoke test with attribute/sankey/sync-group coverage.
- `src/components/simple-chart/simple-chart.component.ts` — rewrite to ECharts; port hardcoded bar data.
- `docs/pages/components/chart.md` — add sankey, sync-group, colors examples; note live-mode change.
- `package.json` — add `echarts`; remove `apexcharts`, `chart.js`.
- `package-lock.json` — regenerated.

**Unchanged:**
- `src/components/chart/chart.scss`
- `src/components/chart/index.ts`
- `src/components/simple-chart/simple-chart.scss`
- `src/components/simple-chart/simple-chart.test.ts` (existing smoke test continues to pass)

---

## Task 1: Install ECharts and set up tree-shakeable imports

**Files:**
- Modify: `package.json` (add `echarts` dependency)

- [ ] **Step 1: Install ECharts**

Run: `npm install echarts@^5.5.0`

Expected: package added to `dependencies`, no errors. `echarts` version pinned to `^5.5.0` (current stable at time of writing; `5.x` is API-stable).

- [ ] **Step 2: Verify install**

Run: `node -e "console.log(require('echarts/package.json').version)"`

Expected: prints a `5.x.y` version string.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add echarts for chart migration"
```

---

## Task 2: Create builders module skeleton with shared types

**Files:**
- Create: `src/components/chart/builders.ts`

This task establishes the types that later tasks will use. No functions yet — just the shared interface. Placing types in the same file as builders keeps the module cohesive (small, related, change together).

- [ ] **Step 1: Write the file**

```ts
// src/components/chart/builders.ts
import type { EChartsOption } from 'echarts';

export type ChartType = 'area' | 'bar' | 'line' | 'sankey';

export interface SeriesItem {
  name: string;
  data: any[];
  color?: string;
}

export interface SankeyEdge {
  source: string;
  target: string;
  value: number;
}

export interface BuilderProps {
  type: ChartType;
  data: SeriesItem[];
  categories: string[];
  xAxisType?: 'datetime' | 'category' | 'numeric';
  yAxisAppend?: string;
  stacked: boolean;
  enableAnimations: boolean;
  datapointSize: number;
  colors?: string[];
  theme: 'light' | 'dark';
}
```

- [ ] **Step 2: Verify compile**

Run: `npx tsc --noEmit -p tsconfig.json 2>&1 | grep builders.ts || echo "no errors"`

Expected: `no errors`.

- [ ] **Step 3: Commit**

```bash
git add src/components/chart/builders.ts
git commit -m "chart: add builders module skeleton with shared types"
```

---

## Task 3: Build `buildBarOption` (TDD)

**Files:**
- Create: `src/components/chart/builders.test.ts`
- Modify: `src/components/chart/builders.ts`

- [ ] **Step 1: Write the failing tests**

```ts
// src/components/chart/builders.test.ts
import { expect } from '@open-wc/testing';
import { buildBarOption, type BuilderProps } from './builders';

const baseProps: BuilderProps = {
  type: 'bar',
  data: [{ name: 'Sales', data: [10, 20, 30] }],
  categories: ['Q1', 'Q2', 'Q3'],
  stacked: false,
  enableAnimations: false,
  datapointSize: 1,
  theme: 'light',
};

describe('buildBarOption', () => {
  it('maps a single series into bar type with categories', () => {
    const opt = buildBarOption(baseProps);
    expect(opt.series).to.have.lengthOf(1);
    expect((opt.series as any[])[0].type).to.equal('bar');
    expect((opt.series as any[])[0].name).to.equal('Sales');
    expect((opt.series as any[])[0].data).to.deep.equal([10, 20, 30]);
    expect((opt.xAxis as any).type).to.equal('category');
    expect((opt.xAxis as any).data).to.deep.equal(['Q1', 'Q2', 'Q3']);
  });

  it('applies stacking when stacked=true', () => {
    const opt = buildBarOption({
      ...baseProps,
      stacked: true,
      data: [
        { name: 'A', data: [1, 2] },
        { name: 'B', data: [3, 4] },
      ],
    });
    expect((opt.series as any[])[0].stack).to.equal('total');
    expect((opt.series as any[])[1].stack).to.equal('total');
  });

  it('does not stack when stacked=false', () => {
    const opt = buildBarOption({
      ...baseProps,
      data: [
        { name: 'A', data: [1, 2] },
        { name: 'B', data: [3, 4] },
      ],
    });
    expect((opt.series as any[])[0].stack).to.be.undefined;
  });

  it('appends y-axis suffix via formatter', () => {
    const opt = buildBarOption({ ...baseProps, yAxisAppend: '%' });
    const formatter = ((opt.yAxis as any).axisLabel.formatter) as (v: number) => string;
    expect(formatter(42)).to.equal('42%');
  });

  it('maps per-series color to itemStyle.color', () => {
    const opt = buildBarOption({
      ...baseProps,
      data: [{ name: 'Sales', data: [1, 2, 3], color: '#ff0000' }],
    });
    expect((opt.series as any[])[0].itemStyle.color).to.equal('#ff0000');
  });

  it('maps colors array to option.color', () => {
    const opt = buildBarOption({ ...baseProps, colors: ['#abc', '#def'] });
    expect(opt.color).to.deep.equal(['#abc', '#def']);
  });

  it('disables animation by default', () => {
    const opt = buildBarOption(baseProps);
    expect(opt.animation).to.equal(false);
  });

  it('enables animation when enableAnimations=true', () => {
    const opt = buildBarOption({ ...baseProps, enableAnimations: true });
    expect(opt.animation).to.equal(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --group builders`

Expected: FAIL — `buildBarOption is not exported from ./builders`.

- [ ] **Step 3: Implement `buildBarOption`**

Append to `src/components/chart/builders.ts`:

```ts
function commonOption(props: BuilderProps): EChartsOption {
  return {
    animation: props.enableAnimations,
    ...(props.colors ? { color: props.colors } : {}),
    tooltip: {
      trigger: 'axis',
      valueFormatter: props.yAxisAppend
        ? (v: number | string) => `${v}${props.yAxisAppend}`
        : undefined,
    },
    legend: {
      top: 0,
      right: 0,
    },
    grid: {
      left: 40,
      right: 20,
      top: 40,
      bottom: 30,
    },
  };
}

function buildYAxis(props: BuilderProps) {
  return {
    type: 'value' as const,
    axisLabel: props.yAxisAppend
      ? { formatter: (v: number) => `${v}${props.yAxisAppend}` }
      : {},
  };
}

function buildXAxis(props: BuilderProps) {
  if (props.xAxisType === 'datetime') return { type: 'time' as const };
  if (props.xAxisType === 'numeric') return { type: 'value' as const };
  return { type: 'category' as const, data: props.categories };
}

function seriesFromProps(
  props: BuilderProps,
  seriesType: 'bar' | 'line',
  extra: (s: SeriesItem) => Record<string, unknown> = () => ({}),
) {
  return props.data.map((s) => ({
    type: seriesType,
    name: s.name,
    data: s.data,
    ...(s.color ? { itemStyle: { color: s.color } } : {}),
    ...(props.stacked ? { stack: 'total' } : {}),
    ...extra(s),
  }));
}

export function buildBarOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'bar'),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --group builders`

Expected: PASS — all `buildBarOption` tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/builders.ts src/components/chart/builders.test.ts
git commit -m "chart: add buildBarOption with stacked, colors, y-axis suffix support"
```

---

## Task 4: Build `buildLineOption` (TDD)

**Files:**
- Modify: `src/components/chart/builders.ts`
- Modify: `src/components/chart/builders.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/components/chart/builders.test.ts`:

```ts
import { buildLineOption } from './builders';

describe('buildLineOption', () => {
  const baseLineProps: BuilderProps = {
    type: 'line',
    data: [{ name: 'Revenue', data: [10, 20, 30] }],
    categories: ['Jan', 'Feb', 'Mar'],
    stacked: false,
    enableAnimations: false,
    datapointSize: 3,
    theme: 'light',
  };

  it('maps a series to line type', () => {
    const opt = buildLineOption(baseLineProps);
    expect((opt.series as any[])[0].type).to.equal('line');
  });

  it('applies symbolSize from datapointSize', () => {
    const opt = buildLineOption(baseLineProps);
    expect((opt.series as any[])[0].symbolSize).to.equal(3);
  });

  it('uses datetime x-axis when xAxisType=datetime', () => {
    const opt = buildLineOption({ ...baseLineProps, xAxisType: 'datetime' });
    expect((opt.xAxis as any).type).to.equal('time');
  });

  it('does not apply areaStyle for plain line', () => {
    const opt = buildLineOption(baseLineProps);
    expect((opt.series as any[])[0].areaStyle).to.be.undefined;
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --group builders`

Expected: FAIL — `buildLineOption is not exported`.

- [ ] **Step 3: Implement**

Append to `src/components/chart/builders.ts`:

```ts
export function buildLineOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', () => ({
      symbolSize: props.datapointSize,
    })),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --group builders`

Expected: PASS — new `buildLineOption` tests green, prior tests still green.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/builders.ts src/components/chart/builders.test.ts
git commit -m "chart: add buildLineOption with symbolSize and xAxisType mapping"
```

---

## Task 5: Build `buildAreaOption` (TDD)

**Files:**
- Modify: `src/components/chart/builders.ts`
- Modify: `src/components/chart/builders.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/components/chart/builders.test.ts`:

```ts
import { buildAreaOption } from './builders';

describe('buildAreaOption', () => {
  const baseAreaProps: BuilderProps = {
    type: 'area',
    data: [{ name: 'Traffic', data: [100, 200, 300] }],
    categories: ['Mon', 'Tue', 'Wed'],
    stacked: false,
    enableAnimations: false,
    datapointSize: 1,
    theme: 'light',
  };

  it('maps a series to line type with areaStyle set', () => {
    const opt = buildAreaOption(baseAreaProps);
    expect((opt.series as any[])[0].type).to.equal('line');
    expect((opt.series as any[])[0].areaStyle).to.be.an('object');
  });

  it('applies stacking when stacked=true', () => {
    const opt = buildAreaOption({
      ...baseAreaProps,
      stacked: true,
      data: [
        { name: 'A', data: [1, 2] },
        { name: 'B', data: [3, 4] },
      ],
    });
    expect((opt.series as any[])[0].stack).to.equal('total');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --group builders`

Expected: FAIL — `buildAreaOption is not exported`.

- [ ] **Step 3: Implement**

Append to `src/components/chart/builders.ts`:

```ts
export function buildAreaOption(props: BuilderProps): EChartsOption {
  return {
    ...commonOption(props),
    xAxis: buildXAxis(props),
    yAxis: buildYAxis(props),
    series: seriesFromProps(props, 'line', () => ({
      symbolSize: props.datapointSize,
      areaStyle: {},
    })),
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --group builders`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/builders.ts src/components/chart/builders.test.ts
git commit -m "chart: add buildAreaOption as line + areaStyle"
```

---

## Task 6: Build `buildSankeyOption` with node auto-derivation (TDD)

**Files:**
- Modify: `src/components/chart/builders.ts`
- Modify: `src/components/chart/builders.test.ts`

- [ ] **Step 1: Write the failing tests**

Append to `src/components/chart/builders.test.ts`:

```ts
import { buildSankeyOption } from './builders';

describe('buildSankeyOption', () => {
  const sankeyProps: BuilderProps = {
    type: 'sankey',
    data: [{
      name: 'Flow',
      data: [
        { source: 'A', target: 'B', value: 10 },
        { source: 'A', target: 'C', value: 5 },
        { source: 'B', target: 'D', value: 7 },
      ],
    }],
    categories: [],
    stacked: false,
    enableAnimations: false,
    datapointSize: 1,
    theme: 'light',
  };

  it('builds one sankey series with links mapped from edges', () => {
    const opt = buildSankeyOption(sankeyProps);
    const series = (opt.series as any[])[0];
    expect(series.type).to.equal('sankey');
    expect(series.links).to.deep.equal([
      { source: 'A', target: 'B', value: 10 },
      { source: 'A', target: 'C', value: 5 },
      { source: 'B', target: 'D', value: 7 },
    ]);
  });

  it('derives unique nodes from edge source/target values', () => {
    const opt = buildSankeyOption(sankeyProps);
    const series = (opt.series as any[])[0];
    const names = series.data.map((n: any) => n.name).sort();
    expect(names).to.deep.equal(['A', 'B', 'C', 'D']);
  });

  it('omits xAxis and yAxis (sankey has no cartesian axes)', () => {
    const opt = buildSankeyOption(sankeyProps);
    expect(opt.xAxis).to.be.undefined;
    expect(opt.yAxis).to.be.undefined;
  });

  it('passes through explicit nodes when provided on the series object', () => {
    const withNodes = {
      ...sankeyProps,
      data: [{
        name: 'Flow',
        nodes: [
          { name: 'A', itemStyle: { color: '#f00' } },
          { name: 'B' }, { name: 'C' }, { name: 'D' },
        ],
        data: sankeyProps.data[0].data,
      }] as any,
    };
    const opt = buildSankeyOption(withNodes);
    const series = (opt.series as any[])[0];
    expect(series.data[0]).to.deep.equal({ name: 'A', itemStyle: { color: '#f00' } });
  });

  it('uses tooltip trigger=item (not axis) for sankey', () => {
    const opt = buildSankeyOption(sankeyProps);
    expect((opt.tooltip as any).trigger).to.equal('item');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- --group builders`

Expected: FAIL — `buildSankeyOption is not exported`.

- [ ] **Step 3: Implement**

Append to `src/components/chart/builders.ts`:

```ts
function deriveNodes(edges: SankeyEdge[]): { name: string }[] {
  const seen = new Set<string>();
  const nodes: { name: string }[] = [];
  for (const edge of edges) {
    if (!seen.has(edge.source)) {
      seen.add(edge.source);
      nodes.push({ name: edge.source });
    }
    if (!seen.has(edge.target)) {
      seen.add(edge.target);
      nodes.push({ name: edge.target });
    }
  }
  return nodes;
}

export function buildSankeyOption(props: BuilderProps): EChartsOption {
  const first = props.data[0] ?? { name: '', data: [] };
  const edges = (first.data ?? []) as SankeyEdge[];
  const explicitNodes = (first as any).nodes as { name: string }[] | undefined;
  const nodes = explicitNodes ?? deriveNodes(edges);

  return {
    animation: props.enableAnimations,
    ...(props.colors ? { color: props.colors } : {}),
    tooltip: { trigger: 'item' },
    series: [{
      type: 'sankey',
      name: first.name,
      data: nodes,
      links: edges,
      emphasis: { focus: 'adjacency' },
    }],
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- --group builders`

Expected: PASS — all builders tests green.

- [ ] **Step 5: Commit**

```bash
git add src/components/chart/builders.ts src/components/chart/builders.test.ts
git commit -m "chart: add buildSankeyOption with node derivation and explicit-nodes passthrough"
```

---

## Task 7: Rewrite `zn-chart` internals on ECharts

**Files:**
- Modify: `src/components/chart/chart.component.ts` (full rewrite of internals; public API preserved)

- [ ] **Step 1: Replace the component implementation**

Replace the entire contents of `src/components/chart/chart.component.ts` with:

```ts
import { type CSSResultGroup, html, type PropertyValues, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, SankeyChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ZincElement from '../../internal/zinc-element';
import {
  buildBarOption, buildLineOption, buildAreaOption, buildSankeyOption,
  type BuilderProps, type ChartType, type SeriesItem,
} from './builders';
import styles from './chart.scss';

echarts.use([
  BarChart, LineChart, SankeyChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent,
  CanvasRenderer,
]);

/**
 * @summary Chart component powered by Apache ECharts.
 * @documentation https://zinc.style/components/data-chart
 * @status experimental
 * @since 1.0
 *
 * @csspart base - The component's base wrapper.
 */
export default class ZnChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property() type: ChartType = 'bar';
  @property({ type: Array }) data: SeriesItem[] = [];
  @property({ type: Array }) categories: string[] = [];

  @property({ attribute: 'x-axis' }) xAxis: 'datetime' | 'category' | 'numeric';
  @property({ type: Number, attribute: 'd-size' }) datapointSize: number = 1;
  @property({ type: Boolean }) stacked = false;

  @property({ type: Boolean }) live = false;
  @property({ attribute: 'data-url' }) dataUrl = '';
  @property({ attribute: 'live-interval', type: Number }) liveInterval = 1000;
  @property({ type: Number, reflect: true }) height = 300;

  @property({ attribute: 'enable-animations', type: Boolean }) enableAnimations = false;
  @property({ attribute: 'y-axis-append' }) yAxisAppend: string;

  @property({ type: Array }) colors?: string[];
  @property({ attribute: 'sync-group' }) syncGroup?: string;

  private chart?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;
  private liveTimer?: number;

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.initChart();
    super.firstUpdated(_changedProperties);
  }

  private getTheme(): 'light' | 'dark' {
    return this.getAttribute('t') === 'dark' ? 'dark' : 'light';
  }

  private buildOption() {
    const props: BuilderProps = {
      type: this.type,
      data: this.data ?? [],
      categories: Array.isArray(this.categories) ? this.categories : [],
      xAxisType: this.xAxis,
      yAxisAppend: this.yAxisAppend,
      stacked: this.stacked,
      enableAnimations: this.enableAnimations,
      datapointSize: this.datapointSize,
      colors: this.colors,
      theme: this.getTheme(),
    };
    switch (this.type) {
      case 'bar': return buildBarOption(props);
      case 'line': return buildLineOption(props);
      case 'area': return buildAreaOption(props);
      case 'sankey': return buildSankeyOption(props);
    }
  }

  private initChart() {
    const host = this.shadowRoot?.getElementById('chart') as HTMLElement | null;
    if (!host) return;
    host.style.height = `${this.height}px`;
    this.chart = echarts.init(host, this.getTheme());
    this.chart.setOption(this.buildOption());

    if (this.syncGroup) {
      this.chart.group = this.syncGroup;
      echarts.connect(this.syncGroup);
    }

    this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
    this.resizeObserver.observe(host);

    if (this.live && this.dataUrl) this.startLive();
  }

  private startLive() {
    this.liveTimer = window.setInterval(async () => {
      try {
        const res = await fetch(this.dataUrl);
        const newData = await res.json();
        this.data = newData;
        this.chart?.setOption({ ...this.buildOption() });
      } catch { /* swallow transient fetch errors */ }
    }, this.liveInterval);
  }

  private reinit() {
    this.chart?.dispose();
    this.chart = undefined;
    this.initChart();
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    super.attributeChangedCallback(name, _old, value);
    if (!this.chart) return;

    if (name === 't') { this.reinit(); return; }
    if (name === 'type') { this.reinit(); return; }
    if (name === 'height') {
      const host = this.shadowRoot?.getElementById('chart') as HTMLElement | null;
      if (host) host.style.height = `${this.height}px`;
      this.chart.resize();
      return;
    }
    if (name === 'sync-group') {
      if (value) {
        this.chart.group = value;
        echarts.connect(value);
      } else {
        this.chart.group = '';
      }
      return;
    }
    this.chart.setOption({ ...this.buildOption() });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.liveTimer) clearInterval(this.liveTimer);
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
    this.chart = undefined;
  }

  protected render(): unknown {
    return html`<div class="chart"><div id="chart"></div></div>`;
  }
}
```

- [ ] **Step 2: Build and verify component compiles**

Run: `npm run build`

Expected: build succeeds, `dist/zn.min.js` regenerated, no TypeScript errors.

- [ ] **Step 3: Run the existing smoke test**

Run: `npm run test -- --group chart`

Expected: PASS — "should render a component".

- [ ] **Step 4: Commit**

```bash
git add src/components/chart/chart.component.ts
git commit -m "chart: rewrite zn-chart internals on ECharts; preserve public API"
```

---

## Task 8: Add component-level tests for `zn-chart`

**Files:**
- Modify: `src/components/chart/chart.test.ts`

- [ ] **Step 1: Replace the test file contents**

```ts
// src/components/chart/chart.test.ts
import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-chart>', () => {
  it('renders a component', async () => {
    const el = await fixture(html`<zn-chart></zn-chart>`);
    expect(el).to.exist;
  });

  it('renders a bar chart with data and categories', async () => {
    const el: any = await fixture(html`
      <zn-chart
        type="bar"
        .data=${[{ name: 'S', data: [1, 2, 3] }]}
        .categories=${['A', 'B', 'C']}
      ></zn-chart>
    `);
    await el.updateComplete;
    // Give ECharts a tick to initialise.
    await new Promise((r) => setTimeout(r, 50));
    const canvas = el.shadowRoot.querySelector('canvas');
    expect(canvas).to.exist;
  });

  it('renders a sankey chart', async () => {
    const el: any = await fixture(html`
      <zn-chart
        type="sankey"
        .data=${[{
          name: 'Flow',
          data: [
            { source: 'A', target: 'B', value: 10 },
            { source: 'B', target: 'C', value: 5 },
          ],
        }]}
      ></zn-chart>
    `);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    const canvas = el.shadowRoot.querySelector('canvas');
    expect(canvas).to.exist;
  });

  it('joins a sync-group when the attribute is set', async () => {
    const a: any = await fixture(html`
      <zn-chart sync-group="g1" type="bar"
        .data=${[{ name: 'S', data: [1, 2] }]}
        .categories=${['A', 'B']}></zn-chart>
    `);
    await a.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    // @ts-expect-error internal
    expect(a.chart?.group).to.equal('g1');
  });
});
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 3: Run tests**

Run: `npm run test -- --group chart`

Expected: PASS — all four tests green.

- [ ] **Step 4: Commit**

```bash
git add src/components/chart/chart.test.ts
git commit -m "chart: add component-level tests for bar/sankey/sync-group"
```

---

## Task 9: Rewrite `zn-simple-chart` on ECharts

**Files:**
- Modify: `src/components/simple-chart/simple-chart.component.ts`

- [ ] **Step 1: Replace the component implementation**

Replace the entire contents of `src/components/simple-chart/simple-chart.component.ts` with:

```ts
import { type CSSResultGroup, html, unsafeCSS } from 'lit';
import { property } from 'lit/decorators.js';
import * as echarts from 'echarts/core';
import { BarChart } from 'echarts/charts';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import ZincElement from '../../internal/zinc-element';
import styles from './simple-chart.scss';

echarts.use([BarChart, GridComponent, TooltipComponent, CanvasRenderer]);

const DEFAULT_LABELS = [
  'Jun 2016', 'Jul 2016', 'Aug 2016', 'Sep 2016', 'Oct 2016', 'Nov 2016',
  'Dec 2016', 'Jan 2017', 'Feb 2017', 'Mar 2017', 'Apr 2017', 'May 2017',
];
const DEFAULT_DATA = [56.4, 39.8, 66.8, 66.4, 40.6, 55.2, 77.4, 69.8, 57.8, 76, 110.8, 142.6];

/**
 * @summary A simple, pre-styled bar chart.
 * @documentation https://zinc.style/components/simple-chart
 * @status experimental
 * @since 1.0
 */
export default class ZnSimpleChart extends ZincElement {
  static styles: CSSResultGroup = unsafeCSS(styles);

  @property({ attribute: 'datasets', type: Array }) datasets?: { data: number[] }[];
  @property({ attribute: 'labels', type: Array }) labels?: string[];

  private chart?: echarts.ECharts;
  private resizeObserver?: ResizeObserver;

  firstUpdated() {
    const host = this.renderRoot.querySelector('#chart') as HTMLElement;
    this.chart = echarts.init(host);
    const data = this.datasets?.[0]?.data ?? DEFAULT_DATA;
    const labels = this.labels ?? DEFAULT_LABELS;
    this.chart.setOption({
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0,0,0,0.7)',
        borderWidth: 0,
        textStyle: { color: '#fff' },
      },
      xAxis: { type: 'category', data: labels, show: false },
      yAxis: { type: 'value', show: false },
      grid: { left: 0, right: 0, top: 0, bottom: 0 },
      series: [{
        type: 'bar',
        data,
        barWidth: 2,
        itemStyle: {
          color: '#29C1BC',
          borderRadius: 10,
        },
        emphasis: {
          itemStyle: { color: '#19837f' },
        },
      }],
    });
    this.resizeObserver = new ResizeObserver(() => this.chart?.resize());
    this.resizeObserver.observe(host);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }

  render() {
    return html`<div id="chart" style="width:100%;height:100%;"></div>`;
  }
}
```

- [ ] **Step 2: Build**

Run: `npm run build`

Expected: build succeeds, no TypeScript errors.

- [ ] **Step 3: Run existing smoke test**

Run: `npm run test -- --group simple-chart`

Expected: PASS — existing test still passes.

- [ ] **Step 4: Commit**

```bash
git add src/components/simple-chart/simple-chart.component.ts
git commit -m "simple-chart: migrate from Chart.js to ECharts"
```

---

## Task 10: Update `chart.md` docs with sankey, sync-group, colors examples

**Files:**
- Modify: `docs/pages/components/chart.md`

- [ ] **Step 1: Add sankey example section**

Append a new section to `docs/pages/components/chart.md` before the "Dark Mode Support" section:

````markdown
### Sankey Diagram

Use `type="sankey"` to render a Sankey flow diagram. Each item in the series `data` array is an edge with `source`, `target`, and `value`. Nodes are auto-derived from unique source/target values.

```html:preview
<zn-chart
  type="sankey"
  height="400"
  data="[{&quot;name&quot;:&quot;Payment Flow&quot;,&quot;data&quot;:[{&quot;source&quot;:&quot;Stripe&quot;,&quot;target&quot;:&quot;USD&quot;,&quot;value&quot;:1200},{&quot;source&quot;:&quot;Stripe&quot;,&quot;target&quot;:&quot;EUR&quot;,&quot;value&quot;:430},{&quot;source&quot;:&quot;USD&quot;,&quot;target&quot;:&quot;Captured&quot;,&quot;value&quot;:900},{&quot;source&quot;:&quot;USD&quot;,&quot;target&quot;:&quot;Declined&quot;,&quot;value&quot;:300},{&quot;source&quot;:&quot;EUR&quot;,&quot;target&quot;:&quot;Captured&quot;,&quot;value&quot;:380},{&quot;source&quot;:&quot;EUR&quot;,&quot;target&quot;:&quot;Declined&quot;,&quot;value&quot;:50}]}]">
</zn-chart>
```
````

- [ ] **Step 2: Add sync-group example section**

Append after the sankey section:

````markdown
### Cross-Chart Tooltip Sync

Use `sync-group="<id>"` on two or more charts to synchronise hover tooltips, zoom, and legend selection across them.

```html:preview
<zn-chart
  sync-group="demo-group"
  type="line"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Visits&quot;,&quot;data&quot;:[120,180,150,220,190]}]"
  height="250">
</zn-chart>
<br />
<zn-chart
  sync-group="demo-group"
  type="bar"
  categories="[&quot;Mon&quot;,&quot;Tue&quot;,&quot;Wed&quot;,&quot;Thu&quot;,&quot;Fri&quot;]"
  data="[{&quot;name&quot;:&quot;Signups&quot;,&quot;data&quot;:[12,18,15,22,19]}]"
  height="250">
</zn-chart>
```
````

- [ ] **Step 3: Add colors example section**

Append after the sync-group section:

````markdown
### Custom Colors

Use the `colors` attribute to set the palette that cycles across series.

```html:preview
<zn-chart
  type="bar"
  colors="[&quot;#ff6c9c&quot;,&quot;#6483F2&quot;,&quot;#29bab5&quot;]"
  categories="[&quot;Q1&quot;,&quot;Q2&quot;,&quot;Q3&quot;]"
  data="[{&quot;name&quot;:&quot;A&quot;,&quot;data&quot;:[10,20,30]},{&quot;name&quot;:&quot;B&quot;,&quot;data&quot;:[15,25,35]},{&quot;name&quot;:&quot;C&quot;,&quot;data&quot;:[20,30,40]}]"
  height="300">
</zn-chart>
```

For a specific series colour, add a `color` property to the series object in the `data` array:

```html:preview
<zn-chart
  type="line"
  categories="[&quot;Jan&quot;,&quot;Feb&quot;,&quot;Mar&quot;]"
  data="[{&quot;name&quot;:&quot;Revenue&quot;,&quot;color&quot;:&quot;hsl(210,70%,50%)&quot;,&quot;data&quot;:[10,20,30]}]"
  height="300">
</zn-chart>
```
````

- [ ] **Step 4: Update the live-mode section (if present) and Data Format section**

Find the "Data Format" section. Append a new subsection:

````markdown
### Sankey Edge Format

When `type="sankey"`, each item in the series `data` array is an edge:

```json
[{
  "name": "Flow",
  "data": [
    {"source": "A", "target": "B", "value": 100},
    {"source": "A", "target": "C", "value": 50}
  ]
}]
```

Nodes are auto-derived from unique source/target values. To customise node appearance or ordering, include an explicit `nodes` key on the series object.
````

- [ ] **Step 5: Update the top-of-file description to reference ECharts**

Find the intro `:::tip` block that mentions ApexCharts and replace it with:

```markdown
:::tip
The chart component is built on Apache ECharts, providing a powerful and flexible charting library with extensive customisation options. Visit the [Apache ECharts documentation](https://echarts.apache.org/en/option.html) for advanced configuration reference.
:::
```

Also update the frontmatter description line:

```markdown
description: Charts visualize data using various chart types powered by Apache ECharts. Display line charts, bar charts, area charts, sankey diagrams, and more with full customization options.
```

- [ ] **Step 6: Commit**

```bash
git add docs/pages/components/chart.md
git commit -m "docs(chart): add sankey, sync-group, colors examples; reference ECharts"
```

---

## Task 11: Remove ApexCharts and Chart.js dependencies

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json` (regenerated)

- [ ] **Step 1: Confirm no remaining source references**

Run: `grep -r --include='*.ts' -l "from 'apexcharts\\|from \"apexcharts\\|from 'chart\\.js\\|from \"chart\\.js" src/`

Expected: no output (nothing importing apexcharts or chart.js from src).

- [ ] **Step 2: Uninstall packages**

Run: `npm uninstall apexcharts chart.js`

Expected: packages removed from `package.json` dependencies.

- [ ] **Step 3: Run full build**

Run: `npm run build`

Expected: build succeeds.

- [ ] **Step 4: Run full test suite**

Run: `npm run test`

Expected: all tests pass (chart, simple-chart, builders, plus all other component tests).

- [ ] **Step 5: Run lint**

Run: `npm run lint`

Expected: no errors, zero warnings.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: remove apexcharts and chart.js (migrated to echarts)"
```

---

## Task 12: Final integration check

**Files:**
- None (verification only)

- [ ] **Step 1: Clean build**

Run: `rm -rf dist && npm run build`

Expected: fresh build succeeds.

- [ ] **Step 2: Inspect bundle for dead deps**

Run: `grep -c "apexcharts\\|from 'chart.js'" dist/zn.js || echo "clean"`

Expected: `clean` (no leftover references).

- [ ] **Step 3: Full test suite one more time**

Run: `npm run test`

Expected: all tests pass.

- [ ] **Step 4: Verify docs page loads**

Start watcher: `npm run watch` (runs dev server).

Manually open the chart docs page (`http://localhost:<port>/components/chart`) and visually confirm:
- Every existing example renders something sensible (visuals will differ from ApexCharts; that is expected).
- New sankey example renders a flow diagram.
- Cross-chart sync example: hovering one chart highlights the same x-value on the other.
- Custom colors example: palette is applied.

Stop the watcher once satisfied (Ctrl+C).

- [ ] **Step 5: Final commit (if any cleanup needed)**

If any final fixes came up from the manual pass, commit them:

```bash
git add <files>
git commit -m "chart: <description of fix>"
```

If nothing changed, skip.

---

## Wrap-up

Branch `feature/echarts-migration` is ready. Open a PR referencing:

- Spec: `docs/superpowers/specs/2026-04-21-echarts-migration-design.md`
- Plan: `docs/superpowers/plans/2026-04-21-echarts-migration.md`

PR description should call out:

1. Public API of `zn-chart` unchanged — no consumer code changes required.
2. Visual output will shift (ECharts vs ApexCharts rendering differences).
3. `live` mode no longer does rolling-window shift — endpoints must return full current series array each tick.
4. `zn-simple-chart` re-rendered via ECharts.
5. Two dependencies removed (`apexcharts`, `chart.js`), one added (`echarts`).
6. New features: `type="sankey"`, `sync-group`, `colors`, per-series `color`.
7. Third-party license attribution: confirm the existing Zinc distribution bundles `LICENSE`/`NOTICE` for `echarts`, `zrender`, and `tslib` the same way it handles other OSS deps. If a `THIRD_PARTY_LICENSES` aggregation doesn't exist today, flag as a follow-up (not blocking this PR — same obligation already applies to every existing MIT dep in `package.json`).