import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnDataTableSearch from './data-table-search.component';
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
});
