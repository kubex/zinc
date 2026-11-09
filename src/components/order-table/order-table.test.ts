import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';

describe('<zn-order-table>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-order-table></zn-order-table> `);

    expect(el).to.exist;
  });

  it('should show the subtotal and shipping ahead of the tax, discount and total', async () => {
    const el = await fixture(html`
      <zn-order-table .data=${{
        headers: ['Item', 'Amount'],
        items: [{caption: 'Widget', data: ['£10.00']}],
        subtotal: '£10.00',
        shipping: '£2.00',
        tax: '£2.40',
        discount: '-£1.00',
        total: '£13.40'
      }}></zn-order-table>
    `);

    const titles = [...el.shadowRoot!.querySelectorAll('.summary-item-title')].map(t => t.textContent?.trim());
    expect(titles).to.deep.equal(['Subtotal', 'Shipping', 'Tax', 'Discount', 'Grand Total']);
  });

  it('should leave out a subtotal or shipping it is not given', async () => {
    const el = await fixture(html`
      <zn-order-table .data=${{headers: ['Item'], items: [], tax: '£2.40', total: '£12.40'}}></zn-order-table>
    `);

    const titles = [...el.shadowRoot!.querySelectorAll('.summary-item-title')].map(t => t.textContent?.trim());
    expect(titles).to.deep.equal(['Tax', 'Grand Total']);
  });
});
