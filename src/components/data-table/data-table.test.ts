import '../../../dist/zn.min.js';
import { expect, fixture, html } from '@open-wc/testing';
import type ZnDataTable from './data-table.component';

describe('<zn-data-table>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-data-table></zn-data-table> `);

    expect(el).to.exist;
  });

  it('does not throw when updating selection without a select-all button', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);

    expect(() => (el as unknown as { updateKeys: () => void }).updateKeys()).not.to.throw();
  });
});
