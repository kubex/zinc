import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnChartSwitcher from './chart-switcher.component';

const shown = (el: ZnChartSwitcher) => Array.from(el.children).filter(chart => !(chart as HTMLElement).inert).map(chart => chart.id);

// A real click lands on the button inside zn-button
const showAsTable = (el: ZnChartSwitcher) =>
  el.shadowRoot!.querySelector('zn-button[label="Show as table"]')!.shadowRoot!.querySelector('button')!.click();

// The navbar draws its own copies of the pills and forwards clicks to the originals
const pill = (el: ZnChartSwitcher, nav: string, label: string) => {
  const navbar = el.shadowRoot!.querySelector(`zn-navbar[aria-label="${nav}"]`)!;
  return Array.from(navbar.shadowRoot!.querySelectorAll<HTMLElement>('ul.navbar > li')).find(li => li.textContent!.trim() === label);
};

const breakdown = (el: ZnChartSwitcher, label: string) =>
  Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('zn-dropdown zn-menu-item')).find(item => item.textContent!.trim() === label);

const switcher = (storeKey = '') => fixture<ZnChartSwitcher>(html`
  <zn-chart-switcher caption="Trends" style="width: 800px" store-key=${storeKey}>
    <div id="revenue-project" metric="Revenue" by="Project"></div>
    <div id="revenue-connector" metric="Revenue" by="Connector"></div>
    <div id="volume-project" metric="Volume" by="Project"></div>
    <div id="volume-connector" metric="Volume" by="Connector"></div>
    <div id="errors" metric="Errors"></div>
  </zn-chart-switcher>
`);

describe('<zn-chart-switcher>', () => {
  afterEach(() => sessionStorage.clear());

  it('shows only the first metric and breakdown to begin with', async () => {
    const el = await switcher();

    expect(shown(el)).to.deep.equal(['revenue-project']);
    expect(el.shadowRoot!.querySelector('zn-dropdown')).to.exist;
  });

  it('keeps the chosen breakdown when switching to a metric that offers it', async () => {
    const el = await switcher();
    breakdown(el, 'Connector')!.click();
    await el.updateComplete;

    await waitUntil(() => pill(el, 'Metric', 'Volume'));
    pill(el, 'Metric', 'Volume')!.click();
    await el.updateComplete;

    expect(shown(el)).to.deep.equal(['volume-connector']);
    expect(breakdown(el, 'Connector')!.hasAttribute('checked'), 'the menu marks the breakdown on show').to.be.true;
    expect(breakdown(el, 'Project')!.hasAttribute('checked')).to.be.false;
  });

  it('shows a metric without breakdowns', async () => {
    const el = await switcher();
    await waitUntil(() => pill(el, 'Metric', 'Errors'));
    pill(el, 'Metric', 'Errors')!.click();
    await el.updateComplete;

    expect(shown(el)).to.deep.equal(['errors']);
    expect(el.shadowRoot!.querySelector('zn-dropdown'), 'no breakdowns, no select').to.not.exist;
  });

  it('restores the stored choice when rendered again', async () => {
    const first = await switcher('trends');
    await waitUntil(() => pill(first, 'Metric', 'Errors'));
    pill(first, 'Metric', 'Errors')!.click();
    await first.updateComplete;

    const again = await switcher('trends');

    expect(shown(again)).to.deep.equal(['errors']);
  });

  it('shows the chart on show as a table of its values, newest first', async () => {
    const el = await fixture<ZnChartSwitcher>(html`
      <zn-chart-switcher caption="Trends">
        <div metric="Rates" y-axis-append="%"></div>
      </zn-chart-switcher>
    `);
    Object.assign(el.children[0], {data: [
      {name: 'Auth', data: [[1000, 90], [2000, 92.25]]},
      {name: 'Capture', data: [[2000, 48]]},
    ]});

    showAsTable(el);
    await el.updateComplete;

    const rows = Array.from(el.shadowRoot!.querySelectorAll('tr')).map(tr =>
      Array.from(tr.children).slice(1).map(cell => cell.textContent!.trim()));
    expect(rows).to.deep.equal([['Auth', 'Capture'], ['92.3%', '48%'], ['90.0%', '']]);
    expect((el.children[0] as HTMLElement).inert).to.equal(true);
  });

  it('lists a flow chart\'s links as a table, in its currency', async () => {
    const el = await fixture<ZnChartSwitcher>(html`
      <zn-chart-switcher caption="Trends"><div metric="Funnel" currency="USD"></div></zn-chart-switcher>
    `);
    Object.assign(el.children[0], {data: [{name: 'Flow', data: [{source: 'Authorized', target: 'Captured', value: 1234.5}]}]});

    showAsTable(el);
    await el.updateComplete;

    const cells = Array.from(el.shadowRoot!.querySelectorAll('tbody td')).map(td => td.textContent!.trim());
    expect(cells).to.deep.equal(['Authorized', 'Captured', new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol'}).format(1234.5)]);
  });

  it('fills the table when its chart loads, in units set as properties', async () => {
    const el = await fixture<ZnChartSwitcher>(html`
      <zn-chart-switcher caption="Trends"><div metric="Volume"></div></zn-chart-switcher>
    `);
    const chart = el.children[0];
    Object.assign(chart, {currency: 'USD', categories: ['Mon']});
    showAsTable(el);
    await el.updateComplete;

    Object.assign(chart, {data: [{name: 'Charges', data: [1234.5]}]});
    chart.dispatchEvent(new CustomEvent('zn-load', {bubbles: true, composed: true}));
    await el.updateComplete;

    const cells = Array.from(el.shadowRoot!.querySelectorAll('tbody td')).map(td => td.textContent!.trim());
    expect(cells).to.deep.equal([new Intl.NumberFormat(undefined, {style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol'}).format(1234.5)]);
  });

  it('labels a category chart\'s table rows by its categories, in order', async () => {
    const el = await fixture<ZnChartSwitcher>(html`
      <zn-chart-switcher caption="Trends"><div metric="Volume"></div></zn-chart-switcher>
    `);
    Object.assign(el.children[0], {categories: ['Mon', 'Tue'], data: [{name: 'Charges', data: [4, 7]}]});

    showAsTable(el);
    await el.updateComplete;

    const rows = Array.from(el.shadowRoot!.querySelectorAll('tbody tr')).map(tr =>
      Array.from(tr.children).map(cell => cell.textContent!.trim()));
    expect(rows).to.deep.equal([['Mon', '4'], ['Tue', '7']]);
  });

  it('folds the controls into a menu while they don\'t fit', async () => {
    const el = await switcher();
    el.style.width = '240px';
    await waitUntil(() => el.shadowRoot!.querySelector('.choices-menu'));

    const radio = el.shadowRoot!.querySelector('zn-radio-group[name="by"] zn-radio[value="Connector"]')!;
    radio.shadowRoot!.querySelector<HTMLElement>('input')!.click();
    await el.updateComplete;
    expect(shown(el)).to.deep.equal(['revenue-connector']);

    el.style.width = '800px';
    await waitUntil(() => !el.shadowRoot!.querySelector('.choices-menu'), 'the controls return once they fit');
  });
});
