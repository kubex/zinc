# ECharts Migration & Sankey Support — Design

**Date**: 2026-04-21
**Branch**: `feature/echarts-migration`
**Status**: Design — awaiting approval before implementation plan

## Goal

Migrate Zinc's charting components from ApexCharts + Chart.js to Apache ECharts, while:

1. Preserving the public API of `zn-chart` so consumer apps require no code changes.
2. Adding a new `type="sankey"` option (the original driver for this work).
3. Adding cross-chart interaction support (hover sync across charts on the same page).
4. Consolidating to a single charting library across Zinc.

## Motivation

Three drivers converged:

- **Sankey gap**: `zn-chart` (ApexCharts) does not support sankey diagrams. ApexCharts' sister library `apexsankey` is commercially licensed with revenue thresholds and platform-distribution caveats — unsuitable for Zinc, which is distributed to customers and will eventually allow customer-authored charts.
- **License risk on ApexCharts core**: similar concerns at platform scale. Apache ECharts (Apache 2.0) has no thresholds, no platform clauses, and includes an explicit patent grant.
- **Cross-chart interaction**: ECharts has native `echarts.connect(groupId)` for synchronised tooltips/zoom/legend across charts. ApexCharts requires DIY glue; Chart.js requires a community plugin.

One charting library (ECharts) replaces two (ApexCharts + Chart.js).

## Non-goals

- No automated visual regression against the current ApexCharts output. Visual shifts are expected and acceptable.
- No performance benchmarks — no existing baseline to compare against.
- No new chart types beyond sankey in this migration (funnel, radar, heatmap, etc. remain future work).
- No rolling-window live-update behaviour (dropping ApexCharts-specific shift-animation pattern).

## Architecture

### Dependency changes

**Add**: `echarts` (Apache 2.0). Import tree-shakeably:

```ts
import * as echarts from 'echarts/core';
import { BarChart, LineChart, SankeyChart } from 'echarts/charts';
import {
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  BarChart, LineChart, SankeyChart,
  GridComponent, TooltipComponent, LegendComponent,
  TitleComponent, DataZoomComponent,
  CanvasRenderer,
]);
```

**Remove**: `apexcharts`, `chart.js`.

**License attribution**: ensure `LICENSE` / `NOTICE` files from `echarts`, `zrender`, and `tslib` are preserved in distribution (standard OSS hygiene, same obligation already applies to existing MIT deps).

### Component structure

`src/components/chart/chart.component.ts` is rewritten internally. Public API frozen. One ECharts instance per component, stored as `this.chart`. Instance lifecycle:

- `firstUpdated`: `echarts.init(host, themeName)` + `chart.setOption(builtOption)`.
- Attribute changes to `data`, `categories`, `colors`, `y-axis-append`, `d-size`, `stacked`, `height`: `chart.setOption(newOption)` — ECharts diffs internally.
- Attribute changes to `type` or `t` (theme): `chart.dispose()` + re-`init()` (ECharts does not support type/theme swap on live instance).
- Disconnected callback: `chart.dispose()`, leave sync group.

Internal builder functions:

```ts
buildLineOption(props): EChartsOption
buildAreaOption(props): EChartsOption  // line + areaStyle
buildBarOption(props): EChartsOption
buildSankeyOption(props): EChartsOption
```

Each takes the resolved public props and returns a complete ECharts option. Keeps branching cleanly scoped and testable in isolation.

### Resize handling

ECharts requires explicit `resize()` calls — unlike ApexCharts' automatic behaviour. Attach a `ResizeObserver` to the host element in `firstUpdated`; on observed resize, call `this.chart.resize()`. Disconnect observer in `disconnectedCallback`.

### `zn-simple-chart`

Migrate to ECharts in the same PR. It's experimental, hardcoded, and using it as a justification to keep Chart.js contradicts the one-library goal. The component's hardcoded data will be ported as-is to an ECharts bar option; its custom external tooltip can stay (ECharts supports `tooltip.formatter` returning HTML, or `tooltip.extraCssText` for styling).

## Attribute mapping — `zn-chart`

All current public attributes are preserved.

| Attribute | ECharts mapping |
|---|---|
| `type="line"` | `series.type: 'line'` |
| `type="bar"` | `series.type: 'bar'` |
| `type="area"` | `series.type: 'line'`, `series.areaStyle: {}` |
| `type="sankey"` | `series.type: 'sankey'` (new) |
| `data=[{name,data}]` | `series: [{name, type, data, ...}]` |
| `categories` | `xAxis: { type: 'category', data: categories }` |
| `x-axis="datetime"` | `xAxis.type: 'time'` (no adapter dep needed) |
| `x-axis="category"` | `xAxis.type: 'category'` |
| `x-axis="numeric"` | `xAxis.type: 'value'` |
| `d-size` | `series.symbolSize` (line/area only; ignored on bar/sankey) |
| `stacked` | `series.stack: 'total'` on each series |
| `height` | CSS height on container + `chart.resize()` via ResizeObserver |
| `enable-animations` | `option.animation: bool` (default false, matches current) |
| `y-axis-append` | `yAxis.axisLabel.formatter: v => v + suffix` and `tooltip.valueFormatter` |
| `t="dark" \| "light"` | `echarts.init(el, 'dark' \| 'light')` |
| `live` | Interval fetch from `data-url` → `setOption({series: newSeries})` — full-replacement updates only. No rolling-window behaviour. |

### New attributes

| Attribute | Purpose |
|---|---|
| `sync-group="<id>"` | Sets `chart.group = id` and calls `echarts.connect(id)`. Charts sharing a group auto-sync tooltip, dataZoom, and legend selection. |
| `colors='["#abc","#def"]'` | JSON array of colour strings. Maps to `option.color`. Cycles per series. |

### Per-series `color` override

Each item in the `data` array may include a `color` field:

```json
[{"name": "Revenue", "color": "hsl(210,70%,50%)", "data": [10, 20, 30]}]
```

Mapped to `series[i].itemStyle.color`. Enables consumer apps to compute colours via their preferred strategy (e.g. hash-of-name → hue) and pass them in. No hash-hue logic baked into Zinc itself.

### Sankey data shape

Preserves the existing `data=[{name, data}]` envelope. The inner `data` items for sankey are edges:

```html
<zn-chart type="sankey" data='[{
  "name": "Payment Flow",
  "data": [
    {"source": "Stripe", "target": "USD", "value": 1200},
    {"source": "Stripe", "target": "EUR", "value": 430},
    {"source": "USD", "target": "Captured", "value": 900}
  ]
}]'></zn-chart>
```

The builder auto-derives `nodes` from unique `source`/`target` values found in edges, then maps:

- `nodes` → ECharts `series.data` (unique node objects by name)
- `data` items → ECharts `series.links`

If a consumer needs custom node config (node colour, explicit ordering), they may include a `nodes` key on the series object, which is passed through to ECharts.

## Cross-chart interaction

```html
<zn-chart sync-group="dash-1" type="line" data="..." />
<zn-chart sync-group="dash-1" type="bar" data="..." />
```

Implementation in `firstUpdated`:

```ts
if (this.syncGroup) {
  this.chart.group = this.syncGroup;
  echarts.connect(this.syncGroup);
}
```

Cross-chart behaviour enabled:

- Hover on one chart shows tooltip at the same x-value on all connected charts.
- DataZoom applied on one is mirrored on others.
- Legend selection mirrored.

On `sync-group` attribute change: set new group, call `connect(newGroup)`. ECharts handles the re-wiring.

On `disconnectedCallback`: `chart.dispose()` — ECharts removes it from the connected group automatically.

## Live mode

Current ApexCharts behaviour (rolling-window shift via `animationEnd`) is dropped. New behaviour:

```ts
if (this.live && this.dataUrl) {
  this.liveTimer = setInterval(async () => {
    const res = await fetch(this.dataUrl);
    const newSeries = await res.json();
    this.chart.setOption({ series: newSeries });
  }, this.liveInterval);
}
```

Endpoint contract: returns the full current series array, same shape as the `data` attribute. Timer cleared in `disconnectedCallback`.

Any consumer using `live` mode today must ensure its endpoint returns full series (most likely already true).

## Docs

Update `docs/pages/components/chart.md`:

- All existing examples verified to render with ECharts (visuals will differ from ApexCharts — that's expected).
- Add sankey example section with a realistic payment-flow diagram.
- Add cross-chart sync example (two charts with same `sync-group`, hover demo).
- Add `colors` attribute example.
- Add per-series `color` override example.
- Update "Data Format" section to include sankey edge shape.
- Note `live` mode behaviour change (full-replacement only).

## Testing

1. **Smoke test**: existing `chart.test.ts` stays — "component renders" — covers wiring breaks.
2. **Attribute tests**: for each public attribute, assert the builder function produces the expected ECharts option subset. Use Mocha (existing test runner). Example shape:
   ```ts
   it('builds a stacked bar option from stacked attribute', () => {
     const opt = buildBarOption({ stacked: true, data: [...], categories: [...] });
     expect(opt.series[0].stack).to.equal('total');
   });
   ```
3. **Sankey tests**: node auto-derivation from edges, custom nodes passthrough, empty data.
4. **Sync-group test**: two instances with same `sync-group`, verify `echarts.connect` called.
5. **Live mode test**: spy on `fetch`, advance fake timers, verify `setOption` called with response.
6. **Manual docs page pass**: every example in `docs/pages/components/chart.md` renders.

Not in scope: visual regression, performance benchmarks, screenshot diffs.

## Rollout

1. Implement on `feature/echarts-migration` (this branch).
2. Rewrite `zn-chart` and `zn-simple-chart` internals.
3. Remove `apexcharts` and `chart.js` from `package.json` / `package-lock.json`.
4. Update docs page; add sankey + sync-group examples.
5. Write tests per the plan above.
6. PR, review, merge.
7. Bump Zinc minor version; publish release.
8. Consumer apps (fortifi/megameld etc.) update to new Zinc version at their own pace. No code changes required on their side. Visuals will shift — release notes call this out.

## Risks

| Risk | Mitigation |
|---|---|
| Visual differences in consumer dashboards | Release notes flag expected visual shift. Public API unchanged. |
| `live` mode regression in consumers relying on rolling-window | Grep consumer repos for `live` attribute; migrate affected call sites. |
| Bundle size delta (~+20KB net after removing ApexCharts + Chart.js) | Accept as cost of consolidation + new features. Use tree-shakeable imports. |
| Translation bugs in builder functions (edge cases in formatters, sankey node inference, stacked mixed-length series) | Attribute-level unit tests covering each path. |
| ResizeObserver quirks inside hidden parents | Standard pattern, well-trodden. No special handling. |
| `zn-simple-chart` consumer breakage | It is `experimental` status — migration is a rewrite, not a compatibility break. Low consumer surface expected. |

## Open questions

None — all design decisions resolved in brainstorming.