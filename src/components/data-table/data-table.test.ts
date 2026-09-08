import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { render } from 'lit';
import type ZnDataTable from './data-table.component';

describe('<zn-data-table>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-data-table></zn-data-table> `);

    expect(el).to.exist;
  });

  // filter-top renders above the panel, so it must not bring an otherwise empty header row with it
  it('renders no header when only filter-top is slotted', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table standalone no-initial-load>
        <div slot="filter-top">Filters</div>
        <div slot="empty-state">Nothing yet</div>
      </zn-data-table>`);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('.table__header__right')).to.not.exist;
    expect(el.shadowRoot!.querySelector('zn-header')).to.not.exist;
  });

  it('leaves a bare empty state unwrapped by the standalone panel', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table standalone no-initial-load>
        <div slot="empty-state">Nothing yet</div>
      </zn-data-table>`);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('zn-panel')).to.not.exist;
    expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.exist;
  });

  it('keeps the standalone panel for an empty state that has a caption', async () => {
    const el = await fixture<ZnDataTable>(html`
      <zn-data-table standalone no-initial-load caption="Customers">
        <div slot="empty-state">Nothing yet</div>
      </zn-data-table>`);
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector('zn-panel')).to.exist;
  });

  // Raising the page size past the total used to drop the whole footer, leaving no way back
  it('keeps the rows-per-page selector when the page size covers every row', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: Array.from({length: 24}, (_, i) => ({id: String(i), cells: [{text: 'Row', column: 'name'}]})),
      page: 1,
      perPage: 50,
      total: 24,
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));

      expect(el.shadowRoot!.querySelector('zn-select[name="rowPerPage"]')).to.exist;
      expect(el.shadowRoot!.querySelector('.table__footer__pagination-page')).to.not.exist;
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('hides the rows-per-page selector when the dataset fits the smallest page size', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));

      expect(el.shadowRoot!.querySelector('zn-select[name="rowPerPage"]')).to.not.exist;
      expect(el.shadowRoot!.querySelector('.table__footer')).to.not.exist;
    } finally {
      window.fetch = originalFetch;
    }
  });

  // One table per group meant two scrollbars and columns that did not line up between groups
  it('renders grouped rows as group header rows inside a single table', async () => {
    const originalFetch = window.fetch;
    const row = (id: string, status: string) => ({
      id,
      cells: [{text: 'Card ' + id, column: 'name'}, {text: status, column: 'status'}],
    });
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: [row('1', 'active'), row('2', 'active'), row('3', 'archived')],
      page: 1,
      perPage: 10,
      total: 3,
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data"
                       group-by="status"
                       groups="active,archived"
                       headers='{"name": {"key": "name", "label": "Name"}, "status": {"key": "status", "label": "Status", "hideColumn": true}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));

      const root = el.shadowRoot!;
      expect(root.querySelectorAll('table')).to.have.length(1);
      expect(root.querySelectorAll('.table__scroll')).to.have.length(1);
      expect([...root.querySelectorAll('tr.table__row--group')].map(r => r.textContent!.trim()))
        .to.deep.equal(['Active', 'Archived']);
      expect(root.querySelectorAll('tbody tr.table__row--data')).to.have.length(3);
    } finally {
      window.fetch = originalFetch;
    }
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

  it('shows the loading skeleton on reload when the previous load returned no rows', async () => {
    const originalFetch = window.fetch;
    const emptyResponse = () => new Response(JSON.stringify({rows: [], page: 1, perPage: 10, total: 0}),
      {status: 200, headers: {'Content-Type': 'application/json'}});
    window.fetch = () => Promise.resolve(emptyResponse());

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot?.querySelector('zn-empty-state'));

      let release: (value: Response) => void;
      window.fetch = () => new Promise<Response>(resolve => (release = resolve));
      el.refresh();
      await waitUntil(() => el.shadowRoot?.querySelector('zn-skeleton'));
      expect(el.shadowRoot!.querySelector('zn-skeleton')).to.exist;

      release!(emptyResponse());
      await waitUntil(() => el.shadowRoot?.querySelector('zn-empty-state'));
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('shows the empty-state slot before any load on a no-initial-load table, then a no-results state after an empty search', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({rows: [], page: 1, perPage: 10, total: 0}),
      {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" no-initial-load headers='{"name": {"key": "name", "label": "Name"}}'>
          <div slot="empty-state" id="filters-prompt">No Filters Selected</div>
        </zn-data-table>`);

      expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.exist;

      el.refresh();
      await waitUntil(() => el.shadowRoot?.querySelector('zn-empty-state'));

      expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.not.exist;
      const emptyState = el.shadowRoot!.querySelector('zn-empty-state')!;
      expect(emptyState.getAttribute('caption')).to.equal('No Results Found');
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('prefers the no-results slot after an empty search on a no-initial-load table', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({rows: [], page: 1, perPage: 10, total: 0}),
      {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" no-initial-load headers='{"name": {"key": "name", "label": "Name"}}'>
          <div slot="empty-state">No Filters Selected</div>
          <div slot="no-results">No Customers Found</div>
        </zn-data-table>`);

      el.refresh();
      await waitUntil(() => el.shadowRoot?.querySelector('slot[name="no-results"]'));

      expect(el.shadowRoot!.querySelector('slot[name="no-results"]')).to.exist;
      expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.not.exist;
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('exposes displayTemplates as an object property', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const templates = (el as unknown as {displayTemplates: Record<string, unknown>}).displayTemplates;
    expect(templates).to.be.an('object');
  });

  it('renders subText as muted secondary text', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const container = document.createElement('div');
    render(el.renderCell({text: 'Main', column: 'name', subText: 'Secondary'}), container);

    const subtext = container.querySelector('.table__cell--subtext');
    expect(subtext).to.exist;
    expect(subtext?.textContent).to.contain('Secondary');
    expect(container.textContent).to.contain('Main');
  });

  it('applies title as a tooltip on link cells', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const container = document.createElement('div');
    render(el.renderCell({text: 'Go', column: 'name', uri: 'https://example.com', title: 'Tip'}), container);

    const link = container.querySelector('a');
    expect(link).to.exist;
    expect(link?.getAttribute('title')).to.equal('Tip');
  });

  it('applies title as a tooltip on styled cells', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const container = document.createElement('div');
    render(el.renderCell({text: 'Val', column: 'name', style: 'bold', title: 'Info'}), container);

    const styled = container.querySelector('zn-style');
    expect(styled).to.exist;
    expect(styled?.getAttribute('title')).to.equal('Info');
  });

  it('omits the title attribute when no title is provided', async () => {
    const el = await fixture<ZnDataTable>(html` <zn-data-table></zn-data-table> `);
    const container = document.createElement('div');
    render(el.renderCell({text: 'Plain', column: 'name', uri: 'https://example.com'}), container);

    const link = container.querySelector('a');
    expect(link).to.exist;
    expect(link?.hasAttribute('title')).to.be.false;
  });
});
