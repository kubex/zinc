import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnDataTableSearch from './data-table-search.component';
import type ZnInput from '../input/input.component';
import type ZnSelect from '../select/select.component';

describe('<zn-data-table-search>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search></zn-data-table-search>`);

    expect(el).to.exist;
  });

  // getFormData must read each slotted field's live `.value` property, not a stale `value` attribute.
  // On a zn-select the `value` attribute even binds to a separate default-value property, so reading
  // the attribute would return the wrong (initial) value.
  it('reads a slotted field\'s live value property rather than its stale value attribute', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search>
        <zn-select name="status" value="open">
          <zn-option value="open">Open</zn-option>
          <zn-option value="closed">Closed</zn-option>
        </zn-select>
      </zn-data-table-search>`);

    const select = el.querySelector<ZnSelect>('zn-select')!;
    await select.updateComplete;

    // Diverge the live property from the attribute the element was rendered with.
    select.value = 'closed';
    expect(select.getAttribute('value')).to.equal('open');

    expect(el.getFormData().status).to.equal('closed');
  });

  it('puts the search icon in the prefix slot, before the input', async () => {
    const el = await fixture<ZnDataTableSearch>(html`<zn-data-table-search></zn-data-table-search>`);
    const input = el.shadowRoot!.querySelector<HTMLElement>('zn-input')!;
    const icon = input.querySelector<HTMLElement>('zn-icon[slot="prefix"]')!;
    expect(icon).to.exist;
    expect(input.querySelector('zn-icon[slot="suffix"]')).to.not.exist;
    await (input as unknown as ZnInput).updateComplete;
    const control = input.shadowRoot!.querySelector('input')!;
    expect(icon.getBoundingClientRect().right).to.be.lessThanOrEqual(control.getBoundingClientRect().left + 1);
  });

  it('can shrink below 200px in a narrow container', async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div style="display: flex; width: 120px"><zn-data-table-search></zn-data-table-search></div>`);
    const el = wrap.querySelector<ZnDataTableSearch>('zn-data-table-search')!;
    await el.updateComplete;
    expect(getComputedStyle(el).minWidth).to.not.equal('200px');
    expect(el.getBoundingClientRect().width).to.be.at.most(120);
  });

  it('turns off the browser autofill history on the native input', async () => {
    const el = await fixture<ZnDataTableSearch>(html`<zn-data-table-search></zn-data-table-search>`);
    const input = el.shadowRoot!.querySelector('zn-input') as unknown as ZnInput;
    await input.updateComplete;

    expect(input.shadowRoot!.querySelector('input')!.getAttribute('autocomplete')).to.equal('off');
  });
});
