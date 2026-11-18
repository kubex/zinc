import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnChartSwitcher from './chart-switcher.component';

const shown = (el: ZnChartSwitcher) => Array.from(el.children).filter(chart => !(chart as HTMLElement).inert).map(chart => chart.id);

// The navbar draws its own copies of the pills and forwards clicks to the originals
const pill = (el: ZnChartSwitcher, nav: string, label: string) => {
  const navbar = el.shadowRoot!.querySelector(`zn-navbar[aria-label="${nav}"]`)!;
  return Array.from(navbar.shadowRoot!.querySelectorAll<HTMLElement>('ul.navbar > li')).find(li => li.textContent!.trim() === label);
};

const breakdown = (el: ZnChartSwitcher, label: string) =>
  Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>('zn-dropdown zn-menu-item')).find(item => item.textContent!.trim() === label);

const switcher = (storeKey = '') => fixture<ZnChartSwitcher>(html`
  <zn-chart-switcher caption="Trends" store-key=${storeKey}>
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
});
