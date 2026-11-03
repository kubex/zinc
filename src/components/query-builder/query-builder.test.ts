import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnQueryBuilder from './query-builder.component';

const filters = [
  {id: 'email', name: 'Email', operators: ['eq', 'starts']},
  {id: 'vip', name: 'VIP', type: 'bool', operators: ['eq']},
  {id: 'country', name: 'Country', options: {GB: 'United Kingdom', US: 'United States'}, operators: ['eq', 'in']},
];

const submitted = (el: ZnQueryBuilder) => JSON.parse(atob(String(el.value))) as object[];

describe('<zn-query-builder>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-query-builder></zn-query-builder> `);

    expect(el).to.exist;
  });

  it('starts with the given rules and submits them unchanged', async () => {
    const rules = [
      {key: 'email', comparator: 'starts', value: 'kyle'},
      {key: 'vip', comparator: 'eq', value: '1'},
      {key: 'country', comparator: 'in', value: ['GB', 'US']},
    ];
    const el = await fixture<ZnQueryBuilder>(html`
      <zn-query-builder .filters=${filters} .rules=${rules}></zn-query-builder>`);

    expect(submitted(el)).to.deep.equal(rules);
    const rows = el.shadowRoot!.querySelectorAll('.query-builder__row');
    expect(rows.length).to.equal(3);
    expect((rows[0].querySelector('.query-builder__comparator') as HTMLInputElement).value).to.equal('starts');
    expect((rows[0].querySelector('.query-builder__value') as HTMLInputElement).value).to.equal('kyle');
    expect((rows[2].querySelector('.query-builder__value') as HTMLInputElement).value).to.deep.equal(['GB', 'US']);
  });

  it('only offers a filter more than once when repeatable', async () => {
    const rules = [{key: 'email', comparator: 'eq', value: 'a'}];
    const options = (el: ZnQueryBuilder) =>
      [...el.shadowRoot!.querySelectorAll('.add-rule zn-option')].map(o => o.getAttribute('value'));

    const single = await fixture<ZnQueryBuilder>(html`
      <zn-query-builder .filters=${filters} .rules=${rules}></zn-query-builder>`);
    expect(options(single)).to.not.include('email');

    const repeatable = await fixture<ZnQueryBuilder>(html`
      <zn-query-builder repeatable .filters=${filters} .rules=${rules}></zn-query-builder>`);
    expect(options(repeatable)).to.include('email');
  });
});
