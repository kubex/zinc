import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnDataTableFilter from './data-table-filter.component';
import type ZnDropdown from '../dropdown/dropdown.component';

const FILTERS = [
  {id: 'role', name: 'role', operators: ['in'], options: {pm: 'Project Manager', eng: 'Engineer'}},
  {id: 'status', name: 'status', operators: ['eq'], options: {active: 'Active', inactive: 'Inactive'}},
  {id: 'email', name: 'email', operators: ['contains']}
];

const clickOn = (el: Element | null | undefined) =>
  el?.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

const decode = (value: string) => JSON.parse(atob(value)) as { key: string; comparator: string; value: string }[];

async function filterBar(defaultFilters = '') {
  const el = await fixture<ZnDataTableFilter>(html`
    <zn-data-table-filter default-filters="${defaultFilters}" .filters="${FILTERS}"></zn-data-table-filter>`);
  await el.updateComplete;
  return el;
}

const pills = (el: ZnDataTableFilter) =>
  [...el.shadowRoot!.querySelectorAll('.filter-bar__pill')].map(p => p.textContent!.trim());

describe('<zn-data-table-filter>', () => {
  it('should render a component', async () => {
    const el = await fixture(html`
      <zn-data-table-filter></zn-data-table-filter>`);

    expect(el).to.exist;
  });

  it('renders a pill for each default filter', async () => {
    const el = await filterBar('role');

    expect(pills(el)).to.deep.equal(['Role']);
  });

  it('offers the filters that are not already active', async () => {
    const el = await filterBar('role');

    const options = [...el.shadowRoot!.querySelectorAll('.filter-bar__add + zn-menu zn-menu-item, zn-menu zn-menu-item')]
      .map(i => i.getAttribute('value'));

    expect(options).to.include('status');
    expect(options).to.include('email');
  });

  it('encodes a selected value as the query-builder payload', async () => {
    const el = await filterBar('status');

    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="active"]'));
    await el.updateComplete;

    expect(decode(el.value)).to.deep.equal([{key: 'status', comparator: 'eq', value: 'active'}]);
  });

  it('accumulates values for an `in` filter and counts them on the pill', async () => {
    const el = await filterBar('role');

    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="pm"]'));
    await el.updateComplete;
    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="eng"]'));
    await el.updateComplete;

    expect(decode(el.value)[0].value).to.equal('pm eng');
    expect(pills(el)).to.deep.equal(['Role (2)']);
  });

  it('unsets a single-value filter when its selected option is picked again', async () => {
    const el = await filterBar('status');

    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="active"]'));
    await el.updateComplete;
    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="active"]'));
    await el.updateComplete;

    expect(el.value).to.equal('');
  });

  it('leaves valueless filters out of the payload', async () => {
    const el = await filterBar('role,status');

    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="active"]'));
    await el.updateComplete;

    expect(decode(el.value)).to.deep.equal([{key: 'status', comparator: 'eq', value: 'active'}]);
  });

  it('emits zn-filter-change when a value changes', async () => {
    const el = await filterBar('status');
    let emitted = 0;
    el.addEventListener('zn-filter-change', () => emitted++);

    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="active"]'));
    await waitUntil(() => emitted > 0);

    expect(emitted).to.equal(1);
  });

  it('keeps a multi-value filter open on select and closes a single-value one', async () => {
    const el = await filterBar('role,status');
    const dropdowns = [...el.shadowRoot!.querySelectorAll<ZnDropdown>('zn-dropdown')];

    const multi = dropdowns.find(d => d.querySelector('zn-menu-item[value="pm"]'))!;
    const single = dropdowns.find(d => d.querySelector('zn-menu-item[value="active"]'))!;

    expect(multi.stayOpenOnSelect).to.be.true;
    expect(single.stayOpenOnSelect).to.be.false;
  });

  it('renders a text input for a filter with no options', async () => {
    const el = await filterBar('email');

    expect(el.shadowRoot!.querySelector('.filter-bar__input zn-input')).to.exist;
  });

  it('clear() removes every pill and empties the value', async () => {
    const el = await filterBar('role,status');
    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="active"]'));
    await el.updateComplete;

    el.clear();
    await el.updateComplete;

    expect(pills(el)).to.deep.equal([]);
    expect(el.value).to.equal('');
  });
});
