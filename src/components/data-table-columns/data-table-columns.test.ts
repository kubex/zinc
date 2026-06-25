import '../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type {ZnColumnsChangeEvent} from '../../events/zn-columns-change';
import type ZnDataTableColumns from './data-table-columns.component';

const cols = [
  {key: 'id', label: 'ID'},
  {key: 'name', label: 'Name'},
  {key: 'email', label: 'Email'},
];

describe('<zn-data-table-columns>', () => {
  it('renders a trigger button', async () => {
    const el = await fixture<ZnDataTableColumns>(html`
      <zn-data-table-columns .columns=${cols} .value=${['id', 'name', 'email']}></zn-data-table-columns>`);
    expect(el.shadowRoot!.querySelector('zn-button')).to.exist;
  });

  it('emits zn-columns-change without a key when toggled off', async () => {
    const el = await fixture<ZnDataTableColumns>(html`
      <zn-data-table-columns .columns=${cols} .value=${['id', 'name', 'email']}></zn-data-table-columns>`);
    setTimeout(() => el.toggleColumn('email', false));
    const ev = await oneEvent(el, 'zn-columns-change') as ZnColumnsChangeEvent;
    expect(ev.detail.columns).to.deep.equal(['id', 'name']);
  });

  it('does not allow removing the last visible column', async () => {
    const el = await fixture<ZnDataTableColumns>(html`
      <zn-data-table-columns .columns=${cols} .value=${['id']}></zn-data-table-columns>`);
    let fired = false;
    el.addEventListener('zn-columns-change', () => (fired = true));
    el.toggleColumn('id', false);
    await el.updateComplete;
    expect(fired).to.be.false;
    expect(el.value).to.deep.equal(['id']);
  });

  it('renders one reorderable row per column, each with a drag handle', async () => {
    const el = await fixture<ZnDataTableColumns>(html`
      <zn-data-table-columns .columns=${cols} .value=${['id', 'name', 'email']}></zn-data-table-columns>`);
    await el.updateComplete;
    const rows = [...el.shadowRoot!.querySelectorAll('.columns__row')];
    expect(rows.length).to.equal(cols.length);
    rows.forEach((row) => {
      expect(row.querySelector('.columns__handle[draggable="true"]')).to.exist;
    });
  });

  it('toggling a checkbox updates value and the checkbox stays toggled (no reshuffle)', async () => {
    const el = await fixture<ZnDataTableColumns>(html`
      <zn-data-table-columns .columns=${cols} .value=${['id', 'name', 'email']}></zn-data-table-columns>`);
    await el.updateComplete;

    // Checkboxes render one per column in declared order; uncheck "name" (index 1).
    const before = el.shadowRoot!.querySelectorAll('zn-checkbox');
    expect(before.length).to.equal(cols.length);
    const nameCb = before[1] as HTMLInputElement & { checked: boolean };
    nameCb.checked = false;
    nameCb.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
    await el.updateComplete;

    expect(el.value).to.deep.equal(['id', 'email']);
    // The same checkbox (kept stable by repeat key) must reflect the unchecked state.
    const after = el.shadowRoot!.querySelectorAll('zn-checkbox');
    expect((after[1] as HTMLInputElement & { checked: boolean }).checked).to.be.false;
    expect((after[0] as HTMLInputElement & { checked: boolean }).checked).to.be.true;
  });

  it('is accessible', async () => {
    const el = await fixture(html`
      <zn-data-table-columns .columns=${cols} .value=${['id', 'name']}></zn-data-table-columns>`);
    await expect(el).to.be.accessible();
  });
});
