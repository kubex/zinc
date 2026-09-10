import '../../../dist/zn.min.js';
import {expect, fixture, html, oneEvent} from '@open-wc/testing';
import type ZnDataTableSearch from './data-table-search.component';
import type ZnSelect from '../select/select.component';

describe('<zn-data-table-search>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search></zn-data-table-search>`);

    expect(el).to.exist;
  });

  it('renders fields-slotted content to the left of the search input', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search>
        <select slot="fields" name="status">
          <option value="open" selected>Open</option>
          <option value="closed">Closed</option>
        </select>
      </zn-data-table-search>`);

    const field = el.querySelector('select')!;
    expect(field.assignedSlot?.name).to.equal('fields');

    // The fields slot is rendered before the search input in the shadow DOM.
    const wrapper = el.shadowRoot!.querySelector('.data-table-search')!;
    const children = Array.from(wrapper.children);
    const fieldsSlot = el.shadowRoot!.querySelector('slot[name="fields"]')!;
    const input = el.shadowRoot!.querySelector('zn-input')!;
    expect(children.indexOf(fieldsSlot)).to.be.lessThan(children.indexOf(input));

    // ...and lays out to the left of the search input.
    expect(field.getBoundingClientRect().left).to.be.at.most(input.getBoundingClientRect().left);
  });

  it('debounces a search when a slotted field emits zn-change', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search debounce-delay="10">
        <select slot="fields" name="status">
          <option value="open" selected>Open</option>
          <option value="closed">Closed</option>
        </select>
      </zn-data-table-search>`);

    const field = el.querySelector('select')!;
    const searchPromise = oneEvent(el, 'zn-search-change');
    field.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
    const event = await searchPromise as CustomEvent<{formData: Record<string, string>}>;

    expect(event.detail.formData.status).to.equal('open');
  });

  it('debounces a search when a slotted field emits a native change', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search debounce-delay="10">
        <select slot="fields" name="status">
          <option value="open">Open</option>
          <option value="closed" selected>Closed</option>
        </select>
      </zn-data-table-search>`);

    const field = el.querySelector('select')!;
    const searchPromise = oneEvent(el, 'zn-search-change');
    field.dispatchEvent(new Event('change', {bubbles: true}));
    const event = await searchPromise as CustomEvent<{formData: Record<string, string>}>;

    expect(event.detail.formData.status).to.equal('closed');
  });

  it('collects form data from both the fields slot and the default slot', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search>
        <select slot="fields" name="status">
          <option value="open" selected>Open</option>
          <option value="closed">Closed</option>
        </select>
        <div slot="fields">
          <input name="priority" value="high"/>
        </div>
        <input name="extra" value="hello"/>
      </zn-data-table-search>`);

    const data = el.getFormData();
    expect(data.status).to.equal('open');
    expect(data.priority).to.equal('high');
    expect(data.extra).to.equal('hello');
  });

  // getFormData must read each field's live `.value` property, not a stale `value` attribute. On a
  // zn-select the `value` attribute even binds to a separate default-value property, so reading the
  // attribute would return the wrong (initial) value.
  it('reads a slotted field\'s live value property rather than its stale value attribute', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search>
        <zn-select slot="fields" name="status" value="open">
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
