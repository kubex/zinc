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

  it('uses the theme palette when no colors are given', async () => {
    const el: any = await fixture(html`
      <zn-chart style="--zn-chart-color-1: #010203; --zn-chart-color-2: #040506"
                categories='["a"]' data='[{"name":"s","data":[1]}]'></zn-chart>`);

    expect(el.getPalette()).to.deep.equal(['#010203', '#040506']);
  });

  it('prefers explicit colors over the theme palette', async () => {
    const el: any = await fixture(html`<zn-chart style="--zn-chart-color-1: #010203"></zn-chart>`);
    el.colors = ['#ffffff'];

    expect(el.buildOption().color).to.deep.equal(['#ffffff']);
  });

  it('fetches data-url once without live, taking categories and data from the response', async () => {
    const original = window.fetch;
    const calls: RequestInit[] = [];
    window.fetch = ((_url: string, init: RequestInit) => {
      calls.push(init);
      return Promise.resolve(new Response(JSON.stringify({categories: ['a', 'b'], data: [{name: 'Sent', data: [1, 2]}]})));
    }) as any;

    try {
      const el: any = await fixture(html`<zn-chart type="line" data-url="/metrics/chart"></zn-chart>`);
      await el.initPromise;
      await new Promise(r => setTimeout(r, 50));
      await el.updateComplete;

      expect(calls.length).to.equal(1);
      expect((calls[0].headers as Record<string, string>)['x-kx-fetch-style']).to.equal('raw-json');
      expect(el.categories).to.deep.equal(['a', 'b']);
      expect(el.chart.getOption().series[0].data).to.deep.equal([1, 2]);
      expect(el.chart.getOption().yAxis[0].max).to.not.equal(6);

      await new Promise(r => setTimeout(r, 1200));
      expect(calls.length).to.equal(1);
    } finally {
      window.fetch = original;
    }
  });

  it('shows a placeholder until data-url loads', async () => {
    const original = window.fetch;
    let resolve!: (r: Response) => void;
    window.fetch = (() => new Promise<Response>(r => { resolve = r; })) as any;

    try {
      const el: any = await fixture(html`<zn-chart type="line" data-url="/metrics/chart"></zn-chart>`);
      await el.initPromise;
      expect(el.shadowRoot.querySelector('.loading')).to.exist;
      expect(el.shadowRoot.querySelector('.chart--loading')).to.exist;

      resolve(new Response(JSON.stringify([{name: 'Sent', data: [1, 2]}])));
      await new Promise(r => setTimeout(r, 50));
      await el.updateComplete;
      expect(el.shadowRoot.querySelector('.chart--loading')).to.not.exist;
      expect(el.chart.getOption().series[0].data).to.deep.equal([1, 2]);

      await new Promise(r => setTimeout(r, 450));
      await el.updateComplete;
      expect(el.shadowRoot.querySelector('.loading')).to.not.exist;
    } finally {
      window.fetch = original;
    }
  });
});
