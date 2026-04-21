import { expect } from '@open-wc/testing';
import { buildAreaOption, buildBarOption, buildLineOption, type BuilderProps } from './builders';

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