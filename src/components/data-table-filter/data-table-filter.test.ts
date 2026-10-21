import '../../../dist/zn.min.js';
import {expect, fixture, html, waitUntil} from '@open-wc/testing';
import type ZnDataTableFilter from './data-table-filter.component';
import type ZnInput from '../input/input.component';
import type ZnSelect from '../select/select.component';

const FILTERS = [
  {id: 'role', name: 'role', operators: ['in'], options: {pm: 'Project Manager', eng: 'Engineer'}},
  {id: 'status', name: 'Status', operators: ['eq', 'neq'], options: {active: 'Active', inactive: 'Inactive'}},
  {id: 'email', name: 'Email', operators: ['contains']},
  {id: 'created', name: 'Created', type: 'date', operators: ['eq', 'before']},
  {id: 'age', name: 'Age', type: 'number', operators: ['eq', 'gte']},
  {id: 'state', name: 'State', operators: ['eq', 'in'], options: {open: 'Open', closed: 'Closed'}},
];

const MANY = Array.from({length: 10}, (_, i) => ({id: `f${i}`, name: i === 4 ? 'Mac Hotspot Shield' : `Field ${i}`, operators: ['eq']}));

const click = (el: Element | null | undefined) =>
  el?.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));

const choose = (control: Element, value: string | string[]) => {
  (control as HTMLElement & {value: string | string[]}).value = value;
  control.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
};

const decode = (value: string) => JSON.parse(atob(value)) as {key: string; comparator: string; value: string}[];
const encode = (rules: {key: string; comparator: string; value: string}[]) => btoa(JSON.stringify(rules));

async function filter(attrs: {defaultFilters?: string; value?: string; filters?: unknown[]} = {}) {
  const el = await fixture<ZnDataTableFilter>(html`
    <zn-data-table-filter default-filters="${attrs.defaultFilters ?? ''}" .filters="${attrs.filters ?? FILTERS}"
                          .value="${attrs.value ?? ''}"></zn-data-table-filter>`);
  await el.updateComplete;
  return el;
}

const root = (el: ZnDataTableFilter) => el.shadowRoot!;
const rules = (el: ZnDataTableFilter) => [...root(el).querySelectorAll('.filter__rule')];
const control = <T extends Element>(el: ZnDataTableFilter, label: string, index = 0) =>
  rules(el)[index].querySelector<T>(`[aria-label="${label}"]`)!;
const chips = (el: ZnDataTableFilter) =>
  [...root(el).querySelectorAll('.filter__chip__text')].map(chip => chip.textContent!.trim());

async function open(el: ZnDataTableFilter) {
  click(root(el).querySelector('.filter__toggle'));
  await el.updateComplete;
}

async function apply(el: ZnDataTableFilter) {
  click(root(el).querySelector('.filter__pop__foot zn-button[color="primary"]'));
  await el.updateComplete;
}

async function setRule(el: ZnDataTableFilter, key: string, value?: string | string[], index = 0) {
  choose(control(el, 'Filter field', index), key);
  await el.updateComplete;
  if (value === undefined) return;
  await waitUntil(() => control(el, 'Filter value', index));
  choose(control(el, 'Filter value', index), value);
  await el.updateComplete;
}

describe('<zn-data-table-filter>', () => {
  it('opens the filter popover from the funnel with one empty rule', async () => {
    const el = await filter();
    const toggle = root(el).querySelector('.filter__toggle')!;
    expect(root(el).querySelector('.filter__pop')).to.not.exist;
    expect(toggle.getAttribute('aria-expanded')).to.equal('false');
    expect(toggle.classList.contains('filter__toggle--open')).to.be.false;

    await open(el);
    expect(toggle.getAttribute('aria-expanded')).to.equal('true');
    expect(toggle.classList.contains('filter__toggle--open')).to.be.true;

    const pop = root(el).querySelector('.filter__pop')!;
    expect(pop).to.exist;
    const head = () => pop.querySelector('.filter__pop__head')!.textContent!.replace(/\s+/g, ' ').trim();
    expect(head()).to.equal('Filters Choose a value for the empty filter to apply it');
    expect(rules(el).length).to.equal(1);
    expect(control<ZnSelect>(el, 'Filter field').value).to.equal('');

    await setRule(el, 'status', 'active');
    expect(head()).to.equal('Filters Show records that match all of these');
  });

  it('encodes field, operator and value exactly as the table builder did', async () => {
    const el = await filter();
    await open(el);

    await setRule(el, 'status', 'active');
    await apply(el);

    expect(el.value).to.equal('W3sia2V5Ijoic3RhdHVzIiwiY29tcGFyYXRvciI6ImVxIiwidmFsdWUiOiJhY3RpdmUifV0=');
    expect(el.activeCount).to.equal(1);
  });

  it('offers the field\'s operators and resets operator and value when the field changes', async () => {
    const el = await filter();
    await open(el);
    await setRule(el, 'age', '18');
    choose(control(el, 'Filter operator'), 'gte');
    await el.updateComplete;
    await apply(el);
    expect(decode(el.value)).to.deep.equal([{key: 'age', comparator: 'gte', value: '18'}]);

    await open(el);
    const operators = [...control(el, 'Filter operator').querySelectorAll('zn-option')].map(o => o.textContent!.trim());
    expect(operators).to.deep.equal(['is', 'is at least']);

    await setRule(el, 'email');
    expect(control<ZnSelect>(el, 'Filter operator').value).to.equal('contains');
    expect(control<ZnInput>(el, 'Filter value').value).to.equal('');
    await apply(el);
    expect(el.value).to.equal('');
  });

  it('narrows a long field list with its search', async () => {
    const el = await filter({filters: MANY});
    await open(el);
    const select = control<ZnSelect>(el, 'Filter field');
    expect(select.hasAttribute('search')).to.be.true;

    expect(select.placeholder).to.equal('Please select...');
    await select.show();
    await el.updateComplete;
    expect(select.placeholder).to.equal('Search 10 fields...');

    await select.updateComplete;
    const input = select.shadowRoot!.querySelector<HTMLInputElement>('.select__display-input')!;
    input.value = 'HOTSPOT';
    input.dispatchEvent(new Event('input', {bubbles: true, composed: true}));
    await select.updateComplete;

    const visible = [...select.querySelectorAll<HTMLElement>('zn-option')].filter(o => !o.hidden).map(o => o.textContent!.trim());
    expect(visible).to.deep.equal(['Mac Hotspot Shield']);
  });

  it('joins an `in` multi-select\'s values with spaces', async () => {
    const el = await filter();
    await open(el);
    choose(control(el, 'Filter field'), 'role');
    await el.updateComplete;

    expect(control(el, 'Filter value').hasAttribute('multiple')).to.be.true;
    choose(control(el, 'Filter value'), ['pm', 'eng']);
    await el.updateComplete;
    await apply(el);

    expect(decode(el.value)).to.deep.equal([{key: 'role', comparator: 'in', value: 'pm eng'}]);
    expect(chips(el)).to.deep.equal(['Role is any of Project Manager, Engineer']);
  });

  it('keeps the first value when an `in` rule moves to a single-value operator', async () => {
    const el = await filter();
    await open(el);
    await setRule(el, 'state');
    choose(control(el, 'Filter operator'), 'in');
    await el.updateComplete;
    choose(control(el, 'Filter value'), ['open', 'closed']);
    await el.updateComplete;

    choose(control(el, 'Filter operator'), 'eq');
    await el.updateComplete;
    await apply(el);

    expect(decode(el.value)).to.deep.equal([{key: 'state', comparator: 'eq', value: 'open'}]);
  });

  it('renders a number input for a number field', async () => {
    const el = await filter();
    await open(el);
    await setRule(el, 'age');

    expect(control(el, 'Filter value').getAttribute('type')).to.equal('number');
  });

  it('keeps the legacy date encoding and re-encodes on an operator change', async () => {
    const el = await filter();
    await open(el);
    await setRule(el, 'created');
    expect(control(el, 'Filter value').getAttribute('type')).to.equal('date');

    choose(control(el, 'Filter value'), '2026-10-20');
    await el.updateComplete;
    await apply(el);
    const timestamp = new Date(2026, 9, 20).getTime();
    expect(decode(el.value)).to.deep.equal([{key: 'created', comparator: 'eq', value: (timestamp / 1000).toString()}]);
    expect(chips(el)).to.deep.equal(['Created is 2026-10-20']);

    await open(el);
    choose(control(el, 'Filter operator'), 'before');
    await el.updateComplete;
    await apply(el);
    const [rule] = decode(el.value);
    expect(rule.comparator).to.equal('before');
    expect(Number(rule.value)).to.be.closeTo(-Math.floor((Date.now() - timestamp) / 60_000), 1);
  });

  it('shows an empty row for each default filter', async () => {
    const el = await filter({defaultFilters: 'email'});
    await open(el);

    expect(rules(el).length).to.equal(1);
    expect(control<ZnSelect>(el, 'Filter field').value).to.equal('email');
    expect(control<ZnInput>(el, 'Filter value').value).to.equal('');
    expect(el.value).to.equal('');
  });

  it('shows chips for a value it is given', async () => {
    const el = await filter({
      value: encode([
        {key: 'status', comparator: 'eq', value: 'active'},
        {key: 'email', comparator: 'contains', value: 'acme'},
      ]),
    });

    expect(chips(el)).to.deep.equal(['Status is Active', 'Email contains acme']);
    expect(el.activeCount).to.equal(2);
    expect(root(el).querySelector('.filter__toggle')!.getAttribute('notification')).to.equal('2');
  });

  it('keeps a single option value with spaces whole', async () => {
    const el = await filter({
      filters: [{id: 'stage', name: 'Stage', operators: ['eq', 'in'], options: {'in progress': 'In progress', done: 'Done'}}],
      value: encode([{key: 'stage', comparator: 'eq', value: 'in progress'}]),
    });

    expect(chips(el)).to.deep.equal(['Stage is In progress']);
  });

  it('rebuilds its rules when the value is changed from outside', async () => {
    const el = await filter({defaultFilters: 'role'});

    el.value = encode([{key: 'status', comparator: 'eq', value: 'active'}]);
    await el.updateComplete;
    expect(chips(el)).to.deep.equal(['Status is Active']);

    await open(el);
    expect(rules(el).length).to.equal(1);
    expect(control<ZnSelect>(el, 'Filter field').value).to.equal('status');
  });

  it('emits zn-filter-change only when Apply changes the encoded value', async () => {
    const el = await filter();
    let emitted = 0;
    el.addEventListener('zn-filter-change', () => emitted++);
    await open(el);

    await setRule(el, 'status', 'active');
    expect(emitted).to.equal(0);
    expect(el.value).to.equal('');
    expect(chips(el)).to.deep.equal([]);

    await apply(el);
    expect(emitted).to.equal(1);
    expect(root(el).querySelector('.filter__pop')).to.not.exist;

    await open(el);
    await apply(el);
    expect(emitted).to.equal(1);
  });

  it('closes on Escape and discards unapplied rules', async () => {
    const el = await filter();
    await open(el);
    await setRule(el, 'status', 'active');
    click(root(el).querySelector('.filter__pop__foot zn-button[icon="plus@lu"]'));
    await el.updateComplete;
    expect(rules(el).length).to.equal(2);

    document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
    await el.updateComplete;
    expect(root(el).querySelector('.filter__pop')).to.not.exist;
    expect(root(el).querySelector('.filter__toggle')!.classList.contains('filter__toggle--open')).to.be.false;

    expect(el.value).to.equal('');
    await open(el);
    expect(rules(el).length).to.equal(1);
    expect(control<ZnSelect>(el, 'Filter field').value).to.equal('');
  });

  it('closes on a click outside and drops incomplete rules', async () => {
    const el = await filter();
    await open(el);
    await setRule(el, 'email');

    click(document.body);
    await el.updateComplete;
    expect(root(el).querySelector('.filter__pop')).to.not.exist;
    expect(chips(el)).to.deep.equal([]);
  });

  it('drops a rule when its chip\'s remove button is clicked', async () => {
    const el = await filter({value: encode([{key: 'status', comparator: 'eq', value: 'active'}])});

    click(root(el).querySelector('.filter__chip__remove'));
    await el.updateComplete;

    expect(chips(el)).to.deep.equal([]);
    expect(el.value).to.equal('');
  });

  it('clear() removes every rule and empties the value', async () => {
    const el = await filter({value: encode([{key: 'status', comparator: 'eq', value: 'active'}])});

    el.clear();
    await el.updateComplete;

    expect(chips(el)).to.deep.equal([]);
    expect(el.value).to.equal('');
  });

  it('offers suggestions matching a typed value, without regard to case', async () => {
    const el = await filter();
    el.suggestions = {email: ['Ada@example.com', 'grace@example.com']};
    await open(el);
    await setRule(el, 'email');

    const input = control<ZnInput>(el, 'Filter value');
    input.value = 'ADA';
    input.dispatchEvent(new Event('zn-input', {bubbles: true, composed: true}));
    await el.updateComplete;

    const shown = [...root(el).querySelectorAll('.filter__suggestion')];
    expect(shown.map(b => b.textContent!.trim())).to.deep.equal(['Ada@example.com']);

    click(shown[0]);
    await el.updateComplete;
    expect(root(el).querySelector('.filter__suggestion')).to.not.exist;
    await apply(el);
    expect(decode(el.value)).to.deep.equal([{key: 'email', comparator: 'contains', value: 'Ada@example.com'}]);
  });

  it('forgets typed text when the field changes', async () => {
    const el = await filter({filters: [...FILTERS, {id: 'name', name: 'Name', operators: ['contains']}]});
    el.suggestions = {email: ['Ada@example.com'], name: ['Adam']};
    await open(el);
    await setRule(el, 'email');

    const input = control<ZnInput>(el, 'Filter value');
    input.value = 'ADA';
    input.dispatchEvent(new Event('zn-input', {bubbles: true, composed: true}));
    await el.updateComplete;
    expect(root(el).querySelector('.filter__suggestion')).to.exist;

    await setRule(el, 'name');
    expect(root(el).querySelector('.filter__suggestion')).to.not.exist;
  });

  it('hands its chips to a filter whose source it is', async () => {
    const wrap = await fixture<HTMLDivElement>(html`
      <div>
        <zn-data-table-filter .filters="${FILTERS}"
                              .value="${encode([{key: 'status', comparator: 'eq', value: 'active'}])}"></zn-data-table-filter>
        <zn-data-table-filter></zn-data-table-filter>
      </div>`);
    const [source, mirror] = [...wrap.querySelectorAll<ZnDataTableFilter>('zn-data-table-filter')];
    mirror.source = source;
    await mirror.updateComplete;
    await source.updateComplete;

    expect(chips(source)).to.deep.equal([]);
    expect(chips(mirror)).to.deep.equal(['Status is Active']);
    expect(root(mirror).querySelector('.filter__toggle')).to.not.exist;

    click(root(mirror).querySelector('.filter__chip__text'));
    await source.updateComplete;
    expect(root(source).querySelector('.filter__pop')).to.exist;

    click(root(mirror).querySelector('.filter__chip__remove'));
    await source.updateComplete;
    await mirror.updateComplete;
    expect(source.value).to.equal('');
    expect(chips(mirror)).to.deep.equal([]);
  });
});
