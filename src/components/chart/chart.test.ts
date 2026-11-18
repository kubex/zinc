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

  it('emits zn-chart-click with the clicked point', async () => {
    const el: any = await fixture(html`
      <zn-chart type="bar"
        .data=${[{ name: 'S', data: [1, 2] }]}
        .categories=${['A', 'B']}></zn-chart>
    `);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    let detail: any;
    el.addEventListener('zn-chart-click', (e: CustomEvent) => { detail = e.detail; });
    el.chart.trigger('click', { seriesName: 'S', name: 'B', dataIndex: 1, value: 2 });
    expect(detail).to.deep.equal({ seriesName: 'S', name: 'B', dataIndex: 1, value: 2 });
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
      // Lays out as the lone-series chart it most likely becomes, with no legend above the plot
      expect(el.shadowRoot.querySelector('.loading--plain')).to.exist;
      expect(el.shadowRoot.querySelector('.loading__legend')).to.not.exist;

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

  it('shows its series as chips that hide and show them, keeping one on show', async () => {
    const el: any = await fixture(html`
      <zn-chart type="line"
                legend-chips
                y-axis-append="%"
                .data=${[{ name: 'Auth', data: [[1, 98], [2, 99]] }, { name: 'Capture', data: [[1, 40], [2, 48.25]] }]}></zn-chart>
    `);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    const chips = (): HTMLButtonElement[] => Array.from((el.shadowRoot as ShadowRoot).querySelectorAll<HTMLButtonElement>('.legend-chip'));
    const selected = (): Record<string, boolean> => el.chart.getOption().legend[0].selected as Record<string, boolean>;

    expect(chips().map(c => c.textContent!.replace(/\s+/g, ' ').trim())).to.deep.equal(['Auth 99%', 'Capture 48.3%']);
    expect(el.chart.getOption().legend[0].show).to.equal(false);

    el.data = [{ ...el.data[0], summary: '98.5%', description: 'Share approved' }, el.data[1]];
    await el.updateComplete;
    expect(chips()[0].textContent!.replace(/\s+/g, ' ').trim()).to.equal('Auth 98.5%');
    expect(chips()[0].closest('zn-tooltip')!.getAttribute('content')).to.equal('Share approved');
    expect(chips().every(c => c.querySelector<HTMLElement>('.legend-chip__swatch')!.style.background !== '')).to.equal(true);

    chips()[0].click();
    await el.updateComplete;
    expect(selected()).to.deep.include({ Auth: false, Capture: true });
    expect(chips()[0].getAttribute('aria-pressed')).to.equal('false');

    chips()[1].click();
    await el.updateComplete;
    expect(selected()).to.deep.include({ Capture: true });

    chips()[0].click();
    await el.updateComplete;
    expect(selected()).to.deep.include({ Auth: true, Capture: true });
  });

  it('keeps a chipped series on show beside a reference series', async () => {
    const el: any = await fixture(html`
      <zn-chart type="line"
                legend-chips
                .data=${[{ name: 'Auth', data: [1, 2] }, { name: 'Capture', data: [3, 4] }, { name: '_baseline', data: [2, 2] }]}></zn-chart>
    `);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    const chips = (): HTMLButtonElement[] => Array.from((el.shadowRoot as ShadowRoot).querySelectorAll<HTMLButtonElement>('.legend-chip'));

    chips()[0].click();
    await el.updateComplete;
    chips()[1].click();
    await el.updateComplete;
    expect(el.chart.getOption().legend[0].selected).to.deep.include({ Auth: false, Capture: true });
  });

  it('hides its tooltip when the page scrolls', async () => {
    const el: any = await fixture(html`<zn-chart type="line" .data=${[{ name: 'Auth', data: [1, 2, 3] }]}></zn-chart>`);
    await el.updateComplete;
    el.chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: 1 });
    const actions: string[] = [];
    const dispatch = el.chart.dispatchAction.bind(el.chart);
    el.chart.dispatchAction = (action: { type: string }) => { actions.push(action.type); dispatch(action); };
    window.dispatchEvent(new Event('scroll'));
    expect(actions).to.deep.equal(['hideTip']);
  });

  it('fits the chips inside its height', async () => {
    const el: any = await fixture(html`
      <zn-chart type="line"
                legend-chips
                height="300"
                .data=${[{ name: 'Auth', data: [1, 2] }, { name: 'Capture', data: [3, 4] }]}></zn-chart>
    `);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    expect(Math.round((el as HTMLElement).getBoundingClientRect().height)).to.equal(300);
  });
});
