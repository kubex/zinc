import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnDataTableFilter from './data-table-filter.component';
import type ZnDatepicker from '../datepicker/datepicker.component';
import type ZnDropdown from '../dropdown/dropdown.component';
import type ZnInput from '../input/input.component';

const FILTERS = [
  {id: 'role', name: 'role', operators: ['in'], options: {pm: 'Project Manager', eng: 'Engineer'}},
  {id: 'status', name: 'status', operators: ['eq'], options: {active: 'Active', inactive: 'Inactive'}},
  {id: 'email', name: 'email', operators: ['contains']},
  {id: 'created', name: 'created', type: 'date', operators: ['eq'], dateSubmitFormat: 'timestamp'},
  {id: 'age', name: 'age', type: 'number', operators: ['eq', 'gte']}
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

  it('counts a typed value as one, however many spaces it contains', async () => {
    const el = await filterBar('email');

    const input = el.shadowRoot!.querySelector<ZnInput>('zn-input')!;
    input.value = 'thats really bad';
    input.dispatchEvent(new Event('zn-input', {bubbles: true, composed: true}));
    await waitUntil(() => el.value.length > 0);
    await el.updateComplete;

    expect(pills(el)).to.deep.equal(['Email: thats really bad']);
  });

  it('matches suggestions without regard to case', async () => {
    const el = await filterBar('email');
    el.suggestions = {email: ['Ada@example.com', 'grace@example.com']};

    const input = el.shadowRoot!.querySelector<ZnInput>('zn-input')!;
    input.value = 'ADA';
    input.dispatchEvent(new Event('zn-input', {bubbles: true, composed: true}));
    await waitUntil(() => el.shadowRoot!.querySelectorAll('.filter-bar__suggestion').length > 0);

    const shown = [...el.shadowRoot!.querySelectorAll('.filter-bar__suggestion')].map(b => b.textContent!.trim());

    expect(shown).to.deep.equal(['Ada@example.com']);
  });

  it('renders a text input for a filter with no options', async () => {
    const el = await filterBar('email');

    expect(el.shadowRoot!.querySelector('.filter-bar__editor zn-input')).to.exist;
  });

  it('renders an inline calendar for a date filter', async () => {
    const el = await filterBar('created');

    const picker = el.shadowRoot!.querySelector('.filter-bar__editor zn-datepicker');

    expect(picker).to.exist;
    expect(picker!.hasAttribute('inline')).to.be.true;
  });

  it('encodes a picked date and labels the pill with it', async () => {
    const el = await filterBar('created');
    const picker = el.shadowRoot!.querySelector<ZnDatepicker>('zn-datepicker')!;
    await picker.updateComplete;

    picker.shadowRoot!.querySelector<HTMLElement>('.air-datepicker-cell.-day-:not(.-other-month-)')!.click();
    // AirDatepicker reports a selection on the next task, not synchronously
    await waitUntil(() => el.value.length > 0);
    await el.updateComplete;

    const [filter] = decode(el.value);

    expect(filter.key).to.equal('created');
    expect(filter.comparator).to.equal('eq');
    expect(Number(filter.value)).to.be.greaterThan(0);
    expect(pills(el)[0]).to.equal(`Created: ${picker.value as string}`);
  });

  it('offers each operator when a filter defines more than one', async () => {
    const el = await filterBar('age');

    const operators = [...el.shadowRoot!.querySelectorAll('.filter-bar__operator')].map(o => o.textContent!.trim());

    expect(operators).to.deep.equal(['is', '\u2265']);
  });

  it('re-encodes the value with the operator the user picks', async () => {
    const el = await filterBar('age');

    const input = el.shadowRoot!.querySelector<ZnInput>('zn-input')!;
    input.value = '18';
    input.dispatchEvent(new Event('zn-input', {bubbles: true, composed: true}));
    await waitUntil(() => el.value.length > 0);

    clickOn(el.shadowRoot!.querySelectorAll('.filter-bar__operator')[1]);
    await el.updateComplete;

    expect(decode(el.value)).to.deep.equal([{key: 'age', comparator: 'gte', value: '18'}]);
    expect(pills(el)).to.deep.equal(['Age \u2265 18']);
  });

  it('lists operators above the options for a filter that has both', async () => {
    const el = await fixture<ZnDataTableFilter>(html`
      <zn-data-table-filter default-filters="state"
                            .filters="${[{
                              id: 'state',
                              name: 'state',
                              operators: ['eq', 'in'],
                              options: {open: 'Open', closed: 'Closed'}
                            }]}"></zn-data-table-filter>`);
    await el.updateComplete;

    const items = [...el.shadowRoot!.querySelectorAll('zn-menu-item')].map(i => i.textContent!.trim());

    expect(items).to.deep.equal(['is', 'is any of', 'Open', 'Closed', 'Remove']);
  });

  it('opens the new pill so its value can be set without a second click', async () => {
    const el = await filterBar();

    clickOn(el.shadowRoot!.querySelector('zn-menu-item[value="status"]'));
    await el.updateComplete;

    const pill = [...el.shadowRoot!.querySelectorAll<ZnDropdown>('zn-dropdown')]
      .find(dropdown => dropdown.dataset.key === 'status')!;

    await waitUntil(() => pill.open, 'the new filter\'s panel never opened');
    expect(pill.open).to.be.true;
  });

  it('keeps the panel open for an operator but closes it for a value', async () => {
    const el = await fixture<ZnDataTableFilter>(html`
      <zn-data-table-filter default-filters="state"
                            .filters="${[{
                              id: 'state',
                              name: 'state',
                              operators: ['eq', 'in'],
                              options: {open: 'Open', closed: 'Closed'}
                            }]}"></zn-data-table-filter>`);
    await el.updateComplete;

    const pill = el.shadowRoot!.querySelector<ZnDropdown>('zn-dropdown')!;
    await pill.show();

    const [operator] = [...pill.querySelectorAll('zn-menu-item')];
    clickOn(operator);
    await el.updateComplete;
    expect(pill.open, 'picking an operator should leave the panel open').to.be.true;

    clickOn(pill.querySelector('zn-menu-item[value="open"]'));
    await waitUntil(() => !pill.open, 'picking a value should close the panel');
    expect(pill.open).to.be.false;
  });

  describe('long option lists', () => {
    const many = Object.fromEntries(
      ['How To', 'Linux', 'Beta', 'Router', 'TV', 'Other', 'Mac Hotspot Shield', 'General', 'iOS', 'Tutorials']
        .map((label, index) => [`c${index}`, label])
    );

    async function categoryBar() {
      const el = await fixture<ZnDataTableFilter>(html`
        <zn-data-table-filter default-filters="category"
                              .filters="${[{
                                id: 'category',
                                name: 'category',
                                operators: ['eq'],
                                options: many
                              }]}"></zn-data-table-filter>`);
      await el.updateComplete;
      return el;
    }

    const search = async (el: ZnDataTableFilter, term: string) => {
      const input = el.shadowRoot!.querySelector<ZnInput>('.filter-bar__option-search')!;
      input.value = term;
      input.dispatchEvent(new Event('zn-input', {bubbles: true, composed: true}));
      await el.updateComplete;
    };

    const labels = (el: ZnDataTableFilter) =>
      [...el.shadowRoot!.querySelectorAll('zn-menu-item')].map(item => item.textContent!.trim());

    it('offers a search above the options', async () => {
      const el = await categoryBar();

      expect(el.shadowRoot!.querySelector('.filter-bar__option-search')).to.exist;
    });

    it('leaves the search off a short list', async () => {
      const el = await filterBar('status');

      expect(el.shadowRoot!.querySelector('.filter-bar__option-search')).to.not.exist;
    });

    it('narrows the options without regard to case', async () => {
      const el = await categoryBar();

      await search(el, 'HOTSPOT');

      expect(labels(el)).to.deep.equal(['Mac Hotspot Shield', 'Remove']);
    });

    it('says so when nothing matches', async () => {
      const el = await categoryBar();

      await search(el, 'nothing here');

      expect(labels(el)).to.deep.equal(['No matches', 'Remove']);
    });
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
