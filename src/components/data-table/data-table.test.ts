import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
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

  it('renders an error alert from the fetch response alongside the table content', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row 1', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
      error: {text: 'Results limited to 10 rows, please filter for more accuracy', level: 'warning'},
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot?.querySelector('zn-alert'));

      const alert = el.shadowRoot!.querySelector('tbody tr:first-child zn-alert')!;
      expect(alert).to.exist;
      expect(alert.textContent).to.contain('limited to 10 rows');
      expect(alert.getAttribute('level')).to.equal('warning');
      expect(el.shadowRoot!.querySelector('tbody tr.table__row--data')).to.exist;
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('exposes displayTemplates as an object property', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const templates = (el as unknown as {displayTemplates: Record<string, unknown>}).displayTemplates;
    expect(templates).to.be.an('object');
  });
});
