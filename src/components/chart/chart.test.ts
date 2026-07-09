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

  it('does not crash when a sankey chart starts in a zero-width container', async () => {
    const wrapper: any = await fixture(html`
      <div style="width: 0">
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
      </div>
    `);
    const el: any = wrapper.querySelector('zn-chart');
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));

    // Reaching this point means initialising the sankey chart in a zero-width
    // container did not throw — previously ECharts' sankey layout crashed with
    // "Cannot read properties of null". The render is deferred until the
    // container gains a size.
    wrapper.style.width = '600px';
    await new Promise((r) => setTimeout(r, 150));

    const series = (el.chart?.getOption()?.series ?? []) as unknown[];
    expect(series.length).to.be.greaterThan(0);
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