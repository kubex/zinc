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

  it('accepts a single Row object on the data property', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    (el as unknown as {data: unknown}).data = {
      id: '1',
      cells: [{text: 'Solo', column: 'name'}],
    };
    expect(() => (el as unknown as {requestUpdate: () => void}).requestUpdate()).not.to.throw();
  });

  it('exposes displayTemplates as an object property', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const templates = (el as unknown as {displayTemplates: Record<string, unknown>}).displayTemplates;
    expect(templates).to.be.an('object');
  });
});
