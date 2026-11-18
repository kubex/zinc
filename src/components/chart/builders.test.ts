/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call */
import {
  buildAreaOption,
  buildBarOption,
  type BuilderProps,
  buildFunnelOption,
  buildGaugeOption,
  buildHeatmapOption,
  buildLineOption,
  buildPieOption,
  buildRadarOption,
  buildSankeyOption,
  buildScatterOption,
  buildSunburstOption,
  buildTreemapOption,
} from './builders';
import { expect } from '@open-wc/testing';

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

describe('bar hover', () => {
  it('shades the hovered category instead of drawing a line', () => {
    expect((buildBarOption(baseProps).tooltip as any).axisPointer.type).to.equal('shadow');
  });
});

describe('bar ends', () => {
  it('rounds the data end and flips it for negative values', () => {
    const series = buildBarOption({ ...baseProps, data: [{ name: 'Net', data: [10, -5] }] }).series as any[];
    expect(series[0].itemStyle.borderRadius).to.deep.equal([4, 4, 0, 0]);
    expect(series[0].data[0]).to.equal(10);
    expect(series[0].data[1]).to.deep.equal({ value: -5, itemStyle: { borderRadius: [0, 0, 4, 4] } });
  });

  it('rounds only the top of a stack and parts its segments with the surface colour', () => {
    const series = buildBarOption({
      ...baseProps,
      stacked: true,
      surfaceColor: 'rgb(255, 255, 255)',
      data: [{ name: 'Captured', data: [1, 2] }, { name: 'Refunded', data: [3, 4] }],
    }).series as any[];
    expect(series.map(s => s.itemStyle.borderRadius)).to.deep.equal([0, [4, 4, 0, 0]]);
    expect(series[0].itemStyle.shadowColor).to.be.undefined;
    expect(series[1].itemStyle).to.include({ shadowColor: 'rgb(255, 255, 255)', shadowOffsetY: 2, shadowBlur: 0 });
  });

  it('rounds and parts the outermost shown segments when legend series are hidden', () => {
    const data = [{ name: 'A', data: [1] }, { name: 'B', data: [2] }, { name: 'C', data: [3] }];
    const ends = (hiddenSeries: string[]) => (buildBarOption({
      ...baseProps, stacked: true, surfaceColor: '#fff', data, hiddenSeries,
    }).series as any[]).map(s => [s.itemStyle.borderRadius, s.itemStyle.shadowColor]);
    expect(ends(['C'])).to.deep.equal([[0, undefined], [[4, 4, 0, 0], '#fff'], [0, '#fff']]);
    expect(ends(['A'])).to.deep.equal([[0, '#fff'], [0, undefined], [[4, 4, 0, 0], '#fff']]);
  });
});

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

  it('resolves a theme colour name on a series', () => {
    const opt = buildLineOption({
      ...baseLineProps,
      data: [{ name: 'Auth', data: [1], color: 'info' }],
      resolveColor: (color: string) => (color === 'info' ? 'rgb(8, 94, 253)' : color),
    });
    expect((opt.series as any[])[0].itemStyle.color).to.equal('rgb(8, 94, 253)');
  });

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

  it('shows the hovered point solid, ringed in the surface colour', () => {
    const series = (buildLineOption({ ...baseLineProps, surfaceColor: 'rgb(255, 255, 255)' }).series as any[])[0];
    expect(series.symbol).to.equal('circle');
    expect(series.emphasis.itemStyle).to.deep.equal({ borderColor: 'rgb(255, 255, 255)', borderWidth: 2 });
    expect(series.symbolSize * series.emphasis.scale).to.equal(10);
  });

  it('keeps room above the plot only when the legend shows', () => {
    expect((buildLineOption(baseLineProps).grid as any).top).to.equal(12);
    const two = buildLineOption({ ...baseLineProps, data: [...baseLineProps.data, { name: 'Refunds', data: [1, 2, 3] }] });
    expect((two.grid as any).top).to.equal(40);
  });
});

describe('per-series options', () => {
  const band = (overrides: Partial<BuilderProps> = {}) => buildLineOption({
    ...baseProps,
    xAxisType: 'datetime',
    data: [
      { name: 'Expected range', data: [[1, 10], [2, 12]], stack: 'band', areaStyle: { opacity: 0 }, lineStyle: { opacity: 0 }, symbol: 'none', silent: true },
      { name: 'Expected range', data: [[1, 5], [2, 6]], stack: 'band', areaStyle: { opacity: 0.15 }, lineStyle: { opacity: 0 }, symbol: 'none', silent: true },
      { name: 'Events', data: [[1, 12], [2, 30]] },
    ],
    ...overrides,
  });

  it('draws a band from stacked series without styling other series', () => {
    const series = band().series as any[];
    expect(series[0].stack).to.equal('band');
    expect(series[1].stack).to.equal('band');
    expect(series[1].areaStyle).to.deep.equal({ opacity: 0.15 });
    expect(series[0].symbol).to.equal('none');
    expect(series[0].silent).to.equal(true);
    expect(series[0].tooltip).to.deep.equal({ show: false });
    expect(series[2].stack).to.be.undefined;
    expect(series[2].areaStyle).to.be.undefined;
    expect(series[2].silent).to.be.undefined;
  });

  it('keeps a per-series stack when the chart is stacked', () => {
    const series = band({ stacked: true }).series as any[];
    expect(series[0].stack).to.equal('band');
    expect(series[2].stack).to.equal('total');
  });
});

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

describe('buildPieOption', () => {
  const pieProps: BuilderProps = {
    type: 'pie',
    data: [{ name: 'Insights', data: [8, 1] }],
    categories: ['Configuration suggestion', 'Insecure configuration'],
    stacked: false,
    enableAnimations: false,
    datapointSize: 1,
    theme: 'light',
  };

  it('maps categories and numeric values into pie slices', () => {
    const opt = buildPieOption(pieProps);
    const series = (opt.series as any[])[0];
    expect(series.type).to.equal('pie');
    expect(series.name).to.equal('Insights');
    expect(series.data).to.deep.equal([
      { name: 'Configuration suggestion', value: 8 },
      { name: 'Insecure configuration', value: 1 },
    ]);
    expect(series.radius).to.deep.equal([0, '70%']);
  });

  it('uses inner and outer radii for a donut', () => {
    const opt = buildPieOption({
      ...pieProps,
      type: 'donut',
      innerRadius: '45%',
      outerRadius: '80%',
    });
    expect((opt.series as any[])[0].radius).to.deep.equal(['45%', '80%']);
  });

  it('accepts named ECharts-style slices and maps their colors', () => {
    const opt = buildPieOption({
      ...pieProps,
      data: [{
        name: 'Insights',
        data: [
          { name: 'Moderate', value: 4, color: '#f5a623' },
          { name: 'Low', value: 5 },
        ],
      }],
    });
    expect((opt.series as any[])[0].data).to.deep.equal([
      { name: 'Moderate', value: 4, itemStyle: { color: '#f5a623' } },
      { name: 'Low', value: 5 },
    ]);
  });

  it('uses item tooltips, optional labels, and value suffixes', () => {
    const opt = buildPieOption({ ...pieProps, showLabels: true, yAxisAppend: '%' });
    const formatter = (opt.tooltip as any).valueFormatter as (value: number) => string;
    expect((opt.tooltip as any).trigger).to.equal('item');
    expect((opt.series as any[])[0].label.show).to.equal(true);
    expect(formatter(42)).to.equal('42%');
  });

  it('has no cartesian axes or grid', () => {
    const opt = buildPieOption(pieProps);
    expect(opt.xAxis).to.be.undefined;
    expect(opt.yAxis).to.be.undefined;
    expect(opt.grid).to.be.undefined;
  });
});

describe('additional native chart builders', () => {
  it('builds a scatter chart with numeric axes and coordinate normalization', () => {
    const opt = buildScatterOption({
      ...baseProps,
      type: 'scatter',
      datapointSize: 12,
      data: [{ name: 'Latency', data: [[1, 20], { x: 2, y: 35 }] }],
    });
    expect((opt.series as any[])[0]).to.include({ type: 'scatter', symbolSize: 12 });
    expect((opt.series as any[])[0].data).to.deep.equal([[1, 20], [2, 35]]);
    expect((opt.xAxis as any).type).to.equal('value');
    expect((opt.yAxis as any).type).to.equal('value');
  });

  it('builds radar indicators and values from categories and series', () => {
    const opt = buildRadarOption({
      ...baseProps,
      type: 'radar',
      categories: ['Security', 'Performance', 'Reliability'],
      data: [
        { name: 'Current', data: [80, 65, 90] },
        { name: 'Target', data: [90, 90, 95] },
      ],
    });
    expect((opt.radar as any).indicator).to.deep.equal([
      { name: 'Security' },
      { name: 'Performance' },
      { name: 'Reliability' },
    ]);
    expect((opt.series as any[])[0].data[0]).to.deep.equal({
      name: 'Current',
      value: [80, 65, 90],
    });
  });

  it('uses explicit radar indicators when supplied', () => {
    const indicators = [
      { name: 'Security', max: 100 },
      { name: 'Latency', max: 500, min: 0 },
    ];
    const opt = buildRadarOption({ ...baseProps, type: 'radar', indicators });
    expect((opt.radar as any).indicator).to.deep.equal(indicators);
  });

  it('builds a gauge with bounds, progress, and a value suffix', () => {
    const opt = buildGaugeOption({
      ...baseProps,
      type: 'gauge',
      data: [{ name: 'Health', data: [82] }],
      minValue: 20,
      maxValue: 120,
      yAxisAppend: '%',
    });
    const series = (opt.series as any[])[0];
    expect(series).to.include({ type: 'gauge', min: 20, max: 120 });
    expect(series.data).to.deep.equal([{ name: 'Health', value: 82 }]);
    expect(series.detail.formatter(82)).to.equal('82%');
  });

  it('builds funnel stages from categories and numeric values', () => {
    const opt = buildFunnelOption({
      ...baseProps,
      type: 'funnel',
      categories: ['Visitors', 'Trials', 'Customers'],
      data: [{ name: 'Conversion', data: [1000, 320, 85] }],
    });
    const series = (opt.series as any[])[0];
    expect(series.type).to.equal('funnel');
    expect(series.data).to.deep.equal([
      { name: 'Visitors', value: 1000 },
      { name: 'Trials', value: 320 },
      { name: 'Customers', value: 85 },
    ]);
    expect(series.label.show).to.equal(true);
    expect(series.label.formatter({ name: 'Trials', value: 320 })).to.equal('Trials  320 · 32%');
  });

  it('builds a categorical heatmap and derives its visual range', () => {
    const data = [[0, 0, 5], [1, 0, 12], [0, 1, 3], [1, 1, 9]];
    const opt = buildHeatmapOption({
      ...baseProps,
      type: 'heatmap',
      categories: ['Mon', 'Tue'],
      yCategories: ['API', 'Web'],
      data: [{ name: 'Requests', data }],
    });
    expect((opt.xAxis as any).data).to.deep.equal(['Mon', 'Tue']);
    expect((opt.yAxis as any).data).to.deep.equal(['API', 'Web']);
    expect((opt.visualMap as any)).to.include({ min: 3, max: 12 });
    expect((opt.series as any[])[0].data).to.equal(data);
  });

  it('passes hierarchical data to treemap and sunburst charts', () => {
    const hierarchy = [{
      name: 'Security',
      children: [
        { name: 'Configuration', value: 8 },
        { name: 'Insecure', value: 1 },
      ],
    }];
    const data = [{ name: 'Insights', data: hierarchy }];
    const treemap = buildTreemapOption({ ...baseProps, type: 'treemap', data });
    const sunburst = buildSunburstOption({
      ...baseProps,
      type: 'sunburst',
      data,
      innerRadius: '10%',
      outerRadius: '85%',
    });
    expect((treemap.series as any[])[0].data).to.equal(hierarchy);
    expect((treemap.series as any[])[0].label.show).to.equal(true);
    expect((sunburst.series as any[])[0].data).to.equal(hierarchy);
    expect((sunburst.series as any[])[0].radius).to.deep.equal(['10%', '85%']);
  });
});

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

  it('labels each stage with its share of what entered the flow', () => {
    const series = (buildSankeyOption(sankeyProps).series as any[])[0];
    const format = series.label.formatter;
    expect(format({ name: 'A', value: 15 })).to.equal('A');
    expect(format({ name: 'C', value: 5 })).to.equal('C  {share|33.3%}');
  });

  it('sets stage labels in the theme font and main text colour', () => {
    const series = (buildSankeyOption({ ...sankeyProps, fontFamily: 'Inter', strongTextColor: 'rgb(6, 27, 49)' }).series as any[])[0];
    expect(series.label.fontFamily).to.equal('Inter');
    expect(series.label.color).to.equal('rgb(6, 27, 49)');
  });

  it('resolves theme colour names on nodes and links', () => {
    const named = {
      ...sankeyProps,
      resolveColor: (color: string) => (color === 'success' ? 'rgb(18, 160, 106)' : color),
      data: [{
        name: 'Flow',
        nodes: [{ name: 'A' }, { name: 'B', itemStyle: { color: 'success' } }],
        data: [{ source: 'A', target: 'B', value: 1, lineStyle: { color: 'success' } }],
      }] as any,
    };
    const series = (buildSankeyOption(named).series as any[])[0];
    expect(series.data[1].itemStyle.color).to.equal('rgb(18, 160, 106)');
    expect(series.links[0].lineStyle.color).to.equal('rgb(18, 160, 106)');
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

describe('cartesian legends', () => {
  it('hides the legend for a single series', () => {
    const opt = buildLineOption({ ...baseProps, type: 'line' });
    expect((opt.legend as any).show).to.equal(false);
  });

  it('shows the legend for several series, ignoring hidden ones', () => {
    const two = buildLineOption({ ...baseProps, data: [{ name: 'A', data: [1] }, { name: 'B', data: [2] }] });
    const oneVisible = buildLineOption({ ...baseProps, data: [{ name: 'A', data: [1] }, { name: '_base', data: [2] }] });
    expect((two.legend as any).show).to.equal(true);
    expect((oneVisible.legend as any).show).to.equal(false);
  });

  it('scrolls the legend on one line so it never wraps into the grid', () => {
    const opt = buildLineOption({ ...baseProps, data: [{ name: 'A', data: [1] }, { name: 'B', data: [2] }] });
    expect((opt.legend as any).type).to.equal('scroll');
  });
});

describe('endLabels', () => {
  const lines = (count: number) => Array.from({ length: count }, (_, i) => ({ name: `S${i}`, data: [[1, 10], [2, 12.25]] }));

  it('labels each line with its last value, in text colour', () => {
    const opt = buildLineOption({ ...baseProps, endLabels: true, yAxisAppend: '%', textColor: 'rgb(1, 2, 3)', data: lines(2) });
    const label = (opt.series as any[])[0].endLabel;
    expect(label.show).to.equal(true);
    expect(label.color).to.equal('rgb(1, 2, 3)');
    expect(label.formatter({ value: [2, 12.25] })).to.equal('12.3%');
    expect((opt.grid as any).right).to.equal(64);
  });

  it('leaves the legend to name more than four lines', () => {
    const opt = buildLineOption({ ...baseProps, endLabels: true, data: lines(5) });
    expect((opt.series as any[])[0].endLabel).to.be.undefined;
    expect((opt.grid as any).right).to.equal(20);
  });
});

describe('value suffix', () => {
  it('shows exact values in tooltips, rounding only end labels', () => {
    const opt = buildLineOption({ ...baseProps, yAxisAppend: '%', endLabels: true, data: [{ name: 'A', data: [[1, 0.04]] }, { name: 'B', data: [[1, 2]] }] });
    expect((opt.tooltip as any).valueFormatter(0.04)).to.equal('0.04%');
    expect((opt.series as any[])[0].endLabel.formatter({ value: [1, 0.04] })).to.equal('0.0%');
  });
});

describe('currency', () => {
  const money = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' });

  it('formats tooltips and end labels as money, and axis ticks without cents', () => {
    const opt = buildLineOption({ ...baseProps, currency: 'USD', endLabels: true, data: [{ name: 'A', data: [[1, 1234.5]] }, { name: 'B', data: [[1, 2]] }] });
    expect((opt.tooltip as any).valueFormatter(1234.5)).to.equal(money.format(1234.5));
    expect((opt.series as any[])[0].endLabel.formatter({ value: [1, 1234.5] })).to.equal(money.format(1234.5));
    expect((opt.grid as any).right).to.equal(96);
    expect((opt.yAxis as any).axisLabel.formatter(2000)).to.equal(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(2000));
  });
});

describe('sankey currency', () => {
  it('formats flow values as money in the tooltip', () => {
    const opt = buildSankeyOption({ ...baseProps, type: 'sankey', currency: 'USD', data: [{ name: 'Flow', data: [{ source: 'A', target: 'B', value: 1234.5 }] }] });
    expect((opt.tooltip as any).valueFormatter(1234.5)).to.equal(new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' }).format(1234.5));
  });
});

describe('markLatest', () => {
  it('hides every point but the last, which gets a dot', () => {
    const series = (buildAreaOption({ ...baseProps, type: 'area', markLatest: true }).series as any[])[0];
    expect(series.symbol).to.equal('none');
    expect(series.data.slice(0, 2)).to.deep.equal([10, 20]);
    expect(series.data[2]).to.deep.equal({ value: 30, symbol: 'circle', symbolSize: 8, emphasis: { scale: 1.25 } });
  });

  it('rings the latest dot in the surface colour, so it stays clear where lines cross', () => {
    const series = (buildAreaOption({ ...baseProps, type: 'area', markLatest: true, surfaceColor: 'rgb(255, 255, 255)' }).series as any[])[0];
    expect(series.data[2].itemStyle).to.deep.equal({ borderColor: 'rgb(255, 255, 255)', borderWidth: 2 });
  });

  it('marks the last point with a value, skipping trailing gaps', () => {
    const data = [{ name: 'A', data: [10, 20, null] }];
    const series = (buildAreaOption({ ...baseProps, type: 'area', markLatest: true, data }).series as any[])[0];
    expect(series.data).to.deep.equal([10, { value: 20, symbol: 'circle', symbolSize: 8, emphasis: { scale: 1.25 } }, null]);
  });

  it('leaves a silent reference series unmarked', () => {
    const data = [{ name: 'Pass mark', data: [70, 70], silent: true, symbol: 'none' }];
    const series = (buildAreaOption({ ...baseProps, type: 'area', markLatest: true, data }).series as any[])[0];
    expect(series.data).to.deep.equal([70, 70]);
  });

  it('leaves the points alone by default', () => {
    const series = (buildLineOption({ ...baseProps, type: 'line' }).series as any[])[0];
    expect(series.symbol).to.equal('circle');
    expect(series.data).to.deep.equal([10, 20, 30]);
  });
});
