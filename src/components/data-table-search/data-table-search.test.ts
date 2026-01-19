import {expect, fixture, html} from '@open-wc/testing';
import type ZnDataTableSearch from './data-table-search.component';

describe('<zn-data-table-search>', () => {
  it('should render a component', async () => {
    const el = await fixture<ZnDataTableSearch>(html`
      <zn-data-table-search></zn-data-table-search>`);

    expect(el).to.exist;
  });
});
