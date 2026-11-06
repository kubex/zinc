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

  it('reserves the menu column on rows without actions when another row has them', async () => {
    const data = {header: ['Name'], items: [
      {caption: 'Me', data: []},
      {caption: 'Them', actions: [{title: 'Edit', path: '/edit'}], data: []},
    ]};
    const el = await fixture<HTMLElement>(html`<zn-table data="${JSON.stringify(data)}"></zn-table>`);
    await (el as unknown as {updateComplete: Promise<unknown>}).updateComplete;

    const cells = el.shadowRoot!.querySelectorAll<HTMLElement>('td.capcol .actions');
    expect(cells[0].classList.contains('actions--placeholder')).to.be.true;
    expect(cells[0].getBoundingClientRect().width).to.equal(cells[1].getBoundingClientRect().width);
  });
});
