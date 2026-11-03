import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-table>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-table></zn-table> `);

    expect(el).to.exist;
  });

  it('opens a row with a uri from anywhere in the row through its caption link', async () => {
    const data = {header: ['Type', 'Connector'], items: [{uri: '/tx/1', target: 'slide', caption: 'AUTH', data: ['sandbanx']}]};
    const el = await fixture<HTMLElement>(html`<zn-table data="${JSON.stringify(data)}"></zn-table>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('td.capcol a')!;
    let clicks = 0;
    link.addEventListener('click', e => { e.preventDefault(); clicks++; });

    const row = el.shadowRoot!.querySelector<HTMLElement>('tr.table-row--link')!;
    row.querySelectorAll('td')[1].click();
    expect(clicks).to.equal(1);

    link.click();
    expect(clicks).to.equal(2);
  });
});
