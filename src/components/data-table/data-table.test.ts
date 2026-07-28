import '../../../dist/zn.min.js';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { render } from 'lit';
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
