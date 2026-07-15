import '../../../dist/zn.min.js';
import {expect, fixture, html} from '@open-wc/testing';
import type ZnEditor from './editor.component';

describe('<zn-editor>', () => {
  it('should render a component', async () => {
    const el = await fixture(html` <zn-editor></zn-editor> `);

    expect(el).to.exist;
  });

  describe('content caching', () => {
    const KEY = 'zned:test-draft';

    afterEach(() => {
      sessionStorage.removeItem(KEY);
      localStorage.removeItem(KEY);
    });

    it('should restore cached content into an empty editor', async () => {
      sessionStorage.setItem(KEY, '0,<p>Hello draft</p>');
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft"></zn-editor>`);

      expect(el.value).to.contain('Hello draft');
    });

    it('should not overwrite an initial value with cached content', async () => {
      sessionStorage.setItem(KEY, '0,<p>Hello draft</p>');
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft" .value=${'<p>Existing</p>'}></zn-editor>`);

      expect(el.value).to.contain('Existing');
      expect(el.value).to.not.contain('Hello draft');
    });

    it('should read from localStorage when local-storage is set', async () => {
      localStorage.setItem(KEY, '0,<p>Local draft</p>');
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft" local-storage></zn-editor>`);

      expect(el.value).to.contain('Local draft');
    });

    it('should cache content when the editor changes', async () => {
      const el = await fixture<ZnEditor>(html`
        <zn-editor store-key="test-draft" .value=${'<p>Typed reply</p>'}></zn-editor>`);

      document.dispatchEvent(new Event('zn-editor-update'));
      await el.updateComplete;

      // Quill's getSemanticHTML encodes spaces as &nbsp;
      expect(sessionStorage.getItem(KEY)).to.contain('Typed&nbsp;reply');
    });

    it('should clear cached content on form submit', async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form @submit=${(e: Event) => e.preventDefault()}>
          <zn-editor store-key="test-draft" .value=${'<p>Typed reply</p>'}></zn-editor>
        </form>`);
      const el = form.querySelector<ZnEditor>('zn-editor')!;

      document.dispatchEvent(new Event('zn-editor-update'));
      await el.updateComplete;
      expect(sessionStorage.getItem(KEY)).to.contain('Typed&nbsp;reply');

      form.requestSubmit();
      expect(sessionStorage.getItem(KEY)).to.equal(null);
    });
  });
});
