/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any */
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

  it('renders pie and donut charts', async () => {
    for (const type of ['pie', 'donut']) {
      const el: any = await fixture(html`
        <zn-chart
          type=${type}
          .data=${[{ name: 'Insights', data: [8, 1] }]}
          .categories=${['Configuration suggestion', 'Insecure configuration']}
        ></zn-chart>
      `);
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 50));
      const canvas = el.shadowRoot.querySelector('canvas');
      expect(canvas, `${type} chart canvas`).to.exist;
    }
  });

  it('renders the additional native chart types', async () => {
    const cases = [
      { type: 'scatter', data: [{ name: 'Points', data: [[1, 2], [2, 4]] }] },
      {
        type: 'radar',
        data: [{ name: 'Current', data: [80, 65, 90] }],
        categories: ['Security', 'Performance', 'Reliability'],
      },
      { type: 'gauge', data: [{ name: 'Health', data: [82] }] },
      {
        type: 'funnel',
        data: [{ name: 'Conversion', data: [1000, 320, 85] }],
        categories: ['Visitors', 'Trials', 'Customers'],
      },
      {
        type: 'heatmap',
        data: [{ name: 'Requests', data: [[0, 0, 5], [1, 0, 12]] }],
        categories: ['Mon', 'Tue'],
        yCategories: ['API'],
      },
      {
        type: 'treemap',
        data: [{ name: 'Insights', data: [{ name: 'Configuration', value: 8 }] }],
      },
      {
        type: 'sunburst',
        data: [{
          name: 'Insights',
          data: [{ name: 'Security', children: [{ name: 'Configuration', value: 8 }] }],
        }],
      },
    ];

    for (const chartCase of cases) {
      const el: any = await fixture(html`
        <zn-chart
          type=${chartCase.type}
          .data=${chartCase.data}
          .categories=${chartCase.categories ?? []}
          .yCategories=${chartCase.yCategories ?? []}
        ></zn-chart>
      `);
      await el.updateComplete;
      await new Promise((r) => setTimeout(r, 50));
      const canvas = el.shadowRoot.querySelector('canvas');
      expect(canvas, `${chartCase.type} chart canvas`).to.exist;
    }
  });

  it('joins a sync-group when the attribute is set', async () => {
    const a: any = await fixture(html`
      <zn-chart sync-group="g1" type="bar"
        .data=${[{ name: 'S', data: [1, 2] }]}
        .categories=${['A', 'B']}></zn-chart>
    `);
    await a.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    expect(a.chart?.group).to.equal('g1');
  });
});
