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

  it('defaults visible columns to all header keys in order', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table
        .headers=${[
          {key: 'id', label: 'ID'},
          {key: 'name', label: 'Name'},
          {key: 'email', label: 'Email'},
        ]}></zn-data-table>`);
    expect((el as any)._visibleColumns).to.deep.equal(['id', 'name', 'email']);
  });

  it('renders one header cell per visible column and no expander column', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table
        no-initial-load
        .headers=${[
          {key: 'id', label: 'ID'},
          {key: 'name', label: 'Name'},
        ]}></zn-data-table>`);
    (el as any)._visibleColumns = ['id', 'name'];
    const rendered = (el as any).renderTableData([
      {id: '1', cells: [{column: 'id', text: '1'}, {column: 'name', text: 'A'}]},
    ]);
    expect(rendered).to.exist;
    expect(el.shadowRoot!.querySelector('.table__cell--expander')).to.be.null;
  });

  it('wraps content in a zn-panel by default', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table no-initial-load caption="Users"
        .headers=${[{key: 'id', label: 'ID'}]}></zn-data-table>`);
    expect(el.shadowRoot!.querySelector('zn-panel')).to.exist;
  });

  it('renders without a panel when flush is set', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table no-initial-load flush
        .headers=${[{key: 'id', label: 'ID'}]}></zn-data-table>`);
    expect(el.shadowRoot!.querySelector('zn-panel')).to.be.null;
  });

  it('persists column changes to localStorage and reloads them', async () => {
    const headers = [
      {key: 'id', label: 'ID'},
      {key: 'name', label: 'Name'},
      {key: 'email', label: 'Email'},
    ];
    window.localStorage.removeItem('zn-data-table-columns:test-key');

    const el = await fixture<ZnDataTable>(html`
      <zn-data-table no-initial-load storage-key="test-key" .headers=${headers}></zn-data-table>`);

    el.dispatchEvent(new CustomEvent('zn-columns-change', {
      detail: {columns: ['name', 'id']}, bubbles: true, composed: true,
    }));
    await el.updateComplete;

    expect((el as any)._visibleColumns).to.deep.equal(['name', 'id']);
    expect(JSON.parse(window.localStorage.getItem('zn-data-table-columns:test-key')!))
      .to.deep.equal({visible: ['name', 'id'], known: ['id', 'name', 'email']});

    const el2 = await fixture<ZnDataTable>(html`
      <zn-data-table no-initial-load storage-key="test-key" .headers=${headers}></zn-data-table>`);
    expect((el2 as any)._visibleColumns).to.deep.equal(['name', 'id']);

    window.localStorage.removeItem('zn-data-table-columns:test-key');
  });

  it('is accessible with a panel and column control', async () => {
    const el = await fixture(html`
      <zn-data-table no-initial-load caption="Users"
        .headers=${[{key: 'id', label: 'ID'}, {key: 'name', label: 'Name'}]}></zn-data-table>`);
    await expect(el).to.be.accessible();
  });

  it('appends newly-added columns on reload but keeps user-hidden columns hidden', async () => {
    // Saved when headers were [id, name] with the user having hidden "name" (visible = [id]).
    window.localStorage.setItem('zn-data-table-columns:recon-key',
      JSON.stringify({visible: ['id'], known: ['id', 'name']}));
    // Now headers also include a brand-new "email" column.
    const headers = [
      {key: 'id', label: 'ID'},
      {key: 'name', label: 'Name'},
      {key: 'email', label: 'Email'},
    ];
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table no-initial-load storage-key="recon-key" .headers=${headers}></zn-data-table>`);
    // name stays hidden (known + deselected); email auto-appears (new, never seen).
    expect((el as any)._visibleColumns).to.deep.equal(['id', 'email']);
    window.localStorage.removeItem('zn-data-table-columns:recon-key');
  });

  it('shows the current page size in rows-per-page even when non-standard', async () => {
    const orig = window.fetch;
    window.fetch = async () => new Response(JSON.stringify({
      page: 1, perPage: 25, total: 360,
      rows: Array.from({length: 10}, (_, i) => ({id: String(i), cells: [{column: 'name', text: 'Row ' + i}]}))
    }), {status: 200, headers: {'Content-Type': 'application/json'}});

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/fake" .headers=${[{key: 'name', label: 'Name'}]}></zn-data-table>`);
      await waitUntil(() => el.shadowRoot?.querySelector('zn-select[name="rowPerPage"]'),
        'rows-per-page select should render');
      const select = el.shadowRoot!.querySelector('zn-select[name="rowPerPage"]') as any;
      await select.updateComplete;
      expect(select.displayLabel).to.equal('25');
    } finally {
      window.fetch = orig;
    }
  });
});
