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
