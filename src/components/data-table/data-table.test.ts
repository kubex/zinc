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

  it('shows a no-results state when a filter empties a normally loading table', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({rows: [], page: 1, perPage: 10, total: 0}),
      {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'>
          <div slot="empty-state" id="nothing-created">Nothing created yet</div>
          <div slot="no-results" id="nothing-matched">Nothing matched</div>
        </zn-data-table>`);

      await waitUntil(() => el.shadowRoot?.querySelector('slot[name="empty-state"]'));
      expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.exist;

      el.filter = 'eyJrZXkiOiJ0eXBlIn0=';
      el.refresh();
      await waitUntil(() => el.shadowRoot?.querySelector('slot[name="no-results"]'));

      expect(el.shadowRoot!.querySelector('slot[name="no-results"]')).to.exist;
      expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.not.exist;
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('shows a no-results state when a search empties a normally loading table', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({rows: [], page: 1, perPage: 10, total: 0}),
      {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" search="nothing" headers='{"name": {"key": "name", "label": "Name"}}'>
          <div slot="empty-state">Nothing created yet</div>
        </zn-data-table>`);

      await waitUntil(() => el.shadowRoot?.querySelector('zn-empty-state'));

      expect(el.shadowRoot!.querySelector('slot[name="empty-state"]')).to.not.exist;
      expect(el.shadowRoot!.querySelector('zn-empty-state')!.getAttribute('caption')).to.equal('No Results Found');
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

  // Search-component field values and any other extra request params are merged at the root of
  // the POST body, alongside the dedicated `search` key.
  describe('extra request params', () => {
    const rowResponse = () => new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}});

    it('sends search-component field values at the root alongside search', async () => {
      const originalFetch = window.fetch;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };

      try {
        const el = await fixture<ZnDataTable>(html`
          <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => bodies.length > 0);

        // Mirror what the search component's zn-search-change listener does: set the search text and
        // merge its field values into requestParams, then reload.
        el.search = 'foo';
        el.requestParams = {status: 'open'};
        el.refresh();
        await waitUntil(() => bodies.some(b => b.search === 'foo'));

        const body = bodies[bodies.length - 1];
        expect(body.search).to.equal('foo');
        expect(body.status).to.equal('open');
        expect(body.searchFields).to.be.undefined;
      } finally {
        window.fetch = originalFetch;
      }
    });

    it('sends no extra keys when no search or field values are set', async () => {
      const originalFetch = window.fetch;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };

      try {
        await fixture<ZnDataTable>(html`
          <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => bodies.length > 0);

        const known = ['filter', 'page', 'perPage', 'search', 'sortColumn', 'sortDirection'];
        expect(Object.keys(bodies[bodies.length - 1]).filter(k => !known.includes(k))).to.deep.equal([]);
      } finally {
        window.fetch = originalFetch;
      }
    });

    it('sends inputs-slot params at the request root', async () => {
      const originalFetch = window.fetch;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };

      try {
        const el = await fixture<ZnDataTable>(html`
          <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'>
            <input slot="inputs" name="csrf" value="tok">
          </zn-data-table>`);
        await waitUntil(() => bodies.length > 0);
        el.refresh();
        await waitUntil(() => bodies.length > 1);

        expect(bodies[bodies.length - 1].csrf).to.equal('tok');
      } finally {
        window.fetch = originalFetch;
      }
    });
  });

  // With `wrap-search-fields`, the same values are nested under `searchFields` instead, with `q`
  // mirroring the search text.
  describe('wrap-search-fields', () => {
    const rowResponse = () => new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}});

    it('nests field values under searchFields with q mirroring the search text', async () => {
      const originalFetch = window.fetch;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };

      try {
        const el = await fixture<ZnDataTable>(html`
          <zn-data-table wrap-search-fields data-uri="/test-data"
                         headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => bodies.length > 0);

        el.search = 'foo';
        el.requestParams = {status: 'open', empty: ''};
        el.refresh();
        await waitUntil(() => bodies.some(b => b.search === 'foo'));

        const body = bodies[bodies.length - 1];
        expect(body.search).to.equal('foo');
        expect(body.status).to.be.undefined;
        expect(body.searchFields).to.deep.equal({status: 'open', q: 'foo'});
      } finally {
        window.fetch = originalFetch;
      }
    });

    it('sends searchFields as null when no search or field values are set', async () => {
      const originalFetch = window.fetch;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };

      try {
        await fixture<ZnDataTable>(html`
          <zn-data-table wrap-search-fields data-uri="/test-data"
                         headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => bodies.length > 0);

        expect(bodies[bodies.length - 1].searchFields).to.be.null;
      } finally {
        window.fetch = originalFetch;
      }
    });

    it('keeps inputs-slot params at the request root', async () => {
      const originalFetch = window.fetch;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };

      try {
        const el = await fixture<ZnDataTable>(html`
          <zn-data-table wrap-search-fields data-uri="/test-data"
                         headers='{"name": {"key": "name", "label": "Name"}}'>
            <input slot="inputs" name="csrf" value="tok">
          </zn-data-table>`);
        await waitUntil(() => bodies.length > 0);
        el.refresh();
        await waitUntil(() => bodies.length > 1);

        const body = bodies[bodies.length - 1];
        expect(body.csrf).to.equal('tok');
        expect(body.searchFields).to.be.null;
      } finally {
        window.fetch = originalFetch;
      }
    });
  });

  // `sharable` mirrors non-default state to the URL query string and restores it on load. These
  // tests mutate window.location/history, so each one restores the original URL in a finally block
  // and preserves the pre-existing query (web-test-runner keeps its session id there).
  describe('sharable URL state', () => {
    const okResponse = () => new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}});

    const MANAGED = ['search', 'filter', 'sortColumn', 'sortDirection', 'page', 'perPage'];

    // Start from the live query (keeping unmanaged params like the WTR session id) with every
    // managed key cleared, then overlay whatever the test wants to seed.
    const seedUrl = (overlay: Record<string, string> = {}) => {
      const params = new URLSearchParams(window.location.search);
      MANAGED.forEach(key => params.delete(key));
      Object.entries(overlay).forEach(([key, value]) => params.set(key, value));
      const query = params.toString();
      window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
    };

    it('seeds the table state from the URL query string on load', async () => {
      const originalFetch = window.fetch;
      const originalUrl = window.location.href;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(okResponse());
      };
      seedUrl({search: 'foo', page: '2'});

      try {
        await fixture<ZnDataTable>(html`
          <zn-data-table sharable data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => bodies.length > 0);

        // The very first request already carries the shared state.
        expect(bodies[0].search).to.equal('foo');
        expect(bodies[0].page).to.equal(2);
      } finally {
        window.fetch = originalFetch;
        window.history.replaceState(window.history.state, '', originalUrl);
      }
    });

    it('writes only changed state to the URL, omitting keys still at their default', async () => {
      const originalFetch = window.fetch;
      const originalUrl = window.location.href;
      window.fetch = () => Promise.resolve(okResponse());
      seedUrl();

      try {
        const el = await fixture<ZnDataTable>(html`
          <zn-data-table sharable data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));

        el.search = 'bar';
        el.refresh();
        await waitUntil(() => window.location.search.includes('search=bar'));

        const params = new URLSearchParams(window.location.search);
        expect(params.get('search')).to.equal('bar');
        // Page 1 and the unset/default sort are omitted rather than written out.
        expect(params.has('page')).to.be.false;
        expect(params.has('sortColumn')).to.be.false;
        expect(params.has('perPage')).to.be.false;
      } finally {
        window.fetch = originalFetch;
        window.history.replaceState(window.history.state, '', originalUrl);
      }
    });

    it('preserves unrelated query params when syncing state', async () => {
      const originalFetch = window.fetch;
      const originalUrl = window.location.href;
      window.fetch = () => Promise.resolve(okResponse());
      seedUrl({utm_source: 'news'});

      try {
        const el = await fixture<ZnDataTable>(html`
          <zn-data-table sharable data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));

        el.search = 'bar';
        el.refresh();
        await waitUntil(() => window.location.search.includes('search=bar'));

        const params = new URLSearchParams(window.location.search);
        expect(params.get('utm_source')).to.equal('news');
        expect(params.get('search')).to.equal('bar');
      } finally {
        window.fetch = originalFetch;
        window.history.replaceState(window.history.state, '', originalUrl);
      }
    });

    it('forces the first load under no-initial-load when the URL carries relevant params', async () => {
      const originalFetch = window.fetch;
      const originalUrl = window.location.href;
      const bodies: Record<string, unknown>[] = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(okResponse());
      };
      seedUrl({search: 'foo'});

      try {
        await fixture<ZnDataTable>(html`
          <zn-data-table sharable no-initial-load data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
        // Despite no-initial-load, a shared link must render results, so the first load fires.
        await waitUntil(() => bodies.length > 0);

        expect(bodies[0].search).to.equal('foo');
      } finally {
        window.fetch = originalFetch;
        window.history.replaceState(window.history.state, '', originalUrl);
      }
    });
  });

  it('shows a server-rendered filter as chips under the header of a slotted filter', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}], page: 1, perPage: 10, total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    const filter = btoa(JSON.stringify([
      {key: 'status', comparator: 'in', value: [0, 10]},
      {key: 'departmentFid', comparator: 'eq', value: ''},
    ]));
    const filters = JSON.stringify([
      {id: 'status', name: 'status', operators: ['in'], options: {0: 'Pending Reply', 10: 'Open', 20: 'Closed'}},
      {id: 'departmentFid', name: 'department', operators: ['eq']},
    ]);

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table filter="${filter}" data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'>
          <zn-data-table-filter slot="filter" filters="${filters}"></zn-data-table-filter>
        </zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('.table__chips'));
      const chipsEl = el.shadowRoot!.querySelector<HTMLElement & {updateComplete: Promise<unknown>}>('.table__chips')!;
      await chipsEl.updateComplete;

      const chips = [...chipsEl.shadowRoot!.querySelectorAll('.filter__chip__text')].map(p => p.textContent!.trim());
      expect(chips).to.deep.equal(['Status is any of Pending Reply, Open']);
      expect(chipsEl.shadowRoot!.querySelectorAll('.filter__chip__remove').length).to.equal(1);
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('sizes data rows from --zn-table-row-height', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" style="--zn-table-row-height: 77px"
                       headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));

      const cell = el.shadowRoot!.querySelector('tbody tr.table__row--data td')!;
      expect(getComputedStyle(cell).height).to.equal('77px');
    } finally {
      window.fetch = originalFetch;
    }
  });

  describe('table controls', () => {
    const rowResponse = () => new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}], page: 1, perPage: 10, total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}});
    const click = (el: Element) => el.dispatchEvent(new MouseEvent('click', {bubbles: true, composed: true, cancelable: true}));
    const choose = (select: Element, value: string) => {
      (select as HTMLElement & {value: string}).value = value;
      select.dispatchEvent(new CustomEvent('zn-change', {bubbles: true, composed: true}));
    };

    let originalFetch: typeof window.fetch;
    let bodies: Record<string, unknown>[];
    beforeEach(() => {
      originalFetch = window.fetch;
      bodies = [];
      window.fetch = (_url: RequestInfo | URL, options?: RequestInit) => {
        if (options?.body) bodies.push(JSON.parse(options.body as string) as Record<string, unknown>);
        return Promise.resolve(rowResponse());
      };
    });
    afterEach(() => {
      window.fetch = originalFetch;
    });

    const filterTable = async () => {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" caption="Things" headers='{"name": {"key": "name", "label": "Name"}}'
                       filter-fields='[{"id":"status","name":"Status","options":{"active":"Active"}}]'></zn-data-table>`);
      await waitUntil(() => bodies.length > 0);
      return el;
    };

    type FilterEl = HTMLElement & {updateComplete: Promise<unknown>};
    const funnel = (el: ZnDataTable) => el.shadowRoot!.querySelector<FilterEl>('.table__header__right zn-data-table-filter')!;
    const chipRow = (el: ZnDataTable) => el.shadowRoot!.querySelector<FilterEl>('.table__chips')!;
    const settle = async (el: ZnDataTable) => {
      await el.updateComplete;
      await funnel(el).updateComplete;
      await chipRow(el)?.updateComplete;
    };

    const addRule = async (el: ZnDataTable) => {
      const root = funnel(el).shadowRoot!;
      choose(root.querySelector('.filter__rule zn-select[aria-label="Filter field"]')!, 'status');
      await settle(el);
      await waitUntil(() => root.querySelector('.filter__rule zn-select[aria-label="Filter value"]'));
      choose(root.querySelector('.filter__rule zn-select[aria-label="Filter value"]')!, 'active');
      await settle(el);
      click(root.querySelector('.filter__pop__foot zn-button[color="primary"]')!);
      await settle(el);
    };

    it('opens the filter builder and encodes a completed rule', async () => {
      const el = await filterTable();
      const root = funnel(el).shadowRoot!;

      click(root.querySelector('.filter__toggle')!);
      await settle(el);
      expect(root.querySelector('.filter__pop')).to.exist;

      await addRule(el);
      const expected = btoa(JSON.stringify([{key: 'status', comparator: 'eq', value: 'active'}]));
      await waitUntil(() => bodies[bodies.length - 1].filter === expected);
      await settle(el);

      expect(el.filter).to.equal(expected);
      const chips = chipRow(el).shadowRoot!;
      expect(chips.querySelectorAll('.filter__chip').length).to.equal(1);
      expect(chips.querySelector('.filter__chip__text')!.textContent!.trim()).to.equal('Status is Active');
    });

    it('closes the filter builder on Escape and drops incomplete rules', async () => {
      const el = await filterTable();
      const root = funnel(el).shadowRoot!;

      click(root.querySelector('.filter__toggle')!);
      await settle(el);
      await addRule(el);
      click(root.querySelector('.filter__toggle')!);
      await settle(el);
      click(root.querySelector('.filter__pop__foot zn-button[icon="plus@lu"]')!);
      await settle(el);
      expect(root.querySelectorAll('.filter__rule').length).to.equal(2);

      document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}));
      await settle(el);
      expect(root.querySelector('.filter__pop')).to.not.exist;
      expect(chipRow(el).shadowRoot!.querySelectorAll('.filter__chip').length).to.equal(1);

      click(root.querySelector('.filter__toggle')!);
      await settle(el);
      expect(root.querySelectorAll('.filter__rule').length).to.equal(1);
    });

    const headerOrder = (el: ZnDataTable) => {
      const right = el.shadowRoot!.querySelector('.table__header__right')!;
      const order = [
        right.querySelector('slot[name="search"]'),
        right.querySelector('zn-data-table-filter, slot[name="filter"]'),
        right.querySelector('zn-dropdown zn-button[icon="columns-3@lu"]')?.closest('zn-dropdown'),
        right.querySelector('zn-button[icon="refresh-cw@lu"]'),
        right.querySelector('slot[name="sort"]'),
        right.querySelector('slot[name="create-action"]'),
      ];
      const children = [...right.children];
      return order.map(node => node ? children.indexOf(node) : -1);
    };
    const ascending = (indexes: number[]) => indexes.every((index, i) => index >= 0 && (i === 0 || index > indexes[i - 1]));
    const twoColumns = '{"name": {"key": "name", "label": "Name"}, "age": {"key": "age", "label": "Age"}}';

    it('orders the header search, funnel, columns, refresh with filter-fields', async () => {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" caption="Things" headers="${twoColumns}"
                       filter-fields='[{"id":"status","name":"Status"}]'>
          <zn-data-table-search slot="search"></zn-data-table-search>
        </zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('zn-button[icon="refresh-cw@lu"]'));

      const order = headerOrder(el);
      expect(ascending(order), `header order ${order.join(',')}`).to.be.true;
    });

    it('orders the header search, funnel, columns, refresh with a slotted filter', async () => {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" caption="Things" headers="${twoColumns}">
          <zn-data-table-search slot="search"></zn-data-table-search>
          <zn-data-table-filter slot="filter" filters='[{"id":"status","name":"Status","operators":["eq"]}]'></zn-data-table-filter>
        </zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('zn-button[icon="refresh-cw@lu"]'));

      const order = headerOrder(el);
      expect(ascending(order), `header order ${order.join(',')}`).to.be.true;
    });

    it('reloads with a slotted filter\'s encoded rules', async () => {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" caption="Things" headers='{"name": {"key": "name", "label": "Name"}}'>
          <zn-data-table-filter slot="filter" filters='[{"id":"status","name":"Status","operators":["eq"],"options":{"active":"Active"}}]'></zn-data-table-filter>
        </zn-data-table>`);
      await waitUntil(() => bodies.length > 0);
      const bar = el.querySelector<FilterEl>('zn-data-table-filter')!;
      const root = bar.shadowRoot!;

      click(root.querySelector('.filter__toggle')!);
      await bar.updateComplete;
      choose(root.querySelector('.filter__rule zn-select[aria-label="Filter field"]')!, 'status');
      await bar.updateComplete;
      choose(root.querySelector('.filter__rule zn-select[aria-label="Filter value"]')!, 'active');
      await bar.updateComplete;
      click(root.querySelector('.filter__pop__foot zn-button[color="primary"]')!);

      const expected = btoa(JSON.stringify([{key: 'status', comparator: 'eq', value: 'active'}]));
      await waitUntil(() => bodies[bodies.length - 1].filter === expected);
      await waitUntil(() => el.shadowRoot!.querySelector<FilterEl>('.table__chips')?.shadowRoot?.querySelector('.filter__chip'));
      expect(root.querySelector('.filter__chip')).to.not.exist;
    });

    it('selecting a tab reloads with the tab param', async () => {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'
                       tabs='[{"value":"a","label":"A"},{"value":"b","label":"B"}]'></zn-data-table>`);
      await waitUntil(() => bodies.length > 0);
      expect(bodies[0].tab).to.equal('a');

      const tabs = el.shadowRoot!.querySelectorAll<HTMLElement>('.table__tab');
      click(tabs[1]);
      await waitUntil(() => bodies[bodies.length - 1].tab === 'b');
      await el.updateComplete;

      const second = el.shadowRoot!.querySelectorAll('.table__tab')[1];
      expect(second.getAttribute('aria-selected')).to.equal('true');
      expect(el.shadowRoot!.querySelectorAll('.table__tab')[0].getAttribute('aria-selected')).to.equal('false');
      expect(el.shadowRoot!.querySelector('.table__tabs__indicator')).to.exist;
    });

    it('sort heading toggles aria-sort with Enter', async () => {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table data-uri="/test-data" headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('th.table__head[tabindex]'));
      const head = () => el.shadowRoot!.querySelector('th.table__head[tabindex]')!;
      expect(head().getAttribute('aria-sort')).to.equal('none');
      expect(head().querySelector('.table__head__sort--active')).to.not.exist;

      head().dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
      await waitUntil(() => head().getAttribute('aria-sort') === 'descending');
      expect(head().querySelector('.table__head__sort--active zn-icon')!.getAttribute('src')).to.contain('arrow-down');

      head().dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true, cancelable: true}));
      await waitUntil(() => head().getAttribute('aria-sort') === 'ascending');
      expect(bodies[bodies.length - 1].sortColumn).to.equal('name');
    });
  });

  it('uses the singular total label for a single row', async () => {
    const originalFetch = window.fetch;
    window.fetch = () => Promise.resolve(new Response(JSON.stringify({
      rows: [{id: '1', cells: [{text: 'Row', column: 'name'}]}],
      page: 1,
      perPage: 10,
      total: 1,
    }), {status: 200, headers: {'Content-Type': 'application/json'}}));

    try {
      const el = await fixture<ZnDataTable>(html`
        <zn-data-table standalone caption="Emails" total-label="emails" total-label-singular="email" data-uri="/test-data"
                       headers='{"name": {"key": "name", "label": "Name"}}'></zn-data-table>`);
      await waitUntil(() => el.shadowRoot!.querySelector('tbody tr.table__row--data'));
      await el.updateComplete;

      expect(el.shadowRoot!.innerHTML).to.match(/1 email["<]/);
    } finally {
      window.fetch = originalFetch;
    }
  });

  it('keeps the slotted search readable in a narrow header', async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div style="width: 340px">
        <zn-data-table standalone no-initial-load caption="A fairly long table caption" total-label="rows">
          <zn-data-table-search slot="search" placeholder="Search..."></zn-data-table-search>
          <div slot="empty-state">Nothing yet</div>
        </zn-data-table>
      </div>`);
    const el = wrap.querySelector<ZnDataTable>('zn-data-table')!;
    await el.updateComplete;
    const search = el.querySelector('zn-data-table-search')!;

    expect(search.getBoundingClientRect().width).to.be.at.least(160);
  });
});
