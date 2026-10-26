import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnReportTable from './report-table.component';

interface Call {url: string; init: RequestInit}

const json = (body: unknown) => new Response(JSON.stringify(body), {status: 200, headers: {'Content-Type': 'application/json'}});

function stubFetch(handler: (index: number) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const original = window.fetch;
  window.fetch = ((url: RequestInfo | URL, init?: RequestInit) => {
    calls.push({url: String(url), init: init ?? {}});
    return Promise.resolve(handler(calls.length - 1));
  }) as typeof fetch;
  return {calls, restore: () => (window.fetch = original)};
}

const report = (overrides: Record<string, unknown> = {}) => ({
  dimension: {label: 'Publisher'},
  groups: [
    {
      label: 'Difference', columns: [
        {key: 'rev', label: 'Revenue', format: 'currency', style: 'breakeven', formula: '{d2.rev} - {d1.rev}'},
        {key: 'ratio', label: 'Ratio', format: 'percent', formula: '{d2.acq} / {d2.clicks}'},
      ],
    },
    {label: '2026-10-19', columns: [{key: 'd1Rev', label: 'Revenue', format: 'currency', value: 'd1.rev'}]},
  ],
  rows: [
    {id: 'a', label: 'Alpha', uri: '#a', values: {d1: {rev: 10}, d2: {rev: 15, acq: 1, clicks: 10}}},
    {id: 'b', label: 'Beta', values: {d1: {rev: 20}, d2: {rev: 5, acq: 9, clicks: 30}}},
  ],
  ...overrides,
});

async function load(body: unknown, markup = html`<zn-report-table data-uri="/report" locale="en-US"></zn-report-table>`) {
  const stub = stubFetch(() => json(body));
  try {
    const el = await fixture<ZnReportTable>(markup);
    await waitUntil(() => el.shadowRoot?.querySelector('tbody tr, zn-empty-state'));
    return el;
  } finally {
    stub.restore();
  }
}

const cells = (el: ZnReportTable, selector: string) =>
  [...el.shadowRoot!.querySelectorAll<HTMLElement>(selector)];

describe('<zn-report-table>', () => {
  it('posts the report state', async () => {
    const stub = stubFetch(() => json(report()));
    try {
      await fixture(html`
        <zn-report-table data-uri="/report" type="compare" group-by="affiliateFid" from="2026-10-19" to="2026-10-20">
          <input slot="inputs" name="csrf" value="t">
        </zn-report-table>`);
      await waitUntil(() => stub.calls.length === 1);

      const {url, init} = stub.calls[0];
      expect(url).to.equal('/report');
      expect(init.method).to.equal('POST');
      expect((init.headers as Record<string, string>)['x-kx-fetch-style']).to.equal('zn-report-table');
      expect(JSON.parse(init.body as string)).to.deep.equal({
        type: 'compare', groupBy: 'affiliateFid', from: '2026-10-19', to: '2026-10-20', filter: '', csrf: 't',
      });
    } finally {
      stub.restore();
    }
  });

  it('renders group headings over their columns', async () => {
    const el = await load(report());

    const groups = cells(el, 'thead tr.report__groups th');
    expect(groups.map(th => th.textContent!.trim())).to.deep.equal(['', 'Difference', '2026-10-19']);
    expect(groups[1].getAttribute('colspan')).to.equal('2');
    expect(groups[2].getAttribute('colspan')).to.equal('1');

    const names = cells(el, 'thead tr:not(.report__groups) th');
    expect(names[0].classList.contains('report__dim')).to.be.true;
    expect(names[0].textContent!.trim()).to.equal('Publisher');
    expect(names.map(th => th.classList.contains('report__sep'))).to.deep.equal([false, true, false, true]);
    const body = cells(el, 'tbody tr:first-child td');
    expect(body.map(td => td.classList.contains('report__sep'))).to.deep.equal([false, true, false, true]);
    const foot = cells(el, 'tfoot tr td');
    expect(foot.map(td => td.classList.contains('report__sep'))).to.deep.equal([false, true, false, true]);
  });

  it('hides a duplicate heading', async () => {
    const el = await load(report({
      groups: [{label: 'Leads', columns: [{key: 'leads', label: 'Leads', value: 'd1.rev'}]}],
    }));

    const names = cells(el, 'thead tr:not(.report__groups) th');
    expect(names[1].textContent!.trim()).to.equal('');
  });

  it('links the first column', async () => {
    const el = await load(report());

    const dims = cells(el, 'tbody td.report__dim');
    expect(dims[0].querySelector('a')!.getAttribute('href')).to.equal('#a');
    expect(dims[0].textContent!.trim()).to.equal('Alpha');
    expect(dims[1].querySelector('a')).to.not.exist;
  });

  it('links cells and passes targets as data-target', async () => {
    const el = await load(report({
      rows: [{id: 'a', label: 'Alpha', uri: '/a', target: 'slide', values: {d1: {rev: 10}}, links: {d1Rev: {uri: '/a/rev', target: 'slide'}}}],
    }));

    const dim = cells(el, 'tbody td.report__dim a')[0];
    expect(dim.hasAttribute('target')).to.be.false;
    expect(dim.getAttribute('data-target')).to.equal('slide');
    const link = cells(el, 'tbody td a[href="/a/rev"]')[0];
    expect(link.getAttribute('data-target')).to.equal('slide');
    expect(link.textContent).to.equal('$10.00');
    expect(cells(el, 'tbody td a')).to.have.length(2);
  });

  it('only shows tick boxes when selectable', async () => {
    const el = await load(report());

    expect(cells(el, 'zn-checkbox')).to.have.length(0);
    expect(cells(el, 'tbody tr[aria-selected]')).to.have.length(0);
  });

  it('hides columns that are empty in every row, and their groups', async () => {
    const el = await load(report({
      groups: [
        {label: 'Shown', columns: [{key: 'a', label: 'A', value: 'a'}, {key: 'zero', label: 'Zero', value: 'z'}]},
        {label: 'Empty', columns: [{key: 'b', label: 'B', value: 'b'}]},
      ],
      rows: [{id: 'r', label: 'Row', values: {a: 1, z: 0, b: 0}}],
    }), html`<zn-report-table data-uri="/report" locale="en-US" hide-empty-columns></zn-report-table>`);

    expect(cells(el, 'thead tr:not(.report__groups) th').map(th => th.textContent!.trim())).to.deep.equal(['Publisher', 'A']);
    expect(cells(el, '.report__glabel').map(label => label.textContent!.trim())).to.deep.equal(['Shown']);
  });

  it('shades heatmap cells against their column maximum', async () => {
    const el = await load(report({
      groups: [{label: 'Counts', columns: [{key: 'n', label: 'N', value: 'n'}]}],
      rows: [
        {id: 'a', label: 'A', values: {n: 4}},
        {id: 'b', label: 'B', values: {n: 2}},
        {id: 'c', label: 'C', values: {n: 0}},
      ],
    }), html`<zn-report-table data-uri="/report" locale="en-US" heatmap></zn-report-table>`);

    const heat = cells(el, 'tbody td.report__num').map(td => td.style.getPropertyValue('--_heat'));
    expect(heat).to.deep.equal(['1.000', '0.500', '']);
  });

  it('computes totals from formulas', async () => {
    const el = await load(report());

    const total = cells(el, 'tfoot tr.report__total td').map(td => td.textContent!.trim());
    expect(total).to.deep.equal(['Total', '($10.00)', '25.00%', '$30.00']);
  });

  it('uses server totals', async () => {
    const el = await load(report({totals: {rev: 99}}));

    const total = cells(el, 'tfoot tr.report__total td').map(td => td.textContent!.trim());
    expect(total).to.deep.equal(['Total', '$99.00', '–', '–']);
  });

  it('colours breakeven columns only', async () => {
    const el = await load(report());

    const tones = cells(el, 'tbody tr').map(tr => [...tr.querySelectorAll('td')].slice(1).map(td =>
      td.classList.contains('report__pos') ? 'pos' : td.classList.contains('report__neg') ? 'neg' : ''));
    expect(tones).to.deep.equal([['pos', '', ''], ['neg', '', '']]);
  });

  it('shows the response error', async () => {
    const el = await load(report({error: {text: 'Results limited', level: 'warning'}}));

    const alert = el.shadowRoot!.querySelector('zn-panel zn-alert')!;
    expect(alert).to.exist;
    expect(alert.textContent).to.contain('Results limited');
    expect(alert.getAttribute('level')).to.equal('warning');
  });

  it('shows an empty state inside the panel', async () => {
    const el = await load(report({rows: []}), html`<zn-report-table data-uri="/report" caption="Day Compare"></zn-report-table>`);

    expect(el.shadowRoot!.querySelector('zn-panel zn-empty-state')).to.exist;
    expect(el.shadowRoot!.querySelector('zn-panel')!.getAttribute('caption')).to.equal('Day Compare');
  });

  it('tolerates nil and empty-array payloads', async () => {
    const empty = await load({groups: null, rows: null});
    expect(empty.shadowRoot!.querySelector('zn-panel zn-empty-state')).to.exist;

    const el = await load(report({
      totals: [],
      rows: [{id: 'a', label: 'Alpha', values: []}, {id: 'b', label: 'Beta', values: {d1: {rev: 4}, d2: {rev: 6}}}],
    }));
    const total = cells(el, 'tfoot tr.report__total td').map(td => td.textContent!.trim());
    expect(total).to.deep.equal(['Total', '$2.00', '0.00%', '$4.00']);
  });

  it('ignores a superseded response', async () => {
    let releaseFirst!: (response: Response) => void;
    const stub = stubFetch(index => index === 0
      ? new Promise<Response>(resolve => (releaseFirst = resolve))
      : json(report({rows: [{id: 's', label: 'Second', values: {}}]})));
    try {
      const el = await fixture<ZnReportTable>(html`<zn-report-table data-uri="/report" group-by="a"></zn-report-table>`);
      await waitUntil(() => stub.calls.length === 1);

      el.groupBy = 'b';
      await waitUntil(() => el.shadowRoot!.querySelector('tbody td.report__dim'));
      releaseFirst(json(report({rows: [{id: 'f', label: 'First', values: {}}]})));
      await new Promise(resolve => setTimeout(resolve, 50));
      await el.updateComplete;

      expect(cells(el, 'tbody td.report__dim').map(td => td.textContent!.trim())).to.deep.equal(['Second']);
      expect((JSON.parse(stub.calls[1].init.body as string) as {groupBy: string}).groupBy).to.equal('b');
      expect(stub.calls[0].init.signal!.aborted).to.be.true;
    } finally {
      stub.restore();
    }
  });

  describe('header controls', () => {
    const click = (target: Element) => target.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    const bodyOf = (call: Call) => JSON.parse(call.init.body as string) as Record<string, string>;
    const labels = (el: ZnReportTable) => cells(el, 'tbody td.report__dim').map(td => td.textContent!.trim());

    async function mount(markup: ReturnType<typeof html>, body: (index: number) => unknown = () => report()) {
      const stub = stubFetch(index => json(body(index)));
      const el = await fixture<ZnReportTable>(markup);
      await waitUntil(() => el.shadowRoot?.querySelector('tbody tr, zn-empty-state'));
      return {el, stub};
    }

    const sixRows = report({
      totals: {rev: 99},
      rows: ['Alpha', 'Alpine', 'Beta', 'Gamma', 'Delta', 'Epsilon'].map((label, i) => ({
        id: label, label, values: {d1: {rev: 0}, d2: {rev: i + 1, acq: 1, clicks: 10}},
      })),
    });

    it('highlights ticked rows, ticks all shown, and clears on group by change', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" group-by="a" selectable
                         group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`);
      try {
        const root = el.shadowRoot!;
        const selected = () => cells(el, 'tbody tr').map(row => row.getAttribute('aria-selected'));

        root.querySelector('tbody zn-checkbox')!.shadowRoot!.querySelector<HTMLInputElement>('input')!.click();
        await el.updateComplete;
        expect(selected()).to.deep.equal(['true', 'false']);

        const all = root.querySelector<HTMLElement & {indeterminate: boolean}>('thead zn-checkbox')!;
        expect(all.indeterminate).to.be.true;
        all.shadowRoot!.querySelector<HTMLInputElement>('input')!.click();
        await el.updateComplete;
        expect(selected()).to.deep.equal(['true', 'true']);
        expect(root.querySelector('thead tr:not(.report__groups) th.report__dim')!.getAttribute('aria-sort')).to.equal('none');

        click(root.querySelector('.report__groupby')!);
        await el.updateComplete;
        click(cells(el, '.report__gpop .report__gopt')[1]);
        await el.updateComplete;
        expect(selected()).to.deep.equal(['false', 'false']);
      } finally {
        stub.restore();
      }
    });

    it('search narrows rows and switches to computed totals', async () => {
      const {el, stub} = await mount(html`<zn-report-table data-uri="/report" locale="en-US" caption="Day Compare"></zn-report-table>`, () => sixRows);
      try {
        const panel = el.shadowRoot!.querySelector('zn-panel')!;
        expect(panel.getAttribute('description')).to.equal('6 rows');
        expect(cells(el, 'tfoot td')[1].textContent!.trim()).to.equal('$99.00');

        const search = el.shadowRoot!.querySelector('zn-data-table-search.report__search')!;
        expect(search.getAttribute('placeholder')).to.equal('Search publisher...');
        const leaked: Event[] = [];
        el.addEventListener('zn-search-change', e => leaked.push(e));
        await (search as HTMLElement & {updateComplete: Promise<unknown>}).updateComplete;
        const input = search.shadowRoot!.querySelector<HTMLElement & {value: string}>('zn-input')!;
        input.value = 'alp';
        input.dispatchEvent(new CustomEvent('zn-input', {bubbles: true, composed: true}));
        await waitUntil(() => labels(el).length === 2);

        expect(labels(el)).to.deep.equal(['Alpha', 'Alpine']);
        expect(leaked).to.have.length(0);
        expect(panel.getAttribute('description')).to.equal('2 of 6 rows');
        expect(cells(el, 'tfoot td')[1].textContent!.trim()).to.equal('$3.00');
        expect(stub.calls.length).to.equal(1);
      } finally {
        stub.restore();
      }
    });

    it('sorts columns descending first, then ascending, then server order', async () => {
      const rows = [
        {id: 'a', label: 'Sub ID 10', values: {d1: {rev: 0}, d2: {rev: 5}}},
        {id: 'b', label: 'Sub ID 9', values: {d1: {rev: 0}, d2: {rev: 20}}},
        {id: 'c', label: 'Sub ID 100', values: {d1: {rev: 0}, d2: {rev: '12.5'}}},
      ];
      const {el, stub} = await mount(html`<zn-report-table data-uri="/report" locale="en-US"></zn-report-table>`, () => report({rows}));
      try {
        const head = (index: number) => cells(el, 'thead tr:not(.report__groups) th')[index];
        const press = async (index: number) => {
          click(head(index));
          await el.updateComplete;
        };

        expect(head(1).getAttribute('aria-sort')).to.equal('none');
        await press(1);
        expect(head(1).getAttribute('aria-sort')).to.equal('descending');
        expect(labels(el)).to.deep.equal(['Sub ID 9', 'Sub ID 100', 'Sub ID 10']);
        await press(1);
        expect(head(1).getAttribute('aria-sort')).to.equal('ascending');
        expect(labels(el)).to.deep.equal(['Sub ID 10', 'Sub ID 100', 'Sub ID 9']);
        await press(1);
        expect(head(1).getAttribute('aria-sort')).to.equal('none');
        expect(labels(el)).to.deep.equal(['Sub ID 10', 'Sub ID 9', 'Sub ID 100']);

        await press(0);
        expect(labels(el)).to.deep.equal(['Sub ID 100', 'Sub ID 10', 'Sub ID 9']);
        head(0).dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
        await el.updateComplete;
        expect(head(0).getAttribute('aria-sort')).to.equal('ascending');
        expect(labels(el)).to.deep.equal(['Sub ID 9', 'Sub ID 10', 'Sub ID 100']);
        expect(cells(el, 'tfoot td')[0].textContent!.trim()).to.equal('Total');
        expect(stub.calls.length).to.equal(1);
      } finally {
        stub.restore();
      }
    });

    it('type tabs only appear with two or more types and refetch on select', async () => {
      const single = await mount(html`<zn-report-table data-uri="/report" types='[{"value":"compare","label":"Day Compare"}]'></zn-report-table>`);
      try {
        expect(single.el.shadowRoot!.querySelector('.table__tabs')).to.not.exist;
        expect(bodyOf(single.stub.calls[0]).type).to.equal('compare');
      } finally {
        single.stub.restore();
      }

      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report"
                         types='[{"value":"compare","label":"Day Compare"},{"value":"summary","label":"Summary"}]'></zn-report-table>`);
      try {
        const tabs = cells(el, '.table__tab');
        expect(tabs.map(tab => tab.textContent!.trim())).to.deep.equal(['Day Compare', 'Summary']);
        const changes: Event[] = [];
        el.addEventListener('zn-report-change', e => changes.push(e));
        click(tabs[0]);
        await el.updateComplete;
        expect(changes).to.have.length(0);

        click(tabs[1]);
        await waitUntil(() => stub.calls.length === 2);
        expect(bodyOf(stub.calls[1]).type).to.equal('summary');
        expect(el.getAttribute('type')).to.equal('summary');
      } finally {
        stub.restore();
      }
    });

    it('group by menu lists options under category headings and refetches', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" group-by="affiliateFid"
                         group-bys='[{"value":"affiliateFid","label":"Publisher","category":"Publisher"},{"value":"campaignFid","label":"Campaign","category":"Campaign"},{"value":"country","label":"Country","category":"Geo"}]'></zn-report-table>`);
      try {
        const root = el.shadowRoot!;
        const trigger = root.querySelector('.report__groupby')!;
        expect(trigger.textContent!.replace(/\s+/g, ' ').trim()).to.equal('Group by: Publisher');

        click(trigger);
        await el.updateComplete;
        expect(cells(el, '.report__gpop .report__gcat__head').map(h => h.textContent!.trim())).to.deep.equal(['Publisher', 'Campaign', 'Geo']);
        const options = cells(el, '.report__gpop .report__gopt');
        expect(options.map(o => o.textContent!.trim())).to.deep.equal(['Publisher', 'Campaign', 'Country']);
        expect(options[0].getAttribute('aria-current')).to.equal('true');

        click(options[2]);
        await waitUntil(() => stub.calls.length === 2);
        expect(bodyOf(stub.calls[1]).groupBy).to.equal('country');
        expect(el.getAttribute('group-by')).to.equal('country');
        await el.updateComplete;
        expect(root.querySelector('.report__gpop')).to.not.exist;
      } finally {
        stub.restore();
      }
    });

    it('moves focus into the group by menu and back to its trigger', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" group-by="b" group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`);
      try {
        const root = el.shadowRoot!;
        const trigger = root.querySelector('.report__groupby')!;
        click(trigger);
        await waitUntil(() => root.activeElement?.classList.contains('report__gopt'));
        expect(root.activeElement!.textContent!.trim()).to.equal('B');

        document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
        await el.updateComplete;
        expect(root.querySelector('.report__gpop')).to.not.exist;
        expect(root.activeElement).to.equal(trigger);

        click(trigger);
        await waitUntil(() => root.activeElement?.classList.contains('report__gopt'));
        click(cells(el, '.report__gopt')[0]);
        await el.updateComplete;
        expect(root.activeElement).to.equal(trigger);
      } finally {
        stub.restore();
      }
    });

    it('lists group bys without categories as one list', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`);
      try {
        click(el.shadowRoot!.querySelector('.report__groupby')!);
        await el.updateComplete;
        expect(cells(el, '.report__gpop .report__gcat__head')).to.have.length(0);
        expect(cells(el, '.report__gpop .report__gopt')).to.have.length(2);
      } finally {
        stub.restore();
      }
    });

    it('date range apply refetches with new from/to', async () => {
      const {el, stub} = await mount(html`<zn-report-table data-uri="/report" from="2026-10-19" to="2026-10-20" max-date="2026-10-20"></zn-report-table>`);
      try {
        const range = el.shadowRoot!.querySelector<HTMLElement & {from: string; to: string}>('zn-date-range')!;
        expect(range.getAttribute('max')).to.equal('2026-10-20');
        range.from = '2026-10-01';
        range.to = '2026-10-07';
        range.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true, detail: {from: '2026-10-01', to: '2026-10-07'}}));
        await waitUntil(() => stub.calls.length === 2);
        expect(bodyOf(stub.calls[1])).to.include({from: '2026-10-01', to: '2026-10-07'});
        expect(el.getAttribute('from')).to.equal('2026-10-01');
      } finally {
        stub.restore();
      }
    });

    it('date range shows all eight quick ranges on screen, and its note', async () => {
      const {el, stub} = await mount(html`<zn-report-table data-uri="/report" from="2026-09-20" to="2026-10-20"
        date-note="Day Compare sets the first day against the last."></zn-report-table>`);
      try {
        el.style.cssText = `display: block; margin-top: ${window.innerHeight - 160}px`;
        const range = el.shadowRoot!.querySelector<HTMLElement & {updateComplete: Promise<boolean>}>('zn-date-range')!;
        await range.updateComplete;
        click(range.shadowRoot!.querySelector('.date-range__trigger')!);
        await range.updateComplete;
        await range.updateComplete;

        const presets = [...range.shadowRoot!.querySelectorAll<HTMLElement>('.date-range__preset')];
        expect(presets.map(p => p.textContent!.trim())).to.deep.equal([
          'Today', 'Yesterday', 'Last 7 days', 'Last 14 days', 'Last 30 days', 'This month', 'Last month', 'Last 90 days'
        ]);
        presets.forEach(p => expect(p.getBoundingClientRect().bottom).to.be.at.most(window.innerHeight));
        expect(range.shadowRoot!.querySelector('.date-range__note')!.textContent).to.equal('Day Compare sets the first day against the last.');
      } finally {
        stub.restore();
      }
    });

    it('funnel sends base64 filter rules', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" filter-fields='[{"id":"status","name":"Status","options":{"active":"Active"}}]'></zn-report-table>`);
      try {
        type FilterEl = HTMLElement & {updateComplete: Promise<unknown>};
        const funnel = el.shadowRoot!.querySelector<FilterEl>('.report__actions zn-data-table-filter')!;
        const root = funnel.shadowRoot!;
        const choose = (select: Element, value: string) => {
          (select as HTMLElement & {value: string}).value = value;
          select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
        };
        click(root.querySelector('.filter__toggle')!);
        await funnel.updateComplete;
        choose(root.querySelector('.filter__rule zn-select[aria-label="Filter field"]')!, 'status');
        await funnel.updateComplete;
        await waitUntil(() => root.querySelector('.filter__rule zn-select[aria-label="Filter value"]'));
        choose(root.querySelector('.filter__rule zn-select[aria-label="Filter value"]')!, 'active');
        await funnel.updateComplete;
        click(root.querySelector('.filter__pop__foot zn-button[color="primary"]')!);

        const expected = btoa(JSON.stringify([{key: 'status', comparator: 'eq', value: 'active'}]));
        await waitUntil(() => stub.calls.length === 2);
        expect(bodyOf(stub.calls[1]).filter).to.equal(expected);
        expect(el.filter).to.equal(expected);
        await el.updateComplete;
        const chips = el.shadowRoot!.querySelector<FilterEl>('.table__chips')!;
        await chips.updateComplete;
        expect(chips.shadowRoot!.querySelector('.filter__chip__text')!.textContent!.trim()).to.equal('Status is Active');
      } finally {
        stub.restore();
      }
    });

    it('emits zn-report-change before fetching', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" type="compare" group-by="a" from="2026-10-19" to="2026-10-20"
                         group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`);
      try {
        const seen: {detail: unknown; calls: number}[] = [];
        el.addEventListener('zn-report-change', e => seen.push({detail: e.detail, calls: stub.calls.length}));
        click(el.shadowRoot!.querySelector('.report__groupby')!);
        await el.updateComplete;
        click(cells(el, '.report__gopt')[1]);
        await waitUntil(() => stub.calls.length === 2);

        expect(seen).to.deep.equal([{detail: {type: 'compare', groupBy: 'b', from: '2026-10-19', to: '2026-10-20', filter: ''}, calls: 1}]);
      } finally {
        stub.restore();
      }
    });

    it('response overrides group-bys, filter fields and adopts its groupBy', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" group-by="affiliateFid" group-bys='[{"value":"affiliateFid","label":"Publisher"}]'></zn-report-table>`,
        () => report({
          groupBy: 'country',
          groupBys: [{value: 'country', label: 'Country'}, {value: 'city', label: 'City'}],
          filterFields: [{id: 'device', name: 'Device'}],
        }));
      try {
        await el.updateComplete;
        expect(el.groupBy).to.equal('country');
        const root = el.shadowRoot!;
        expect(root.querySelector('.report__groupby')!.textContent!.replace(/\s+/g, ' ').trim()).to.equal('Group by: Country');
        expect(root.querySelector('.report__actions zn-data-table-filter')).to.exist;
        click(root.querySelector('.report__groupby')!);
        await el.updateComplete;
        expect(cells(el, '.report__gopt').map(o => o.textContent!.trim())).to.deep.equal(['Country', 'City']);
        await new Promise(resolve => setTimeout(resolve, 50));
        expect(stub.calls.length).to.equal(1);
      } finally {
        stub.restore();
      }
    });

    it('fetches an adopted group by again once another has been fetched', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" group-by="a"
                         group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`,
        index => report(index === 0 ? {groupBy: 'b'} : {}));
      try {
        await el.updateComplete;
        expect(el.groupBy).to.equal('b');

        el.groupBy = 'a';
        await waitUntil(() => stub.calls.length === 2);
        el.groupBy = 'b';
        await waitUntil(() => stub.calls.length === 3);
        expect(bodyOf(stub.calls[2]).groupBy).to.equal('b');
      } finally {
        stub.restore();
      }
    });

    it('keeps group labels beside the frozen column', async () => {
      const {el, stub} = await mount(html`<zn-report-table data-uri="/report"></zn-report-table>`);
      try {
        const label = el.shadowRoot!.querySelector<HTMLElement>('.report__groups th.report__sep .report__glabel')!;
        expect(getComputedStyle(label).position).to.equal('sticky');
        const dim = el.shadowRoot!.querySelector<HTMLElement>('.report__groups th.report__dim')!;
        await waitUntil(() => el.style.getPropertyValue('--_dim-width') === `${dim.offsetWidth}px`);
      } finally {
        stub.restore();
      }
    });

    it('sharable reads state from and writes it to the URL', async () => {
      const original = window.location.href;
      window.history.replaceState(window.history.state, '', `${window.location.pathname}?type=summary&groupBy=country&from=2026-10-01&to=2026-10-07`);
      let stub: ReturnType<typeof stubFetch> | undefined;
      try {
        const mounted = await mount(html`
          <zn-report-table data-uri="/report" sharable
                           types='[{"value":"compare","label":"Day Compare"},{"value":"summary","label":"Summary"}]'
                           group-bys='[{"value":"affiliateFid","label":"Publisher"},{"value":"country","label":"Country"},{"value":"city","label":"City"}]'></zn-report-table>`);
        stub = mounted.stub;
        const el = mounted.el;
        expect(bodyOf(stub.calls[0])).to.include({type: 'summary', groupBy: 'country', from: '2026-10-01', to: '2026-10-07'});

        click(el.shadowRoot!.querySelector('.report__groupby')!);
        await el.updateComplete;
        click(cells(el, '.report__gopt')[2]);
        await el.updateComplete;

        const params = new URLSearchParams(window.location.search);
        expect(params.get('groupBy')).to.equal('city');
        expect(params.get('type')).to.equal('summary');
        expect(params.get('from')).to.equal('2026-10-01');
      } finally {
        stub?.restore();
        window.history.replaceState(window.history.state, '', original);
      }
    });

    it('opening one popover closes the others', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" filter-fields='[{"id":"status","name":"Status"}]'
                         group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`);
      try {
        type Child = HTMLElement & {updateComplete: Promise<unknown>};
        const root = el.shadowRoot!;
        const funnel = root.querySelector<Child>('.report__actions zn-data-table-filter')!;
        const range = root.querySelector<Child>('zn-date-range')!;

        click(range.shadowRoot!.querySelector('.date-range__trigger')!);
        await range.updateComplete;
        expect(range.shadowRoot!.querySelector('.date-range__pop')).to.exist;

        click(funnel.shadowRoot!.querySelector('.filter__toggle')!);
        await funnel.updateComplete;
        await range.updateComplete;
        expect(funnel.shadowRoot!.querySelector('.filter__pop')).to.exist;
        expect(range.shadowRoot!.querySelector('.date-range__pop')).to.not.exist;

        click(root.querySelector('.report__groupby')!);
        await el.updateComplete;
        await funnel.updateComplete;
        expect(root.querySelector('.report__gpop')).to.exist;
        expect(funnel.shadowRoot!.querySelector('.filter__pop')).to.not.exist;
      } finally {
        stub.restore();
      }
    });

    it('popover triggers expose their state on the inner button', async () => {
      const {el, stub} = await mount(html`
        <zn-report-table data-uri="/report" filter-fields='[{"id":"status","name":"Status"}]'
                         group-bys='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-report-table>`);
      try {
        type Child = HTMLElement & {updateComplete: Promise<unknown>};
        const root = el.shadowRoot!;
        const funnel = root.querySelector<Child>('.report__actions zn-data-table-filter')!;
        const range = root.querySelector<Child>('zn-date-range')!;
        const triggers = [
          root.querySelector<Child>('.report__groupby')!,
          funnel.shadowRoot!.querySelector<Child>('.filter__toggle')!,
          range.shadowRoot!.querySelector<Child>('.date-range__trigger')!,
        ];
        await Promise.all(triggers.map(trigger => trigger.updateComplete));
        for (const trigger of triggers) {
          const inner = trigger.shadowRoot!.querySelector('button')!;
          expect(inner.getAttribute('aria-haspopup')).to.equal('dialog');
          expect(inner.getAttribute('aria-expanded')).to.equal('false');
        }

        click(triggers[0]);
        await el.updateComplete;
        await triggers[0].updateComplete;
        expect(triggers[0].shadowRoot!.querySelector('button')!.getAttribute('aria-expanded')).to.equal('true');
      } finally {
        stub.restore();
      }
    });
  });

  it('renders the other columns when one formula is invalid', async () => {
    const el = await load(report({
      groups: [{label: 'G', columns: [
        {key: 'bad', label: 'Bad', format: 'number', formula: '{d1.rev} +'},
        {key: 'rev', label: 'Revenue', format: 'currency', value: 'd1.rev'},
      ]}],
    }));

    const first = cells(el, 'tbody tr:first-child td');
    expect(first.map(td => td.textContent!.trim())).to.deep.equal(['Alpha', '0', '$10.00']);
  });
});
